// frontend/client/js/main.js

// === PHẦN 1: TIỆN ÍCH & LOGIC SẢN PHẨM (GIỮ NGUYÊN) ===
function fixImgPath(path) {
    if (!path || path === '') return 'https://via.placeholder.com/300x400?text=No+Image';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/asset/')) return '..' + path; // /asset/xyz.jpg -> ../asset/xyz.jpg
    if (path.startsWith('asset/')) return '../' + path; // asset/xyz.jpg -> ../asset/xyz.jpg  
    if (path.startsWith('../')) return path;
    if (path.startsWith('uploads/')) return '../../backend/' + path;
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

// Object lưu trữ trạng thái xoay vòng cho từng danh mục
const categoryRotation = {
    ao: { currentIndex: 0, allProducts: [], intervalId: null },
    quan: { currentIndex: 0, allProducts: [], intervalId: null },
    phukien: { currentIndex: 0, allProducts: [], intervalId: null }
};

// Hàm render 4 sản phẩm dựa trên index hiện tại
function renderCategoryProducts(key, products, startIndex) {
    const container = document.getElementById(`${key}-products`);
    if (!container) return;

    const displayProducts = products.slice(startIndex, startIndex + 4);
    if (displayProducts.length === 0) {
        // Quay lại đầu nếu hết sản phẩm
        categoryRotation[key].currentIndex = 0;
        renderCategoryProducts(key, products, 0);
        return;
    }

    container.innerHTML = displayProducts.map(p => renderProductCard(p)).join('');
}

// Hàm bắt đầu xoay vòng sản phẩm cho một danh mục
function startProductRotation(key, products) {
    // Dừng interval cũ nếu có
    if (categoryRotation[key].intervalId) {
        clearInterval(categoryRotation[key].intervalId);
    }

    // Chỉ xoay vòng nếu có nhiều hơn 4 sản phẩm
    if (products.length > 4) {
        categoryRotation[key].intervalId = setInterval(() => {
            categoryRotation[key].currentIndex += 4;
            // Quay lại đầu nếu vượt quá
            if (categoryRotation[key].currentIndex >= products.length) {
                categoryRotation[key].currentIndex = 0;
            }
            renderCategoryProducts(key, products, categoryRotation[key].currentIndex);
        }, 5000); // 5 giây
    }
}

async function loadHomeData() {
    try {
        // Danh mục cha: Áo = 1, Quần = 2, Phụ kiện = 3
        const categoryIds = { ao: 1, quan: 2, phukien: 3 };

        // Lấy sản phẩm cho từng danh mục
        for (const [key, categoryId] of Object.entries(categoryIds)) {
            const container = document.getElementById(`${key}-products`);
            if (!container) continue;

            try {
                // Gọi API với category ID (backend sẽ tự động lấy cả danh mục con)
                const products = await API.get(`/products?category=${categoryId}`);
                
                if (products && products.length > 0) {
                    // Lưu tất cả sản phẩm
                    categoryRotation[key].allProducts = products;
                    categoryRotation[key].currentIndex = 0;
                    
                    // Render 4 sản phẩm đầu tiên
                    renderCategoryProducts(key, products, 0);
                    
                    // Bắt đầu xoay vòng nếu có nhiều hơn 4 sản phẩm
                    startProductRotation(key, products);
                } else {
                    container.innerHTML = '<p class="col-span-4 text-center py-10 text-gray-500">Chưa có sản phẩm nào.</p>';
                }
            } catch (error) {
                console.error(`Lỗi tải sản phẩm danh mục ${key}:`, error);
                container.innerHTML = '<p class="col-span-4 text-center py-10 text-red-500">Lỗi tải dữ liệu.</p>';
            }

            // Thêm sự kiện click cho nút "Xem tất cả"
            const viewAllBtn = document.getElementById(`view-all-${key}`);
            if (viewAllBtn) {
                viewAllBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = `search.html?category=${categoryId}`;
                };
            }
        }
    } catch (error) {
        console.error('Lỗi tải dữ liệu trang chủ:', error);
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
        this.initPasswordToggle();
    },

    // Tính năng hiện/ẩn mật khẩu
    initPasswordToggle() {
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.onclick = () => {
                const targetId = btn.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (input) {
                    const isPass = input.type === 'password';
                    input.type = isPass ? 'text' : 'password';
                    btn.textContent = isPass ? '🔒' : '👁️';
                }
            };
        });
    },

    // Hàm hiển thị lỗi dưới ô input
    showError(inputId, message) {
        const errorEl = document.getElementById(`error-${inputId}`);
        const inputEl = document.getElementById(inputId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
        if (inputEl) inputEl.classList.add('border-red-500');
    },

    // Hàm xóa tất cả lỗi cũ
    clearErrors() {
        document.querySelectorAll('[id^="error-"]').forEach(el => {
            el.textContent = '';
            el.classList.add('hidden');
        });
        document.querySelectorAll('input').forEach(el => el.classList.remove('border-red-500'));
    },

    toggleModal(show) {
        if (this.modal) {
            if (show) this.modal.classList.remove('hidden');
            else {
                this.modal.classList.add('hidden');
                this.clearErrors();
            }
        }
    },

    switchForm(type) {
        const forms = ['form-login', 'form-register', 'form-forgot', 'form-reset-password'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) form.classList.toggle('hidden', formId !== `form-${type}`);
        });
        const headerText = document.querySelector('#auth-header p');
        if (headerText) {
            const titles = { login: 'Đăng nhập', register: 'Đăng ký', forgot: 'Quên mật khẩu', 'reset-password': 'Đặt lại mật khẩu' };
            headerText.textContent = titles[type] || 'Tài khoản';
        }
    },

    checkLoginStatus() {
        const authBtn = document.getElementById('authBtn');
        const user = JSON.parse(localStorage.getItem('user'));
        if (authBtn) {
            if (user) {
                authBtn.innerHTML = `<div class="flex items-center gap-1"><span class="text-xs font-bold truncate max-w-[80px]">${user.name}</span></div>`;
                authBtn.onclick = (e) => { e.preventDefault(); window.location.href = 'profile.html'; };
            } else {
                authBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
                authBtn.onclick = (e) => { e.preventDefault(); this.toggleModal(true); this.switchForm('login'); };
            }
        }
    },

    bindEvents() {
        const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const validatePassword = (pass) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);

        // FORM ĐĂNG NHẬP
        const formLogin = document.getElementById('form-login');
        if (formLogin) {
            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();
                this.clearErrors();

                const email = document.getElementById('login-email').value.trim();
                const pass = document.getElementById('login-password').value;
                let hasError = false;

                if (!email) { this.showError('login-email', 'Email không được để trống'); hasError = true; }
                else if (!validateEmail(email)) { this.showError('login-email', 'Email không hợp lệ'); hasError = true; }
                
                if (!pass) { this.showError('login-password', 'Mật khẩu không được để trống'); hasError = true; }

                if (hasError) return;

                const res = await API.post('/auth/login', { Email: email, MatKhau: pass });
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));
                    window.location.reload();
                } else {
                    this.showError('login-password', res.message || 'Sai email hoặc mật khẩu');
                }
            });
        }

        // FORM ĐĂNG KÝ
        const formRegister = document.getElementById('form-register');
        if (formRegister) {
            formRegister.addEventListener('submit', async (e) => {
                e.preventDefault();
                this.clearErrors();

                const data = {
                    HoTen: document.getElementById('reg-name').value.trim(),
                    Email: document.getElementById('reg-email').value.trim(),
                    SoDienThoai: document.getElementById('reg-phone').value.trim(),
                    MatKhau: document.getElementById('reg-pass').value,
                    ConfirmMatKhau: document.getElementById('reg-confirm-pass').value
                };
                let hasError = false;

                if (!data.HoTen) { this.showError('reg-name', 'Tên không được để trống'); hasError = true; }
                const phoneRegex = /^[0-9]{10}$/;
                if (!data.SoDienThoai) { this.showError('reg-phone', 'Số điện thoại không được để trống'); hasError = true; }
                else if (!phoneRegex.test(data.SoDienThoai)) { this.showError('reg-phone', 'Số điện thoại không hợp lệ (gồm 10 chữ số)'); hasError = true; }
                if (!validateEmail(data.Email)) { this.showError('reg-email', 'Email không hợp lệ'); hasError = true; }
                if (!validatePassword(data.MatKhau)) { 
                    this.showError('reg-pass', 'Mật khẩu yếu (8+ ký tự, đủ chữ hoa, thường, số, ký tự đặc biệt)'); 
                    hasError = true; 
                }
                if (data.MatKhau !== data.ConfirmMatKhau) { 
                    this.showError('reg-confirm-pass', 'Mật khẩu xác nhận không khớp'); 
                    hasError = true; 
                }

                if (hasError) return;

                const res = await API.post('/auth/register', data);
                if (res.userId) {
                    alert('Đăng ký thành công!');
                    this.switchForm('login');
                } else {
                    this.showError('reg-email', res.message || 'Email đã tồn tại');
                }
            });
        }
        // Form Forgot Password Submit (Gửi OTP)
        const formForgot = document.getElementById('form-forgot');
        if (formForgot) {
            formForgot.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('forgot-email').value;
                
                try {
                    const res = await API.post('/auth/forgot-password', { email });
                    if (res.success) {
                        // Lưu email để dùng cho form reset password
                        document.getElementById('otp-email-display').textContent = `Mã OTP đã được gửi đến: ${email}`;
                        this.switchForm('reset-password');
                        alert('Mã OTP đã được gửi đến email của bạn!');
                    } else {
                        alert(res.message || 'Có lỗi xảy ra khi gửi OTP');
                    }
                } catch (err) {
                    alert('Không thể gửi OTP. Vui lòng thử lại!');
                }
            });
        }

        // Form Reset Password Submit (Xác thực OTP và đổi mật khẩu)
        const formResetPassword = document.getElementById('form-reset-password');
        if (formResetPassword) {
            formResetPassword.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('forgot-email').value;
                const otp = document.getElementById('reset-otp').value;
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;

                // Validate password match
                if (newPassword !== confirmPassword) {
                    alert('Mật khẩu xác nhận không khớp!');
                    return;
                }

                if (newPassword.length < 6) {
                    alert('Mật khẩu phải có ít nhất 6 ký tự!');
                    return;
                }

                try {
                    const res = await API.post('/auth/reset-password', {
                        email,
                        otp,
                        newPassword
                    });
                    
                    if (res.success) {
                        alert('Đổi mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
                        this.switchForm('login');
                        // Clear form
                        formResetPassword.reset();
                        document.getElementById('forgot-email').value = '';
                    } else {
                        alert(res.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
                    }
                } catch (err) {
                    alert('Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại!');
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

// Dọn dẹp intervals khi rời trang
window.addEventListener('beforeunload', () => {
    Object.values(categoryRotation).forEach(cat => {
        if (cat.intervalId) clearInterval(cat.intervalId);
    });
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