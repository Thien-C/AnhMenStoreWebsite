// Hàm tiện ích: Tự động sửa đường dẫn ảnh nếu cần
function fixImgPath(path) {
    if (!path) return 'https://via.placeholder.com/300x400';
    if (path.startsWith('http') || path.startsWith('../')) return path;
    return '../' + path; // Thêm ../ để lùi ra khỏi thư mục pages/
}

// 1. Hàm render HTML cho 1 thẻ sản phẩm
function renderProductCard(p) {
    // Giá tiền
    const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.GiaHienThi || 0);
    // Ảnh đại diện (đã fix path)
    const imgSrc = fixImgPath(p.AnhDaiDien);
    
    // Xử lý màu sắc
    let colors = p.DS_Mau ? p.DS_Mau.split(',') : ['Mặc định'];
    const colorHtml = colors.slice(0, 3).map(c => {
        const mapColor = { 'Đen': '#000', 'Trắng': '#fff', 'Xanh': '#1e3a8a', 'Xám': '#808080', 'Đỏ': '#dc2626', 'Be': '#f5f5dc', 'Nâu': '#8B4513' };
        const bg = mapColor[c] || '#ccc';
        return `<div class="color-swatch" style="background-color: ${bg}" title="${c}"></div>`;
    }).join('');

    return `
        <div class="product-card group w-full md:w-auto block relative">
            <a href="product-detail.html?id=${p.MaSP}" class="block relative w-full aspect-[3/4] overflow-hidden rounded-xl mb-3 bg-gray-200">
                <img src="${imgSrc}" class="product-img w-full h-full object-cover">
                
                <div class="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition duration-300 flex justify-center pb-4">
                    <button onclick="event.preventDefault(); addQuickToCart(${p.MaBienThe})" 
                            class="bg-white text-black text-xs font-bold py-2 px-6 rounded-full shadow-lg hover:bg-black hover:text-white transition">
                        Thêm vào giỏ
                    </button>
                </div>
            </a>
            
            <a href="product-detail.html?id=${p.MaSP}">
                <div class="flex gap-1 mb-2">${colorHtml}</div>
                <h3 class="text-sm text-gray-700 font-medium mb-1 group-hover:text-blue-600 truncate">${p.TenSP}</h3>
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-bold text-black">${price}</span>
                </div>
            </a>
        </div>
    `;
}

// Hàm thêm nhanh vào giỏ (yêu cầu cart.js đã load)
async function addQuickToCart(variantId) {
    if(!variantId) {
        alert("Sản phẩm này chưa có biến thể để mua ngay!");
        return;
    }
    if(typeof CartManager !== 'undefined') {
        await CartManager.addToCart(variantId, 1);
    }
}

// ================= LOGIC TRANG CHỦ =================
async function loadHomeData() {
    const products = await API.get('/products');
    
    const winterContainer = document.getElementById('winter-products');
    const runningContainer = document.getElementById('running-products');

    if(winterContainer) winterContainer.innerHTML = '';
    if(runningContainer) runningContainer.innerHTML = '';

    if(Array.isArray(products) && products.length > 0) {
        products.forEach((p, index) => {
            const html = renderProductCard(p);
            // 5 sản phẩm đầu vào slider chạy bộ
            if (index < 5 && runningContainer) {
                runningContainer.innerHTML += `<div class="w-[280px] snap-start flex-shrink-0">${html}</div>`;
            } 
            // Tất cả vào grid chính
            if (winterContainer) {
                winterContainer.innerHTML += html;
            }
        });
    } else {
        if(winterContainer) winterContainer.innerHTML = '<p class="col-span-4 text-center py-10">Chưa có sản phẩm nào.</p>';
    }
}

// ================= LOGIC TÌM KIẾM =================
// 1. Chuyển hướng khi ấn tìm kiếm
function handleSearchRedirect() {
    const input = document.getElementById('searchInput');
    const keyword = input.value.trim();
    if (!keyword) {
        alert("Vui lòng nhập từ khóa!");
        return;
    }
    window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
}

// 2. Load dữ liệu tại trang search.html
async function loadSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword');
    const displayEl = document.getElementById('search-keyword-display');
    const container = document.getElementById('search-results-container');
    const searchInput = document.getElementById('searchInput');

    if (!keyword) {
        if(displayEl) displayEl.innerText = "Bạn chưa nhập từ khóa tìm kiếm.";
        return;
    }

    if (searchInput) searchInput.value = keyword;
    if (displayEl) displayEl.innerHTML = `Từ khóa: <span class="font-bold text-black">"${keyword}"</span>`;
    if (container) container.innerHTML = '<p class="col-span-4 text-center text-gray-500">Đang tìm kiếm...</p>';

    try {
        const products = await API.get(`/products?keyword=${keyword}`);
        if (container) {
            container.innerHTML = ''; 
            if (Array.isArray(products) && products.length > 0) {
                products.forEach(p => container.innerHTML += renderProductCard(p));
            } else {
                container.innerHTML = `<div class="col-span-full text-center py-10"><p class="text-xl text-gray-500 mb-4">Không tìm thấy sản phẩm nào.</p><a href="index.html" class="text-blue-600 font-bold hover:underline">Về trang chủ</a></div>`;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

// ================= KHỞI TẠO CHUNG =================
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Router đơn giản
    if (path.includes('search.html')) {
        loadSearchPage();
    } else if (path.includes('index.html') || path.endsWith('/') || path.endsWith('pages/')) {
        loadHomeData();
    }

    // Sự kiện nút tìm kiếm (chung cho mọi trang)
    const btnSearch = document.getElementById('btnSearch');
    const searchInput = document.getElementById('searchInput');

    if(btnSearch && searchInput) {
        btnSearch.addEventListener('click', handleSearchRedirect);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearchRedirect();
        });
    }

    // Cập nhật badge giỏ hàng
    if (typeof CartManager !== 'undefined') {
        CartManager.updateBadge();
    }
});