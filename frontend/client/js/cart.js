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

    // Cập nhật số lượng trên icon giỏ hàng
    static async updateBadge() {
        const badge = document.getElementById('cart-count');
        if (!badge) return;

        const user = this.getUser();
        let count = 0;

        if (user) {
            try {
                const cartItems = await API.get('/cart');
                if (Array.isArray(cartItems)) count = cartItems.length; 
            } catch (e) { console.error(e); }
        } else {
            const localItems = this.getLocalCart();
            count = localItems.length;
        }

        badge.innerText = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }

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
            alert('Đã thêm vào giỏ hàng (Máy cục bộ)');
        }
        this.updateBadge();
    }
    
    static async getCartDetails() {
        const user = this.getUser();
        if (user) {
            const res = await API.get('/cart');
            return Array.isArray(res) ? res : [];
        } else {
            const localItems = this.getLocalCart();
            if (localItems.length === 0) return [];
            const ids = localItems.map(i => i.maBienThe);
            const variants = await API.post('/products/variants', { ids });

            return variants.map(v => {
                const item = localItems.find(i => i.maBienThe === v.MaBienThe);
                return {
                    ...v,
                    SoLuong: item ? item.soLuong : 0,
                    MaChiTietGH: v.MaBienThe 
                };
            });
        }
    }

    static async removeItem(id) {
        const user = this.getUser();
        if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            if (user) {
                await API.delete(`/cart/${id}`);
            } else {
                let items = this.getLocalCart();
                items = items.filter(i => i.maBienThe != id);
                this.setLocalCart(items);
            }
            // Reload lại để cập nhật giao diện
            // Nếu đang ở trang cart thì gọi render lại, nếu không thì reload trang
            if (document.getElementById('cart-items')) {
                this.renderCartPage(); 
                this.updateBadge();
            } else {
                window.location.reload();
            }
        }
    }

    static async updateQuantity(id, newQty, maxStock) {
        newQty = parseInt(newQty);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        if (maxStock !== undefined && newQty > maxStock) {
            alert(`Kho chỉ còn ${maxStock} sản phẩm!`);
            newQty = maxStock;
        }

        const user = this.getUser();
        if (user) {
            await API.put('/cart/update', { maChiTietGH: id, soLuong: newQty });
        } else {
            let items = this.getLocalCart();
            const item = items.find(i => i.maBienThe === id);
            if (item) {
                item.soLuong = newQty;
                this.setLocalCart(items);
            }
        }
        
        // Reload nhẹ thay vì reload trang
        if (document.getElementById('cart-items')) {
            this.renderCartPage();
        } else {
            window.location.reload();
        }
    }

    // === MỚI: HÀM RENDER TRANG GIỎ HÀNG (ĐỂ FILE HTML GỌN HƠN) ===
    static async renderCartPage() {
        const container = document.getElementById('cart-items');
        if(!container) return; // Không phải trang cart

        container.innerHTML = '<p class="text-gray-500">Đang tải giỏ hàng...</p>';
        const items = await this.getCartDetails();
        let total = 0;

        if(!items || items.length === 0) {
            container.innerHTML = '<p class="text-center py-4">Giỏ hàng của bạn đang trống.</p>';
            document.getElementById('subtotal').innerText = '0đ';
            document.getElementById('total').innerText = '0đ';
            return;
        }

        container.innerHTML = items.map(item => {
            total += item.Gia * item.SoLuong;
            const updateId = this.getUser() ? item.MaChiTietGH : item.MaBienThe;
            const maxStock = item.SoLuongTon || 999;
            
            // Fix ảnh: Nếu không phải http và không bắt đầu ../ thì thêm vào
            let imgSrc = item.HinhAnh || 'https://via.placeholder.com/100';
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
                imgSrc = '../' + imgSrc;
            }

            return `
                <div class="flex gap-4 border-b border-gray-100 pb-4 last:border-0 relative group">
                    <img src="${imgSrc}" class="w-20 h-24 object-cover rounded-md border">
                    
                    <div class="flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-gray-800 text-sm md:text-base pr-6">${item.TenSP}</h3>
                            <p class="text-xs text-gray-500 mt-1">Phân loại: ${item.TenMauSac} / ${item.TenKichCo}</p>
                        </div>
                        
                        <div class="flex justify-between items-end mt-2">
                            <span class="text-blue-600 font-bold">${new Intl.NumberFormat('vi-VN').format(item.Gia)}đ</span>
                            
                            <div class="flex items-center border border-gray-300 rounded h-8">
                                <button onclick="CartManager.updateQuantity(${updateId}, ${item.SoLuong - 1}, ${maxStock})" 
                                        class="px-2 hover:bg-gray-100 text-gray-600">-</button>
                                
                                <input type="number" value="${item.SoLuong}" 
                                    class="w-12 text-center text-sm focus:outline-none h-full"
                                    onchange="CartManager.updateQuantity(${updateId}, this.value, ${maxStock})">
                                
                                <button onclick="CartManager.updateQuantity(${updateId}, ${item.SoLuong + 1}, ${maxStock})" 
                                        class="px-2 hover:bg-gray-100 text-gray-600">+</button>
                            </div>
                        </div>
                    </div>

                    <button onclick="CartManager.removeItem(${updateId})" class="absolute top-0 right-0 text-gray-400 hover:text-red-500 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            `;
        }).join('');

        const strTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
        if(document.getElementById('subtotal')) document.getElementById('subtotal').innerText = strTotal;
        if(document.getElementById('total')) document.getElementById('total').innerText = strTotal;
    }
}

// Tự động chạy render nếu đang ở trang cart
document.addEventListener('DOMContentLoaded', () => {
    if(window.location.pathname.includes('cart.html')) {
        CartManager.renderCartPage();
    }
});