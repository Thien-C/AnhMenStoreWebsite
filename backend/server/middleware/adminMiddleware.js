const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    }

    try {
        // Token thường có dạng "Bearer <token>"
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

        // Lưu payload vào req.user (tương tự authMiddleware)
        req.user = decoded;

        // Kiểm tra role / VaiTro
        const role = decoded.role || decoded.VaiTro;
        if (role !== 'Admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập (Admin only)' });
        }

        next();
    } catch (e) {
        return res.status(400).json({ message: 'Token không hợp lệ' });
    }
};


