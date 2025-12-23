// Biến toàn cục
let currentCouponCode = null;
let discountAmount = 0;
let subtotalAmount = 0;
const SHIPPING_FEE = 30000;

// Load thông tin đơn hàng khi trang được tải
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrderSummary();
    setupCouponHandler();
    setupFormHandler();
    await loadUserAddresses();
});

// Load danh sách sản phẩm từ localStorage
async function loadOrderSummary() {
    // Đọc từ checkout_items (lưu từ trang cart.html)
    const checkoutItems = JSON.parse(localStorage.getItem('checkout_items') || '[]');
    const summaryContainer = document.getElementById('order-summary-items');

    if (!checkoutItems || checkoutItems.length === 0) {
        summaryContainer.innerHTML = '<p class="text-gray-500 text-sm">Không có sản phẩm nào được chọn</p>';
        updateTotalDisplay();
        return;
    }

    // Lấy chi tiết sản phẩm từ giỏ hàng
    const items = await CartManager.getCartDetails();
    
    // checkoutItems là mảng các MaBienThe, filter để lấy chi tiết
    const selectedDetails = items.filter(item => 
        checkoutItems.includes(item.MaBienThe)
    );

    if (selectedDetails.length === 0) {
        summaryContainer.innerHTML = '<p class="text-gray-500 text-sm">Không tìm thấy sản phẩm</p>';
        updateTotalDisplay();
        return;
    }

    // Render danh sách
    summaryContainer.innerHTML = selectedDetails.map(item => {
        const quantity = item.SoLuong;
        const price = item.Gia * quantity;

        let imgSrc = item.HinhAnh || 'https://via.placeholder.com/60';
        if (imgSrc.includes(',')) {
            imgSrc = imgSrc.split(',')[0].trim();
        }
        if (!imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
            imgSrc = '../' + imgSrc;
        }

        return `
            <div class="flex gap-3 items-center pb-3 border-b border-gray-100 last:border-0">
                <img src="${imgSrc}" class="w-14 h-16 object-cover rounded border">
                <div class="flex-1">
                    <h4 class="font-semibold text-sm text-gray-800">${item.TenSP}</h4>
                    <p class="text-xs text-gray-500">${item.TenMauSac} / ${item.TenKichCo}</p>
                    <p class="text-xs text-gray-600 mt-1">SL: ${quantity} x ${new Intl.NumberFormat('vi-VN').format(item.Gia)}đ</p>
                </div>
                <span class="font-bold text-sm">${new Intl.NumberFormat('vi-VN').format(price)}đ</span>
            </div>
        `;
    }).join('');

    // Tính tạm tính
    subtotalAmount = selectedDetails.reduce((sum, item) => {
        return sum + (item.Gia * item.SoLuong);
    }, 0);

    updateTotalDisplay();
}

// Cập nhật hiển thị tổng tiền
function updateTotalDisplay() {
    document.getElementById('subtotal-amount').textContent = 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotalAmount);

    const total = subtotalAmount + SHIPPING_FEE - discountAmount;
    document.getElementById('total-amount').textContent = 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);

    // Hiển thị/ẩn dòng giảm giá
    if (discountAmount > 0) {
        document.getElementById('discount-row').classList.remove('hidden');
        document.getElementById('discount-amount').textContent = 
            '-' + new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount);
    } else {
        document.getElementById('discount-row').classList.add('hidden');
    }
}

// Xử lý áp dụng mã giảm giá
function setupCouponHandler() {
    const btnApply = document.getElementById('btnApplyCoupon');
    const couponInput = document.getElementById('couponCode');
    const messageEl = document.getElementById('coupon-message');

    btnApply.addEventListener('click', async () => {
        const code = couponInput.value.trim().toUpperCase();
        
        if (!code) {
            showCouponMessage('Vui lòng nhập mã giảm giá!', 'error');
            return;
        }

        if (subtotalAmount === 0) {
            showCouponMessage('Giỏ hàng trống!', 'error');
            return;
        }

        btnApply.disabled = true;
        btnApply.textContent = 'Đang kiểm tra...';

        try {
            const response = await fetch('http://localhost:3000/api/orders/check-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    totalOrderValue: subtotalAmount
                })
            });

            const result = await response.json();

            if (result.success) {
                currentCouponCode = code;
                discountAmount = result.discountAmount;
                updateTotalDisplay();
                showCouponMessage(result.message, 'success');
                couponInput.disabled = true;
                btnApply.textContent = '✓ Đã áp dụng';
            } else {
                currentCouponCode = null;
                discountAmount = 0;
                updateTotalDisplay();
                showCouponMessage(result.message, 'error');
                btnApply.disabled = false;
                btnApply.textContent = 'Áp dụng';
            }
        } catch (error) {
            console.error('Error checking coupon:', error);
            showCouponMessage('Lỗi kết nối server!', 'error');
            btnApply.disabled = false;
            btnApply.textContent = 'Áp dụng';
        }
    });

    // Cho phép nhập lại mã khi thay đổi input
    couponInput.addEventListener('input', () => {
        if (couponInput.disabled) {
            couponInput.disabled = false;
            btnApply.disabled = false;
            btnApply.textContent = 'Áp dụng';
            currentCouponCode = null;
            discountAmount = 0;
            updateTotalDisplay();
            messageEl.classList.add('hidden');
        }
    });
}

// Hiển thị thông báo mã giảm giá
function showCouponMessage(message, type) {
    const messageEl = document.getElementById('coupon-message');
    messageEl.textContent = message;
    messageEl.classList.remove('hidden', 'text-green-600', 'text-red-600');
    messageEl.classList.add(type === 'success' ? 'text-green-600' : 'text-red-600');
}

// Xử lý submit form đặt hàng
function setupFormHandler() {
    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handlePlaceOrder();
    });
}

// Hàm đặt hàng
async function handlePlaceOrder() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) {
        alert('Vui lòng đăng nhập để đặt hàng!');
        window.location.href = 'index.html';
        return;
    }

    // Đọc từ checkout_items (mảng các MaBienThe)
    const checkoutItems = JSON.parse(localStorage.getItem('checkout_items') || '[]');
    if (checkoutItems.length === 0) {
        alert('Vui lòng chọn sản phẩm để đặt hàng!');
        window.location.href = 'cart.html';
        return;
    }

    const hoTen = document.getElementById('name').value.trim();
    const soDienThoai = document.getElementById('phone').value.trim();
    const diaChi = document.getElementById('address').value.trim();
    const phuongThucTT = document.getElementById('method').value;

    if (!hoTen || !soDienThoai || !diaChi) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const orderData = {
        hoTen,
        soDienThoai,
        diaChi,
        phuongThucTT,
        listItems: checkoutItems,  // Gửi mảng MaBienThe
        maGiamGia: currentCouponCode  // Gửi kèm mã giảm giá
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
            localStorage.removeItem('checkout_items');
            window.location.href = 'index.html';
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Lỗi kết nối server!');
    }
}

// Load địa chỉ đã lưu (nếu có)
async function loadUserAddresses() {
    // Tính năng này có thể mở rộng sau
}
