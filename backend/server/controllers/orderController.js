// backend/server/controllers/orderController.js
const { connectDB, sql } = require('../config/dbConfig');

exports.createOrder = async (req, res) => {
    // 1. Nhận listItems từ req.body
    const { hoTen, diaChi, soDienThoai, phuongThucTT, listItems } = req.body;
    const userId = req.user.id;
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin(); 

        // Kiểm tra nếu không có listItems hoặc mảng rỗng
        if (!listItems || !Array.isArray(listItems) || listItems.length === 0) {
            throw new Error('Không có sản phẩm nào được chọn!');
        }

        // --- XỬ LÝ SQL ĐỘNG CHO MỆNH ĐỀ IN (...) ---
        // Tạo danh sách tham số: @id0, @id1, @id2...
        const request = new sql.Request(transaction);
        const params = listItems.map((id, index) => `@id${index}`).join(',');

        // Gán giá trị cho từng tham số
        request.input('UserId', sql.Int, userId);
        listItems.forEach((id, index) => {
            request.input(`id${index}`, sql.Int, id);
        });

        // 2. Query Lấy dữ liệu (CHỈ NHỮNG MÓN ĐƯỢC CHỌN)
        // Thêm điều kiện: AND ct.MaBienThe IN (...)
        const cartQuery = `
            SELECT ct.MaBienThe, ct.SoLuong, bt.Gia 
            FROM ChiTietGioHang ct
            JOIN GioHang gh ON ct.MaGioHang = gh.MaGioHang
            JOIN SanPham_BienThe bt ON ct.MaBienThe = bt.MaBienThe
            WHERE gh.MaNguoiDung = @UserId 
            AND ct.MaBienThe IN (${params})  
        `;
        
        const cartItems = await request.query(cartQuery);

        if (cartItems.recordset.length === 0) throw new Error('Giỏ hàng trống hoặc sản phẩm chọn không hợp lệ!');

        const totalAmount = cartItems.recordset.reduce((sum, item) => sum + (item.SoLuong * item.Gia), 0);

        // 3. Insert DonHang với COLLATE Vietnamese_CI_AS
        const orderReq = new sql.Request(transaction);
        orderReq.input('UserId', sql.Int, userId)
                .input('Name', sql.NVarChar, hoTen)
                .input('Addr', sql.NVarChar, diaChi)
                .input('Phone', sql.VarChar, soDienThoai)
                .input('Total', sql.Decimal, totalAmount)
                .input('Method', sql.NVarChar, phuongThucTT)
                .input('Status', sql.NVarChar, 'Chờ xác nhận');  // ✅ Thêm trạng thái mặc định
        
        const orderRes = await orderReq.query(`
            INSERT INTO DonHang (MaNguoiDung, HoTenNguoiNhan, DiaChiGiaoHang, SoDienThoaiGiaoHang, TongTien, PhuongThucThanhToan, TrangThai)
            VALUES (@UserId, @Name COLLATE Vietnamese_CI_AS, @Addr COLLATE Vietnamese_CI_AS, @Phone, @Total, @Method COLLATE Vietnamese_CI_AS, @Status COLLATE Vietnamese_CI_AS);
            SELECT SCOPE_IDENTITY() AS MaDonHang;
        `);
        const newOrderId = orderRes.recordset[0].MaDonHang;

        // 4. Insert ChiTietDonHang & Trừ Tồn Kho (Vòng lặp không đổi)
        for (const item of cartItems.recordset) {
            const stockReq = new sql.Request(transaction);
            stockReq.input('Id', sql.Int, item.MaBienThe).input('Qty', sql.Int, item.SoLuong);
            
            const updateStock = await stockReq.query(`
                UPDATE SanPham_BienThe SET SoLuongTon = SoLuongTon - @Qty 
                WHERE MaBienThe = @Id AND SoLuongTon >= @Qty
            `);

            if (updateStock.rowsAffected[0] === 0) {
                throw new Error(`Sản phẩm (ID: ${item.MaBienThe}) không đủ hàng!`);
            }

            const detailReq = new sql.Request(transaction);
            detailReq.input('OrderId', sql.Int, newOrderId)
                     .input('VariantId', sql.Int, item.MaBienThe)
                     .input('Qty', sql.Int, item.SoLuong)
                     .input('Price', sql.Decimal, item.Gia);
            await detailReq.query(`INSERT INTO ChiTietDonHang (MaDonHang, MaBienThe, SoLuong, DonGia) VALUES (@OrderId, @VariantId, @Qty, @Price)`);
        }

        // 5. Xóa các sản phẩm ĐÃ MUA khỏi Giỏ hàng (QUAN TRỌNG: Chỉ xóa món đã chọn)
        // Phải tạo lại request mới để xóa vì request cũ đã execute
        const clearReq = new sql.Request(transaction);
        clearReq.input('UserId', sql.Int, userId);
        
        // Gán lại tham số id cho query xóa
        listItems.forEach((id, index) => {
            clearReq.input(`id${index}`, sql.Int, id);
        });

        // Query DELETE chỉ xóa sản phẩm nằm trong IN (...)
        await clearReq.query(`
            DELETE ct 
            FROM ChiTietGioHang ct 
            JOIN GioHang gh ON ct.MaGioHang = gh.MaGioHang 
            WHERE gh.MaNguoiDung = @UserId 
            AND ct.MaBienThe IN (${params})
        `);

        await transaction.commit();
        
        // ✅ Set charset UTF-8 cho response
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({ message: 'Đặt hàng thành công!', orderId: newOrderId });

    } catch (err) {
        if(transaction) await transaction.rollback();
        res.status(500).json({ message: err.message });
    }
};