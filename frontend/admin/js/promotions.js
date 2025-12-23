// frontend/admin/js/promotions.js

const API_BASE_URL = 'http://localhost:3000/api';
let isEditMode = false;

// Kiểm tra đăng nhập và quyền Admin
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'Admin') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '../client/html/index.html';
        return false;
    }

    // Hiển thị tên admin
    const adminNameEl = document.getElementById('admin-name');
    if (adminNameEl) adminNameEl.textContent = user.name || 'Admin';

    return true;
}

// Lấy headers với token
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Format tiền tệ VND
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Format ngày tháng dd/mm/yyyy
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Format datetime cho input datetime-local
function formatDateTimeForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Hàm load danh sách mã giảm giá
async function loadCoupons() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
            method: 'GET',
            headers: getHeaders()
        });

        const result = await response.json();
        
        if (result.success && result.data) {
            renderCoupons(result.data);
        } else {
            document.getElementById('coupons-tbody').innerHTML = `
                <tr><td colspan="10" style="text-align: center; padding: 24px; color: #dc3545;">Lỗi tải dữ liệu: ${result.message}</td></tr>
            `;
        }
    } catch (error) {
        console.error('Error loading coupons:', error);
        document.getElementById('coupons-tbody').innerHTML = `
            <tr><td colspan="10" style="text-align: center; padding: 24px; color: #dc3545;">Lỗi kết nối server!</td></tr>
        `;
    }
}

// Render bảng mã giảm giá
function renderCoupons(coupons) {
    const tbody = document.getElementById('coupons-tbody');
    
    if (!coupons || coupons.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="10" style="text-align: center; padding: 24px; color: #6c757d;">Chưa có mã giảm giá nào</td></tr>
        `;
        return;
    }

    tbody.innerHTML = coupons.map(coupon => {
        // Định dạng giá trị giảm
        const giaTriDisplay = coupon.LoaiGiamGia === 'Percentage' 
            ? `${coupon.GiaTri}%` 
            : formatCurrency(coupon.GiaTri);

        // Định dạng trạng thái với màu sắc
        let statusColor = '#28a745'; // Xanh - Hoạt động
        let statusBg = '#d4edda';
        if (coupon.TrangThai === 'Hết hạn') {
            statusColor = '#dc3545'; // Đỏ
            statusBg = '#f8d7da';
        } else if (coupon.TrangThai === 'Chưa diễn ra') {
            statusColor = '#ffc107'; // Vàng
            statusBg = '#fff3cd';
        }

        return `
            <tr style="border-bottom: 1px solid #dee2e6;">
                <td style="padding: 12px; font-weight: 600; color: #495057;">${coupon.Code}</td>
                <td style="padding: 12px; color: #6c757d; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${coupon.MoTa || ''}">${coupon.MoTa || '-'}</td>
                <td style="padding: 12px; color: #6c757d;">${coupon.LoaiGiamGia === 'Percentage' ? 'Phần trăm' : 'Tiền mặt'}</td>
                <td style="padding: 12px; font-weight: 600; color: #667eea;">${giaTriDisplay}</td>
                <td style="padding: 12px; color: #6c757d;">${formatCurrency(coupon.DonHangToiThieu)}</td>
                <td style="padding: 12px; text-align: center; font-weight: 600;">${coupon.SoLuong}</td>
                <td style="padding: 12px; color: #6c757d;">${formatDate(coupon.NgayBatDau)}</td>
                <td style="padding: 12px; color: #6c757d;">${formatDate(coupon.NgayKetThuc)}</td>
                <td style="padding: 12px;">
                    <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: ${statusColor}; background: ${statusBg};">
                        ${coupon.TrangThai}
                    </span>
                </td>
                <td style="padding: 12px;">
                    <button onclick="editCoupon(${coupon.MaCoupon})" style="padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 4px; font-size: 12px;">Sửa</button>
                    <button onclick="deleteCoupon(${coupon.MaCoupon})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Mở modal tạo/sửa mã
function openModal(coupon = null) {
    const modal = document.getElementById('coupon-modal');
    const form = document.getElementById('coupon-form');
    const title = document.getElementById('modal-title');
    
    if (coupon) {
        // Chế độ sửa
        isEditMode = true;
        title.textContent = 'Cập nhật mã giảm giá';
        document.getElementById('coupon-id').value = coupon.MaCoupon;
        document.getElementById('coupon-code').value = coupon.Code;
        document.getElementById('coupon-code').disabled = true; // Không cho sửa Code
        document.getElementById('coupon-description').value = coupon.MoTa || '';
        document.getElementById('coupon-type').value = coupon.LoaiGiamGia;
        document.getElementById('coupon-type').disabled = true; // Không cho sửa loại
        document.getElementById('coupon-value').value = coupon.GiaTri;
        document.getElementById('coupon-value').disabled = true; // Không cho sửa giá trị
        document.getElementById('coupon-min-order').value = coupon.DonHangToiThieu;
        document.getElementById('coupon-quantity').value = coupon.SoLuong;
        document.getElementById('coupon-start-date').value = formatDateTimeForInput(coupon.NgayBatDau);
        document.getElementById('coupon-end-date').value = formatDateTimeForInput(coupon.NgayKetThuc);
    } else {
        // Chế độ tạo mới
        isEditMode = false;
        title.textContent = 'Tạo mã giảm giá';
        form.reset();
        document.getElementById('coupon-code').disabled = false;
        document.getElementById('coupon-type').disabled = false;
        document.getElementById('coupon-value').disabled = false;
        
        // Set ngày bắt đầu = hôm nay
        const now = new Date();
        document.getElementById('coupon-start-date').value = formatDateTimeForInput(now);
        
        // Set ngày kết thúc = 30 ngày sau
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);
        document.getElementById('coupon-end-date').value = formatDateTimeForInput(endDate);
    }
    
    modal.style.display = 'flex';
}

// Đóng modal
function closeModal() {
    document.getElementById('coupon-modal').style.display = 'none';
    document.getElementById('coupon-form').reset();
}

// Xử lý lưu mã giảm giá
async function handleSaveCoupon(event) {
    event.preventDefault();

    // Lấy dữ liệu từ form
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const description = document.getElementById('coupon-description').value.trim();
    const type = document.getElementById('coupon-type').value;
    const value = parseFloat(document.getElementById('coupon-value').value);
    const minOrder = parseFloat(document.getElementById('coupon-min-order').value) || 0;
    const quantity = parseInt(document.getElementById('coupon-quantity').value);
    const startDate = document.getElementById('coupon-start-date').value;
    const endDate = document.getElementById('coupon-end-date').value;

    // Validate frontend
    if (!code || !value || !quantity || !startDate || !endDate) {
        alert('Vui lòng điền đầy đủ các trường bắt buộc!');
        return;
    }

    if (value <= 0) {
        alert('Giá trị giảm phải lớn hơn 0!');
        return;
    }

    if (type === 'Percentage' && value > 100) {
        alert('Giá trị giảm theo % không được vượt quá 100!');
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu!');
        return;
    }

    // Chuẩn bị dữ liệu
    const data = {
        Code: code,
        MoTa: description,
        LoaiGiamGia: type,
        GiaTri: value,
        DonHangToiThieu: minOrder,
        NgayBatDau: startDate,
        NgayKetThuc: endDate,
        SoLuong: quantity
    };

    try {
        let url = `${API_BASE_URL}/admin/coupons`;
        let method = 'POST';

        if (isEditMode) {
            const id = document.getElementById('coupon-id').value;
            url = `${API_BASE_URL}/admin/coupons/${id}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeModal();
            loadCoupons(); // Reload danh sách
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving coupon:', error);
        alert('Lỗi kết nối server!');
    }
}

// Sửa mã giảm giá
async function editCoupon(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
            method: 'GET',
            headers: getHeaders()
        });

        const result = await response.json();
        
        if (result.success) {
            const coupon = result.data.find(c => c.MaCoupon === id);
            if (coupon) {
                openModal(coupon);
            }
        }
    } catch (error) {
        console.error('Error loading coupon:', error);
        alert('Lỗi kết nối server!');
    }
}

// Xóa mã giảm giá
async function deleteCoupon(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadCoupons(); // Reload danh sách
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Lỗi kết nối server!');
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../client/html/index.html';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    // Load danh sách mã giảm giá
    loadCoupons();

    // Event listeners
    document.getElementById('btn-create-coupon').addEventListener('click', () => openModal());
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    document.getElementById('coupon-form').addEventListener('submit', handleSaveCoupon);
    document.getElementById('btn-logout').addEventListener('click', logout);

    // Tự động chuyển Code thành chữ in hoa khi gõ
    document.getElementById('coupon-code').addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    // Đóng modal khi click bên ngoài
    document.getElementById('coupon-modal').addEventListener('click', (e) => {
        if (e.target.id === 'coupon-modal') {
            closeModal();
        }
    });
});
