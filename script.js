// URL của file db.json
const dataUrl = './db.json';

// Biến lưu trữ dữ liệu gốc
let allProducts = [];
let filteredProducts = [];

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

// Hàm render bảng sản phẩm
function renderProductsTable(products) {
    // Xóa nội dung cũ
    appElement.innerHTML = '';

    // Kiểm tra có dữ liệu không
    if (!products || products.length === 0) {
        appElement.innerHTML = '<div class="error">Không có dữ liệu để hiển thị</div>';
        return;
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
                    ${products.map(function (product) {
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
            <p class="text-muted">Tổng số sản phẩm: <strong>${products.length}</strong></p>
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

// Gọi hàm fetch khi trang load xong
fetchData();
