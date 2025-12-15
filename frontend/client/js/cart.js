// File: client/js/cart.js

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

    // --- CẬP NHẬT SỐ LƯỢNG TRÊN HEADER (MỚI) ---
    static async updateBadge() {
        const badge = document.getElementById('cart-count');
        if (!badge) return;

        const user = this.getUser();
        let count = 0;

        if (user) {
            // Nếu đã đăng nhập: Gọi API đếm số lượng thật trong DB
            try {
                const cartItems = await API.get('/cart');
                // Cộng dồn số lượng các món
                if (Array.isArray(cartItems)) {
                    count = cartItems.reduce((sum, item) => sum + item.SoLuong, 0);
                }
            } catch (e) { console.error(e); }
        } else {
            // Nếu chưa đăng nhập: Đếm từ LocalStorage
            const localItems = this.getLocalCart();
            count = localItems.reduce((sum, item) => sum + item.soLuong, 0);
        }

        badge.innerText = count;
    }

    // --- THÊM VÀO GIỎ ---
    static async addToCart(variantId, quantity) {
        const user = this.getUser();
        
        if (user) {
            // Đã đăng nhập -> Gọi API
            const res = await API.post('/cart/add', { maBienThe: variantId, soLuong: quantity });
            alert(res.message || 'Đã thêm vào giỏ hàng');
        } else {
            // Chưa đăng nhập -> Lưu Local
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
        
        // [QUAN TRỌNG] Cập nhật lại số lượng ngay lập tức
        this.updateBadge();
    }
}

// Tự động chạy updateBadge khi file js được load (để hiển thị số ngay khi vào trang)
document.addEventListener('DOMContentLoaded', () => {
    CartManager.updateBadge();
});