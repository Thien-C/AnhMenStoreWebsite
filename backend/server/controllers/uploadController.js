const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục asset nếu chưa có (để hiển thị ảnh trên frontend)
const uploadsDir = path.join(__dirname, '../../../frontend/client/asset');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file unique với timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ accept file ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Middleware để handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File quá lớn! Tối đa 5MB' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ success: false, message: 'Quá nhiều file! Tối đa 10 ảnh' });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
};

// API upload nhiều ảnh
exports.uploadMultipleImages = [
    upload.array('images', 10),
    handleMulterError,
    (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: 'Không có file được upload!' });
            }
            
            // Trả về array các đường dẫn (relative to frontend)
            const imagePaths = req.files.map(file => `/asset/${file.filename}`);
            
            res.json({ 
                success: true, 
                message: 'Upload thành công!',
                imagePaths: imagePaths,
                count: req.files.length
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
];

// API upload ảnh đơn (giữ lại để backward compatible)
exports.uploadImage = [
    upload.single('image'),
    handleMulterError,
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Không có file được upload!' });
            }
            
            const relativePath = `/asset/${req.file.filename}`;
            
            res.json({ 
                success: true, 
                message: 'Upload thành công!',
                imagePath: relativePath,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
];
