// URL của file db.json trên GitHub (raw)
// Thay đổi URL này thành raw URL của repo GitHub của bạn
const dataUrl = './db.json';

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
            // Render dữ liệu ra giao diện
            renderProducts(data);
        })
        .catch(function (error) {
            // Xử lý lỗi
            appElement.innerHTML = '<div class="error">Lỗi: ' + error.message + '</div>';
            console.error('Error:', error);
        });
}

// Hàm render danh sách sản phẩm
function renderProducts(products) {
    // Xóa nội dung cũ
    appElement.innerHTML = '';

    // Kiểm tra có dữ liệu không
    if (!products || products.length === 0) {
        appElement.innerHTML = '<div class="error">Không có dữ liệu để hiển thị</div>';
        return;
    }

    // Loop qua từng sản phẩm và tạo HTML
    products.forEach(function (product) {
        // Tạo card cho mỗi sản phẩm
        const productCard = createProductCard(product);
        // Thêm vào app
        appElement.appendChild(productCard);
    });
}

// Hàm tạo card cho một sản phẩm
function createProductCard(product) {
    // Tạo div container
    const card = document.createElement('div');
    card.className = 'product-card';

    // Tạo image
    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.images && product.images[0] ? product.images[0] : 'https://placehold.co/600x400';
    image.alt = product.title || 'Product';

    // Xử lý lỗi khi ảnh không load được
    image.onerror = function () {
        this.src = 'https://placehold.co/600x400?text=No+Image';
    };

    // Tạo title
    const title = document.createElement('h2');
    title.className = 'product-title';
    title.textContent = product.title || 'Không có tên';

    // Tạo description
    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description || 'Không có mô tả';

    // Tạo price
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = '$' + (product.price || 0);

    // Tạo category
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = product.category && product.category.name ? product.category.name : 'Uncategorized';

    // Thêm các element vào card
    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(price);
    card.appendChild(category);

    return card;
}

// Gọi hàm fetch khi trang load xong
fetchData();
