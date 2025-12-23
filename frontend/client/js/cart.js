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
    
    // Lấy chi tiết sản phẩm (Xử lý an toàn để tránh lỗi render)
    static async getCartDetails() {
        const user = this.getUser();
        if (user) {
            try {
                const res = await API.get('/cart');
                return Array.isArray(res) ? res : [];
            } catch (e) { return []; }
        } else {
            const localItems = this.getLocalCart();
            if (localItems.length === 0) return [];
            
            const ids = localItems.map(i => i.maBienThe);
            try {
                const variants = await API.post('/products/variants', { ids });
                if (!Array.isArray(variants)) return [];

                return variants.map(v => {
                    const item = localItems.find(i => i.maBienThe === v.MaBienThe);
                    return {
                        ...v,
                        SoLuong: item ? item.soLuong : 0,
                        MaChiTietGH: v.MaBienThe 
                    };
                });
            } catch (e) { return []; }
        }
    }

    static async removeItem(id) {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        const user = this.getUser();
        if (user) {
            await API.delete(`/cart/${id}`);
        } else {
            let items = this.getLocalCart();
            items = items.filter(i => i.maBienThe != id);
            this.setLocalCart(items);
        }
        // Gọi lại render để cập nhật giao diện ngay lập tức
        this.renderCartPage(); 
        this.updateBadge();
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
        
        this.renderCartPage();
    }

    // === HÀM RENDER CHÍNH ===
    static async renderCartPage() {
        const container = document.getElementById('cart-items');
        if(!container) return; // Không phải trang cart thì thoát

        container.innerHTML = '<p class="text-gray-500">Đang tải giỏ hàng...</p>';
        const items = await this.getCartDetails();

        if(!items || items.length === 0) {
            container.innerHTML = '<p class="text-center py-4">Giỏ hàng của bạn đang trống.</p>';
            if(document.getElementById('subtotal')) document.getElementById('subtotal').innerText = '0đ';
            if(document.getElementById('total')) document.getElementById('total').innerText = '0đ';
            return;
        }

        container.innerHTML = items.map(item => {
            const updateId = this.getUser() ? item.MaChiTietGH : item.MaBienThe;
            const maxStock = item.SoLuongTon || 999;
            
            // Fix ảnh - Lấy ảnh đầu tiên từ chuỗi phân tách bằng dấu phẩy
            let imgSrc = item.HinhAnh || 'https://via.placeholder.com/100';
            if (imgSrc.includes(',')) {
                imgSrc = imgSrc.split(',')[0].trim();
            }
            if (!imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
                imgSrc = '../' + imgSrc;
            }

            return `
                <div class="flex gap-4 border-b border-gray-100 pb-4 last:border-0 relative group items-center">
                    <input type="checkbox" 
                           class="cart-checkbox w-5 h-5 accent-black cursor-pointer mr-2" 
                           value="${item.MaBienThe}"
                           data-price="${item.Gia}"
                           data-qty="${item.SoLuong}"
                           onchange="updateSelectedTotal()" checked>

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
                                
                                <input type="number" 
                                    value="${item.SoLuong}" 
                                    min="1"
                                    max="${maxStock}"
                                    class="w-12 text-center text-sm focus:outline-none h-full"
                                    onchange="CartManager.updateQuantity(${updateId}, this.value, ${maxStock})"
                                    onblur="CartManager.updateQuantity(${updateId}, this.value, ${maxStock})"
                                    onclick="this.select()">
                                
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

        // Gọi hàm tính tổng ngay sau khi render xong
        updateSelectedTotal();
    }
}

// --- CÁC HÀM XỬ LÝ SỰ KIỆN (Để bên ngoài Class để HTML dễ gọi) ---

// 1. Tính tổng tiền các món được chọn
function updateSelectedTotal() {
    const checkboxes = document.querySelectorAll('.cart-checkbox:checked');
    let total = 0;
    
    checkboxes.forEach(box => {
        const price = parseFloat(box.dataset.price);
        const qty = parseInt(box.dataset.qty);
        total += price * qty;
    });

    const strTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
    if(document.getElementById('subtotal')) document.getElementById('subtotal').innerText = strTotal;
    if(document.getElementById('total')) document.getElementById('total').innerText = strTotal;
}

// 2. Chuyển sang trang Checkout
function proceedToCheckout() {
    const checkboxes = document.querySelectorAll('.cart-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
        return;
    }

    const selectedItems = [];
    checkboxes.forEach(box => {
        selectedItems.push(parseInt(box.value)); // Lấy MaBienThe
    });

    // Lưu danh sách item cần thanh toán vào localStorage
    localStorage.setItem('checkout_items', JSON.stringify(selectedItems));
    window.location.href = 'checkout.html';
}

// --- TỰ ĐỘNG CHẠY KHI LOAD TRANG ---
document.addEventListener('DOMContentLoaded', () => {
    // Nếu đang ở trang cart.html thì render giỏ hàng
    if(window.location.pathname.includes('cart.html')) {
        CartManager.renderCartPage();
    }
    
    // Cập nhật số lượng trên icon giỏ hàng (cho tất cả các trang)
    CartManager.updateBadge();
});
// === LOGIC CHECKOUT ===
// === LOGIC CHECKOUT ===
async function initCheckoutPage() {
    // 1. Kiểm tra đăng nhập
    const user = CartManager.getUser();
    if (!user) {
        alert('Vui lòng đăng nhập để thanh toán!');
        window.location.href = 'index.html';
        return;
    }

    // 2. Kiểm tra giỏ hàng
    const selectedItems = JSON.parse(localStorage.getItem('checkout_items'));
    if (!selectedItems || selectedItems.length === 0) {
        alert("Chưa chọn sản phẩm nào!");
        window.location.href = 'cart.html';
        return;
    }

    // 3. Tải thông tin Profile & Địa chỉ
    try {
        const profile = await API.get('/user/profile');
        
        // Nếu user có địa chỉ đã lưu -> Hiển thị dropdown
        if (profile && profile.addresses && profile.addresses.length > 0) {
            const selectorGroup = document.getElementById('address-selector-group');
            const selectEl = document.getElementById('saved-addresses');
            
            if (selectorGroup && selectEl) {
                selectorGroup.classList.remove('hidden');

                // Render options
                profile.addresses.forEach(addr => {
                    const opt = document.createElement('option');
                    opt.value = addr.MaDiaChi;
                    // Lưu dữ liệu vào dataset để tiện lấy ra khi change
                    opt.dataset.name = addr.HoTenNguoiNhan;
                    opt.dataset.phone = addr.SoDienThoai;
                    opt.dataset.address = addr.DiaChiChiTiet;
                    
                    // Text hiển thị
                    const defaultLabel = addr.LaMacDinh ? ' (Mặc định)' : '';
                    opt.innerText = `${addr.DiaChiChiTiet} - ${addr.HoTenNguoiNhan}${defaultLabel}`;
                    
                    selectEl.appendChild(opt);

                    // Nếu là mặc định -> Chọn luôn & Điền form
                    if (addr.LaMacDinh) {
                        selectEl.value = addr.MaDiaChi;
                        fillCheckoutForm(addr.HoTenNguoiNhan, addr.SoDienThoai, addr.DiaChiChiTiet);
                    }
                });

                // Bắt sự kiện thay đổi lựa chọn
                selectEl.addEventListener('change', (e) => {
                    const val = e.target.value;
                    if (val === 'new') {
                        // Nếu chọn nhập mới -> Reset form
                        fillCheckoutForm(user.name || '', '', ''); 
                    } else {
                        // Nếu chọn địa chỉ có sẵn -> Lấy data từ option đã chọn
                        const selectedOpt = selectEl.options[selectEl.selectedIndex];
                        fillCheckoutForm(
                            selectedOpt.dataset.name,
                            selectedOpt.dataset.phone,
                            selectedOpt.dataset.address
                        );
                    }
                });
            }
        } else {
            // Nếu chưa có địa chỉ nào -> Fill tên mặc định của user
            if(document.getElementById('name')) document.getElementById('name').value = user.name || '';
        }
    } catch (err) {
        console.error("Lỗi tải profile:", err);
    }

    // KHÔNG xử lý submit ở đây nữa, để checkout.html xử lý
    // Vì checkout.html đã có logic đầy đủ với mã giảm giá
}

// Helper: Hàm điền form nhanh
function fillCheckoutForm(name, phone, address) {
    if(document.getElementById('name')) document.getElementById('name').value = name || '';
    if(document.getElementById('phone')) document.getElementById('phone').value = phone || '';
    if(document.getElementById('address')) document.getElementById('address').value = address || '';
}

// Thêm vào Event Listener chung của cart.js
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    // Nếu là trang cart
    if(path.includes('cart.html')) {
        CartManager.renderCartPage();
    }
    
    // Nếu là trang checkout
    if(path.includes('checkout.html')) {
        initCheckoutPage();
    }

    // Update badge cho mọi trang
    CartManager.updateBadge();
});