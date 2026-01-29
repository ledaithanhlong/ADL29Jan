// URL của JSON Server API
const dataUrl = 'http://localhost:3000';

// Biến lưu trữ dữ liệu gốc
let allData = { posts: [], comments: [], profile: {} };
let allPosts = [];
let filteredPosts = [];
let allComments = [];
let showDeleted = true; // Hiển thị cả bài viết đã xóa

// Biến phân trang
let currentPageSize = 5;
let currentPage = 1;

// Biến cho modal
let editingPostIndex = -1;
let editingCommentIndex = -1;
let postModal;
let commentModal;
let currentPostId = null; // ID bài viết hiện tại để xem comments

// Lấy element app để render dữ liệu
const appElement = document.getElementById('app');

// Khởi tạo modal khi trang load
document.addEventListener('DOMContentLoaded', function () {
    postModal = new bootstrap.Modal(document.getElementById('postModal'));
    commentModal = new bootstrap.Modal(document.getElementById('commentModal'));
});

// Hàm fetch dữ liệu từ JSON Server
function fetchData() {
    appElement.innerHTML = '<div class="loading">Đang tải dữ liệu...</div>';

    // Fetch posts và comments từ JSON Server
    Promise.all([
        fetch(`${dataUrl}/posts`).then(res => res.json()),
        fetch(`${dataUrl}/comments`).then(res => res.json())
    ])
        .then(function ([posts, comments]) {
            allData = { posts, comments, profile: {} };
            allPosts = posts || [];
            allComments = comments || [];
            filteredPosts = [...allPosts];
            renderPostsTable(filteredPosts);
        })
        .catch(function (error) {
            appElement.innerHTML = '<div class="error">Lỗi: ' + error.message + '</div>';
            console.error('Error:', error);
        });
}

// Hàm lấy max ID và tạo ID mới
function getNextPostId() {
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
    btn.textContent = showDeleted ? ' Ẩn đã xóa' : ' Hiện đã xóa';
    btn.className = showDeleted ? 'btn btn-sm btn-warning' : 'btn btn-sm btn-secondary';

    if (showDeleted) {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(p => !p.isDeleted);
    }

    currentPage = 1;
    renderPostsTable(filteredPosts);
}

// Hàm render bảng bài viết với phân trang
function renderPostsTable(posts) {
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
                        <th style="width: 60px;">ID</th>
                        <th>Title</th>
                        <th style="width: 100px;">Views</th>
                        <th style="width: 200px;">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayPosts.map(function (post, index) {
        const actualIndex = allPosts.findIndex(p => p.id === post.id);
        const isDeleted = post.isDeleted || false;
        const rowStyle = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6; background-color: #ffe6e6;"' : '';

        return `
                            <tr ${rowStyle}>
                                <td>${post.id}</td>
                                <td><strong>${post.title || 'Không có tên'}</strong></td>
                                <td><span class="badge bg-success">${post.views || 0}</span></td>
                                <td>
                                    <div class="action-buttons">
                                        ${!isDeleted ? `
                                            <button class="btn btn-sm btn-primary" onclick="editPost(${actualIndex})">Sửa</button>
                                            <button class="btn btn-sm btn-danger" onclick="softDeletePost(${actualIndex})">Xóa</button>
                                        ` : `
                                            <button class="btn btn-sm btn-success" onclick="restorePost(${actualIndex})">Khôi phục</button>
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
    renderPostsTable(filteredPosts);
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

    renderPostsTable(filteredPosts);
}

// Hàm sắp xếp theo views
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

    renderPostsTable(filteredPosts);
}

// Hàm reset về trạng thái ban đầu
function resetData() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }

    filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);
    currentPage = 1;
    renderPostsTable(filteredPosts);
}

// Hàm thay đổi số lượng hiển thị trên 1 trang
function changePageSize(size) {
    currentPageSize = size;
    currentPage = 1;
    renderPostsTable(filteredPosts);
}

// Hàm chuyển trang
function changePage(page) {
    const totalPages = Math.ceil(filteredPosts.length / currentPageSize);

    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderPostsTable(filteredPosts);
    }
}

// === POST CRUD FUNCTIONS ===

// Mở modal thêm bài viết
function openAddModal() {
    editingPostIndex = -1;
    document.getElementById('modalTitle').textContent = 'Thêm bài viết';
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = ''; // Để trống, sẽ tự động tạo
    postModal.show();
}

// Mở modal sửa bài viết
function editPost(index) {
    editingPostIndex = index;
    const post = allPosts[index];

    document.getElementById('modalTitle').textContent = 'Sửa bài viết';
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postViews').value = post.views || '';

    postModal.show();
}

// Lưu bài viết (thêm hoặc sửa)
function savePost() {
    const title = document.getElementById('postTitle').value.trim();
    const views = document.getElementById('postViews').value.trim();

    if (!title) {
        alert('Vui lòng nhập tiêu đề bài viết!');
        return;
    }

    const postData = {
        id: editingPostIndex === -1 ? getNextPostId() : allPosts[editingPostIndex].id,
        title: title,
        views: views || '0',
        isDeleted: false
    };

    if (editingPostIndex === -1) {
        // Thêm mới
        allPosts.push(postData);
    } else {
        // Sửa
        allPosts[editingPostIndex] = postData;
    }

    // Cập nhật filteredPosts
    filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);

    postModal.hide();
    renderPostsTable(filteredPosts);
}

// Xóa mềm bài viết
function softDeletePost(index) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
        return;
    }

    allPosts[index].isDeleted = true;

    // Cập nhật filteredPosts
    if (!showDeleted) {
        filteredPosts = allPosts.filter(p => !p.isDeleted);
    } else {
        filteredPosts = [...allPosts];
    }

    renderPostsTable(filteredPosts);
}

// Khôi phục bài viết
function restorePost(index) {
    if (!confirm('Bạn có muốn khôi phục bài viết này?')) {
        return;
    }

    allPosts[index].isDeleted = false;

    filteredPosts = showDeleted ? [...allPosts] : allPosts.filter(p => !p.isDeleted);
    renderPostsTable(filteredPosts);
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
    editingCommentIndex = -1;
    document.getElementById('commentModalTitle').textContent = 'Thêm comment';
    document.getElementById('commentForm').reset();
    document.getElementById('commentId').value = '';
    commentModal.show();
}

// Sửa comment
function editComment(commentId) {
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return;

    editingCommentIndex = allComments.findIndex(c => c.id === commentId);
    document.getElementById('commentModalTitle').textContent = 'Sửa comment';
    document.getElementById('commentId').value = comment.id;
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
        id: editingCommentIndex === -1 ? getNextCommentId() : allComments[editingCommentIndex].id,
        text: text,
        postId: currentPostId,
        isDeleted: false
    };

    if (editingCommentIndex === -1) {
        // Thêm mới
        allComments.push(commentData);
    } else {
        // Sửa
        allComments[editingCommentIndex] = commentData;
    }

    commentModal.hide();
    viewComments(currentPostId);
}

// Xóa mềm comment
function softDeleteComment(commentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa comment này?')) {
        return;
    }

    const index = allComments.findIndex(c => c.id === commentId);
    if (index !== -1) {
        allComments[index].isDeleted = true;
        viewComments(currentPostId);
    }
}

// Khôi phục comment
function restoreComment(commentId) {
    if (!confirm('Bạn có muốn khôi phục comment này?')) {
        return;
    }

    const index = allComments.findIndex(c => c.id === commentId);
    if (index !== -1) {
        allComments[index].isDeleted = false;
        viewComments(currentPostId);
    }
}

// Gọi hàm fetch khi trang load xong
fetchData();
