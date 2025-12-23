const { connectDB, sql } = require('../../config/dbConfig');

// GET /api/admin/coupons - Lấy danh sách mã giảm giá
exports.getAllCoupons = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT 
                MaCoupon,
                Code,
                MoTa,
                LoaiGiamGia,
                GiaTri,
                DonHangToiThieu,
                NgayBatDau,
                NgayKetThuc,
                SoLuong
            FROM MaGiamGia
            ORDER BY NgayKetThuc DESC
        `);

        // Tính toán trạng thái cho mỗi mã
        const now = new Date();
        const coupons = result.recordset.map(coupon => {
            let trangThai = 'Hoạt động';
            const ngayBatDau = new Date(coupon.NgayBatDau);
            const ngayKetThuc = new Date(coupon.NgayKetThuc);

            if (now < ngayBatDau) {
                trangThai = 'Chưa diễn ra';
            } else if (now > ngayKetThuc || coupon.SoLuong <= 0) {
                trangThai = 'Hết hạn';
            }

            return {
                ...coupon,
                TrangThai: trangThai
            };
        });

        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error('Error getting coupons:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/admin/coupons - Tạo mã giảm giá mới
exports.createCoupon = async (req, res) => {
    const { Code, MoTa, LoaiGiamGia, GiaTri, DonHangToiThieu, NgayBatDau, NgayKetThuc, SoLuong } = req.body;

    try {
        // Validation
        if (!Code || !LoaiGiamGia || !GiaTri || !NgayBatDau || !NgayKetThuc || !SoLuong) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        if (GiaTri <= 0) {
            return res.status(400).json({ success: false, message: 'Giá trị giảm phải lớn hơn 0!' });
        }

        const startDate = new Date(NgayBatDau);
        const endDate = new Date(NgayKetThuc);
        if (endDate <= startDate) {
            return res.status(400).json({ success: false, message: 'Ngày kết thúc phải sau ngày bắt đầu!' });
        }

        if (LoaiGiamGia === 'Percentage' && GiaTri > 100) {
            return res.status(400).json({ success: false, message: 'Giá trị giảm theo % không được vượt quá 100!' });
        }

        const pool = await connectDB();

        // Kiểm tra Code đã tồn tại chưa
        const checkRequest = pool.request();
        checkRequest.input('Code', sql.VarChar, Code.toUpperCase());
        const checkResult = await checkRequest.query('SELECT * FROM MaGiamGia WHERE Code = @Code');
        
        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Mã Code đã tồn tại!' });
        }

        // Insert mã mới
        const insertRequest = pool.request();
        insertRequest.input('Code', sql.VarChar, Code.toUpperCase());
        insertRequest.input('MoTa', sql.NVarChar, MoTa || '');
        insertRequest.input('LoaiGiamGia', sql.NVarChar, LoaiGiamGia);
        insertRequest.input('GiaTri', sql.Decimal(18, 2), GiaTri);
        insertRequest.input('DonHangToiThieu', sql.Decimal(18, 2), DonHangToiThieu || 0);
        insertRequest.input('NgayBatDau', sql.DateTime, NgayBatDau);
        insertRequest.input('NgayKetThuc', sql.DateTime, NgayKetThuc);
        insertRequest.input('SoLuong', sql.Int, SoLuong);

        await insertRequest.query(`
            INSERT INTO MaGiamGia (Code, MoTa, LoaiGiamGia, GiaTri, DonHangToiThieu, NgayBatDau, NgayKetThuc, SoLuong)
            VALUES (@Code, @MoTa, @LoaiGiamGia, @GiaTri, @DonHangToiThieu, @NgayBatDau, @NgayKetThuc, @SoLuong)
        `);

        res.status(201).json({ success: true, message: 'Tạo mã giảm giá thành công!' });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/admin/coupons/:id - Cập nhật mã giảm giá
exports.updateCoupon = async (req, res) => {
    const { id } = req.params;
    const { MoTa, DonHangToiThieu, NgayBatDau, NgayKetThuc, SoLuong } = req.body;

    try {
        // Validation
        if (!NgayBatDau || !NgayKetThuc || SoLuong === undefined) {
            return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        const startDate = new Date(NgayBatDau);
        const endDate = new Date(NgayKetThuc);
        if (endDate <= startDate) {
            return res.status(400).json({ success: false, message: 'Ngày kết thúc phải sau ngày bắt đầu!' });
        }

        const pool = await connectDB();
        const updateRequest = pool.request();
        
        updateRequest.input('MaCoupon', sql.Int, id);
        updateRequest.input('MoTa', sql.NVarChar, MoTa || '');
        updateRequest.input('DonHangToiThieu', sql.Decimal(18, 2), DonHangToiThieu || 0);
        updateRequest.input('NgayBatDau', sql.DateTime, NgayBatDau);
        updateRequest.input('NgayKetThuc', sql.DateTime, NgayKetThuc);
        updateRequest.input('SoLuong', sql.Int, SoLuong);

        const result = await updateRequest.query(`
            UPDATE MaGiamGia
            SET MoTa = @MoTa,
                DonHangToiThieu = @DonHangToiThieu,
                NgayBatDau = @NgayBatDau,
                NgayKetThuc = @NgayKetThuc,
                SoLuong = @SoLuong
            WHERE MaCoupon = @MaCoupon
        `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá!' });
        }

        res.json({ success: true, message: 'Cập nhật mã giảm giá thành công!' });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/coupons/:id - Xóa mã giảm giá
exports.deleteCoupon = async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await connectDB();
        const deleteRequest = pool.request();
        deleteRequest.input('MaCoupon', sql.Int, id);

        const result = await deleteRequest.query('DELETE FROM MaGiamGia WHERE MaCoupon = @MaCoupon');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá!' });
        }

        res.json({ success: true, message: 'Xóa mã giảm giá thành công!' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
