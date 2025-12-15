const { connectDB, sql } = require('../config/dbConfig');

// API 1: Lấy danh sách sản phẩm (Có Filter & Search)
exports.getProducts = async (req, res) => {
    try {
        const pool = await connectDB();
        const { category, keyword } = req.query;

        let query = `
            SELECT 
                sp.MaSP, sp.TenSP, sp.TrangThai, 
                dm.TenDanhMuc,
                bt_dai_dien.Gia as GiaHienThi,
                bt_dai_dien.HinhAnh as AnhDaiDien,
                bt_dai_dien.MaBienThe
            FROM SanPham sp
            LEFT JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc
            -- Kỹ thuật OUTER APPLY: Lấy biến thể có giá thấp nhất làm đại diện
            OUTER APPLY (
                SELECT TOP 1 MaBienThe, Gia, HinhAnh 
                FROM SanPham_BienThe 
                WHERE MaSP = sp.MaSP 
                ORDER BY Gia ASC
            ) bt_dai_dien
            WHERE sp.TrangThai = N'Đang bán'
        `;

        const request = pool.request();

        // Xử lý Filter Dynamic
        if (category) {
            query += ` AND sp.MaDanhMuc = @Category`;
            request.input('Category', sql.Int, category);
        }

        if (keyword) {
            query += ` AND sp.TenSP LIKE @Keyword`;
            request.input('Keyword', sql.NVarChar, `%${keyword}%`);
        }

        query += ` ORDER BY sp.NgayTao DESC`;

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (err) {
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