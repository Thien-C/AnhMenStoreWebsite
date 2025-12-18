// API_BASE_URL được định nghĩa trong api.js

let masterData = {
    categories: [],
    colors: [],
    sizes: []
};

function optionList(list, valueKey, labelKey) {
    return list.map(i => `<option value="${i[valueKey]}">${i[labelKey]}</option>`).join('');
}

function renderMasterDataSelects() {
    const catSelect = document.getElementById('MaDanhMuc');
    if (catSelect) {
        catSelect.innerHTML = `<option value="">-- Chọn danh mục --</option>` + optionList(masterData.categories, 'MaDanhMuc', 'TenDanhMuc');
    }
}

function buildVariantRow(rowId) {
    return `
        <tr data-row="${rowId}">
            <td>
                <select class="variant-color">
                    ${optionList(masterData.colors, 'MaMauSac', 'TenMauSac')}
                </select>
            </td>
            <td>
                <select class="variant-size">
                    ${optionList(masterData.sizes, 'MaKichCo', 'TenKichCo')}
                </select>
            </td>
            <td>
                <input type="number" class="variant-price" min="0" step="1000" placeholder="Giá">
            </td>
            <td>
                <input type="number" class="variant-stock" min="0" step="1" placeholder="Tồn kho">
            </td>
            <td>
                <input type="file" class="variant-image-file" accept="image/*" multiple>
                <input type="hidden" class="variant-images" placeholder="Đường dẫn ảnh">
                <div class="images-preview" style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px;"></div>
            </td>
            <td>
                <button type="button" class="btn-danger btn-remove-variant">Xóa</button>
            </td>
        </tr>
    `;
}

function addVariantRow() {
    const tbody = document.getElementById('variant-body');
    if (!tbody) return;
    const rowId = Date.now();
    tbody.insertAdjacentHTML('beforeend', buildVariantRow(rowId));
    bindRemoveButtons();
}

function bindRemoveButtons() {
    document.querySelectorAll('.btn-remove-variant').forEach(btn => {
        btn.onclick = (e) => {
            const tr = e.target.closest('tr');
            if (tr) tr.remove();
        };
    });
}

async function collectVariants() {
    const rows = document.querySelectorAll('#variant-body tr');
    const variants = [];

    for (const row of rows) {
        const color = row.querySelector('.variant-color')?.value;
        const size = row.querySelector('.variant-size')?.value;
        const price = row.querySelector('.variant-price')?.value;
        const stock = row.querySelector('.variant-stock')?.value;
        const fileInput = row.querySelector('.variant-image-file');
        
        if (color && size && price) {
            let imagePaths = [];
            
            // Upload nhiều ảnh nếu có file được chọn
            if (fileInput && fileInput.files.length > 0) {
                try {
                    imagePaths = await uploadMultipleImages(fileInput.files);
                } catch (err) {
                    console.error('Upload ảnh thất bại:', err);
                    alert(`Upload ảnh thất bại: ${err.message}`);
                    return [];
                }
            }
            
            // Lưu ảnh dưới dạng string separated by comma
            const imagePathString = imagePaths.join(',');
            
            variants.push({
                maMauSac: Number(color),
                maKichCo: Number(size),
                gia: Number(price),
                soLuongTon: Number(stock || 0),
                hinhAnh: imagePathString || ''
            });
        }
    }

    return variants;
}

async function loadMasterData() {
    try {
        const data = await API.get('/products/master-data');
        masterData.categories = data.categories || [];
        masterData.colors = data.colors || [];
        masterData.sizes = data.sizes || [];
        renderMasterDataSelects();
        // Tạo sẵn 1 dòng biến thể
        addVariantRow();
    } catch (err) {
        alert('Không tải được dữ liệu danh mục/màu/size');
    }
}

async function handleSubmitProduct(e) {
    e.preventDefault();
    const TenSP = document.getElementById('TenSP')?.value.trim();
    const MoTa = document.getElementById('MoTa')?.value.trim();
    const MaDanhMuc = document.getElementById('MaDanhMuc')?.value;

    const BienThe = await collectVariants();
    if (!TenSP || !MaDanhMuc || BienThe.length === 0) {
        alert('Vui lòng nhập đủ Tên sản phẩm, Danh mục và ít nhất 1 biến thể');
        return;
    }

    const payload = {
        tenSP: TenSP,
        moTa: MoTa,
        maDanhMuc: Number(MaDanhMuc),
        bienThe: BienThe
    };

    const res = await API.post('/admin/products', payload);
    if (res && res.MaSP) {
        alert('Tạo sản phẩm thành công! Mã SP: ' + res.MaSP);
        document.getElementById('product-form').reset();
        document.getElementById('variant-body').innerHTML = '';
        addVariantRow();
    } else {
        alert(res?.message || 'Không tạo được sản phẩm');
    }
}

function bindFormEvents() {
    const form = document.getElementById('product-form');
    if (form) form.addEventListener('submit', handleSubmitProduct);

    const btnAdd = document.getElementById('btn-add-variant');
    if (btnAdd) btnAdd.addEventListener('click', addVariantRow);

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', () => {
        const tbody = document.getElementById('variant-body');
        if (tbody) tbody.innerHTML = '';
        addVariantRow();
    });
}

// Hàm upload nhiều ảnh
async function uploadMultipleImages(files) {
    if (!files || files.length === 0) {
        return [];
    }
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Upload failed');
        }
        
        return data.imagePaths || [];
    } catch (err) {
        console.error('Upload error:', err);
        throw err;
    }
}

// Hàm preview nhiều ảnh
function handleImagePreview(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const row = e.target.closest('tr');
    const previewContainer = row.querySelector('.images-preview');
    
    if (previewContainer) {
        previewContainer.innerHTML = ''; // Clear old previews
        
        for (let i = 0; i < Math.min(files.length, 5); i++) { // Preview tối đa 5 ảnh
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.style.cssText = 'width: 50px; height: 50px; background-size: cover; background-position: center; border: 1px solid #d1d5db; border-radius: 4px;';
                preview.style.backgroundImage = `url(${e.target.result})`;
                previewContainer.appendChild(preview);
            };
            
            reader.readAsDataURL(file);
        }
        
        // Hiển thị số lượng ảnh nếu > 5
        if (files.length > 5) {
            const moreText = document.createElement('div');
            moreText.style.cssText = 'width: 50px; height: 50px; background: #f3f4f6; border: 1px dashed #d1d5db; display: flex; align-items: center; justify-content: center; font-size: 12px; border-radius: 4px;';
            moreText.textContent = `+${files.length - 5}`;
            previewContainer.appendChild(moreText);
        }
    }
}

// Cập nhật hàm addVariantRow để bind event
function addVariantRow() {
    const tbody = document.getElementById('variant-body');
    if (!tbody) return;
    const rowId = Date.now();
    tbody.insertAdjacentHTML('beforeend', buildVariantRow(rowId));
    bindRemoveButtons();
    
    // Bind event cho file input mới
    const newRow = tbody.querySelector(`tr[data-row="${rowId}"]`);
    const fileInput = newRow?.querySelector('.variant-image-file');
    if (fileInput) {
        fileInput.addEventListener('change', handleImagePreview);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // checkAdminAccess đã chạy trong admin.js
    loadMasterData();
    bindFormEvents();
    bindTabEvents();
    bindProductListEvents();
});

// === TAB MANAGEMENT ===
function bindTabEvents() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update button states
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.style.borderBottom = '2px solid transparent';
                b.style.color = '#6b7280';
            });
            btn.classList.add('active');
            btn.style.borderBottom = '2px solid #2563eb';
            btn.style.color = '#2563eb';
            
            // Show/hide sections
            document.querySelectorAll('.content-page').forEach(section => {
                section.style.display = 'none';
            });
            const activeSection = document.getElementById(`tab-${tabName}`);
            if (activeSection) {
                activeSection.style.display = 'block';
            }
            
            // Load products when switching to list tab
            if (tabName === 'list-products') {
                loadProducts();
            }
        });
    });
}

// === PRODUCT LIST ===
let currentPage = 1;
let pageSize = 10;
let totalProducts = 0;
let allProducts = [];

function bindProductListEvents() {
    // Search
    const searchInput = document.getElementById('search-product');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentPage = 1;
            loadProducts();
        }, 500));
    }
    
    // Filters
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    if (filterCategory) {
        filterCategory.addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
    }
    if (filterStatus) {
        filterStatus.addEventListener('change', () => {
            currentPage = 1;
            loadProducts();
        });
    }
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function loadProducts() {
    const tbody = document.getElementById('products-body');
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px;"><div class="spinner"></div>Đang tải...</td></tr>`;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) throw new Error('Failed to load products');
        
        const data = await res.json();
        allProducts = data.products || [];
        
        // Apply filters
        let filtered = [...allProducts];
        
        const searchTerm = document.getElementById('search-product')?.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.TenSP.toLowerCase().includes(searchTerm) ||
                p.MaSP.toString().includes(searchTerm)
            );
        }
        
        const categoryFilter = document.getElementById('filter-category')?.value;
        if (categoryFilter) {
            // Lọc theo danh mục cha và con
            const selectedCategoryId = parseInt(categoryFilter);
            console.log('🔍 Category Filter:', {
                selectedCategoryId,
                categories: masterData.categories,
                allProducts: allProducts.map(p => ({ MaSP: p.MaSP, TenSP: p.TenSP, MaDanhMuc: p.MaDanhMuc }))
            });
            
            filtered = filtered.filter(p => {
                // Kiểm tra nếu sản phẩm thuộc danh mục được chọn trực tiếp
                if (p.MaDanhMuc == selectedCategoryId) {
                    return true;
                }
                // Kiểm tra nếu danh mục của sản phẩm là con của danh mục được chọn
                const productCategory = masterData.categories.find(c => c.MaDanhMuc == p.MaDanhMuc);
                const isChildCategory = productCategory && productCategory.MaDanhMucCha == selectedCategoryId;
                
                if (isChildCategory) {
                    console.log(`✅ Product ${p.TenSP} matches: category ${productCategory.TenDanhMuc} is child of selected category`);
                }
                
                return isChildCategory;
            });
        }
        
        const statusFilter = document.getElementById('filter-status')?.value;
        if (statusFilter) {
            console.log('🔍 Status Filter:', {
                statusFilter,
                productsWithStatus: allProducts.map(p => ({ 
                    MaSP: p.MaSP, 
                    TenSP: p.TenSP, 
                    TrangThai: p.TrangThai, 
                    TongTonKho: p.TongTonKho 
                }))
            });
            
            filtered = filtered.filter(p => {
                // Chuẩn hóa trạng thái để so sánh
                let productStatus = p.TrangThai;
                let matches = false;
                
                // Xử lý trường hợp "Còn hàng" - kiểm tra cả "Đang bán" và tồn kho > 0
                if (statusFilter === 'Còn hàng') {
                    matches = (productStatus === 'Đang bán' || productStatus === 'Còn hàng') && 
                             (p.TongTonKho === null || p.TongTonKho > 0);
                }
                // Xử lý trường hợp "Hết hàng"
                else if (statusFilter === 'Hết hàng') {
                    matches = productStatus === 'Hết hàng' || 
                             (p.TongTonKho !== null && p.TongTonKho === 0);
                }
                // Xử lý các trạng thái khác
                else {
                    matches = productStatus === statusFilter;
                }
                
                if (matches) {
                    console.log(`✅ Product ${p.TenSP} matches status filter: ${productStatus} (stock: ${p.TongTonKho})`);
                }
                
                return matches;
            });
        }
        
        totalProducts = filtered.length;
        
        // Pagination
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paged = filtered.slice(start, end);
        
        renderProductTable(paged);
        renderPagination();
        
        // Load categories for filter
        if (masterData.categories.length > 0) {
            const filterCat = document.getElementById('filter-category');
            if (filterCat && filterCat.options.length <= 1) {
                filterCat.innerHTML = '<option value="">Tất cả danh mục</option>' + 
                    optionList(masterData.categories, 'MaDanhMuc', 'TenDanhMuc');
            }
        }
        
    } catch (err) {
        console.error('Load products error:', err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red; padding: 40px;">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
    }
}

function renderProductTable(products) {
    const tbody = document.getElementById('products-body');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 40px;">Không có sản phẩm nào</td></tr>`;
        return;
    }
    
    tbody.innerHTML = products.map(p => {
        const category = masterData.categories.find(c => c.MaDanhMuc == p.MaDanhMuc);
        const categoryName = category ? category.TenDanhMuc : 'N/A';
        
        const minPrice = p.GiaThapNhat ? parseInt(p.GiaThapNhat).toLocaleString('vi-VN') : 'N/A';
        const maxPrice = p.GiaCaoNhat ? parseInt(p.GiaCaoNhat).toLocaleString('vi-VN') : 'N/A';
        const priceRange = minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`;
        
        let statusBadge = '';
        // Logic hiển thị trạng thái khớp với logic lọc
        if ((p.TrangThai === 'Đang bán' || p.TrangThai === 'Còn hàng') && 
            (p.TongTonKho === null || p.TongTonKho > 0)) {
            statusBadge = '<span class="badge badge-success">Còn hàng</span>';
        } else if (p.TrangThai === 'Hết hàng' || 
                  (p.TongTonKho !== null && p.TongTonKho === 0)) {
            statusBadge = '<span class="badge badge-warning">Hết hàng</span>';
        } else if (p.TrangThai === 'Ngừng bán') {
            statusBadge = '<span class="badge badge-danger">Ngừng bán</span>';
        } else {
            statusBadge = '<span class="badge badge-secondary">' + p.TrangThai + '</span>';
        }
        
        return `
            <tr>
                <td>${p.MaSP}</td>
                <td>${p.TenSP}</td>
                <td>${categoryName}</td>
                <td>${p.SoLuongBienThe || 0}</td>
                <td>${priceRange}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="editProduct(${p.MaSP})">Sửa</button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${p.MaSP}, '${p.TenSP}')">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(totalProducts / pageSize);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">‹</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button disabled>...</button>`;
        }
    }
    
    // Next button
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">›</button>`;
    
    container.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(totalProducts / pageSize);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadProducts();
}

// === EDIT PRODUCT ===
async function editProduct(maSP) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/products/${maSP}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) throw new Error('Failed to load product detail');
        
        const data = await res.json();
        const product = data.product;
        
        // Fill form
        document.getElementById('edit-maSP').value = product.MaSP;
        document.getElementById('edit-tenSP').value = product.TenSP;
        document.getElementById('edit-maDanhMuc').value = product.MaDanhMuc;
        document.getElementById('edit-moTa').value = product.MoTa || '';
        
        // Load categories for edit modal
        const editCatSelect = document.getElementById('edit-maDanhMuc');
        if (editCatSelect && masterData.categories.length > 0) {
            editCatSelect.innerHTML = '<option value="">-- Chọn danh mục --</option>' + 
                optionList(masterData.categories, 'MaDanhMuc', 'TenDanhMuc');
            editCatSelect.value = product.MaDanhMuc;
        }
        
        // Render variants
        const container = document.getElementById('edit-variants-container');
        if (container && product.variants) {
            container.innerHTML = product.variants.map((v, idx) => {
                const color = masterData.colors.find(c => c.MaMauSac == v.MaMauSac);
                const size = masterData.sizes.find(s => s.MaKichCo == v.MaKichCo);
                const colorName = color ? color.TenMauSac : 'N/A';
                const sizeName = size ? size.TenKichCo : 'N/A';
                
                return `
                    <div class="variant-edit-item" style="border: 1px solid #e5e7eb; padding: 12px; margin-bottom: 10px; border-radius: 6px;" data-mabienthe="${v.MaBienThe}">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Màu sắc</label>
                                <select class="form-control edit-variant-color">
                                    ${optionList(masterData.colors, 'MaMauSac', 'TenMauSac')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Kích cỡ</label>
                                <select class="form-control edit-variant-size">
                                    ${optionList(masterData.sizes, 'MaKichCo', 'TenKichCo')}
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Giá bán</label>
                                <input type="number" class="form-control edit-variant-price" value="${v.GiaBan}" min="0" step="1000">
                            </div>
                            <div class="form-group">
                                <label>Tồn kho</label>
                                <input type="number" class="form-control edit-variant-stock" value="${v.SoLuongTonKho}" min="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Ảnh hiện tại</label>
                            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 8px;">
                                ${(v.HinhAnh || '').split(',').filter(Boolean).map(img => `
                                    <div style="width: 60px; height: 60px; background: url(${API_BASE_URL}${img.trim()}) center/cover; border: 1px solid #d1d5db; border-radius: 4px;"></div>
                                `).join('')}
                            </div>
                            <input type="file" class="form-control edit-variant-image-file" accept="image/*" multiple>
                            <input type="hidden" class="edit-variant-images" value="${v.HinhAnh || ''}">
                        </div>
                    </div>
                `;
            }).join('');
            
            // Set variant values
            container.querySelectorAll('.variant-edit-item').forEach((item, idx) => {
                const variant = product.variants[idx];
                item.querySelector('.edit-variant-color').value = variant.MaMauSac;
                item.querySelector('.edit-variant-size').value = variant.MaKichCo;
            });
        }
        
        // Show modal
        document.getElementById('modal-edit').classList.add('active');
        
    } catch (err) {
        console.error('Edit product error:', err);
        alert('Lỗi tải thông tin sản phẩm: ' + err.message);
    }
}

function closeEditModal() {
    document.getElementById('modal-edit').classList.remove('active');
}

// Handle edit form submit
document.getElementById('form-edit-product')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const maSP = document.getElementById('edit-maSP').value;
    const tenSP = document.getElementById('edit-tenSP').value.trim();
    const maDanhMuc = document.getElementById('edit-maDanhMuc').value;
    const moTa = document.getElementById('edit-moTa').value.trim();
    
    if (!tenSP || !maDanhMuc) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    // Collect variants
    const variantItems = document.querySelectorAll('.variant-edit-item');
    const bienThe = [];
    
    for (const item of variantItems) {
        const maBienThe = item.dataset.mabienthe;
        const maMauSac = item.querySelector('.edit-variant-color').value;
        const maKichCo = item.querySelector('.edit-variant-size').value;
        const giaBan = parseFloat(item.querySelector('.edit-variant-price').value);
        const soLuongTonKho = parseInt(item.querySelector('.edit-variant-stock').value);
        const fileInput = item.querySelector('.edit-variant-image-file');
        let hinhAnh = item.querySelector('.edit-variant-images').value; // Existing images
        
        // Upload new images if selected
        if (fileInput.files.length > 0) {
            const uploadedPaths = await uploadMultipleImages(fileInput.files);
            if (uploadedPaths && uploadedPaths.length > 0) {
                // Append new images to existing
                const existing = hinhAnh ? hinhAnh.split(',').filter(Boolean) : [];
                hinhAnh = [...existing, ...uploadedPaths].join(',');
            }
        }
        
        bienThe.push({
            maBienThe: maBienThe ? parseInt(maBienThe) : null,
            maMauSac,
            maKichCo,
            giaBan,
            soLuongTonKho,
            hinhAnh
        });
    }
    
    if (bienThe.length === 0) {
        alert('Vui lòng thêm ít nhất một biến thể');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/products/${maSP}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                tenSP,
                maDanhMuc: parseInt(maDanhMuc),
                moTa,
                bienThe
            })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'Update failed');
        }
        
        alert('Cập nhật sản phẩm thành công!');
        closeEditModal();
        loadProducts(); // Reload list
        
    } catch (err) {
        console.error('Update product error:', err);
        alert('Lỗi cập nhật sản phẩm: ' + err.message);
    }
});

// === DELETE PRODUCT ===
async function deleteProduct(maSP, tenSP) {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${tenSP}"?\nSản phẩm sẽ chuyển sang trạng thái "Ngừng bán".`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/products/${maSP}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'Delete failed');
        }
        
        alert('Xóa sản phẩm thành công!');
        loadProducts(); // Reload list
        
    } catch (err) {
        console.error('Delete product error:', err);
        alert('Lỗi xóa sản phẩm: ' + err.message);
    }
}

// === HARD DELETE (Optional) ===
async function hardDeleteProduct(maSP, tenSP) {
    if (!confirm(`⚠️ CẢNH BÁO: Xóa vĩnh viễn sản phẩm "${tenSP}"?\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
        return;
    }
    
    if (!confirm('Bạn có CHẮC CHẮN muốn xóa vĩnh viễn? Nhấn OK để tiếp tục.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/products/${maSP}/hard`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'Hard delete failed');
        }
        
        alert('Xóa vĩnh viễn sản phẩm thành công!');
        loadProducts(); // Reload list
        
    } catch (err) {
        console.error('Hard delete product error:', err);
        alert('Lỗi xóa vĩnh viễn sản phẩm: ' + err.message);
    }
}


