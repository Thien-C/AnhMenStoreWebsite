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
                <input type="text" class="variant-image" placeholder="Đường dẫn ảnh">
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

function collectVariants() {
    const rows = document.querySelectorAll('#variant-body tr');
    const variants = [];

    rows.forEach(row => {
        const color = row.querySelector('.variant-color')?.value;
        const size = row.querySelector('.variant-size')?.value;
        const price = row.querySelector('.variant-price')?.value;
        const stock = row.querySelector('.variant-stock')?.value;
        const image = row.querySelector('.variant-image')?.value;

        if (color && size && price) {
            variants.push({
                MaMauSac: Number(color),
                MaKichCo: Number(size),
                Gia: Number(price),
                SoLuongTon: Number(stock || 0),
                HinhAnh: image || null
            });
        }
    });

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

    const BienThe = collectVariants();
    if (!TenSP || !MaDanhMuc || BienThe.length === 0) {
        alert('Vui lòng nhập đủ Tên sản phẩm, Danh mục và ít nhất 1 biến thể');
        return;
    }

    const payload = {
        TenSP,
        MoTa,
        MaDanhMuc: Number(MaDanhMuc),
        BienThe
    };

    const res = await API.post('/admin/products', payload);
    if (res && res.MaSP) {
        alert('Tạo sản phẩm thành công! Mã SP: ' + res.MaSP);
        document.getElementById('product-form').reset();
        document.getElementById('variant-body').innerHTML = '';
        addVariantRow();
    } else {
        alert(res.message || 'Không tạo được sản phẩm');
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

document.addEventListener('DOMContentLoaded', () => {
    // checkAdminAccess đã chạy trong admin.js
    loadMasterData();
    bindFormEvents();
});


