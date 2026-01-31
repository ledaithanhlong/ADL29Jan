// URL của JSON Server API
const API_URL = 'http://localhost:3000';
const POSTS_URL = `${API_URL}/posts`;
const COMMENTS_URL = `${API_URL}/comments`;

// Biến lưu trữ dữ liệu gốc
let allPosts = [];
let filteredPosts = [];
let allComments = [];
let showDeleted = true; // Hiển thị cả bài viết đã xóa

// Biến phân trang
let currentPageSize = 5;
let currentPage = 1;

// Biến cho modal
let editingPostId = null;
let editingCommentId = null;
let productModal;
let commentModal;
let currentPostId = null; // ID bài viết hiện tại để xem comments

// Lấy element app để render dữ liệu
const appElement = document.getElementById('app');

// Khởi tạo modal khi trang load
document.addEventListener('DOMContentLoaded', function () {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    commentModal = new bootstrap.Modal(document.getElementById('commentModal'));
});

// Hàm fetch dữ liệu từ JSON Server
function fetchData() {
    appElement.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

    Promise.all([
        fetch(POSTS_URL).then(res => res.json()),
        fetch(COMMENTS_URL).then(res => res.json())
    ])
        .then(function ([posts, comments]) {
            allPosts = posts || [];
            allComments = comments || [];
            filteredPosts = [...allPosts];
            renderProductsTable(filteredPosts);
        })
        .catch(function (error) {
            appElement.innerHTML = '<div class="error">Lỗi: ' + error.message + '<br>Đảm bảo json-server đang chạy: npx json-server db.json --static .</div>';
            console.error('Error:', error);
        });
}

// Hàm lấy max ID và tạo ID mới
function getNextProductId() {
    if (allPosts.length === 0) return "1";

    const maxId = Math.max(...allPosts.map(p => parseInt(p.id) || 0));
    return String(maxId + 1);
}

function getNextCommentId() {
    if (allComments.length === 0) return "1";

    const maxId = Math.max(...allComments.map(c => parseInt(c.id) || 0));
    return String(maxId + 1);
}

// Hàm toggle hiển thị bài viết đã xóa
function toggleShowDeleted() {
    showDeleted = !showDeleted;
    const btn = document.getElementById('toggleDeletedBtn');
    btn.textContent = showDeleted ? '👁️ Ẩn đã xóa' : '👁️ Hiện đã xóa';
    btn.className = showDeleted ? 'btn btn-sm btn-warning me-2' : 'btn btn-sm btn-secondary me-2';

    if (showDeleted) {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(p => !p.isDeleted);
    }

    currentPage = 1;
    renderProductsTable(filteredPosts);
}

// Hàm render bảng bài viết với phân trang
function renderProductsTable(posts) {
    appElement.innerHTML = '';

    if (!posts || posts.length === 0) {
        appElement.innerHTML = '<div class="error">Không có dữ liệu để hiển thị</div>';
        return;
    }

    // Tính toán phân trang
    let displayPosts = posts;
    let totalPages = 1;

    if (currentPageSize > 0) {
        totalPages = Math.ceil(posts.length / currentPageSize);
        const startIndex = (currentPage - 1) * currentPageSize;
        const endIndex = startIndex + currentPageSize;
        displayPosts = posts.slice(startIndex, endIndex);
    }

    // Tạo bảng Bootstrap
    const tableHTML = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Tiêu đề</th>
                        <th style="width: 150px;">Lượt xem</th>
                        <th style="width: 250px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayPosts.map(function (post) {
        const isDeleted = post.isDeleted || false;
        const rowStyle = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6; background-color: #ffe6e6;"' : '';

        return `
                            <tr ${rowStyle}>
                                <td>${post.id}</td>
                                <td><strong>${post.title || 'Không có tiêu đề'}</strong></td>
                                <td><span class="badge bg-info">${post.views || 0} views</span></td>
                                <td>
                                    <div class="action-buttons">
                                        ${!isDeleted ? `
                                            <button class="btn btn-sm btn-primary" onclick="editProduct('${post.id}')">Sửa</button>
                                            <button class="btn btn-sm btn-danger" onclick="softDeleteProduct('${post.id}')">Xóa</button>
                                        ` : `
                                            <button class="btn btn-sm btn-success" onclick="restoreProduct('${post.id}')">Khôi phục</button>
                                        `}
                                        <button class="btn btn-sm btn-info" onclick="viewComments('${post.id}')">Comments</button>
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
                Hiển thị ${displayPosts.length} / ${posts.length} bài viết
                ${currentPageSize > 0 ? ` (Trang ${currentPage}/${totalPages})` : ''}
            </p>
            ${currentPageSize > 0 && totalPages > 1 ? `
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-secondary" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                        ← Trước
                    </button>
                    ${Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
        if (totalPages <= 10) return i + 1;
        if (currentPage <= 5) return i + 1;
        if (currentPage >= totalPages - 4) return totalPages - 9 + i;
        return currentPage - 5 + i;
    }).map(page => `
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

    let basePosts = showDeleted ? allPosts : allPosts.filter(p => !p.isDeleted);

    if (searchTerm === '') {
        filteredPosts = [...basePosts];
    } else {
        filteredPosts = basePosts.filter(function (post) {
            const postTitle = post.title ? post.title.toLowerCase() : '';
            return postTitle.includes(searchTerm);
        });
    }

    currentPage = 1;
    renderProductsTable(filteredPosts);
}

// Hàm sắp xếp theo tên
function sortByName(order) {
    filteredPosts.sort(function (a, b) {
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

    renderProductsTable(filteredPosts);
}

// Hàm sắp xếp theo lượt xem
function sortByPrice(order) {
    filteredPosts.sort(function (a, b) {
        const viewsA = parseInt(a.views) || 0;
        const viewsB = parseInt(b.views) || 0;

        if (order === 'asc') {
            return viewsA - viewsB;
        } else {
            return viewsB - viewsA;
        }
    });

    renderProductsTable(filteredPosts);
}

// Hàm reset về trạng thái ban đầu
function resetData() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);
    currentPage = 1;
    renderProductsTable(filteredPosts);
}

// Hàm thay đổi số lượng hiển thị trên 1 trang
function changePageSize(size) {
    currentPageSize = size;
    currentPage = 1;
    renderProductsTable(filteredPosts);
}

// Hàm chuyển trang
function changePage(page) {
    const totalPages = Math.ceil(filteredPosts.length / currentPageSize);

    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProductsTable(filteredPosts);
    }
}

// === POST CRUD FUNCTIONS ===

// Mở modal thêm bài viết
function openAddModal() {
    editingPostId = null;
    document.getElementById('modalTitle').textContent = 'Thêm bài viết';
    document.getElementById('productForm').reset();
    productModal.show();
}

// Mở modal sửa bài viết
function editProduct(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    editingPostId = postId;
    document.getElementById('modalTitle').textContent = 'Sửa bài viết';
    document.getElementById('productTitle').value = post.title || '';
    document.getElementById('productDescription').value = post.views || '';
    document.getElementById('productPrice').style.display = 'none';
    document.getElementById('productImage').style.display = 'none';
    document.getElementById('productCategory').style.display = 'none';

    // Đổi label
    document.querySelector('label[for="productDescription"]').textContent = 'Lượt xem *';

    productModal.show();
}

// Lưu bài viết (thêm hoặc sửa)
function saveProduct() {
    const title = document.getElementById('productTitle').value.trim();
    const views = document.getElementById('productDescription').value.trim();

    if (!title || !views) {
        alert('Vui lòng nhập tiêu đề và lượt xem!');
        return;
    }

    const postData = {
        title: title,
        views: views,
        isDeleted: false
    };

    if (editingPostId === null) {
        // Thêm mới - POST request
        postData.id = getNextProductId();

        fetch(POSTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
            .then(res => res.json())
            .then(newPost => {
                allPosts.push(newPost);
                filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);
                productModal.hide();
                renderProductsTable(filteredPosts);
            })
            .catch(error => {
                alert('Lỗi khi thêm bài viết: ' + error.message);
            });
    } else {
        // Sửa - PUT request
        postData.id = editingPostId;

        fetch(`${POSTS_URL}/${editingPostId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData)
        })
            .then(res => res.json())
            .then(updatedPost => {
                const index = allPosts.findIndex(p => p.id === editingPostId);
                if (index !== -1) {
                    allPosts[index] = updatedPost;
                }
                filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);
                productModal.hide();
                renderProductsTable(filteredPosts);
            })
            .catch(error => {
                alert('Lỗi khi sửa bài viết: ' + error.message);
            });
    }
}

// Xóa mềm bài viết
function softDeleteProduct(postId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
        return;
    }

    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    post.isDeleted = true;

    // PATCH request để cập nhật isDeleted
    fetch(`${POSTS_URL}/${postId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: true })
    })
        .then(res => res.json())
        .then(() => {
            filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);
            renderProductsTable(filteredPosts);
        })
        .catch(error => {
            alert('Lỗi khi xóa bài viết: ' + error.message);
        });
}

// Khôi phục bài viết
function restoreProduct(postId) {
    if (!confirm('Bạn có muốn khôi phục bài viết này?')) {
        return;
    }

    const post = allPosts.find(p => p.id === postId);
    if (!post) return;

    post.isDeleted = false;

    // PATCH request để cập nhật isDeleted
    fetch(`${POSTS_URL}/${postId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: false })
    })
        .then(res => res.json())
        .then(() => {
            filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);
            renderProductsTable(filteredPosts);
        })
        .catch(error => {
            alert('Lỗi khi khôi phục bài viết: ' + error.message);
        });
}

// === COMMENTS CRUD FUNCTIONS ===

// Xem comments của bài viết
function viewComments(postId) {
    currentPostId = postId;
    const post = allPosts.find(p => p.id === postId);
    const postComments = allComments.filter(c => c.postId === postId);

    const commentsHTML = `
        <div class="mb-3">
            <h5>Comments cho: ${post ? post.title : 'Bài viết'}</h5>
            <button class="btn btn-sm btn-success mb-3" onclick="openAddCommentModal()">+ Thêm comment</button>
        </div>
        <div class="list-group">
            ${postComments.length === 0 ? '<p class="text-muted">Chưa có comment nào</p>' : ''}
            ${postComments.map(comment => `
                <div class="list-group-item ${comment.isDeleted ? 'bg-light' : ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1" style="${comment.isDeleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                            <strong>Comment #${comment.id}</strong>
                            <p class="mb-1">${comment.text}</p>
                        </div>
                        <div class="btn-group-vertical btn-group-sm">
                            ${!comment.isDeleted ? `
                                <button class="btn btn-sm btn-primary" onclick="editComment('${comment.id}')">Sửa</button>
                                <button class="btn btn-sm btn-danger" onclick="softDeleteComment('${comment.id}')">Xóa</button>
                            ` : `
                                <button class="btn btn-sm btn-success" onclick="restoreComment('${comment.id}')">Khôi phục</button>
                            `}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    appElement.innerHTML = `
        <div class="mb-3">
            <button class="btn btn-secondary" onclick="fetchData()">← Quay lại danh sách bài viết</button>
        </div>
        ${commentsHTML}
    `;
}

// Mở modal thêm comment
function openAddCommentModal() {
    editingCommentId = null;
    document.getElementById('commentModalTitle').textContent = 'Thêm comment';
    document.getElementById('commentForm').reset();
    commentModal.show();
}

// Sửa comment
function editComment(commentId) {
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return;

    editingCommentId = commentId;
    document.getElementById('commentModalTitle').textContent = 'Sửa comment';
    document.getElementById('commentText').value = comment.text || '';
    commentModal.show();
}

// Lưu comment
function saveComment() {
    const text = document.getElementById('commentText').value.trim();

    if (!text) {
        alert('Vui lòng nhập nội dung comment!');
        return;
    }

    const commentData = {
        text: text,
        postId: currentPostId,
        isDeleted: false
    };

    if (editingCommentId === null) {
        // Thêm mới - POST request
        commentData.id = getNextCommentId();

        fetch(COMMENTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        })
            .then(res => res.json())
            .then(newComment => {
                allComments.push(newComment);
                commentModal.hide();
                viewComments(currentPostId);
            })
            .catch(error => {
                alert('Lỗi khi thêm comment: ' + error.message);
            });
    } else {
        // Sửa - PUT request
        commentData.id = editingCommentId;

        fetch(`${COMMENTS_URL}/${editingCommentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData)
        })
            .then(res => res.json())
            .then(updatedComment => {
                const index = allComments.findIndex(c => c.id === editingCommentId);
                if (index !== -1) {
                    allComments[index] = updatedComment;
                }
                commentModal.hide();
                viewComments(currentPostId);
            })
            .catch(error => {
                alert('Lỗi khi sửa comment: ' + error.message);
            });
    }
}

// Xóa mềm comment
function softDeleteComment(commentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa comment này?')) {
        return;
    }

    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return;

    comment.isDeleted = true;

    // PATCH request
    fetch(`${COMMENTS_URL}/${commentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: true })
    })
        .then(res => res.json())
        .then(() => {
            viewComments(currentPostId);
        })
        .catch(error => {
            alert('Lỗi khi xóa comment: ' + error.message);
        });
}

// Khôi phục comment
function restoreComment(commentId) {
    if (!confirm('Bạn có muốn khôi phục comment này?')) {
        return;
    }

    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return;

    comment.isDeleted = false;

    // PATCH request
    fetch(`${COMMENTS_URL}/${commentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDeleted: false })
    })
        .then(res => res.json())
        .then(() => {
            viewComments(currentPostId);
        })
        .catch(error => {
            alert('Lỗi khi khôi phục comment: ' + error.message);
        });
}

// Gọi hàm fetch khi trang load xong
fetchData();
