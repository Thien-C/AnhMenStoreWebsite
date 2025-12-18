// Bảo mật trang Admin & điều hướng layout

function checkAdminAccess() {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    // Nếu không có token hoặc không có user trong localStorage -> về trang chủ
    if (!token || !userRaw) {
        window.location.href = '../client/html/index.html';
        return;
    }

    let user;
    try {
        user = JSON.parse(userRaw);
    } catch (e) {
        localStorage.removeItem('user');
        window.location.href = '../client/html/index.html';
        return;
    }

    // Nếu client đã lưu role và không phải Admin thì chặn ngay
    if (user.role && user.role !== 'Admin') {
        alert('Bạn không có quyền truy cập trang Admin!');
        window.location.href = '../client/html/index.html';
        return;
    }

    // Gọi API để xác thực token + role từ server
    (async () => {
        try {
            const res = await API.get('/user/profile'); // API đã được bảo vệ bởi authMiddleware

            // Nếu server trả lỗi hoặc không phải Admin (VaiTro khác 'Admin')
            if (!res || res.message || (res.user && res.user.VaiTro && res.user.VaiTro !== 'Admin')) {
                alert('Bạn không có quyền truy cập trang Admin!');
                window.location.href = '../client/html/index.html';
                return;
            }

            // Cập nhật tên Admin trên header nếu có
            if (res.user && res.user.HoTen) {
                const el = document.getElementById('admin-name');
                if (el) el.textContent = res.user.HoTen;
            }
        } catch (error) {
            console.error('Admin verify error:', error);
            window.location.href = '../client/html/index.html';
        }
    })();
}

// Xử lý chuyển tab Dashboard / Orders / Products
function initAdminNavigation() {
    const navButtons = document.querySelectorAll('.nav-item[data-page]');
    const pages = document.querySelectorAll('.content-page');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');

            // Active button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Hiển thị page tương ứng
            pages.forEach(p => {
                if (p.id === `page-${page}`) p.classList.add('active');
                else p.classList.remove('active');
            });
        });
    });
}

function initLogoutButton() {
    const btnLogout = document.getElementById('btn-logout');
    if (!btnLogout) return;

    btnLogout.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn đăng xuất khỏi trang Admin?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Chuyển về trang chủ client
            window.location.href = '../client/html/index.html';
        }
    });
}

// Load thống kê và đơn hàng mới nhất cho Dashboard
async function loadDashboardData() {
    try {
        const orders = await API.get('/admin/orders');
        
        if (!Array.isArray(orders)) {
            console.error('Invalid orders data:', orders);
            return;
        }

        // Thống kê
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.TrangThai === 'Chờ xác nhận').length;
        const shippingOrders = orders.filter(o => o.TrangThai === 'Đang giao').length;
        const completedOrders = orders.filter(o => o.TrangThai === 'Hoàn thành' || o.TrangThai === 'Đã giao').length;

        // Cập nhật số liệu
        const totalEl = document.getElementById('total-orders');
        const pendingEl = document.getElementById('pending-orders');
        const shippingEl = document.getElementById('shipping-orders');
        const completedEl = document.getElementById('completed-orders');

        if (totalEl) totalEl.textContent = totalOrders;
        if (pendingEl) pendingEl.textContent = pendingOrders;
        if (shippingEl) shippingEl.textContent = shippingOrders;
        if (completedEl) completedEl.textContent = completedOrders;

        // Hiển thị 5 đơn hàng mới nhất
        const tbody = document.getElementById('recent-orders-tbody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #6c757d;">Chưa có đơn hàng nào</td></tr>';
            return;
        }

        const recentOrders = orders.slice(0, 5);
        tbody.innerHTML = recentOrders.map(order => {
            const customerName = order.TenKhachHang || order.HoTenNguoiNhan || 'Khách lẻ';
            const date = new Date(order.NgayDatHang).toLocaleString('vi-VN');
            const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.TongTien);
            
            let statusBadge = '';
            let statusColor = '#6c757d';
            
            if (order.TrangThai === 'Chờ xác nhận') {
                statusColor = '#ffc107';
            } else if (order.TrangThai === 'Đang giao') {
                statusColor = '#17a2b8';
            } else if (order.TrangThai === 'Hoàn thành' || order.TrangThai === 'Đã giao') {
                statusColor = '#28a745';
            } else if (order.TrangThai === 'Đã hủy') {
                statusColor = '#dc3545';
            }
            
            statusBadge = `<span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${order.TrangThai || 'Không rõ'}</span>`;
            
            return `
                <tr style="border-bottom: 1px solid #dee2e6;">
                    <td style="padding: 12px; color: #495057;">#${order.MaDonHang}</td>
                    <td style="padding: 12px; color: #495057;">${customerName}</td>
                    <td style="padding: 12px; color: #6c757d; font-size: 14px;">${date}</td>
                    <td style="padding: 12px; color: #495057; font-weight: 600;">${price}</td>
                    <td style="padding: 12px;">${statusBadge}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Load dashboard data error:', error);
        const tbody = document.getElementById('recent-orders-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #dc3545;">Lỗi tải dữ liệu. Vui lòng thử lại!</td></tr>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    initAdminNavigation();
    initLogoutButton();
    
    // Load dashboard data khi trang load
    loadDashboardData();
});


