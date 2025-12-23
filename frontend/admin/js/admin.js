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
    // Kiểm tra cả role, VaiTro, và so sánh không phân biệt hoa thường
    const userRole = user.role || user.VaiTro || user.Role || user.vaiTro;
    if (userRole && userRole.toLowerCase() !== 'admin') {
        alert('Bạn không có quyền truy cập trang Admin!');
        window.location.href = '../client/html/index.html';
        return;
    }

    // Gọi API để xác thực token + role từ server
    (async () => {
        try {
            const res = await API.get('/user/profile'); // API đã được bảo vệ bởi authMiddleware

            // Nếu server trả lỗi hoặc không phải Admin
            // Kiểm tra nhiều field có thể chứa VaiTro
            const serverRole = res.user?.VaiTro || res.user?.role || res.user?.Role || res.user?.vaiTro;
            if (!res || res.message || (serverRole && serverRole.toLowerCase() !== 'admin')) {
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

// Xử lý chuyển tab Dashboard / Orders / Products / Reports
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

            // Nếu chuyển sang page reports, load dữ liệu
            if (page === 'reports') {
                loadReport();
            }
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

    // Init reports functionality
    initReportsPage();
});

// ============= BÁO CÁO DOANH THU =============
let currentChart = null;

function initReportsPage() {
    // Xử lý sự kiện thay đổi loại báo cáo
    const reportType = document.getElementById('reportType');
    if (reportType) {
        reportType.addEventListener('change', function() {
            const dateRange = document.getElementById('dateRange');
            if (this.value === 'custom') {
                dateRange.classList.add('active');
                // Set default dates
                const today = new Date().toISOString().split('T')[0];
                const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    .toISOString().split('T')[0];
                document.getElementById('startDate').value = firstDayOfMonth;
                document.getElementById('endDate').value = today;
            } else {
                dateRange.classList.remove('active');
            }
        });
    }

    // Xử lý nút xem báo cáo
    const btnViewReport = document.getElementById('btnViewReport');
    if (btnViewReport) {
        btnViewReport.addEventListener('click', loadReport);
    }

    // Set default date cho custom
    const today = new Date().toISOString().split('T')[0];
    const endDate = document.getElementById('endDate');
    if (endDate) {
        endDate.value = today;
    }
}

// Format số tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format ngày giờ
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Lấy class cho status badge
function getStatusClass(status) {
    const statusMap = {
        'Hoàn thành': 'status-completed',
        'Đã hủy': 'status-cancelled',
        'Chờ xác nhận': 'status-pending',
        'Đang giao': 'status-shipping'
    };
    return statusMap[status] || 'status-pending';
}

// Load báo cáo doanh thu
async function loadReport() {
    try {
        const type = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // Validate date range cho custom
        if (type === 'custom' && (!startDate || !endDate)) {
            alert('Vui lòng chọn khoảng thời gian!');
            return;
        }

        if (type === 'custom' && new Date(startDate) > new Date(endDate)) {
            alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
            return;
        }

        // Build query string
        let queryParams = `type=${type}`;
        if (type === 'custom') {
            queryParams += `&startDate=${startDate}&endDate=${endDate}`;
        }

        // Call API
        const result = await API.get(`/admin/reports/revenue?${queryParams}`);

        if (result && result.success) {
            displayStats(result.data);
            renderChart(result.data.chartData);
            await loadOrderDetails(type, startDate, endDate);
        } else {
            alert(result.message || 'Có lỗi xảy ra');
        }

    } catch (error) {
        console.error('Lỗi khi tải báo cáo:', error);
        alert('Không thể tải báo cáo. Vui lòng thử lại!');
    }
}

// Hiển thị thống kê
function displayStats(data) {
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalOrdersEl = document.getElementById('totalOrders');
    const cancelledOrdersEl = document.getElementById('cancelledOrders');

    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(data.totalRevenue);
    if (totalOrdersEl) totalOrdersEl.textContent = data.totalOrders;
    if (cancelledOrdersEl) cancelledOrdersEl.textContent = data.cancelledOrders;
}

// Render biểu đồ
function renderChart(chartData) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Hủy biểu đồ cũ nếu có
    if (currentChart) {
        currentChart.destroy();
    }

    // Kiểm tra dữ liệu rỗng
    if (!chartData || chartData.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }

    // Tạo biểu đồ mới
    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.map(item => item.label),
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: chartData.map(item => item.value),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN', {
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value) + ' ₫';
                        }
                    }
                }
            }
        }
    });
}

// Load chi tiết đơn hàng
async function loadOrderDetails(type, startDate, endDate) {
    try {
        const container = document.getElementById('orderTableContainer');
        if (!container) return;

        container.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

        let queryParams = `type=${type}`;
        if (type === 'custom') {
            queryParams += `&startDate=${startDate}&endDate=${endDate}`;
        }

        const result = await API.get(`/admin/reports/order-details?${queryParams}`);

        if (result && result.success) {
            displayOrderTable(result.data);
        } else {
            container.innerHTML = '<div class="no-data">Không có dữ liệu</div>';
        }

    } catch (error) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', error);
        const container = document.getElementById('orderTableContainer');
        if (container) {
            container.innerHTML = '<div class="no-data">Không thể tải dữ liệu</div>';
        }
    }
}

// Hiển thị bảng đơn hàng
function displayOrderTable(orders) {
    const container = document.getElementById('orderTableContainer');
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="no-data">Không có đơn hàng nào trong khoảng thời gian này</div>';
        return;
    }

    let html = `
        <table class="order-table">
            <thead>
                <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Phương thức TT</th>
                    <th>Trạng thái</th>
                </tr>
            </thead>
            <tbody>
    `;

    orders.forEach(order => {
        html += `
            <tr>
                <td><strong>#${order.MaDonHang}</strong></td>
                <td>${order.TenKhachHang || 'N/A'}</td>
                <td>${formatDateTime(order.NgayDatHang)}</td>
                <td><strong>${formatCurrency(order.TongTien)}</strong></td>
                <td>${order.PhuongThucThanhToan}</td>
                <td>
                    <span class="status-badge ${getStatusClass(order.TrangThai)}">
                        ${order.TrangThai}
                    </span>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}


