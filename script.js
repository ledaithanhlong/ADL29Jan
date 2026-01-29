// URL của file db.json
const dataUrl = './db.json';

// Biến lưu trữ dữ liệu gốc
let allProducts = [];
let filteredProducts = [];

// Biến phân trang
let currentPageSize = -1; // -1 nghĩa là hiển thị tất cả
let currentPage = 1;

// Lấy element app để render dữ liệu
const appElement = document.getElementById('app');

// Hàm fetch dữ liệu từ db.json
function fetchData() {
    // Hiển thị loading
    appElement.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

    // Fetch dữ liệu từ file JSON
    fetch(dataUrl)
        .then(function (response) {
            // Kiểm tra response có OK không
            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu');
            }
            // Parse JSON
            return response.json();
        })
        .then(function (data) {
            // Lưu dữ liệu gốc
            allProducts = data;
            filteredProducts = data;
            // Render dữ liệu ra giao diện
            renderProductsTable(filteredProducts);
        })
        .catch(function (error) {
            // Xử lý lỗi
            appElement.innerHTML = '<div class="error">Lỗi: ' + error.message + '</div>';
            console.error('Error:', error);
        });
}

// Hàm render bảng sản phẩm với phân trang
function renderProductsTable(products) {
    // Xóa nội dung cũ
    appElement.innerHTML = '';

    // Kiểm tra có dữ liệu không
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
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Mô tả</th>
                        <th>Giá</th>
                        <th>Danh mục</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayProducts.map(function (product) {
        return `
                            <tr>
                                <td>${product.id}</td>
                                <td>
                                    <img src="${product.images && product.images[0] ? product.images[0] : 'https://placehold.co/80x80'}" 
                                         class="product-image" 
                                         alt="${product.title || 'Product'}"
                                         onerror="this.src='https://placehold.co/80x80?text=No+Image'">
                                </td>
                                <td><strong>${product.title || 'Không có tên'}</strong></td>
                                <td>${product.description || 'Không có mô tả'}</td>
                                <td><span class="badge bg-success">$${product.price || 0}</span></td>
                                <td><span class="badge bg-primary">${product.category && product.category.name ? product.category.name : 'Uncategorized'}</span></td>
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
                    <button class="btn btn-sm btn-outline-primary" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                        ← Trước
                    </button>
                    ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
                        <button class="btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'}" onclick="changePage(${page})">
                            ${page}
                        </button>
                    `).join('')}
                    <button class="btn btn-sm btn-outline-primary" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                        Sau →
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    appElement.innerHTML = tableHTML;
}

// Hàm tìm kiếm (sử dụng onChange và onInput)
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Lọc sản phẩm theo tên
    if (searchTerm === '') {
        filteredProducts = allProducts;
    } else {
        filteredProducts = allProducts.filter(function (product) {
            const productName = product.title ? product.title.toLowerCase() : '';
            return productName.includes(searchTerm);
        });
    }

    // Render lại bảng
    renderProductsTable(filteredProducts);
}

// Hàm sắp xếp theo tên
function sortByName(order) {
    filteredProducts.sort(function (a, b) {
        const nameA = (a.title || '').toLowerCase();
        const nameB = (b.title || '').toLowerCase();

        if (order === 'asc') {
            // A-Z
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        } else {
            // Z-A
            if (nameA > nameB) return -1;
            if (nameA < nameB) return 1;
            return 0;
        }
    });

    // Render lại bảng
    renderProductsTable(filteredProducts);
}

// Hàm sắp xếp theo giá
function sortByPrice(order) {
    filteredProducts.sort(function (a, b) {
        const priceA = a.price || 0;
        const priceB = b.price || 0;

        if (order === 'asc') {
            // Giá tăng dần
            return priceA - priceB;
        } else {
            // Giá giảm dần
            return priceB - priceA;
        }
    });

    // Render lại bảng
    renderProductsTable(filteredProducts);
}

// Hàm reset về trạng thái ban đầu
function resetData() {
    // Xóa nội dung ô tìm kiếm
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    // Reset về dữ liệu gốc
    filteredProducts = [...allProducts];

    // Reset trang về 1
    currentPage = 1;

    // Render lại bảng
    renderProductsTable(filteredProducts);
}

// Hàm thay đổi số lượng hiển thị trên 1 trang
function changePageSize(size) {
    currentPageSize = size;
    currentPage = 1; // Reset về trang 1
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

// Gọi hàm fetch khi trang load xong
fetchData();
