// backend/server/controllers/productController.js
const { connectDB, sql } = require('../config/dbConfig');

// API 1: Lấy danh sách sản phẩm (Có Filter, Search & Sort)
exports.getProducts = async (req, res) => {
    try {
        console.log('🔍 getProducts called with params:', req.query);
        const pool = await connectDB();
        const { category, keyword, sort, minPrice, maxPrice } = req.query; 

        const request = pool.request();

        // Query cơ bản
        let query = `
            SELECT 
                sp.MaSP, sp.TenSP, sp.TrangThai, sp.MaDanhMuc,
                dm.TenDanhMuc,
                bt_dai_dien.Gia as GiaHienThi,
                bt_dai_dien.HinhAnh as AnhDaiDien,
                bt_dai_dien.MaBienThe
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc
            -- OUTER APPLY: Lấy biến thể đại diện (ưu tiên giá thấp nhất)
            OUTER APPLY (
                SELECT TOP 1 MaBienThe, Gia, HinhAnh 
                FROM SanPham_BienThe 
                WHERE MaSP = sp.MaSP AND SoLuongTon > 0
                ORDER BY MaBienThe ASC
            ) bt_dai_dien
            WHERE sp.TrangThai = N'Đang bán'
        `;

        // --- XỬ LÝ ĐIỀU KIỆN ---
        
        // 1. Tìm kiếm từ khóa
        if (keyword) {
            query += ` AND sp.TenSP LIKE @Keyword`;
            request.input('Keyword', sql.NVarChar, `%${keyword}%`);
        }

        // 2. Lọc danh mục (bao gồm cả danh mục con)
        if (category) {
            query += ` AND (sp.MaDanhMuc = @Category OR EXISTS (
                SELECT 1 FROM DanhMuc dm_child 
                WHERE dm_child.MaDanhMucCha = @Category 
                AND sp.MaDanhMuc = dm_child.MaDanhMuc
            ))`;
            request.input('Category', sql.Int, category);
        }

        // 3. Lọc khoảng giá [MỚI]
        if (minPrice) {
            query += ` AND bt_dai_dien.Gia >= @MinPrice`;
            request.input('MinPrice', sql.Decimal, minPrice);
        }
        if (maxPrice) {
            query += ` AND bt_dai_dien.Gia <= @MaxPrice`;
            request.input('MaxPrice', sql.Decimal, maxPrice);
        }

        // --- XỬ LÝ SẮP XẾP [MỚI] ---
        switch (sort) {
            case 'price_asc': // Giá tăng dần
                query += ` ORDER BY bt_dai_dien.Gia ASC`;
                break;
            case 'price_desc': // Giá giảm dần
                query += ` ORDER BY bt_dai_dien.Gia DESC`;
                break;
            case 'oldest': // Cũ nhất
                query += ` ORDER BY sp.NgayTao ASC`;
                break;
            default: // Mặc định: Mới nhất
                query += ` ORDER BY sp.NgayTao DESC`;
                break;
        }

        const result = await request.query(query);
        console.log(`📦 Found ${result.recordset.length} products for query:`, { category, keyword, sort, minPrice, maxPrice });
        res.json(result.recordset);

    } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        res.status(500).json({ message: err.message });
    }
};

// API 2: Lấy chi tiết sản phẩm (Header + Variants)
exports.getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();

        // 1. Lấy thông tin chung (Header)
        const spQuery = await pool.request()
            .input('MaSP', sql.Int, id)
            .query(`
                SELECT sp.*, dm.TenDanhMuc 
                FROM SanPham sp 
                LEFT JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc
                WHERE sp.MaSP = @MaSP
            `);

        if (spQuery.recordset.length === 0) {
            return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
        }

        const productInfo = spQuery.recordset[0];

        // 2. Lấy danh sách biến thể (Detail)
        const btQuery = await pool.request()
            .input('MaSP', sql.Int, id)
            .query(`
                SELECT 
                    bt.MaBienThe as variantId,
                    ms.TenMauSac as color,
                    kc.TenKichCo as size,
                    bt.Gia as price,
                    bt.SoLuongTon as stock,
                    bt.HinhAnh as image
                FROM SanPham_BienThe bt
                LEFT JOIN MauSac ms ON bt.MaMauSac = ms.MaMauSac
                LEFT JOIN KichCo kc ON bt.MaKichCo = kc.MaKichCo
                WHERE bt.MaSP = @MaSP
            `);

        res.json({
            id: productInfo.MaSP,
            name: productInfo.TenSP,
            desc: productInfo.MoTa,
            category: productInfo.TenDanhMuc,
            variants: btQuery.recordset
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API 3: Master Data (Dữ liệu nền cho bộ lọc) [QUAN TRỌNG: Đây là hàm bị thiếu gây lỗi]
exports.getMasterData = async (req, res) => {
    try {
        const pool = await connectDB();
        const cats = await pool.request().query('SELECT * FROM DanhMuc');
        const colors = await pool.request().query('SELECT * FROM MauSac');
        const sizes = await pool.request().query('SELECT * FROM KichCo');

        res.json({
            categories: cats.recordset,
            colors: colors.recordset,
            sizes: sizes.recordset
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// API 4: Lấy chi tiết danh sách biến thể (Dùng cho Giỏ hàng Guest)
exports.getVariantsByIds = async (req, res) => {
    try {
        const { ids } = req.body; 
        if (!ids || ids.length === 0) return res.json([]);

        const pool = await connectDB();
        const request = pool.request();

        const params = ids.map((id, index) => `@id${index}`).join(',');
        ids.forEach((id, index) => request.input(`id${index}`, sql.Int, id));

        const query = `
            SELECT 
                bt.MaBienThe, bt.Gia, bt.HinhAnh, bt.SoLuongTon,
                sp.TenSP, sp.MaSP,
                ms.TenMauSac, kc.TenKichCo
            FROM SanPham_BienThe bt
            JOIN SanPham sp ON bt.MaSP = sp.MaSP
            LEFT JOIN MauSac ms ON bt.MaMauSac = ms.MaMauSac
            LEFT JOIN KichCo kc ON bt.MaKichCo = kc.MaKichCo
            WHERE bt.MaBienThe IN (${params})
        `;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API: Lấy danh mục sản phẩm
exports.getCategories = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM DanhMuc');
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy danh mục sản phẩm:", err);
        res.status(500).json({ message: err.message });
    }
};

// API: Tạo sản phẩm mới (Admin)
exports.createProductAdmin = async (req, res) => {
    try {
        const { tenSP, moTa, maDanhMuc, trangThai, bienThe } = req.body;
        
        // Validate input
        if (!tenSP || !maDanhMuc) {
            return res.status(400).json({ message: 'Tên sản phẩm và danh mục là bắt buộc' });
        }

        const pool = await connectDB();
        const transaction = pool.transaction();
        
        await transaction.begin();
        
        try {
            // 1. Tạo sản phẩm mới
            const productResult = await transaction.request()
                .input('TenSP', sql.NVarChar, tenSP)
                .input('MoTa', sql.NVarChar, moTa || '')
                .input('MaDanhMuc', sql.Int, maDanhMuc)
                .input('TrangThai', sql.NVarChar, trangThai || 'Đang bán')
                .query(`
                    INSERT INTO SanPham (TenSP, MoTa, MaDanhMuc, TrangThai, NgayTao)
                    OUTPUT INSERTED.MaSP
                    VALUES (@TenSP, @MoTa, @MaDanhMuc, @TrangThai, GETDATE())
                `);
            
            const maSP = productResult.recordset[0].MaSP;
            
            // 2. Tạo các biến thể (nếu có)
            if (bienThe && Array.isArray(bienThe) && bienThe.length > 0) {
                for (const bt of bienThe) {
                    await transaction.request()
                        .input('MaSP', sql.Int, maSP)
                        .input('MaMauSac', sql.Int, bt.maMauSac)
                        .input('MaKichCo', sql.Int, bt.maKichCo)
                        .input('Gia', sql.Decimal, bt.gia)
                        .input('SoLuongTon', sql.Int, bt.soLuongTon || 0)
                        .input('HinhAnh', sql.NVarChar, bt.hinhAnh || '')
                        .query(`
                            INSERT INTO SanPham_BienThe (MaSP, MaMauSac, MaKichCo, Gia, SoLuongTon, HinhAnh)
                            VALUES (@MaSP, @MaMauSac, @MaKichCo, @Gia, @SoLuongTon, @HinhAnh)
                        `);
                }
            }
            
            await transaction.commit();
            res.status(201).json({ message: 'Tạo sản phẩm thành công', maSP });
            
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
        
    } catch (err) {
        console.error("Lỗi tạo sản phẩm:", err);
        res.status(500).json({ message: err.message });
    }
};
