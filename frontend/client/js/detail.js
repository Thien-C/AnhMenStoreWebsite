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