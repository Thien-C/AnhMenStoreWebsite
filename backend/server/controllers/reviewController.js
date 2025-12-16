const { connectDB, sql } = require('../config/dbConfig');

// 1. Lấy danh sách đánh giá của một sản phẩm
exports.getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const pool = await connectDB();

        const result = await pool.request()
            .input('MaSP', sql.Int, productId)
            .query(`
                SELECT 
                    dg.MaDanhGia, dg.SoSao, dg.BinhLuan, dg.NgayDanhGia,
                    nd.HoTen
                FROM DanhGia dg
                JOIN NguoiDung nd ON dg.MaNguoiDung = nd.MaNguoiDung
                WHERE dg.MaSP = @MaSP
                ORDER BY dg.NgayDanhGia DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Thêm đánh giá mới (Yêu cầu đăng nhập)
exports.addReview = async (req, res) => {
    try {
        const { productId, soSao, binhLuan } = req.body;
        const userId = req.user.id; // Lấy từ token qua middleware

        if (!soSao || soSao < 1 || soSao > 5) {
            return res.status(400).json({ message: 'Số sao phải từ 1 đến 5' });
        }

        const pool = await connectDB();
        
        // (Tùy chọn) Kiểm tra xem user đã mua hàng chưa mới cho đánh giá
        // Ở đây mình làm đơn giản là cho đánh giá luôn
        
        await pool.request()
            .input('MaSP', sql.Int, productId)
            .input('MaNguoiDung', sql.Int, userId)
            .input('SoSao', sql.Int, soSao)
            .input('BinhLuan', sql.NText, binhLuan)
            .query(`
                INSERT INTO DanhGia (MaSP, MaNguoiDung, SoSao, BinhLuan)
                VALUES (@MaSP, @MaNguoiDung, @SoSao, @BinhLuan)
            `);

        res.json({ message: 'Cảm ơn bạn đã đánh giá!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};