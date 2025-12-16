// frontend/client/js/profile.js

// 1. Kiểm tra đăng nhập
const token = localStorage.getItem('token');
if (!token) {
    alert('Vui lòng đăng nhập để xem trang này!');
    window.location.href = 'index.html';
}

// 2. Load dữ liệu khi vào trang
document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    loadOrders();
    
    // Gán tên lên header (nếu có từ localStorage)
    const user = JSON.parse(localStorage.getItem('user'));
    if(user) document.getElementById('header-user-name').innerText = user.name;
});

// 3. Hàm chuyển Tab
function switchTab(tabName) {
    // Ẩn hết content
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    // Hiện content được chọn
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    // Update style button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if(btn.dataset.tab === tabName) {
            btn.classList.add('bg-blue-50', 'text-blue-600');
        } else {
            btn.classList.remove('bg-blue-50', 'text-blue-600');
        }
    });
}

// 4. API: Lấy thông tin Profile & Địa chỉ
async function loadProfileData() {
    const data = await API.get('/user/profile');
    if (data.user) {
        // Render Info
        document.getElementById('sidebar-name').innerText = data.user.HoTen;
        document.getElementById('info-name').value = data.user.HoTen;
        document.getElementById('info-email').value = data.user.Email;
        document.getElementById('info-phone').value = data.user.SoDienThoai || 'Chưa cập nhật';
        document.getElementById('info-date').value = new Date(data.user.NgayDangKy).toLocaleDateString('vi-VN');

        // Render Address
        renderAddressList(data.addresses);
    }
}

// 5. Render danh sách địa chỉ
function renderAddressList(addresses) {
    const container = document.getElementById('address-list');
    if (addresses.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Bạn chưa lưu địa chỉ nào.</p>';
        return;
    }

    container.innerHTML = addresses.map(addr => `
        <div class="border border-gray-200 rounded-lg p-4 flex justify-between items-start ${addr.LaMacDinh ? 'border-blue-500 bg-blue-50' : ''}">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-gray-800">${addr.HoTenNguoiNhan}</span>
                    <span class="text-gray-500 text-sm">| ${addr.SoDienThoai}</span>
                    ${addr.LaMacDinh ? '<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded ml-2">Mặc định</span>' : ''}
                </div>
                <p class="text-sm text-gray-600">${addr.DiaChiChiTiet}</p>
            </div>
            <div class="flex flex-col gap-2 items-end">
                ${!addr.LaMacDinh ? 
                    `<button onclick="setDefaultAddress(${addr.MaDiaChi})" class="text-blue-600 text-xs hover:underline">Đặt làm mặc định</button>
                     <button onclick="deleteAddress(${addr.MaDiaChi})" class="text-red-500 text-xs hover:underline">Xóa</button>` 
                    : '<span class="text-xs text-gray-400">Đã chọn mặc định</span>'}
            </div>
        </div>
    `).join('');
}

// 6. Form Thêm địa chỉ
function toggleAddressForm(show) {
    const form = document.getElementById('add-address-form');
    if(show) form.classList.remove('hidden');
    else form.classList.add('hidden');
}

// Xử lý submit form thêm địa chỉ
document.getElementById('form-add-addr').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        hoTen: document.getElementById('addr-name').value,
        sdt: document.getElementById('addr-phone').value,
        diaChi: document.getElementById('addr-detail').value,
        macDinh: document.getElementById('addr-default').checked
    };

    const res = await API.post('/user/address', data);
    if(res.message) {
        alert(res.message);
        toggleAddressForm(false);
        document.getElementById('form-add-addr').reset();
        loadProfileData(); // Reload lại danh sách
    }
});

// 7. Set mặc định
async function setDefaultAddress(id) {
    if(!confirm('Đặt địa chỉ này làm mặc định?')) return;
    await API.put(`/user/address/default/${id}`, {});
    loadProfileData();
}

// 8. Xóa địa chỉ
async function deleteAddress(id) {
    if(!confirm('Bạn chắc chắn muốn xóa?')) return;
    try {
        const res = await API.delete(`/user/address/${id}`);
        if(res.message) alert(res.message);
        loadProfileData();
    } catch (e) {
        alert(e.message);
    }
}

// 9. Lấy lịch sử đơn hàng (Render kiểu mới có chi tiết sp)
async function loadOrders() {
    const orders = await API.get('/user/orders');
    const container = document.getElementById('order-list');
    
    // Reset container
    container.innerHTML = '';

    if(!Array.isArray(orders) || orders.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-10">Bạn chưa có đơn hàng nào.</p>';
        return;
    }

    // Helper fix ảnh
    const fixImg = (path) => {
        if (!path) return 'https://via.placeholder.com/80';
        if (path.startsWith('http') || path.startsWith('../')) return path;
        return '../' + path;
    };

    // Helper render trạng thái
    const getStatusBadge = (status) => {
        let color = 'bg-yellow-100 text-yellow-700'; // Chờ xác nhận
        if (status === 'Đã giao') color = 'bg-green-100 text-green-700';
        if (status === 'Đã hủy') color = 'bg-red-100 text-red-700';
        return `<span class="px-3 py-1 rounded-full text-xs font-bold ${color}">${status}</span>`;
    };

    container.innerHTML = orders.map(order => {
        const itemsHtml = order.Items.map(item => `
            <div class="flex gap-4 py-4 border-b last:border-0 items-center">
                <img src="${fixImg(item.HinhAnh)}" class="w-16 h-20 object-cover rounded border border-gray-200">
                <div class="flex-1">
                    <p class="font-bold text-gray-800 text-sm">${item.TenSP}</p>
                    <p class="text-xs text-gray-500 mt-1">Phân loại: ${item.Mau} / ${item.Size}</p>
                    <p class="text-xs text-gray-500">x${item.SoLuong}</p>
                </div>
                <div class="text-sm font-semibold text-blue-600">
                    ${new Intl.NumberFormat('vi-VN').format(item.DonGia)}đ
                </div>
            </div>
        `).join('');

        // [LOGIC MỚI] Kiểm tra để hiện nút Hủy
        const cancelButton = (order.TrangThai === 'Chờ xác nhận' || order.TrangThai === 'Pending') 
            ? `<button onclick="cancelOrder(${order.MaDonHang})" class="ml-4 text-red-600 text-sm font-bold border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition">Hủy đơn</button>`
            : '';

        return `
            <div class="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div class="bg-gray-50 p-4 flex justify-between items-center border-b">
                    <div class="flex items-center">
                        <span class="font-bold text-gray-700">#${order.MaDonHang}</span>
                        <span class="text-xs text-gray-500 ml-2 hidden md:inline">(${new Date(order.NgayDatHang).toLocaleDateString('vi-VN')})</span>
                    </div>
                    
                    <div class="flex items-center">
                        ${getStatusBadge(order.TrangThai)}
                        ${cancelButton} </div>
                </div>

                <div class="p-4">
                    ${itemsHtml}
                </div>

                <div class="bg-gray-50 p-4 border-t flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div class="text-xs text-gray-500">
                        <p><span class="font-bold">Người nhận:</span> ${order.HoTen} - ${order.SDT}</p>
                        <p class="truncate max-w-md"><span class="font-bold">Địa chỉ:</span> ${order.DiaChi}</p>
                    </div>
                    <div class="text-lg">
                        Thành tiền: <span class="font-bold text-red-600">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.TongTien)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
// 10.Hủy đơn hàng
async function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.')) {
        return;
    }

    try {
        // Gọi API PUT (tham số thứ 2 là body rỗng)
        const res = await API.put(`/user/orders/${orderId}/cancel`, {});
        
        if (res.message) {
            alert(res.message);
            // Tải lại danh sách đơn hàng để cập nhật trạng thái
            loadOrders();
        }
    } catch (err) {
        alert('Lỗi: ' + (err.message || 'Không thể hủy đơn hàng'));
    }
}
// 11. Đăng xuất
function handleLogout() {
    if(confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}