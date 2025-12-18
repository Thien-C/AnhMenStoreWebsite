const { connectDB, sql } = require('../config/dbConfig');

// API 1: Lấy danh sách sản phẩm (Có Filter & Search)
// API 1: Lấy danh sách sản phẩm (Có Search Keyword)
exports.getProducts = async (req, res) => {
    try {
        const pool = await connectDB();
        const { category, keyword } = req.query; // Lấy tham số từ URL

        const request = pool.request();

        // Câu lệnh SQL cơ bản
        let query = `
            SELECT 
                sp.MaSP, sp.TenSP, sp.TrangThai, sp.MaDanhMuc,
                dm.TenDanhMuc,
                bt_dai_dien.Gia as GiaHienThi,
                bt_dai_dien.HinhAnh as AnhDaiDien,
                bt_dai_dien.MaBienThe
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc
            -- OUTER APPLY: Lấy biến thể đầu tiên làm ảnh đại diện
            OUTER APPLY (
                SELECT TOP 1 MaBienThe, Gia, HinhAnh 
                FROM SanPham_BienThe 
                WHERE MaSP = sp.MaSP AND SoLuongTon > 0
                ORDER BY MaBienThe ASC
            ) bt_dai_dien
            WHERE sp.TrangThai = N'Đang bán'
        `;

        // --- XỬ LÝ TÌM KIẾM (SEARCH) ---
        if (keyword) {
            // Thêm điều kiện LIKE
            query += ` AND sp.TenSP LIKE @Keyword`;
            // Gán tham số an toàn (tránh SQL Injection)
            request.input('Keyword', sql.NVarChar, `%${keyword}%`);
        }

        // --- XỬ LÝ LỌC DANH MỤC (NẾU CÓ) ---
        if (category) {
            query += ` AND sp.MaDanhMuc = @Category`;
            request.input('Category', sql.Int, category);
        }

        // Sắp xếp mặc định: Mới nhất lên đầu
        query += ` ORDER BY sp.NgayTao DESC`;

        const result = await request.query(query);
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

        // 3. Output JSON format
        const responseData = {
            id: productInfo.MaSP,
            name: productInfo.TenSP,
            desc: productInfo.MoTa,
            category: productInfo.TenDanhMuc,
            variants: btQuery.recordset
        };

        res.json(responseData);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API 3: Master Data (Dữ liệu nền cho bộ lọc)
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

// API 3.5: Lấy danh sách danh mục (cho bộ lọc)
exports.getCategories = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT MaDanhMuc, TenDanhMuc FROM DanhMuc ORDER BY TenDanhMuc');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// API 4: Lấy chi tiết danh sách biến thể (Dùng cho Giỏ hàng Guest)
exports.getVariantsByIds = async (req, res) => {
    try {
        const { ids } = req.body; // Mảng id: [1, 2, 3]
        if (!ids || ids.length === 0) return res.json([]);

        const pool = await connectDB();
        const request = pool.request();

        // Tạo tham số động cho câu query IN (...)
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

// === ADMIN: Tạo sản phẩm mới cùng các biến thể ===
// POST /api/admin/products
exports.createProductAdmin = async (req, res) => {
    const { TenSP, MoTa, MaDanhMuc, BienThe } = req.body || {};

    if (!TenSP || !Array.isArray(BienThe) || BienThe.length === 0) {
        return res.status(400).json({ message: 'Thiếu thông tin sản phẩm hoặc biến thể' });
    }

    let pool;
    const transaction = new sql.Transaction();

    try {
        pool = await connectDB();
        transaction.connection = pool;
        await transaction.begin();

        // 1. Thêm sản phẩm
        const spReq = new sql.Request(transaction);
        spReq
            .input('TenSP', sql.NVarChar, TenSP)
            .input('MoTa', sql.NText, MoTa || null)
            .input('MaDanhMuc', sql.Int, MaDanhMuc || null);

        const spResult = await spReq.query(`
            INSERT INTO SanPham (TenSP, MoTa, MaDanhMuc, TrangThai)
            VALUES (@TenSP, @MoTa, @MaDanhMuc, N'Đang bán');
            SELECT SCOPE_IDENTITY() AS MaSP;
        `);

        const maSP = spResult.recordset[0].MaSP;

        // 2. Thêm các biến thể
        for (const bt of BienThe) {
            const { MaMauSac, MaKichCo, Gia, SoLuongTon, HinhAnh } = bt;
            const btReq = new sql.Request(transaction);
            btReq
                .input('MaSP', sql.Int, maSP)
                .input('MaMauSac', sql.Int, MaMauSac)
                .input('MaKichCo', sql.Int, MaKichCo)
                .input('Gia', sql.Decimal(18, 2), Gia)
                .input('SoLuongTon', sql.Int, SoLuongTon)
                .input('HinhAnh', sql.VarChar, HinhAnh || null);

            await btReq.query(`
                INSERT INTO SanPham_BienThe (MaSP, MaKichCo, MaMauSac, Gia, SoLuongTon, HinhAnh)
                VALUES (@MaSP, @MaKichCo, @MaMauSac, @Gia, @SoLuongTon, @HinhAnh);
            `);
        }

        await transaction.commit();

        res.status(201).json({
            message: 'Tạo sản phẩm mới thành công',
            MaSP: maSP
        });
    } catch (err) {
        try {
            await transaction.rollback();
        } catch (e) {
            // ignore
        }
        console.error('Admin Create Product Error:', err);
        res.status(500).json({ message: err.message });
    }
};