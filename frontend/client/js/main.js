// frontend/client/js/main.js

// === PHẦN 1: TIỆN ÍCH & LOGIC SẢN PHẨM (GIỮ NGUYÊN) ===
function fixImgPath(path) {
    if (!path) return 'https://via.placeholder.com/300x400';
    if (path.startsWith('http') || path.startsWith('../')) return path;
    return '../' + path; 
}

function renderProductCard(p) {
    const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.GiaHienThi || 0);
    const imgSrc = fixImgPath(p.AnhDaiDien);
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
                    
                    <button onclick="event.preventDefault(); window.location.href='product-detail.html?id=${p.MaSP}'" 
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

async function addQuickToCart(variantId) {
    if(!variantId) { alert("Sản phẩm này chưa có biến thể để mua ngay!"); return; }
    if(typeof CartManager !== 'undefined') await CartManager.addToCart(variantId, 1);
}

async function loadHomeData() {
    const products = await API.get('/products');
    const winterContainer = document.getElementById('winter-products');
    const runningContainer = document.getElementById('running-products');

    if(winterContainer) winterContainer.innerHTML = '';
    if(runningContainer) runningContainer.innerHTML = '';

    if(Array.isArray(products) && products.length > 0) {
        products.forEach((p, index) => {
            const html = renderProductCard(p);
            if (index < 5 && runningContainer) runningContainer.innerHTML += `<div class="w-[280px] snap-start flex-shrink-0">${html}</div>`;
            if (winterContainer) winterContainer.innerHTML += html;
        });
    } else {
        if(winterContainer) winterContainer.innerHTML = '<p class="col-span-4 text-center py-10">Chưa có sản phẩm nào.</p>';
    }
}

// === PHẦN 2: LOGIC TÌM KIẾM ===
function handleSearchRedirect() {
    const input = document.getElementById('searchInput');
    const keyword = input.value.trim();
    if (!keyword) { alert("Vui lòng nhập từ khóa!"); return; }
    window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
}

async function loadSearchPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword');
    const categoryId = urlParams.get('category'); // Lấy ID từ URL
    
    const displayEl = document.getElementById('search-keyword-display');
    const container = document.getElementById('search-results-container');
    const searchInput = document.getElementById('searchInput');

    // === PHẦN 1: XỬ LÝ HIỂN THỊ TIÊU ĐỀ ===
    if (displayEl) {
        if (keyword) {
            displayEl.innerHTML = `Kết quả tìm kiếm cho: <span class="font-bold">"${keyword}"</span>`;
            if (searchInput) searchInput.value = keyword;
        } else if (categoryId) {
            // [MỚI] Gọi API lấy Master Data để tìm tên danh mục từ ID
            displayEl.innerHTML = `Đang tải tên danh mục...`; // Hiện text tạm
            
            try {
                const data = await API.get('/products/master-data');
                // Tìm danh mục có ID trùng với categoryId trên URL
                const cat = data.categories.find(c => c.MaDanhMuc == categoryId);
                
                if (cat) {
                    displayEl.innerHTML = `Đang xem danh mục: <span class="font-bold text-blue-600 text-xl">"${cat.TenDanhMuc}"</span>`;
                } else {
                    displayEl.innerHTML = `Đang xem danh mục ID: <span class="font-bold">"${categoryId}"</span>`;
                }
            } catch (err) {
                console.error("Lỗi lấy tên danh mục:", err);
                // Fallback nếu lỗi API
                displayEl.innerHTML = `Đang xem danh mục ID: <span class="font-bold">"${categoryId}"</span>`;
            }

        } else {
            displayEl.innerHTML = `Tất cả sản phẩm`;
        }
    }
    
    // === PHẦN 2: TẢI SẢN PHẨM (GIỮ NGUYÊN) ===
    try {
        let apiUrl = '/products';
        const params = [];
        if (keyword) params.push(`keyword=${encodeURIComponent(keyword)}`);
        if (categoryId) params.push(`category=${categoryId}`);
        
        if (params.length > 0) apiUrl += '?' + params.join('&');

        const products = await API.get(apiUrl);
        
        if (container) {
            container.innerHTML = ''; 
            if (Array.isArray(products) && products.length > 0) {
                products.forEach(p => container.innerHTML += renderProductCard(p));
            } else {
                container.innerHTML = `
                    <div class="col-span-full text-center py-10">
                        <p class="text-xl text-gray-500 mb-4">Không tìm thấy sản phẩm nào.</p>
                        <a href="index.html" class="text-blue-600 font-bold hover:underline">Xem tất cả sản phẩm</a>
                    </div>`;
            }
        }
    } catch (error) { console.error(error); }
}
// === PHẦN 3: LOGIC AUTH (ĐĂNG NHẬP / ĐĂNG KÝ / MODAL) - MỚI ===
const AuthManager = {
    modal: null,
    
    init() {
        this.modal = document.getElementById('auth-modal');
        this.checkLoginStatus();
        this.bindEvents();
    },

    toggleModal(show) {
        if (this.modal) {
            if (show) this.modal.classList.remove('hidden');
            else this.modal.classList.add('hidden');
        }
    },

    switchForm(type) {
        const formLogin = document.getElementById('form-login');
        const formRegister = document.getElementById('form-register');
        if (formLogin && formRegister) {
            formLogin.classList.toggle('hidden', type !== 'login');
            formRegister.classList.toggle('hidden', type !== 'register');
        }
    },

    checkLoginStatus() {
        const authBtn = document.getElementById('authBtn');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (authBtn) {
            if (user) {
                // ĐÃ ĐĂNG NHẬP: Hiện tên User + Click vào thì sang trang Profile
                authBtn.innerHTML = `<div class="flex items-center gap-1"><span class="text-xs font-bold truncate max-w-[80px]">${user.name}</span></div>`;
                
                // --- SỬA ĐOẠN NÀY ---
                authBtn.onclick = (e) => {
                    e.preventDefault(); 
                    // Chuyển hướng sang trang Profile thay vì logout ngay
                    window.location.href = 'profile.html';
                };
                // --------------------

            } else {
                // CHƯA ĐĂNG NHẬP: Giữ nguyên logic mở Modal
                authBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                `;
                authBtn.onclick = (e) => {
                    e.preventDefault();
                    this.toggleModal(true);
                    this.switchForm('login');
                };
            }
        }
    },

    bindEvents() {
        // Form Login Submit
        const formLogin = document.getElementById('form-login');
        if (formLogin) {
            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const pass = document.getElementById('login-password').value;
                const res = await API.post('/auth/login', { Email: email, MatKhau: pass });
                
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));
                    
                    // Merge giỏ hàng offline vào online nếu có
                    const localCart = JSON.parse(localStorage.getItem('cart_items') || '[]');
                    if (localCart.length > 0) {
                        await API.post('/cart/merge', { items: localCart });
                        localStorage.removeItem('cart_items');
                    }
                    
                    alert('Đăng nhập thành công!');
                    this.toggleModal(false);

                    // Nếu là Admin -> chuyển đến trang Admin
                    if (res.user && res.user.role === 'Admin') {
                        window.location.href = '/frontend/admin/index.html';
                    } else {
                        window.location.reload();
                    }
                } else {
                    alert(res.message || 'Lỗi đăng nhập');
                }
            });
        }

        // Form Register Submit
        const formRegister = document.getElementById('form-register');
        if (formRegister) {
            formRegister.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = {
                    HoTen: document.getElementById('reg-name').value,
                    SoDienThoai: document.getElementById('reg-phone').value,
                    Email: document.getElementById('reg-email').value,
                    MatKhau: document.getElementById('reg-pass').value
                };
                const res = await API.post('/auth/register', data);
                if (res.userId) {
                    alert('Đăng ký thành công! Vui lòng đăng nhập.');
                    this.switchForm('login');
                } else {
                    alert(res.message);
                }
            });
        }

        // Close Modal Buttons (Nút X và Nền đen)
        const closeBtns = document.querySelectorAll('.close-auth-modal');
        closeBtns.forEach(btn => btn.onclick = () => this.toggleModal(false));
    }
};

// === KHỞI TẠO CHUNG ===
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Router
    if (path.includes('search.html')) loadSearchPage();
    else if (path.includes('index.html') || path.endsWith('/')) loadHomeData();

    // Search Event
    const btnSearch = document.getElementById('btnSearch');
    const searchInput = document.getElementById('searchInput');
    if(btnSearch && searchInput) {
        btnSearch.addEventListener('click', handleSearchRedirect);
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearchRedirect(); });
    }
    
    // Init Auth
    AuthManager.init();
    loadMenu();
    // Update Cart Badge
    if (typeof CartManager !== 'undefined') CartManager.updateBadge();
});

// Expose AuthManager global để gọi từ HTML nếu cần (ví dụ onclick chuyển form)
window.AuthManager = AuthManager;

// === PHẦN: RENDER MENU ĐỘNG ===
async function loadMenu() {
    const navContainer = document.getElementById('main-nav');
    if (!navContainer) return;

    try {
        // 1. Lấy dữ liệu Master Data (Chứa danh mục)
        const data = await API.get('/products/master-data');
        const categories = data.categories; // Mảng danh mục từ DB

        if (!categories || categories.length === 0) return;

        // 2. Tạo nút "Sản Phẩm" (Hiện tất cả)
        let html = `
            <a href="search.html" class="hover:text-blue-600 transition h-full flex items-center">
                Sản phẩm
            </a>
        `;

        // 3. Lọc lấy các Danh mục CHA (MaDanhMucCha = null)
        const parents = categories.filter(c => !c.MaDanhMucCha);

        parents.forEach(parent => {
            // Tìm các con của danh mục này
            const children = categories.filter(c => c.MaDanhMucCha === parent.MaDanhMuc);

            if (children.length > 0) {
                // === MENU CÓ CẤP 2 (Dropdown) ===
                const childHtml = children.map(child => `
                    <a href="search.html?category=${child.MaDanhMuc}" 
                       class="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-600 text-sm font-medium whitespace-nowrap border-b border-gray-100 last:border-0 transition-colors">
                       ${child.TenDanhMuc}
                    </a>
                `).join('');

                html += `
                    <div class="group relative h-full flex items-center cursor-pointer">
                        <a href="search.html?category=${parent.MaDanhMuc}" class="hover:text-blue-600 transition flex items-center gap-1">
                            ${parent.TenDanhMuc}
                            <svg class="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </a>
                        
                        <div class="absolute top-full left-0 bg-white shadow-xl border-t-2 border-blue-600 min-w-[180px] 
                                    opacity-0 invisible translate-y-2 transition-all duration-300 z-50 rounded-b-lg
                                    group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                            ${childHtml}
                        </div>
                    </div>
                `;
            } else {
                // === MENU KHÔNG CÓ CON (Link thường) ===
                html += `
                    <a href="search.html?category=${parent.MaDanhMuc}" class="hover:text-blue-600 transition h-full flex items-center">
                        ${parent.TenDanhMuc}
                    </a>
                `;
            }
        });

        navContainer.innerHTML = html;

    } catch (err) {
        console.error("Lỗi tải menu:", err);
    }
}