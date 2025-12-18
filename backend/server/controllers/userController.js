const { connectDB, sql } = require('../config/dbConfig');

// 1. Lấy thông tin Profile (User + List Địa chỉ)
exports.getProfile = async (req, res) => {
    try {
        const pool = await connectDB();
        const userId = req.user.id;

        // Lấy thông tin user
        const userRes = await pool.request()
            .input('Id', sql.Int, userId)
            .query('SELECT HoTen, Email, SoDienThoai, NgayDangKy FROM NguoiDung WHERE MaNguoiDung = @Id');

        // Lấy danh sách địa chỉ
        const addrRes = await pool.request()
            .input('Id', sql.Int, userId)
            .query('SELECT * FROM SoDiaChi WHERE MaNguoiDung = @Id ORDER BY LaMacDinh DESC');

        res.json({
            user: userRes.recordset[0],
            addresses: addrRes.recordset
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Thêm địa chỉ mới
exports.addAddress = async (req, res) => {
    try {
        const { hoTen, sdt, diaChi, macDinh } = req.body;
        const userId = req.user.id;
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Nếu user chọn mặc định, hoặc đây là địa chỉ đầu tiên -> Set các cái khác về 0
        if (macDinh) {
            request.input('UserId', sql.Int, userId);
            await request.query('UPDATE SoDiaChi SET LaMacDinh = 0 WHERE MaNguoiDung = @UserId');
        }

        // Kiểm tra xem user đã có địa chỉ nào chưa, nếu chưa thì cái này bắt buộc là mặc định
        const checkCount = await new sql.Request(transaction)
            .input('UserId', sql.Int, userId)
            .query('SELECT COUNT(*) as count FROM SoDiaChi WHERE MaNguoiDung = @UserId');
        
        let isDefault = macDinh ? 1 : 0;
        if (checkCount.recordset[0].count === 0) isDefault = 1;

        const insertReq = new sql.Request(transaction);
        insertReq.input('UserId', sql.Int, userId)
                 .input('Name', sql.NVarChar, hoTen)
                 .input('Phone', sql.VarChar, sdt)
                 .input('Addr', sql.NVarChar, diaChi)
                 .input('IsDefault', sql.Bit, isDefault);
        
        await insertReq.query(`
            INSERT INTO SoDiaChi (MaNguoiDung, HoTenNguoiNhan, SoDienThoai, DiaChiChiTiet, LaMacDinh)
            VALUES (@UserId, @Name COLLATE Vietnamese_CI_AS, @Phone, @Addr COLLATE Vietnamese_CI_AS, @IsDefault)
        `);

        await transaction.commit();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({ message: 'Thêm địa chỉ thành công' });

    } catch (err) {
        if(transaction) await transaction.rollback();
        res.status(500).json({ message: err.message });
    }
};

// 3. Thiết lập địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user.id;
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        const request = new sql.Request(transaction);

        // Set tất cả về 0
        request.input('UserId', sql.Int, userId);
        await request.query('UPDATE SoDiaChi SET LaMacDinh = 0 WHERE MaNguoiDung = @UserId');

        // Set cái được chọn về 1
        const updateReq = new sql.Request(transaction);
        updateReq.input('UserId', sql.Int, userId)
                 .input('AddrId', sql.Int, addressId);
        await updateReq.query('UPDATE SoDiaChi SET LaMacDinh = 1 WHERE MaDiaChi = @AddrId AND MaNguoiDung = @UserId');

        await transaction.commit();
        res.json({ message: 'Đã đặt làm mặc định' });
    } catch (err) {
        if(transaction) await transaction.rollback();
        res.status(500).json({ message: err.message });
    }
};

// 4. Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const userId = req.user.id;
        const pool = await connectDB();

        // Không cho xóa địa chỉ đang mặc định (logic tùy chọn)
        const check = await pool.request()
            .input('Id', sql.Int, addressId)
            .query('SELECT LaMacDinh FROM SoDiaChi WHERE MaDiaChi = @Id');
            
        if(check.recordset[0] && check.recordset[0].LaMacDinh) {
            return res.status(400).json({message: 'Không thể xóa địa chỉ mặc định. Hãy set địa chỉ khác làm mặc định trước.'});
        }

        await pool.request()
            .input('Id', sql.Int, addressId)
            .input('UserId', sql.Int, userId)
            .query('DELETE FROM SoDiaChi WHERE MaDiaChi = @Id AND MaNguoiDung = @UserId');

        res.json({ message: 'Đã xóa địa chỉ' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Lấy lịch sử đơn hàng (Kèm chi tiết sản phẩm)
exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const pool = await connectDB();
        
        // Query Join nhiều bảng để lấy thông tin chi tiết
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .query(`
                SELECT 
                    dh.MaDonHang, dh.NgayDatHang, dh.TrangThai, dh.TongTien, 
                    dh.DiaChiGiaoHang, dh.HoTenNguoiNhan, dh.SoDienThoaiGiaoHang,
                    ct.SoLuong, ct.DonGia,
                    sp.TenSP,
                    bt.HinhAnh,
                    ms.TenMauSac,
                    kc.TenKichCo
                FROM DonHang dh
                JOIN ChiTietDonHang ct ON dh.MaDonHang = ct.MaDonHang
                JOIN SanPham_BienThe bt ON ct.MaBienThe = bt.MaBienThe
                JOIN SanPham sp ON bt.MaSP = sp.MaSP
                LEFT JOIN MauSac ms ON bt.MaMauSac = ms.MaMauSac
                LEFT JOIN KichCo kc ON bt.MaKichCo = kc.MaKichCo
                WHERE dh.MaNguoiDung = @UserId
                ORDER BY dh.NgayDatHang DESC
            `);
        
        // Xử lý dữ liệu: Gom nhóm các dòng (flat rows) thành object đơn hàng (nested object)
        const ordersMap = new Map();

        result.recordset.forEach(row => {
            if (!ordersMap.has(row.MaDonHang)) {
                ordersMap.set(row.MaDonHang, {
                    MaDonHang: row.MaDonHang,
                    NgayDatHang: row.NgayDatHang,
                    TrangThai: row.TrangThai,
                    TongTien: row.TongTien,
                    HoTen: row.HoTenNguoiNhan,
                    SDT: row.SoDienThoaiGiaoHang,
                    DiaChi: row.DiaChiGiaoHang,
                    Items: [] // Mảng chứa các sản phẩm
                });
            }
            
            // Đẩy sản phẩm vào đơn hàng tương ứng
            ordersMap.get(row.MaDonHang).Items.push({
                TenSP: row.TenSP,
                HinhAnh: row.HinhAnh,
                Mau: row.TenMauSac,
                Size: row.TenKichCo,
                SoLuong: row.SoLuong,
                DonGia: row.DonGia
            });
        });

        // Chuyển Map thành Array để trả về Client
        res.json(Array.from(ordersMap.values()));

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. Cập nhật thông tin cá nhân (Họ tên, SĐT)
exports.updateProfile = async (req, res) => {
    try {
        const { hoTen, soDienThoai } = req.body;
        const userId = req.user.id;
        const pool = await connectDB();

        // Validate cơ bản
        if (!hoTen || !soDienThoai) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ Họ tên và Số điện thoại' });
        }

        await pool.request()
            .input('Id', sql.Int, userId)
            .input('Name', sql.NVarChar, hoTen)
            .input('Phone', sql.VarChar, soDienThoai)
            .query(`
                UPDATE NguoiDung 
                SET HoTen = @Name, SoDienThoai = @Phone 
                WHERE MaNguoiDung = @Id
            `);

        res.json({ message: 'Cập nhật thông tin thành công!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
    const { id } = req.params; // Mã đơn hàng
    const userId = req.user.id;
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Kiểm tra đơn hàng (đúng chủ, đúng trạng thái)
        const checkReq = new sql.Request(transaction);
        checkReq.input('Id', sql.Int, id).input('UserId', sql.Int, userId);
        
        const orderCheck = await checkReq.query(`
            SELECT TrangThai FROM DonHang WHERE MaDonHang = @Id AND MaNguoiDung = @UserId
        `);

        if (orderCheck.recordset.length === 0) {
            throw new Error('Đơn hàng không tồn tại!');
        }
        
        // Lưu ý: Chuỗi so sánh phải khớp chính xác với trong DB (có thể là Unicode N'...')
        // Ở đây mình so sánh tương đối hoặc bạn đảm bảo DB lưu 'Chờ xác nhận'
        const currentStatus = orderCheck.recordset[0].TrangThai;
        if (currentStatus !== 'Chờ xác nhận') {
            throw new Error('Chỉ có thể hủy đơn hàng đang chờ xác nhận!');
        }

        // 2. Cập nhật trạng thái đơn hàng với COLLATE
        const updateReq = new sql.Request(transaction);
        updateReq.input('Id', sql.Int, id)
                 .input('Status', sql.NVarChar, 'Đã hủy');
        await updateReq.query("UPDATE DonHang SET TrangThai = @Status COLLATE Vietnamese_CI_AS WHERE MaDonHang = @Id");

        // 3. Hoàn lại tồn kho (Lấy chi tiết -> Cộng lại vào SanPham_BienThe)
        const detailReq = new sql.Request(transaction);
        detailReq.input('Id', sql.Int, id);
        const items = await detailReq.query('SELECT MaBienThe, SoLuong FROM ChiTietDonHang WHERE MaDonHang = @Id');

        for (const item of items.recordset) {
            const stockReq = new sql.Request(transaction);
            stockReq.input('Qty', sql.Int, item.SoLuong)
                    .input('VariantId', sql.Int, item.MaBienThe);
            // Cộng lại số lượng
            await stockReq.query('UPDATE SanPham_BienThe SET SoLuongTon = SoLuongTon + @Qty WHERE MaBienThe = @VariantId');
        }

        await transaction.commit();
        res.json({ message: 'Hủy đơn hàng thành công!' });

    } catch (err) {
        if(transaction) await transaction.rollback();
        res.status(500).json({ message: err.message });
    }
};