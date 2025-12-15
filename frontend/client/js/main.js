// js/main.js
async function renderHomePage() {
    // 1. Load Master Data (để render menu nếu cần - Phase sau)
    
    // 2. Load Products
    const products = await API.get('/products');
    const container = document.getElementById('winter-products'); // Giả sử render vào section này
    
    if (!container) return;
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p>Không tìm thấy sản phẩm</p>';
        return;
    }

    products.forEach(p => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.GiaHienThi || 0);
        const img = p.AnhDaiDien || 'https://via.placeholder.com/300x400';
        const html = `
            <a href="product-detail.html?id=${p.MaSP}" class="product-card group cursor-pointer block">
                
                <div class="relative w-full aspect-[3/4] overflow-hidden rounded-xl mb-3 bg-gray-200">
                    <img src="${img}" class="product-img w-full h-full object-cover transition duration-300 group-hover:scale-105">
                    
                    <div class="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition duration-300 flex justify-center pb-4">
                        <span class="bg-white text-black text-xs font-bold py-2 px-6 rounded-full shadow-lg hover:bg-black hover:text-white transition">Xem chi tiết</span>
                    </div>
                </div>

                <h3 class="text-sm font-medium group-hover:text-blue-600 truncate">${p.TenSP}</h3>
                <div class="flex items-center space-x-2 mt-1">
                    <span class="text-sm font-bold">${price}</span>
                </div>
            </a>
        `;
        container.innerHTML += html;
    });
}

// Chạy hàm khi load trang index
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    renderHomePage();
}