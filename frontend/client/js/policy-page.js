// Hàm chuyển tab
function showSection(id) {
    // Ẩn tất cả nội dung
    document.querySelectorAll('.policy-section').forEach(el => el.classList.add('hidden'));
    // Bỏ active button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    // Hiện nội dung được chọn
    document.getElementById(`content-${id}`).classList.remove('hidden');
    document.getElementById(`btn-${id}`).classList.add('active');
}

// Tự động mở tab dựa trên Hash URL (VD: policy.html#payment)
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if(hash && ['size', 'return', 'shipping', 'payment'].includes(hash)) {
        showSection(hash);
    } else {
        showSection('size'); // Mặc định
    }
});
