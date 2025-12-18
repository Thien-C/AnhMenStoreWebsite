// === FILTER LOGIC ===
let allProducts = [];
let filteredProducts = [];

// Hàm fix path ảnh
function fixImgPath(path) {
    if (!path) return '../asset/placeholder.jpg';
    if (path.startsWith('http')) return path;
    if (path.startsWith('../')) return path;
    if (path.startsWith('asset/')) return '../' + path;
    return path;
}

// Hàm set nhanh khoảng giá
function setQuickPrice(min, max) {
    document.getElementById('filter-min-price').value = min;
    document.getElementById('filter-max-price').value = max === 999999999 ? '' : max;
    applyFilters(); // Tự động áp dụng filter
}

// Toggle filter cho mobile
function toggleFilterMobile() {
    const sidebar = document.querySelector('aside');
    sidebar.classList.toggle('hidden');
}

// Load danh mục
async function loadCategories() {
    try {
        const categories = await API.get('/products/categories');
        const select = document.getElementById('filter-category');
        
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.MaDanhMuc;
                option.textContent = cat.TenDanhMuc;
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Load categories error:', err);
    }
}

// Load sản phẩm với filter từ backend
async function loadAllProducts() {
    applyFilters(); // Gọi applyFilters thay vì load trực tiếp
}

// Áp dụng bộ lọc (sử dụng API backend)
async function applyFilters() {
    try {
        const keyword = document.getElementById('filter-keyword').value.trim();
        const minPrice = parseInt(document.getElementById('filter-min-price').value) || '';
        const maxPrice = parseInt(document.getElementById('filter-max-price').value) || '';
        const category = document.getElementById('filter-category').value;
        const sort = document.getElementById('filter-sort').value;

        // Tạo query parameters
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);

        // Gọi API với filter
        const queryString = params.toString();
        const url = queryString ? `/products?${queryString}` : '/products';
        const products = await API.get(url);
        
        allProducts = Array.isArray(products) ? products : [];
        filteredProducts = [...allProducts]; // Backend đã filter và sort rồi

        renderProducts();
        updateResultCount();
        updateSearchDisplay();
    } catch (err) {
        console.error('Load products error:', err);
        showEmptyState();
    }
}

// Hiển thị sản phẩm
function renderProducts() {
    const container = document.getElementById('search-results-container');
    const emptyState = document.getElementById('empty-state');

    if (filteredProducts.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');

    container.innerHTML = filteredProducts.map(p => {
        const img = fixImgPath(p.AnhDaiDien);
        const price = new Intl.NumberFormat('vi-VN').format(p.GiaHienThi || 0);
        
        return `
            <div class="product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer" onclick="window.location.href='product-detail.html?id=${p.MaSP}'">
                <div class="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img src="${img}" alt="${p.TenSP}" class="product-img w-full h-full object-cover" onerror="this.src='../asset/placeholder.jpg'">
                </div>
                <div class="p-3">
                    <div class="text-xs text-gray-500 mb-1">${p.TenDanhMuc || 'Sản phẩm'}</div>
                    <h3 class="font-bold text-sm md:text-base mb-2 line-clamp-2">${p.TenSP}</h3>
                    <div class="flex items-center justify-between">
                        <span class="text-blue-600 font-bold text-lg">${price}₫</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Cập nhật số lượng kết quả
function updateResultCount() {
    const countEl = document.getElementById('result-count');
    countEl.textContent = `Tìm thấy ${filteredProducts.length} sản phẩm`;
}

// Cập nhật thông báo tìm kiếm
function updateSearchDisplay() {
    const displayEl = document.getElementById('search-keyword-display');
    const keyword = document.getElementById('filter-keyword').value;
    const minPrice = document.getElementById('filter-min-price').value;
    const maxPrice = document.getElementById('filter-max-price').value;
    const category = document.getElementById('filter-category');
    const categoryText = category.options[category.selectedIndex].text;

    let parts = [];
    if (keyword) parts.push(`"${keyword}"`);
    if (minPrice || maxPrice) {
        const priceRange = `${minPrice ? new Intl.NumberFormat('vi-VN').format(minPrice) + '₫' : '0₫'} - ${maxPrice ? new Intl.NumberFormat('vi-VN').format(maxPrice) + '₫' : '∞'}`;
        parts.push(`Giá: ${priceRange}`);
    }
    if (category.value) parts.push(`Danh mục: ${categoryText}`);

    displayEl.textContent = parts.length > 0 ? parts.join(' | ') : 'Tất cả sản phẩm';
}

// Reset bộ lọc
function resetFilters() {
    document.getElementById('filter-keyword').value = '';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-sort').value = 'newest';
    applyFilters();
}

// Show empty state
function showEmptyState() {
    document.getElementById('search-results-container').classList.add('hidden');
    document.getElementById('empty-state').classList.remove('hidden');
    document.getElementById('result-count').textContent = 'Không có sản phẩm';
}

// Debounce function to avoid too many API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', async () => {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const urlKeyword = urlParams.get('keyword');
    const urlCategory = urlParams.get('category');
    
    // Load categories first
    await loadCategories();
    
    // Set URL params after categories are loaded
    if (urlKeyword) {
        document.getElementById('filter-keyword').value = urlKeyword;
    }
    if (urlCategory) {
        document.getElementById('filter-category').value = urlCategory;
    }
    
    // Load products after everything is set up
    loadAllProducts();

    // Auto filter khi nhấn Enter trong ô tìm kiếm
    document.getElementById('filter-keyword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    // Add event listeners cho các filter controls
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    document.getElementById('filter-sort').addEventListener('change', applyFilters);
    document.getElementById('filter-min-price').addEventListener('input', debounce(applyFilters, 500));
    document.getElementById('filter-max-price').addEventListener('input', debounce(applyFilters, 500));
});
