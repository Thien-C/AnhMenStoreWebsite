const { connectDB, sql } = require('../config/dbConfig');

// Helper: Lấy MaGioHang của User
async function getCartId(userId, pool) {
    if (!pool) {
        throw new Error('Database connection not available');
    }
    const res = await pool.request()
        .input('MaNguoiDung', sql.Int, userId)
        .query('SELECT MaGioHang FROM GioHang WHERE MaNguoiDung = @MaNguoiDung');
    return res.recordset.length ? res.recordset[0].MaGioHang : null;
}

// 1. GET: Lấy danh sách giỏ hàng
exports.getCart = async (req, res) => {
    try {
        const pool = await connectDB();
        if (!pool) {
            return res.status(500).json({ message: 'Database connection failed' });
        }
        const cartId = await getCartId(req.user.id, pool);
        
        if (!cartId) return res.json([]);

        const result = await pool.request()
            .input('MaGioHang', sql.Int, cartId)
            .query(`
                SELECT 
                    ct.MaChiTietGH, ct.SoLuong, ct.MaBienThe,
                    sp.TenSP, sp.MaSP,
                    ms.TenMauSac, kc.TenKichCo,
                    bt.Gia, bt.HinhAnh, bt.SoLuongTon
                FROM ChiTietGioHang ct
                JOIN SanPham_BienThe bt ON ct.MaBienThe = bt.MaBienThe
                JOIN SanPham sp ON bt.MaSP = sp.MaSP
                LEFT JOIN MauSac ms ON bt.MaMauSac = ms.MaMauSac
                LEFT JOIN KichCo kc ON bt.MaKichCo = kc.MaKichCo
                WHERE ct.MaGioHang = @MaGioHang
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. POST: Thêm vào giỏ
exports.addToCart = async (req, res) => {
    try {
        const { maBienThe, soLuong } = req.body;
        const pool = await connectDB();
        if (!pool) {
            return res.status(500).json({ message: 'Database connection failed' });
        }
        const cartId = await getCartId(req.user.id, pool);

        // Kiểm tra tồn tại
        const checkItem = await pool.request()
            .input('MaGioHang', sql.Int, cartId)
            .input('MaBienThe', sql.Int, maBienThe)
            .query('SELECT * FROM ChiTietGioHang WHERE MaGioHang = @MaGioHang AND MaBienThe = @MaBienThe');

        if (checkItem.recordset.length > 0) {
            // Update cộng dồn
            await pool.request()
                .input('MaGioHang', sql.Int, cartId)
                .input('MaBienThe', sql.Int, maBienThe)
                .input('SoLuong', sql.Int, soLuong)
                .query('UPDATE ChiTietGioHang SET SoLuong = SoLuong + @SoLuong WHERE MaGioHang = @MaGioHang AND MaBienThe = @MaBienThe');
        } else {
            // Insert mới
            await pool.request()
                .input('MaGioHang', sql.Int, cartId)
                .input('MaBienThe', sql.Int, maBienThe)
                .input('SoLuong', sql.Int, soLuong)
                .query('INSERT INTO ChiTietGioHang (MaGioHang, MaBienThe, SoLuong) VALUES (@MaGioHang, @MaBienThe, @SoLuong)');
        }
        res.json({ message: 'Đã thêm vào giỏ' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. PUT: Cập nhật số lượng
exports.updateCartItem = async (req, res) => {
    try {
        const { maChiTietGH, soLuong } = req.body;
        const pool = await connectDB();
        if (!pool) {
            return res.status(500).json({ message: 'Database connection failed' });
        }
        await pool.request()
            .input('Id', sql.Int, maChiTietGH)
            .input('Sl', sql.Int, soLuong)
            .query('UPDATE ChiTietGioHang SET SoLuong = @Sl WHERE MaChiTietGH = @Id');
        res.json({ message: 'Đã cập nhật' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. DELETE: Xóa item
exports.removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();        if (!pool) {
            return res.status(500).json({ message: 'Database connection failed' });
        }        await pool.request()
            .input('Id', sql.Int, id)
            .query('DELETE FROM ChiTietGioHang WHERE MaChiTietGH = @Id');
        res.json({ message: 'Đã xóa sản phẩm' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. MERGE: Gộp LocalStorage vào Database (Khi login)
exports.mergeCart = async (req, res) => {
    try {
        const { items } = req.body; // Mảng [{maBienThe, soLuong}]
        if (!items || items.length === 0) return res.json({ message: 'No items' });

        const pool = await connectDB();
        if (!pool) {
            return res.status(500).json({ message: 'Database connection failed' });
        }
        const cartId = await getCartId(req.user.id, pool);

        for (const item of items) {
             const check = await pool.request()
                .input('GH', sql.Int, cartId)
                .input('BT', sql.Int, item.maBienThe)
                .query('SELECT * FROM ChiTietGioHang WHERE MaGioHang = @GH AND MaBienThe = @BT');

            if (check.recordset.length > 0) {
                await pool.request()
                    .input('GH', sql.Int, cartId)
                    .input('BT', sql.Int, item.maBienThe)
                    .input('SL', sql.Int, item.soLuong)
                    .query('UPDATE ChiTietGioHang SET SoLuong = SoLuong + @SL WHERE MaGioHang = @GH AND MaBienThe = @BT');
            } else {
                await pool.request()
                    .input('GH', sql.Int, cartId)
                    .input('BT', sql.Int, item.maBienThe)
                    .input('SL', sql.Int, item.soLuong)
                    .query('INSERT INTO ChiTietGioHang (MaGioHang, MaBienThe, SoLuong) VALUES (@GH, @BT, @SL)');
            }
        }
        res.json({ message: 'Merge thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};