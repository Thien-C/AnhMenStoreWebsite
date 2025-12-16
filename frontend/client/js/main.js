// 1. Hàm tạo HTML cho 1 thẻ sản phẩm (Tách ra để dùng chung cho cả Load trang và Search)
function createProductHTML(p) {
    const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.GiaHienThi || 0);
    const img = p.AnhDaiDien || 'https://via.placeholder.com/300x400';
    
    // HTML chuẩn có thẻ <a> bao ngoài để click chuyển trang
    return `
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
}

// 2. Hàm load trang chủ mặc định (Chạy khi mới vào trang)
async function renderHomePage() {
    const products = await API.get('/products');
    
    const winterContainer = document.getElementById('winter-products');
    const runningContainer = document.getElementById('running-products');

    // Reset container
    if(winterContainer) winterContainer.innerHTML = '';
    if(runningContainer) runningContainer.innerHTML = '';

    if(Array.isArray(products) && products.length > 0) {
        // Render danh sách sản phẩm
        products.forEach((p, index) => {
            const html = createProductHTML(p);
            
            // Logic chia sản phẩm: 
            // 5 sản phẩm đầu tiên cho vào Slider "Đồ Chạy Bộ" (nếu có container)
            if (index < 5 && runningContainer) {
                const sliderItem = `<div class="w-[280px] snap-start flex-shrink-0">${html}</div>`;
                runningContainer.innerHTML += sliderItem;
            } 
            
            // Tất cả sản phẩm cho vào Grid "Đồ Thu Đông"
            if (winterContainer) {
                winterContainer.innerHTML += html;
            }
        });
    } else {
        if(winterContainer) winterContainer.innerHTML = '<p class="col-span-4 text-center py-10">Chưa có sản phẩm nào.</p>';
    }
}

// 3. Hàm xử lý Tìm Kiếm (GỌI KHI ẤN ENTER HOẶC CLICK NÚT SEARCH)
async function handleSearch() {
    const input = document.getElementById('searchInput');
    // Nếu trang web chưa có ô input search thì bỏ qua (tránh lỗi ở các trang khác)
    if (!input) return;

    const keyword = input.value.trim();

    if (!keyword) {
        alert("Vui lòng nhập từ khóa để tìm kiếm!");
        return;
    }

    // Gọi API tìm kiếm
    const products = await API.get(`/products?keyword=${keyword}`);

    // Xử lý giao diện kết quả
    const resultContainer = document.getElementById('winter-products');
    const titleSection = document.querySelector('h2.text-2xl'); // Tìm tiêu đề để đổi tên
    const runningSection = document.querySelector('section.bg-gray-100'); // Section Chạy bộ

    if (resultContainer) {
        resultContainer.innerHTML = ''; // Xóa sạch sản phẩm cũ
        
        // Ẩn section chạy bộ đi cho đỡ rối mắt khi đang tìm kiếm
        if(runningSection) runningSection.style.display = 'none';
        
        // Đổi tiêu đề section
        if(titleSection) titleSection.innerText = `Kết quả tìm kiếm: "${keyword}"`;

        if (products.length === 0) {
            resultContainer.innerHTML = '<p class="col-span-4 text-center py-10 text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</p>';
        } else {
            products.forEach(p => {
                resultContainer.innerHTML += createProductHTML(p);
            });
        }
    }
}

// 4. Khởi tạo sự kiện (Event Listeners) - Chạy khi trang web tải xong
document.addEventListener('DOMContentLoaded', () => {
    
    // Kiểm tra nếu đang ở trang chủ thì mới render danh sách mặc định
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        renderHomePage();
    }

    // Gắn sự kiện cho nút Tìm kiếm và ô nhập liệu
    const btnSearch = document.getElementById('btnSearch');
    const searchInput = document.getElementById('searchInput');

    if (btnSearch && searchInput) {
        // Sự kiện Click nút kính lúp
        btnSearch.addEventListener('click', handleSearch);

        // Sự kiện nhấn phím Enter trong ô input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});