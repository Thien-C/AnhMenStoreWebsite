const { connectDB, sql } = require('../config/dbConfig');

exports.createOrder = async (req, res) => {
    const { hoTen, diaChi, soDienThoai, phuongThucTT } = req.body;
    const userId = req.user.id;
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin(); // Bắt đầu giao dịch

        // 1. Lấy dữ liệu từ Giỏ hàng (Tính tiền tại server để bảo mật)
        const cartReq = new sql.Request(transaction);
        cartReq.input('UserId', sql.Int, userId);
        const cartItems = await cartReq.query(`
            SELECT ct.MaBienThe, ct.SoLuong, bt.Gia 
            FROM ChiTietGioHang ct
            JOIN GioHang gh ON ct.MaGioHang = gh.MaGioHang
            JOIN SanPham_BienThe bt ON ct.MaBienThe = bt.MaBienThe
            WHERE gh.MaNguoiDung = @UserId
        `);

        if (cartItems.recordset.length === 0) throw new Error('Giỏ hàng trống!');

        const totalAmount = cartItems.recordset.reduce((sum, item) => sum + (item.SoLuong * item.Gia), 0);

        // 2. Insert DonHang
        const orderReq = new sql.Request(transaction);
        orderReq.input('UserId', sql.Int, userId)
                .input('Name', sql.NVarChar, hoTen)
                .input('Addr', sql.NVarChar, diaChi)
                .input('Phone', sql.VarChar, soDienThoai)
                .input('Total', sql.Decimal, totalAmount)
                .input('Method', sql.NVarChar, phuongThucTT);
        
        const orderRes = await orderReq.query(`
            INSERT INTO DonHang (MaNguoiDung, HoTenNguoiNhan, DiaChiGiaoHang, SoDienThoaiGiaoHang, TongTien, PhuongThucThanhToan)
            VALUES (@UserId, @Name, @Addr, @Phone, @Total, @Method);
            SELECT SCOPE_IDENTITY() AS MaDonHang;
        `);
        const newOrderId = orderRes.recordset[0].MaDonHang;

        // 3. Insert ChiTietDonHang & Trừ Tồn Kho
        for (const item of cartItems.recordset) {
            // Trừ tồn kho (Quan trọng: Kiểm tra >= Qty)
            const stockReq = new sql.Request(transaction);
            stockReq.input('Id', sql.Int, item.MaBienThe).input('Qty', sql.Int, item.SoLuong);
            
            const updateStock = await stockReq.query(`
                UPDATE SanPham_BienThe SET SoLuongTon = SoLuongTon - @Qty 
                WHERE MaBienThe = @Id AND SoLuongTon >= @Qty
            `);

            if (updateStock.rowsAffected[0] === 0) {
                throw new Error(`Sản phẩm (ID: ${item.MaBienThe}) không đủ hàng!`);
            }

            // Insert Chi tiết
            const detailReq = new sql.Request(transaction);
            detailReq.input('OrderId', sql.Int, newOrderId)
                     .input('VariantId', sql.Int, item.MaBienThe)
                     .input('Qty', sql.Int, item.SoLuong)
                     .input('Price', sql.Decimal, item.Gia);
            await detailReq.query(`INSERT INTO ChiTietDonHang (MaDonHang, MaBienThe, SoLuong, DonGia) VALUES (@OrderId, @VariantId, @Qty, @Price)`);
        }

        // 4. Xóa Giỏ hàng
        const clearReq = new sql.Request(transaction);
        clearReq.input('UserId', sql.Int, userId);
        await clearReq.query(`DELETE ct FROM ChiTietGioHang ct JOIN GioHang gh ON ct.MaGioHang = gh.MaGioHang WHERE gh.MaNguoiDung = @UserId`);

        await transaction.commit(); // Thành công -> Lưu DB
        res.json({ message: 'Đặt hàng thành công!', orderId: newOrderId });

    } catch (err) {
        await transaction.rollback(); // Lỗi -> Hoàn tác tất cả
        res.status(500).json({ message: err.message });
    }
};