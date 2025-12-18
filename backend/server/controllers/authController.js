const { connectDB, sql } = require('../config/dbConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');



// API: ĐĂNG KÝ
exports.register = async (req, res) => {
    const { HoTen, Email, SoDienThoai, MatKhau, ConfirmMatKhau } = req.body;

    try {
        // 1. Validation cơ bản
        if (!HoTen || !Email || !SoDienThoai || !MatKhau) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
        }
        // SoDienThoai chỉ chứa số và có độ dài hợp lệ
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(SoDienThoai)) {
            return res.status(400).json({ message: 'Số điện thoại không hợp lệ!' });
        }
        // 2. Kiểm tra định dạng Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            return res.status(400).json({ message: 'Email không đúng định dạng (name@example.com)!' });
        }

        // 3. Kiểm tra độ mạnh mật khẩu (>=8 ký tự, hoa, thường, số, ký tự đặc biệt)
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passRegex.test(MatKhau)) {
            return res.status(400).json({ 
                message: 'Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!' 
            });
        }

        // 4. Kiểm tra khớp mật khẩu
        if (MatKhau !== ConfirmMatKhau) {
            return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp!' });
        }

        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        // 5. Kiểm tra Email tồn tại
        const checkRequest = new sql.Request(transaction);
        checkRequest.input('Email', sql.VarChar, Email);
        const checkResult = await checkRequest.query('SELECT * FROM NguoiDung WHERE Email = @Email');
        
        if (checkResult.recordset.length > 0) {
            throw new Error('Email đã tồn tại trong hệ thống!');
        }

        // 6. Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(MatKhau, salt);

        // 7. Insert người dùng
        const insertUserReq = new sql.Request(transaction);
        insertUserReq.input('HoTen', sql.NVarChar, HoTen)
                     .input('Email', sql.VarChar, Email)
                     .input('SoDienThoai', sql.VarChar, SoDienThoai)
                     .input('MatKhau', sql.VarChar, hashedPassword);
        
        const userResult = await insertUserReq.query(`
            INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, MatKhau) 
            VALUES (@HoTen COLLATE Vietnamese_CI_AS, @Email, @SoDienThoai, @MatKhau);
            SELECT SCOPE_IDENTITY() AS MaNguoiDung;
        `);

        const newUserId = userResult.recordset[0].MaNguoiDung;

        // 8. Tạo giỏ hàng
        const insertCartReq = new sql.Request(transaction);
        insertCartReq.input('MaNguoiDung', sql.Int, newUserId);
        await insertCartReq.query('INSERT INTO GioHang (MaNguoiDung) VALUES (@MaNguoiDung)');

        await transaction.commit();
        res.status(201).json({ message: 'Đăng ký thành công!', userId: newUserId });

    } catch (error) {
        if (typeof transaction !== 'undefined') await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

// API: ĐĂNG NHẬP
exports.login = async (req, res) => {
    const { Email, MatKhau } = req.body;

    try {
        // Validation đầu vào
        if (!Email || !MatKhau) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Email và Mật khẩu!' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            return res.status(400).json({ message: 'Email không đúng định dạng!' });
        }

        const pool = await connectDB();
        const request = pool.request();
        request.input('Email', sql.VarChar, Email);
        
        const result = await request.query('SELECT * FROM NguoiDung WHERE Email = @Email');
        const user = result.recordset[0];

        if (!user) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

        const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
        if (!isMatch) return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });

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


// Cấu hình email transporter
let emailTransporter;
try {
    emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        }
    });
} catch (error) {
    console.warn('⚠️ Email service not configured. OTP will be logged to console only.');
    emailTransporter = null;
}
// Store OTP tạm thời (production nên dùng Redis)
const otpStorage = new Map();

// API: Gửi OTP quên mật khẩu
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const pool = await connectDB();
        const request = pool.request();
        request.input('Email', sql.VarChar, email);
        
        // Kiểm tra email có tồn tại không
        const result = await request.query('SELECT MaNguoiDung, HoTen FROM NguoiDung WHERE Email = @Email');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Email không tồn tại trong hệ thống!' 
            });
        }

        const user = result.recordset[0];
        
        // Tạo mã OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Lưu OTP với thời hạn 5 phút
        otpStorage.set(email, {
            otp,
            userId: user.MaNguoiDung,
            expires: Date.now() + 5 * 60 * 1000 // 5 phút
        });

        // Gửi email hoặc log OTP nếu email service chưa cấu hình
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@anhmenstore.com',
            to: email,
            subject: 'Mã OTP đặt lại mật khẩu - Anh Men Store',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e40af;">Anh Men Store</h2>
                    <p>Xin chào ${user.HoTen},</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã OTP của bạn là:</p>
                    <h1 style="color: #dc2626; text-align: center; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
                    <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">© 2025 Anh Men Store. All rights reserved.</p>
                </div>
            `
        };

        // Nếu email service chưa cấu hình, chỉ log OTP ra console
        if (!emailTransporter || !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.log('╔══════════════════════════════════════════╗');
            console.log('║          MÃ OTP QUÊN MẬT KHẨU           ║');
            console.log('╠══════════════════════════════════════════╣');
            console.log(`║  Email: ${email.padEnd(33, ' ')}║`);
            console.log(`║  OTP:   ${otp.padEnd(33, ' ')}║`);
            console.log(`║  User:  ${user.HoTen.padEnd(33, ' ')}║`);
            console.log('║  Hiệu lực: 5 phút                        ║');
            console.log('╚══════════════════════════════════════════╝');
            
            res.json({ 
                success: true, 
                message: 'Mã OTP đã được tạo! (Kiểm tra console server để lấy mã)',
                devMode: true,
                otp: otp // CHỈ TRẢ VỀ OTP KHI CHƯA CẤU HÌNH EMAIL (DEV MODE)
            });
        } else {
            // Gửi email thực
            try {
                await emailTransporter.sendMail(mailOptions);
                console.log(`✅ OTP đã gửi đến email: ${email}`);
                
                res.json({ 
                    success: true, 
                    message: 'Mã OTP đã được gửi đến email của bạn!' 
                });
            } catch (emailError) {
                console.error('❌ Lỗi gửi email:', emailError);
                // Vẫn log OTP ra console để user có thể test
                console.log('╔══════════════════════════════════════════╗');
                console.log('║     MÃ OTP (Email gửi thất bại)         ║');
                console.log('╠══════════════════════════════════════════╣');
                console.log(`║  Email: ${email.padEnd(33, ' ')}║`);
                console.log(`║  OTP:   ${otp.padEnd(33, ' ')}║`);
                console.log('╚══════════════════════════════════════════╝');
                
                res.json({ 
                    success: true, 
                    message: 'Email service chưa sẵn sàng. Mã OTP đã được tạo (kiểm tra console server)',
                    devMode: true,
                    otp: otp
                });
            }
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại!' 
        });
    }
};

// API: Xác thực OTP và đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Kiểm tra OTP
        const otpData = otpStorage.get(email);
        
        if (!otpData) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã OTP không hợp lệ hoặc đã hết hạn!' 
            });
        }

        if (otpData.expires < Date.now()) {
            otpStorage.delete(email);
            return res.status(400).json({ 
                success: false, 
                message: 'Mã OTP đã hết hạn!' 
            });
        }

        if (otpData.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mã OTP không đúng!' 
            });
        }

        // Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu trong database
        const pool = await connectDB();
        const request = pool.request();
        request.input('MatKhau', sql.VarChar, hashedPassword);
        request.input('MaNguoiDung', sql.Int, otpData.userId);
        
        await request.query('UPDATE NguoiDung SET MatKhau = @MatKhau WHERE MaNguoiDung = @MaNguoiDung');

        // Xóa OTP đã sử dụng
        otpStorage.delete(email);

        res.json({ 
            success: true, 
            message: 'Đổi mật khẩu thành công!' 
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại!' 
        });
    }
};