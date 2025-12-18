function formatMoney(value) {
    try {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    } catch {
        return value;
    }
}

function formatDate(value) {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString('vi-VN');
    } catch {
        return value;
    }
}

function getStatusBadge(statusRaw) {
    const status = statusRaw || '';
    let cls = 'badge';

    if (status === 'Chờ xác nhận' || status === 'Pending') {
        cls += ' badge-pending';
    } else if (status === 'Đang giao') {
        cls += ' badge-shipping';
    } else if (status === 'Đã giao' || status === 'Hoàn thành') {
        cls += ' badge-success';
    } else if (status === 'Đã hủy') {
        cls += ' badge-cancel';
    } else {
        cls += ' badge-pending';
    }

    return `<span class="${cls}">${status || 'Không rõ'}</span>`;
}

function buildStatusOptions(current) {
    const options = [
        'Chờ xác nhận',
        'Đang giao',
        'Đã giao',
        'Hoàn thành',
        'Đã hủy'
    ];

    return options
        .map(st => `<option value="${st}" ${st === current ? 'selected' : ''}>${st}</option>`)
        .join('');
}

async function loadAdminOrders() {
    const tbody = document.getElementById('orders-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px;">Đang tải dữ liệu...</td></tr>`;

    const data = await API.get('/admin/orders');

    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:16px;">Chưa có đơn hàng nào.</td></tr>`;
        return;
    }

    tbody.innerHTML = data
        .map(o => {
            const customerName = o.TenKhachHang || o.HoTenNguoiNhan || 'Khách lẻ';
            return `
                <tr>
                    <td>#${o.MaDonHang}</td>
                    <td>${customerName}</td>
                    <td>${formatDate(o.NgayDatHang)}</td>
                    <td>${formatMoney(o.TongTien)}</td>
                    <td>${getStatusBadge(o.TrangThai)}</td>
                    <td>
                        <select class="status-select" onchange="handleChangeOrderStatus(${o.MaDonHang}, this.value)">
                            ${buildStatusOptions(o.TrangThai)}
                        </select>
                    </td>
                </tr>
            `;
        })
        .join('');
}

async function handleChangeOrderStatus(orderId, status) {
    if (!confirm(`Xác nhận đổi trạng thái đơn #${orderId} sang "${status}"?`)) {
        // Reload lại để reset select (trường hợp cancel)
        loadAdminOrders();
        return;
    }

    const res = await API.put(`/admin/orders/${orderId}`, { TrangThai: status });

    if (res && res.message) {
        alert(res.message);
        await loadAdminOrders();
    } else {
        alert('Cập nhật thất bại. Vui lòng thử lại.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // checkAdminAccess đã được gọi trong admin.js
    loadAdminOrders();
});


