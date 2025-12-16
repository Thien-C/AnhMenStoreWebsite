// Helper fix ảnh (copy để dùng nội bộ file này)
function fixImgPath(path) {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('../')) return path;
    return '../' + path;
}

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let productData = null;
let currentVariant = null;
let selectedColor = null;
let selectedSize = null;

if (productId) {
    loadProductDetail(productId);
} else {
    // Nếu không có ID thì không làm gì hoặc về trang chủ
}

async function loadProductDetail(id) {
    const data = await API.get(`/products/${id}`);
    
    if (!data || !data.variants) {
        document.getElementById('p-name').innerText = "Không tìm thấy sản phẩm";
        return;
    }

    // === QUAN TRỌNG: Fix lại đường dẫn ảnh trong dữ liệu ngay khi tải về ===
    data.variants = data.variants.map(v => ({
        ...v,
        image: fixImgPath(v.image) // Thêm ../ vào trước
    }));

    productData = data;
    
    // Render info
    document.getElementById('p-name').innerText = data.name;
    document.getElementById('p-desc').innerText = data.desc || 'Không có mô tả';
    document.title = data.name + ' - Anh Men Store';

    // Render Gallery
    renderImageGallery(data.variants);

    // Render Options
    renderVariantOptions();
    // Load Reviews
    loadReviews(id); 
    setupStarRating();
}

function renderImageGallery(variants) {
    const mainImg = document.getElementById('main-img');
    const galleryContainer = document.getElementById('image-gallery');
    
    // Lấy danh sách ảnh unique
    const uniqueImages = [...new Set(variants.map(v => v.image).filter(img => img))];

    if (uniqueImages.length > 0) {
        mainImg.src = uniqueImages[0];
        galleryContainer.innerHTML = uniqueImages.map(img => `
            <div class="w-20 h-24 border border-gray-200 rounded cursor-pointer hover:border-black transition overflow-hidden" 
                 onclick="document.getElementById('main-img').src='${img}'">
                <img src="${img}" class="w-full h-full object-cover">
            </div>
        `).join('');
    } else {
        mainImg.src = 'https://via.placeholder.com/500?text=No+Image';
        galleryContainer.innerHTML = '';
    }
}

function renderVariantOptions() {
    const variants = productData.variants;
    const uniqueColors = [...new Set(variants.map(v => v.color))];
    const uniqueSizes = [...new Set(variants.map(v => v.size))]; // Có thể sort size nếu cần

    document.getElementById('color-options').innerHTML = uniqueColors.map(c => 
        `<button class="option-btn color-btn" onclick="selectColor('${c}')">${c}</button>`
    ).join('');

    document.getElementById('size-options').innerHTML = uniqueSizes.map(s => 
        `<button class="option-btn size-btn" onclick="selectSize('${s}')">${s}</button>`
    ).join('');
}

function selectColor(color) {
    selectedColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.toggle('active', btn.innerText === color));
    checkVariant();
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.toggle('active', btn.innerText === size));
    checkVariant();
}

function checkVariant() {
    const btnAdd = document.getElementById('add-to-cart');
    const priceEl = document.getElementById('p-price');
    const stockEl = document.getElementById('stock-status');
    const mainImg = document.getElementById('main-img');

    if (!selectedColor || !selectedSize) return;

    currentVariant = productData.variants.find(v => v.color === selectedColor && v.size === selectedSize);

    if (currentVariant) {
        priceEl.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentVariant.price);
        
        // Đổi ảnh theo biến thể (nếu có ảnh riêng)
        if (currentVariant.image) {
            mainImg.src = currentVariant.image;
        }

        if (currentVariant.stock > 0) {
            stockEl.innerText = `Còn hàng (Tồn: ${currentVariant.stock})`;
            stockEl.className = 'text-sm mb-4 font-semibold text-green-600';
            
            btnAdd.disabled = false;
            btnAdd.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
            btnAdd.classList.add('bg-black', 'text-white', 'hover:bg-gray-800');
            btnAdd.innerText = 'THÊM VÀO GIỎ';
            btnAdd.onclick = () => addToCart(currentVariant.variantId);
        } else {
            stockEl.innerText = 'Hết hàng';
            stockEl.className = 'text-sm mb-4 font-semibold text-red-600';
            btnAdd.disabled = true;
            btnAdd.className = 'flex-1 bg-gray-300 text-gray-500 font-bold py-3 rounded-lg transition cursor-not-allowed';
            btnAdd.innerText = 'Hết hàng';
        }
    } else {
        priceEl.innerText = '---';
        stockEl.innerText = 'Chưa có phiên bản này';
        btnAdd.disabled = true;
    }
}

function adjustDetailQty(delta) {
    if (!currentVariant) { alert('Vui lòng chọn biến thể!'); return; }
    const input = document.getElementById('quantity');
    let newVal = parseInt(input.value) + delta;
    if (newVal < 1) newVal = 1;
    if (newVal > currentVariant.stock) newVal = currentVariant.stock;
    input.value = newVal;
}

function validateManualQty() {
    if (!currentVariant) return;
    const input = document.getElementById('quantity');
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > currentVariant.stock) val = currentVariant.stock;
    input.value = val;
}

async function addToCart(variantId) {
    if (!currentVariant) return;
    const qty = parseInt(document.getElementById('quantity').value) || 1;
    await CartManager.addToCart(variantId, qty);
}
// === LOGIC ĐÁNH GIÁ (REVIEW) ===

// 1. Tải danh sách đánh giá
async function loadReviews(prodId) {
    const container = document.getElementById('reviews-list');
    try {
        const reviews = await API.get(`/reviews/${prodId}`);
        
        if (!Array.isArray(reviews) || reviews.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>';
            return;
        }

        // Helper tạo sao vàng
        const renderStars = (n) => {
            let html = '';
            for(let i=1; i<=5; i++) {
                html += `<svg class="w-4 h-4 ${i <= n ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            }
            return html;
        };

        container.innerHTML = reviews.map(r => `
            <div class="border-b border-gray-100 pb-4 last:border-0">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-600">
                            ${r.HoTen.charAt(0)}
                        </div>
                        <span class="font-bold text-sm text-gray-800">${r.HoTen}</span>
                    </div>
                    <span class="text-xs text-gray-400">${new Date(r.NgayDanhGia).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="flex mb-2">${renderStars(r.SoSao)}</div>
                <p class="text-gray-600 text-sm">${r.BinhLuan || ''}</p>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-500">Lỗi tải đánh giá.</p>';
    }
}

// 2. Xử lý UI chọn sao (Click để chọn)
function setupStarRating() {
    const stars = document.querySelectorAll('#star-rating-group .star-icon');
    const input = document.getElementById('rating-value');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.value);
            input.value = val;
            
            // Cập nhật màu
            stars.forEach(s => {
                if(parseInt(s.dataset.value) <= val) {
                    s.classList.add('text-yellow-400');
                    s.classList.remove('text-gray-300');
                } else {
                    s.classList.remove('text-yellow-400');
                    s.classList.add('text-gray-300');
                }
            });
        });
    });
}

// 3. Gửi đánh giá
async function submitReview() {
    // Check đăng nhập
    const token = localStorage.getItem('token');
    if(!token) {
        alert('Vui lòng đăng nhập để viết đánh giá!');
        // Mở modal đăng nhập nếu có (sử dụng AuthManager global từ main.js)
        if(window.AuthManager) {
            window.AuthManager.toggleModal(true);
            window.AuthManager.switchForm('login');
        }
        return;
    }

    const productId = new URLSearchParams(window.location.search).get('id');
    const soSao = document.getElementById('rating-value').value;
    const binhLuan = document.getElementById('review-content').value;

    if(!binhLuan.trim()) {
        alert('Vui lòng nhập nội dung đánh giá!');
        return;
    }

    try {
        const res = await API.post('/reviews', {
            productId: productId,
            soSao: parseInt(soSao),
            binhLuan: binhLuan
        });

        if(res.message) {
            alert(res.message);
            // Reset form
            document.getElementById('review-content').value = '';
            // Reload lại danh sách
            loadReviews(productId);
        }
    } catch (e) {
        alert('Lỗi khi gửi đánh giá: ' + e.message);
    }
}