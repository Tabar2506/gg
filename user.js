      // ========= HÀM LẤY / LƯU LOCALSTORAGE =========
        function getCurrentUser() {
            return localStorage.getItem('currentUser');
        }

        function getUsers() {
            return JSON.parse(localStorage.getItem('users') || '{}');
        }

        function getContents() {
            return JSON.parse(localStorage.getItem('contents') || '[]');
        }

        function saveContents(contents) {
            localStorage.setItem('contents', JSON.stringify(contents));
        }

        function getNextContentId() {
            let id = Number(localStorage.getItem('nextContentId') || '1');
            localStorage.setItem('nextContentId', id + 1);
            return id;
        }

        // ========= KIỂM TRA ĐĂNG NHẬP USER =========
        function checkUserLogin() {
            const currentUser = getCurrentUser();
            const users = getUsers();

            if (!currentUser || !users[currentUser]) {
                alert('Bạn phải đăng nhập trước!');
                window.location.href = 'index.html';
                return null;
            }

            if (users[currentUser].role === 'admin') {
                alert('Đây là tài khoản admin, chuyển sang trang quản trị.');
                window.location.href = 'admin.html';
                return null;
            }

            return currentUser;
        }

        // ========= BIẾN TOÀN CỤC =========
        let CURRENT_USER = null;
        let SELECTED_CONTENT_ID = null;

        // ========= FORM =========
        function resetForm() {
            document.getElementById('contentId').value = '';
            document.getElementById('title').value = '';
            document.getElementById('topic').value = '';
            document.getElementById('description').value = '';
            document.getElementById('visibility').value = 'public';
            document.getElementById('content').value = '';
        }

        function saveContent() {
            const idInput = document.getElementById('contentId').value;
            const title = document.getElementById('title').value.trim();
            const topic = document.getElementById('topic').value.trim();
            const description = document.getElementById('description').value.trim();
            const visibility = document.getElementById('visibility').value;
            const content = document.getElementById('content').value.trim();

            if (!title || !topic || !description || !content) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            let contents = getContents();

            if (idInput) {
                const id = Number(idInput);
                const idx = contents.findIndex(c => c.id === id && c.owner === CURRENT_USER);
                if (idx === -1) {
                    alert('Không tìm thấy nội dung để sửa!');
                    return;
                }
                const item = contents[idx];
                item.title = title;
                item.topic = topic;
                item.description = description;
                item.content = content;
                item.isPublic = (visibility === 'public');
                alert('Cập nhật nội dung thành công!');
            } else {
                const newContent = {
                    id: getNextContentId(),
                    title,
                    topic,
                    description,
                    content,
                    isPublic: (visibility === 'public'),
                    owner: CURRENT_USER,
                    createdAt: new Date().toLocaleString('vi-VN'),
                    likes: [],
                    comments: []
                };
                contents.push(newContent);
                alert('Thêm nội dung thành công!');
            }

            saveContents(contents);
            resetForm();
            displayContents();
        }

        function editContent(id) {
            const contents = getContents();
            const item = contents.find(c => c.id === id && c.owner === CURRENT_USER);
            if (!item) {
                alert('Không tìm thấy nội dung hoặc bạn không có quyền sửa!');
                return;
            }

            document.getElementById('contentId').value = item.id;
            document.getElementById('title').value = item.title;
            document.getElementById('topic').value = item.topic;
            document.getElementById('description').value = item.description;
            document.getElementById('visibility').value = item.isPublic ? 'public' : 'private';
            document.getElementById('content').value = item.content;

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function deleteContent(id) {
            if (!confirm('Bạn có chắc muốn xóa nội dung này?')) return;

            let contents = getContents();
            const idx = contents.findIndex(c => c.id === id && c.owner === CURRENT_USER);
            if (idx === -1) {
                alert('Không tìm thấy nội dung hoặc bạn không có quyền xóa!');
                return;
            }

            contents.splice(idx, 1);
            saveContents(contents);
            alert('Đã xóa nội dung!');
            displayContents();

            if (SELECTED_CONTENT_ID === id) {
                closeModal();
            }
        }

        // ========= DANH SÁCH BÀI VIẾT (CARD) =========
        function buildTopicFilterOptions(visibleContents) {
            const select = document.getElementById('topicFilter');
            const currentValue = select.value || 'all';

            const topics = [];
            visibleContents.forEach(c => {
                if (c.topic && !topics.includes(c.topic)) {
                    topics.push(c.topic);
                }
            });

            select.innerHTML = '<option value="all">Tất cả chủ đề</option>';
            topics.forEach(topic => {
                const opt = document.createElement('option');
                opt.value = topic;
                opt.textContent = topic;
                select.appendChild(opt);
            });

            // giữ lại lựa chọn cũ nếu có
            if ([...select.options].some(o => o.value === currentValue)) {
                select.value = currentValue;
            }
        }

        function displayContents() {
            const postList = document.getElementById('postList');
            const emptyMsg = document.getElementById('emptyMessage');
            postList.innerHTML = '';

            const allContents = getContents();

            // Bài mình + bài công khai người khác
            let visibleContents = allContents.filter(c => c.owner === CURRENT_USER || c.isPublic);

            // Tạo option lọc chủ đề dựa trên danh sách này
            buildTopicFilterOptions(visibleContents);

            // Áp dụng search + filter
            const searchText = document.getElementById('searchInput').value.trim().toLowerCase();
            const topicFilter = document.getElementById('topicFilter').value;

            visibleContents = visibleContents.filter(c => {
                const matchSearch = c.title.toLowerCase().includes(searchText);
                const matchTopic = (topicFilter === 'all') || (c.topic === topicFilter);
                return matchSearch && matchTopic;
            });

            if (visibleContents.length === 0) {
                emptyMsg.style.display = 'block';
                return;
            } else {
                emptyMsg.style.display = 'none';
            }

            visibleContents.forEach(item => {
                const card = document.createElement('div');
                card.className = 'post-item';

                const header = document.createElement('div');
                header.className = 'post-header';

                const title = document.createElement('h3');
                title.className = 'post-title';
                title.textContent = item.title;
                header.appendChild(title);

                const ownerSpan = document.createElement('span');
                ownerSpan.className = 'post-owner';
                ownerSpan.textContent = item.owner;
                header.appendChild(ownerSpan);

                card.appendChild(header);

                const desc = document.createElement('p');
                desc.className = 'post-description';
                desc.textContent = item.description;
                card.appendChild(desc);

                const meta = document.createElement('p');
                meta.className = 'post-meta';

                const topicSpan = document.createElement('span');
                topicSpan.className = 'post-topic';
                topicSpan.textContent = 'Chủ đề: ' + item.topic;

                const dateSpan = document.createElement('span');
                dateSpan.className = 'post-date';
                dateSpan.textContent = item.createdAt;

                const statusSpan = document.createElement('span');
                statusSpan.classList.add('status-pill');
                if (item.isPublic) {
                    statusSpan.classList.add('status-public');
                    statusSpan.textContent = 'Công khai';
                } else {
                    statusSpan.classList.add('status-private');
                    statusSpan.textContent = 'Riêng tư';
                }

                meta.appendChild(topicSpan);
                meta.appendChild(document.createTextNode(' • '));
                meta.appendChild(dateSpan);
                meta.appendChild(document.createTextNode(' • '));
                meta.appendChild(statusSpan);

                card.appendChild(meta);

                const footer = document.createElement('div');
                footer.className = 'post-footer';

                const stats = document.createElement('div');
                stats.className = 'post-stats';
                const likeCount = (item.likes || []).length;
                const commentCount = (item.comments || []).length;
                stats.innerHTML =
                    '<span class="icon-heart">❤</span> ' + likeCount +
                    '  <span class="icon-comment">💬</span> ' + commentCount;
                footer.appendChild(stats);

                const actions = document.createElement('div');
                actions.className = 'post-actions';

                const viewBtn = document.createElement('button');
                viewBtn.className = 'btn-pill';
                viewBtn.textContent = 'Xem chi tiết';
                viewBtn.onclick = function () {
                    viewDetail(item.id);
                };
                actions.appendChild(viewBtn);

                if (item.owner === CURRENT_USER) {
                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-pill';
                    editBtn.textContent = 'Sửa';
                    editBtn.onclick = function () {
                        editContent(item.id);
                    };
                    actions.appendChild(editBtn);

                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn-pill btn-danger';
                    delBtn.textContent = 'Xóa';
                    delBtn.onclick = function () {
                        deleteContent(item.id);
                    };
                    actions.appendChild(delBtn);
                }

                footer.appendChild(actions);
                card.appendChild(footer);

                postList.appendChild(card);
            });
        }

        // ========= MODAL CHI TIẾT =========
        function openModal() {
            document.getElementById('detailModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('detailModal').classList.remove('show');
            document.getElementById('commentText').value = '';
            SELECTED_CONTENT_ID = null;
        }

        function viewDetail(id) {
            const contents = getContents();
            const item = contents.find(c => c.id === id);
            if (!item) {
                alert('Không tìm thấy nội dung!');
                return;
            }

            SELECTED_CONTENT_ID = id;

            // Tiêu đề, meta
            document.getElementById('modalTitle').textContent = item.title;
            const metaText = item.owner + ' • ' + item.createdAt + ' • ' +
                (item.isPublic ? 'Công khai' : 'Riêng tư') +
                ' • Chủ đề: ' + item.topic;
            document.getElementById('modalMeta').textContent = metaText;

            // Nội dung
            document.getElementById('modalContent').innerHTML = item.content;

            // Like info + nút
            const likeList = item.likes || [];
            const liked = likeList.indexOf(CURRENT_USER) !== -1;
            const likeBtn = document.getElementById('modalLikeBtn');
            likeBtn.textContent = liked ? 'Bỏ thích' : 'Thích';
            document.getElementById('modalLikeInfo').textContent =
                likeList.length + ' lượt thích';

            // Bình luận
            const ul = document.getElementById('commentList');
            ul.innerHTML = '';
            (item.comments || []).forEach(cmt => {
                const li = document.createElement('li');
                li.className = 'comment-item';
                li.textContent = cmt.user + ' (' + cmt.createdAt + '): ' + cmt.text;
                ul.appendChild(li);
            });

            // Quyền bình luận
            const cmtWrapper = document.getElementById('commentFormWrapper');
            const cmtNote = document.getElementById('commentNote');
            if (!item.isPublic) {
                cmtWrapper.style.display = 'none';
                cmtNote.textContent = 'Đây là bài viết riêng tư, không thể bình luận.';
            } else if (item.owner === CURRENT_USER) {
                cmtWrapper.style.display = 'none';
                cmtNote.textContent = 'Bạn không thể bình luận vào bài viết của chính mình.';
            } else {
                cmtWrapper.style.display = 'block';
                cmtNote.textContent = '';
            }

            openModal();
        }

        function toggleLike() {
            if (!SELECTED_CONTENT_ID) return;

            const contents = getContents();
            const item = contents.find(c => c.id === SELECTED_CONTENT_ID);
            if (!item) return;

            if (item.owner === CURRENT_USER) {
                alert('Bạn không thể like bài của chính mình!');
                return;
            }
            if (!item.isPublic) {
                alert('Chỉ có thể like bài công khai!');
                return;
            }

            item.likes = item.likes || [];
            const idx = item.likes.indexOf(CURRENT_USER);
            if (idx === -1) {
                item.likes.push(CURRENT_USER);
            } else {
                item.likes.splice(idx, 1); // bỏ thích
            }

            saveContents(contents);
            displayContents();
            viewDetail(SELECTED_CONTENT_ID); // cập nhật lại modal
        }

        function sendComment() {
            if (!SELECTED_CONTENT_ID) return;

            const text = document.getElementById('commentText').value.trim();
            if (!text) {
                alert('Vui lòng nhập nội dung bình luận!');
                return;
            }

            const contents = getContents();
            const item = contents.find(c => c.id === SELECTED_CONTENT_ID);
            if (!item) return;

            if (!item.isPublic || item.owner === CURRENT_USER) {
                alert('Bạn chỉ được bình luận vào bài công khai của người khác!');
                return;
            }

            item.comments = item.comments || [];
            item.comments.push({
                user: CURRENT_USER,
                text,
                createdAt: new Date().toLocaleString('vi-VN')
            });

            saveContents(contents);
            document.getElementById('commentText').value = '';
            displayContents();
            viewDetail(SELECTED_CONTENT_ID); // render lại list bình luận
        }

        // ========= UI: ĐĂNG XUẤT + THEME =========
        function setupUI() {
            document.getElementById('welcomeText').textContent =
                'Xin chào, ' + CURRENT_USER + '!';

            document.getElementById('logoutBtn').onclick = function () {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            };

            const themeToggle = document.getElementById('themeToggleUser');
            let isDarkMode = false;

            function applyTheme() {
                if (isDarkMode) {
                    document.body.classList.remove('light-mode');
                    themeToggle.textContent = 'Chế độ sáng';
                } else {
                    document.body.classList.add('light-mode');
                    themeToggle.textContent = 'Chế độ tối';
                }
            }

            themeToggle.onclick = function () {
                isDarkMode = !isDarkMode;
                applyTheme();
            };

            applyTheme();
        }

        // ========= KHỞI TẠO =========
        window.onload = function () {
            const user = checkUserLogin();
            if (!user) return;
            CURRENT_USER = user;

            setupUI();
            displayContents();

            document.getElementById('saveBtn').onclick = saveContent;
            document.getElementById('resetBtn').onclick = resetForm;

            document.getElementById('searchInput').oninput = displayContents;
            document.getElementById('topicFilter').onchange = displayContents;

            document.getElementById('modalCloseBtn').onclick = closeModal;
            document.getElementById('detailModal').onclick = function (e) {
                if (e.target.id === 'detailModal') {
                    closeModal();
                }
            };

            document.getElementById('modalLikeBtn').onclick = toggleLike;
            document.getElementById('commentBtn').onclick = sendComment;
        };
