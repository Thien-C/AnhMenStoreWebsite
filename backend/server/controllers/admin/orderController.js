const { connectDB, sql } = require('../../config/dbConfig');

// GET /api/admin/orders
exports.getOrders = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT 
                dh.MaDonHang,
                dh.MaNguoiDung,
                dh.HoTenNguoiNhan COLLATE Vietnamese_CI_AS AS HoTenNguoiNhan,
                dh.DiaChiGiaoHang COLLATE Vietnamese_CI_AS AS DiaChiGiaoHang,
                dh.SoDienThoaiGiaoHang,
                dh.NgayDatHang,
                dh.TongTien,
                dh.PhuongThucThanhToan COLLATE Vietnamese_CI_AS AS PhuongThucThanhToan,
                dh.TrangThai COLLATE Vietnamese_CI_AS AS TrangThai,
                dh.MaGiamGia,
                nd.HoTen COLLATE Vietnamese_CI_AS AS TenKhachHang
            FROM DonHang dh
            LEFT JOIN NguoiDung nd ON dh.MaNguoiDung = nd.MaNguoiDung
            ORDER BY dh.NgayDatHang DESC
        `);

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(result.recordset);
    } catch (err) {
        console.error('Admin Get Orders Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/admin/orders/:id
exports.updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { TrangThai } = req.body || {};

    if (!TrangThai) {
        return res.status(400).json({ message: 'Thiếu trạng thái đơn hàng' });
    }

    try {
        const pool = await connectDB();
        const request = pool.request();
        request
            .input('Id', sql.Int, id)
            .input('TrangThai', sql.NVarChar, TrangThai);

        const result = await request.query(`
            UPDATE DonHang
            SET TrangThai = @TrangThai COLLATE Vietnamese_CI_AS
            WHERE MaDonHang = @Id;

            SELECT @@ROWCOUNT AS AffectedRows;
        `);

        const affected = result.recordset[0]?.AffectedRows || 0;
        if (affected === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
    } catch (err) {
        console.error('Admin Update Order Status Error:', err);
        res.status(500).json({ message: err.message });
    }
};


