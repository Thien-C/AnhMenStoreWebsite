const API_URL = 'http://localhost:3000/api';
let currentChart = null;

// Kiểm tra authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Kiểm tra nhiều trường hợp: role, VaiTro, Role, vaiTro
    const userRole = user.role || user.VaiTro || user.Role || user.vaiTro;
    
    if (!token || (userRole && userRole.toLowerCase() !== 'admin')) {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '../client/html/index.html';
        return false;
    }

    // Hiển thị tên admin
    document.getElementById('adminName').textContent = user.HoTen || 'Admin';
    return true;
}

// Đăng xuất
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../client/html/index.html';
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
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/reports/revenue?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải báo cáo');
        }

        const result = await response.json();

        if (result.success) {
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
    document.getElementById('totalRevenue').textContent = formatCurrency(data.totalRevenue);
    document.getElementById('totalOrders').textContent = data.totalOrders;
    document.getElementById('cancelledOrders').textContent = data.cancelledOrders;
}

// Render biểu đồ
function renderChart(chartData) {
    const ctx = document.getElementById('revenueChart');

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
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                borderColor: 'rgba(37, 99, 235, 1)',
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
        container.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

        let queryParams = `type=${type}`;
        if (type === 'custom') {
            queryParams += `&startDate=${startDate}&endDate=${endDate}`;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/reports/order-details?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết đơn hàng');
        }

        const result = await response.json();

        if (result.success) {
            displayOrderTable(result.data);
        } else {
            container.innerHTML = '<div class="no-data">Không có dữ liệu</div>';
        }

    } catch (error) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', error);
        document.getElementById('orderTableContainer').innerHTML = 
            '<div class="no-data">Không thể tải dữ liệu</div>';
    }
}

// Hiển thị bảng đơn hàng
function displayOrderTable(orders) {
    const container = document.getElementById('orderTableContainer');

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

// Xử lý sự kiện thay đổi loại báo cáo
function initReportEvents() {
    document.getElementById('reportType').addEventListener('change', function() {
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

    // Xử lý nút xem báo cáo
    document.getElementById('btnViewReport').addEventListener('click', loadReport);
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        // Init events
        initReportEvents();
        
        // Set default date cho custom
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('endDate').value = today;
        
        // Load báo cáo mặc định (năm nay)
        loadReport();
    }
});
