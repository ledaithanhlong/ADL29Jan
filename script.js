// URL của file db.json
const dataUrl = './db.json';

// Biến lưu trữ dữ liệu gốc
let allProducts = [];
let filteredProducts = [];

// Biến phân trang
let currentPageSize = 5; // Mặc định hiển thị 5 sản phẩm/trang
let currentPage = 1;

// Biến cho modal
let editingProductIndex = -1;
let productModal;

// Lấy element app để render dữ liệu
const appElement = document.getElementById('app');

// Khởi tạo modal khi trang load
document.addEventListener('DOMContentLoaded', function () {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
});

// Hàm fetch dữ liệu từ db.json
function fetchData() {
    appElement.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

    fetch(dataUrl)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu');
            }
            return response.json();
        })
        .then(function (data) {
            allProducts = data;
            filteredProducts = [...data];
            renderProductsTable(filteredProducts);
        })
        .catch(function (error) {
            appElement.innerHTML = '<div class="error">Lỗi: ' + error.message + '</div>';
            console.error('Error:', error);
        });
}

// Hàm render bảng sản phẩm với phân trang
function renderProductsTable(products) {
    appElement.innerHTML = '';

    if (!products || products.length === 0) {
        appElement.innerHTML = '<div class="error">Không có dữ liệu để hiển thị</div>';
        return;
    }

    // Tính toán phân trang
    let displayProducts = products;
    let totalPages = 1;

    if (currentPageSize > 0) {
        totalPages = Math.ceil(products.length / currentPageSize);
        const startIndex = (currentPage - 1) * currentPageSize;
        const endIndex = startIndex + currentPageSize;
        displayProducts = products.slice(startIndex, endIndex);
    }

    // Tạo bảng Bootstrap
    const tableHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th style="width: 60px;">ID</th>
                        <th style="width: 90px;">Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Mô tả</th>
                        <th style="width: 100px;">Giá</th>
                        <th style="width: 120px;">Danh mục</th>
                        <th style="width: 150px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayProducts.map(function (product, index) {
        const actualIndex = currentPageSize > 0 ?
            (currentPage - 1) * currentPageSize + index :
            index;
        return `
                            <tr>
                                <td>${product.id}</td>
                                <td>
                                    <img src="${product.images && product.images[0] ? product.images[0] : 'https://placehold.co/70x70'}" 
                                         class="product-image" 
                                         alt="${product.title || 'Product'}"
                                         onerror="this.src='https://placehold.co/70x70?text=No+Image'">
                                </td>
                                <td><strong>${product.title || 'Không có tên'}</strong></td>
                                <td>${product.description || 'Không có mô tả'}</td>
                                <td><span class="badge bg-success">$${product.price || 0}</span></td>
                                <td><span class="badge bg-primary">${product.category && product.category.name ? product.category.name : 'Uncategorized'}</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-primary" onclick="editProduct(${actualIndex})">Sửa</button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${actualIndex})">Xóa</button>
                                    </div>
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="text-center mt-3">
            <p class="text-muted">
                Hiển thị ${displayProducts.length} / ${products.length} sản phẩm
                ${currentPageSize > 0 ? ` (Trang ${currentPage}/${totalPages})` : ''}
            </p>
            ${currentPageSize > 0 && totalPages > 1 ? `
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-secondary" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                        ← Trước
                    </button>
                    ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                        <button class="btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-secondary'}" onclick="changePage(${page})">
                            ${page}
                        </button>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-secondary" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                        Sau →
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    appElement.innerHTML = tableHTML;
}

// Hàm tìm kiếm
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (searchTerm === '') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(function (product) {
            const productName = product.title ? product.title.toLowerCase() : '';
            return productName.includes(searchTerm);
        });
    }

    currentPage = 1;
    renderProductsTable(filteredProducts);
}

// Hàm sắp xếp theo tên
function sortByName(order) {
    filteredProducts.sort(function (a, b) {
        const nameA = (a.title || '').toLowerCase();
        const nameB = (b.title || '').toLowerCase();

        if (order === 'asc') {
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        } else {
            if (nameA > nameB) return -1;
            if (nameA < nameB) return 1;
            return 0;
        }
    });

    renderProductsTable(filteredProducts);
}

// Hàm sắp xếp theo giá
function sortByPrice(order) {
    filteredProducts.sort(function (a, b) {
        const priceA = a.price || 0;
        const priceB = b.price || 0;

        if (order === 'asc') {
            return priceA - priceB;
        } else {
            return priceB - priceA;
        }
    });

    renderProductsTable(filteredProducts);
}

// Hàm reset về trạng thái ban đầu
function resetData() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    filteredProducts = [...allProducts];
    currentPage = 1;
    renderProductsTable(filteredProducts);
}

// Hàm thay đổi số lượng hiển thị trên 1 trang
function changePageSize(size) {
    currentPageSize = size;
    currentPage = 1;
    renderProductsTable(filteredProducts);
}

// Hàm chuyển trang
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / currentPageSize);

    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProductsTable(filteredProducts);
    }
}

// === CRUD FUNCTIONS ===

// Mở modal thêm sản phẩm
function openAddModal() {
    editingProductIndex = -1;
    document.getElementById('modalTitle').textContent = 'Thêm sản phẩm';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    productModal.show();
}

// Mở modal sửa sản phẩm
function editProduct(index) {
    editingProductIndex = index;
    const product = filteredProducts[index];

    document.getElementById('modalTitle').textContent = 'Sửa sản phẩm';
    document.getElementById('productId').value = product.id;
    document.getElementById('productTitle').value = product.title || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productImage').value = product.images && product.images[0] ? product.images[0] : '';
    document.getElementById('productCategory').value = product.category && product.category.name ? product.category.name : '';

    productModal.show();
}

// Lưu sản phẩm (thêm hoặc sửa)
function saveProduct() {
    const title = document.getElementById('productTitle').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const imageUrl = document.getElementById('productImage').value.trim();
    const categoryName = document.getElementById('productCategory').value.trim();

    if (!title || !price) {
        alert('Vui lòng nhập tên sản phẩm và giá!');
        return;
    }

    const productData = {
        id: editingProductIndex === -1 ? Date.now() : filteredProducts[editingProductIndex].id,
        title: title,
        description: description,
        price: price,
        images: [imageUrl || 'https://placehold.co/600x400'],
        category: {
            id: 1,
            name: categoryName || 'Uncategorized'
        }
    };

    if (editingProductIndex === -1) {
        // Thêm mới
        allProducts.push(productData);
        filteredProducts.push(productData);
    } else {
        // Sửa
        const productId = filteredProducts[editingProductIndex].id;
        const allProductIndex = allProducts.findIndex(p => p.id === productId);

        if (allProductIndex !== -1) {
            allProducts[allProductIndex] = productData;
        }
        filteredProducts[editingProductIndex] = productData;
    }

    productModal.hide();
    renderProductsTable(filteredProducts);
}

// Xóa sản phẩm
function deleteProduct(index) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }

    const productId = filteredProducts[index].id;

    // Xóa khỏi allProducts
    const allProductIndex = allProducts.findIndex(p => p.id === productId);
    if (allProductIndex !== -1) {
        allProducts.splice(allProductIndex, 1);
    }

    // Xóa khỏi filteredProducts
    filteredProducts.splice(index, 1);

    renderProductsTable(filteredProducts);
}

// Gọi hàm fetch khi trang load xong
fetchData();
