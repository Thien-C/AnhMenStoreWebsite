const { connectDB, sql } = require('../config/dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { HoTen, Email, SoDienThoai, MatKhau } = req.body;
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // 1. Kiểm tra Email tồn tại
        const checkRequest = new sql.Request(transaction);
        checkRequest.input('Email', sql.VarChar, Email);
        const checkResult = await checkRequest.query('SELECT * FROM NguoiDung WHERE Email = @Email');
        
        if (checkResult.recordset.length > 0) {
            throw new Error('Email đã tồn tại!');
        }

        // 2. Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(MatKhau, salt);

        // 3. Insert NguoiDung và lấy ID vừa tạo
        const insertUserReq = new sql.Request(transaction);
        insertUserReq.input('HoTen', sql.NVarChar, HoTen)
                     .input('Email', sql.VarChar, Email)
                     .input('SoDienThoai', sql.VarChar, SoDienThoai)
                     .input('MatKhau', sql.VarChar, hashedPassword);
        
        // Dùng SCOPE_IDENTITY() để lấy MaNguoiDung vừa tạo
        const userResult = await insertUserReq.query(`
            INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau) 
            VALUES (@HoTen, @Email, @SoDienThoai, @MatKhau);
            SELECT SCOPE_IDENTITY() AS MaNguoiDung;
        `);

        const newUserId = userResult.recordset[0].MaNguoiDung;

        // 4. Tự động tạo GioHang cho User này
        const insertCartReq = new sql.Request(transaction);
        insertCartReq.input('MaNguoiDung', sql.Int, newUserId);
        await insertCartReq.query('INSERT INTO GioHang (MaNguoiDung) VALUES (@MaNguoiDung)');

        await transaction.commit();
        res.status(201).json({ message: 'Đăng ký thành công!', userId: newUserId });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { Email, MatKhau } = req.body;

    try {
        const pool = await connectDB();
        const request = pool.request();
        request.input('Email', sql.VarChar, Email);
        
        const result = await request.query('SELECT * FROM NguoiDung WHERE Email = @Email');
        const user = result.recordset[0];

        if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
        if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

        // Tạo Token
        const token = jwt.sign(
            { id: user.MaNguoiDung, role: user.VaiTro },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.MaNguoiDung,
                name: user.HoTen,
                role: user.VaiTro
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};