class CartManager {
    static getUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    static getLocalCart() {
        return JSON.parse(localStorage.getItem('cart_items')) || [];
    }

    static setLocalCart(items) {
        localStorage.setItem('cart_items', JSON.stringify(items));
    }

    // --- CẬP NHẬT BADGE SỐ LƯỢNG ---
    static async updateBadge() {
        const badge = document.getElementById('cart-count');
        if (!badge) return;

        const user = this.getUser();
        let count = 0;

        if (user) {
            try {
                // Nếu login: Gọi API lấy danh sách và đếm số phần tử
                const cartItems = await API.get('/cart');
                if (Array.isArray(cartItems)) {
                    // SỬA: Lấy độ dài mảng (số loại SP) thay vì cộng dồn số lượng
                    count = cartItems.length; 
                }
            } catch (e) { console.error(e); }
        } else {
            // Nếu guest: Đếm từ LocalStorage
            const localItems = this.getLocalCart();
            // SỬA: Lấy độ dài mảng (số loại SP) thay vì cộng dồn số lượng
            count = localItems.length;
        }

        badge.innerText = count;
        // Ẩn hiện badge (Chỉ hiện khi > 0)
        badge.style.display = count > 0 ? 'block' : 'none';
    }
    // --- THÊM VÀO GIỎ ---
    static async addToCart(variantId, quantity) {
        const user = this.getUser();
        
        if (user) {
            const res = await API.post('/cart/add', { maBienThe: variantId, soLuong: quantity });
            alert(res.message || 'Đã thêm vào giỏ hàng');
        } else {
            let items = this.getLocalCart();
            const existItem = items.find(i => i.maBienThe === variantId);
            
            if (existItem) {
                existItem.soLuong += quantity;
            } else {
                items.push({ maBienThe: variantId, soLuong: quantity });
            }
            this.setLocalCart(items);
            alert('Đã thêm vào giỏ hàng (Lưu trên máy)');
        }
        
        this.updateBadge();
    }
    
    // --- [MỚI] LẤY CHI TIẾT GIỎ HÀNG (ĐỂ HIỂN THỊ TRANG CART.HTML) ---
    static async getCartDetails() {
        const user = this.getUser();
        
        if (user) {
            // 1. Nếu đã đăng nhập: Lấy full từ API
            const res = await API.get('/cart');
            return Array.isArray(res) ? res : [];
        } else {
            // 2. Nếu chưa đăng nhập: Lấy ID từ Local -> Gọi API lấy thông tin SP -> Ghép lại
            const localItems = this.getLocalCart();
            if (localItems.length === 0) return [];

            const ids = localItems.map(i => i.maBienThe);
            // Gọi API mới vừa tạo ở Backend
            const variants = await API.post('/products/variants', { ids });

            // Ghép số lượng từ Local vào thông tin từ Server
            return variants.map(v => {
                const item = localItems.find(i => i.maBienThe === v.MaBienThe);
                return {
                    ...v,
                    SoLuong: item ? item.soLuong : 0,
                    // Giả lập ID chi tiết giỏ hàng bằng ID biến thể để nút Xóa hoạt động
                    MaChiTietGH: v.MaBienThe 
                };
            });
        }
    }

    // --- [MỚI] XÓA SẢN PHẨM KHỎI GIỎ ---
    static async removeItem(id) {
        const user = this.getUser();
        
        if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            if (user) {
                // API xóa cần MaChiTietGH
                await API.delete(`/cart/${id}`);
            } else {
                // Local xóa theo MaBienThe (id truyền vào)
                let items = this.getLocalCart();
                items = items.filter(i => i.maBienThe != id);
                this.setLocalCart(items);
            }
            // Reload lại trang để cập nhật giao diện
            window.location.reload();
        }
    }
    // --- [MỚI] CẬP NHẬT SỐ LƯỢNG ---
    static async updateQuantity(id, newQty, maxStock) {
        newQty = parseInt(newQty);
        
        // Validate cơ bản
        if (isNaN(newQty) || newQty < 1) newQty = 1;

        // Validate tồn kho (nếu có truyền maxStock)
        if (maxStock !== undefined && newQty > maxStock) {
            alert(`Kho chỉ còn ${maxStock} sản phẩm cho mẫu này!`);
            newQty = maxStock;
        }

        const user = this.getUser();
        if (user) {
            // Đã login: Gọi API PUT
            await API.put('/cart/update', { maChiTietGH: id, soLuong: newQty });
        } else {
            // Guest: Sửa LocalStorage
            let items = this.getLocalCart();
            const item = items.find(i => i.maBienThe === id);
            if (item) {
                item.soLuong = newQty;
                this.setLocalCart(items);
            }
        }
        
        window.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateBadge();
});