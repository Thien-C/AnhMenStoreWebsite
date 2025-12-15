// js/detail.js

// Lấy ID từ URL (VD: product-detail.html?id=1)
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let productData = null;
let currentVariant = null;
let selectedColor = null;
let selectedSize = null;

// Khởi chạy
if (productId) {
    loadProductDetail(productId);
} else {
    alert('Không tìm thấy ID sản phẩm');
    window.location.href = 'index.html';
}

async function loadProductDetail(id) {
    // 1. Gọi API lấy dữ liệu
    const data = await API.get(`/products/${id}`);
    
    if (!data || !data.variants) {
        alert('Lỗi tải dữ liệu');
        return;
    }

    productData = data;
    
    // 2. Render thông tin chung
    document.getElementById('p-name').innerText = data.name;
    document.getElementById('p-desc').innerText = data.desc || 'Không có mô tả';
    document.title = data.name + ' - Anh Men Store';

    // 3. Render các nút chọn biến thể
    renderVariantOptions();
}

function renderVariantOptions() {
    const variants = productData.variants;

    // Lọc ra danh sách màu và size duy nhất (Unique)
    const uniqueColors = [...new Set(variants.map(v => v.color))];
    const uniqueSizes = [...new Set(variants.map(v => v.size))];

    // Render nút Màu
    const colorContainer = document.getElementById('color-options');
    colorContainer.innerHTML = uniqueColors.map(c => 
        `<button class="option-btn color-btn" onclick="selectColor('${c}')">${c}</button>`
    ).join('');

    // Render nút Size
    const sizeContainer = document.getElementById('size-options');
    sizeContainer.innerHTML = uniqueSizes.map(s => 
        `<button class="option-btn size-btn" onclick="selectSize('${s}')">${s}</button>`
    ).join('');
    
    // Mặc định chọn biến thể đầu tiên (nếu muốn)
    // selectColor(uniqueColors[0]);
    // selectSize(uniqueSizes[0]);
}

function selectColor(color) {
    selectedColor = color;
    
    // UI Update: Highlight nút màu
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === color);
    });

    checkVariant();
}

function selectSize(size) {
    selectedSize = size;

    // UI Update: Highlight nút size
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === size);
    });

    checkVariant();
}

// Hàm LOGIC QUAN TRỌNG NHẤT: Kiểm tra xem User chọn cặp Màu/Size có tồn tại không
function checkVariant() {
    const btnAdd = document.getElementById('add-to-cart');
    const priceEl = document.getElementById('p-price');
    const imgEl = document.getElementById('main-img');
    const stockEl = document.getElementById('stock-status');

    if (!selectedColor || !selectedSize) return;

    // Tìm biến thể khớp cả Màu và Size trong mảng variants
    currentVariant = productData.variants.find(v => 
        v.color === selectedColor && v.size === selectedSize
    );

    if (currentVariant) {
        // CÓ HÀNG
        priceEl.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentVariant.price);
        
        if (currentVariant.image) {
            imgEl.src = currentVariant.image;
        }

        if (currentVariant.stock > 0) {
            stockEl.innerText = `Còn hàng (Tồn: ${currentVariant.stock})`;
            stockEl.className = 'text-sm mb-4 font-semibold text-green-600';
            
            // Enable nút mua
            btnAdd.disabled = false;
            btnAdd.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
            btnAdd.classList.add('bg-black', 'text-white', 'hover:bg-gray-800');
            btnAdd.innerText = 'THÊM VÀO GIỎ';
            
            // Gán sự kiện thêm giỏ hàng (Phase 3 sẽ xử lý kỹ hơn)
            btnAdd.onclick = () => addToCart(currentVariant.variantId);
        } else {
            stockEl.innerText = 'Hết hàng tạm thời';
            stockEl.className = 'text-sm mb-4 font-semibold text-red-600';
            disableBuyButton(btnAdd);
        }

    } else {
        // KHÔNG TỒN TẠI cặp màu size này (Ví dụ: Có Đen, Có size S, nhưng không có áo Đen size S)
        priceEl.innerText = '---';
        stockEl.innerText = 'Phiên bản này không tồn tại';
        stockEl.className = 'text-sm mb-4 font-semibold text-gray-500';
        disableBuyButton(btnAdd);
    }
}

function disableBuyButton(btn) {
    btn.disabled = true;
    btn.className = 'flex-1 bg-gray-300 text-gray-500 font-bold py-3 rounded-lg transition cursor-not-allowed';
    btn.innerText = 'Tạm hết hàng / Không có sẵn';
}

function addToCart(variantId) {
    // Phase 3 sẽ làm API gọi server
    alert(`Đã thêm Variant ID: ${variantId} vào giỏ (Logic Server ở Phase 3)`);
}