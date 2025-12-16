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
    const data = await API.get(`/products/${id}`);
    
    if (!data || !data.variants) {
        alert('Lỗi tải dữ liệu');
        return;
    }

    productData = data;
    
    // 1. Render thông tin chung
    document.getElementById('p-name').innerText = data.name;
    document.getElementById('p-desc').innerText = data.desc || 'Không có mô tả';
    document.title = data.name + ' - Anh Men Store';

    // 2. Render Gallery ảnh (YÊU CẦU MỚI)
    renderImageGallery(data.variants);

    // 3. Render các nút chọn biến thể
    renderVariantOptions();
}

// --- HÀM MỚI: Xử lý hiển thị ảnh ---
function renderImageGallery(variants) {
    const mainImg = document.getElementById('main-img');
    const galleryContainer = document.getElementById('image-gallery');

    // Lọc ra danh sách các link ảnh duy nhất (loại bỏ trùng lặp và null)
    const uniqueImages = [...new Set(variants.map(v => v.image).filter(img => img))];

    if (uniqueImages.length > 0) {
        // A. Đặt ảnh đại diện là ảnh đầu tiên trong danh sách (kể cả chưa chọn size/màu)
        mainImg.src = uniqueImages[0];

        // B. Render danh sách ảnh nhỏ bên dưới
        galleryContainer.innerHTML = uniqueImages.map((img, index) => `
            <div class="w-20 h-24 border border-gray-200 rounded cursor-pointer hover:border-black transition overflow-hidden" 
                 onclick="changeMainImage('${img}')">
                <img src="${img}" class="w-full h-full object-cover">
            </div>
        `).join('');
    } else {
        mainImg.src = 'https://via.placeholder.com/500?text=No+Image';
        galleryContainer.innerHTML = '';
    }
}

// Hàm sự kiện khi click vào ảnh nhỏ
function changeMainImage(src) {
    document.getElementById('main-img').src = src;
}
// -----------------------------------

function renderVariantOptions() {
    const variants = productData.variants;
    const uniqueColors = [...new Set(variants.map(v => v.color))];
    const uniqueSizes = [...new Set(variants.map(v => v.size))];

    // Render nút Màu
    document.getElementById('color-options').innerHTML = uniqueColors.map(c => 
        `<button class="option-btn color-btn" onclick="selectColor('${c}')">${c}</button>`
    ).join('');

    // Render nút Size
    document.getElementById('size-options').innerHTML = uniqueSizes.map(s => 
        `<button class="option-btn size-btn" onclick="selectSize('${s}')">${s}</button>`
    ).join('');
}

function selectColor(color) {
    selectedColor = color;
    // Highlight nút
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === color);
    });
    checkVariant();
}

function selectSize(size) {
    selectedSize = size;
    // Highlight nút
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === size);
    });
    checkVariant();
}

function checkVariant() {
    const btnAdd = document.getElementById('add-to-cart');
    const priceEl = document.getElementById('p-price');
    const stockEl = document.getElementById('stock-status');
    // Lưu ý: Không đổi ảnh main ở đây nữa nếu bạn muốn giữ ảnh người dùng đang xem từ gallery
    // Hoặc nếu muốn: Khi chọn đúng biến thể -> Tự động đổi ảnh main sang ảnh biến thể đó:
    const mainImg = document.getElementById('main-img');

    if (!selectedColor || !selectedSize) return;

    currentVariant = productData.variants.find(v => 
        v.color === selectedColor && v.size === selectedSize
    );

    if (currentVariant) {
        // Cập nhật giá
        priceEl.innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentVariant.price);
        
        // Tự động nhảy ảnh theo biến thể (Optional - theo trải nghiệm người dùng tốt nhất)
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
            
            btnAdd.onclick = function() {
                addToCart(currentVariant.variantId);
            };
        } else {
            stockEl.innerText = 'Hết hàng tạm thời';
            stockEl.className = 'text-sm mb-4 font-semibold text-red-600';
            disableBuyButton(btnAdd);
        }
    } else {
        priceEl.innerText = '---';
        stockEl.innerText = 'Phiên bản không tồn tại';
        disableBtn(btnAdd);
    }
}

function disableBtn(btn) {
    btn.disabled = true;
    btn.className = 'flex-1 bg-gray-300 text-gray-500 font-bold py-3 rounded-lg transition cursor-not-allowed';
    btn.innerText = 'Vui lòng chọn biến thể';
}

function adjustDetailQty(delta) {
    if (!currentVariant) {
        alert('Vui lòng chọn Màu sắc và Kích cỡ trước!');
        return;
    }
    
    const input = document.getElementById('quantity');
    let newVal = parseInt(input.value) + delta;
    
    // Validate
    if (newVal < 1) newVal = 1;
    if (newVal > currentVariant.stock) {
        alert(`Kho chỉ còn ${currentVariant.stock} sản phẩm!`);
        newVal = currentVariant.stock;
    }
    
    input.value = newVal;
}
// Hàm mới: Kiểm tra khi người dùng tự nhập số
function validateManualQty() {
    if (!currentVariant) return; // Chưa chọn biến thể thì chưa check kỹ

    const input = document.getElementById('quantity');
    let val = parseInt(input.value);

    // Nếu nhập linh tinh hoặc < 1 thì về 1
    if (isNaN(val) || val < 1) {
        val = 1;
    }

    // Nếu nhập quá tồn kho
    if (val > currentVariant.stock) {
        alert(`Quá số lượng tồn kho (Max: ${currentVariant.stock})`);
        val = currentVariant.stock;
    }

    input.value = val;
}

// Cập nhật hàm addToCart để dùng giá trị thực tế từ input
async function addToCart(variantId) {
    if (!currentVariant) return;
    const qty = parseInt(document.getElementById('quantity').value) || 1;
    
    if (qty > currentVariant.stock) {
        alert(`Sản phẩm không đủ hàng (chỉ còn ${currentVariant.stock})`);
        return;
    }
    
    await CartManager.addToCart(variantId, qty);
}