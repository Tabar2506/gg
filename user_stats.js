        function getCurrentUser() {
            return localStorage.getItem('currentUser');
        }

        function getUsers() {
            return JSON.parse(localStorage.getItem('users') || '{}');
        }

        function getContents() {
            return JSON.parse(localStorage.getItem('contents') || '[]');
        }

        function checkUserLogin() {
            const currentUser = getCurrentUser();
            const users = getUsers();

            if (!currentUser || !users[currentUser]) {
                alert('Bạn phải đăng nhập trước!');
                window.location.href = 'index.html';
                return null;
            }

            if (users[currentUser].role === 'admin') {
                alert('Tài khoản admin không dùng trang thống kê này!');
                window.location.href = 'admin.html';
                return null;
            }

            return currentUser;
        }

        function renderStats(user) {
            document.getElementById('welcomeText').textContent =
                'Xin chào, ' + user + '!';

            const contents = getContents();
            const myContents = contents.filter(c => c.owner === user);

            const totalMy = myContents.length;
            const myPublic = myContents.filter(c => c.isPublic).length;
            const myPrivate = totalMy - myPublic;

            document.getElementById('totalMy').textContent = totalMy;
            document.getElementById('myPublic').textContent = myPublic;
            document.getElementById('myPrivate').textContent = myPrivate;

            // likes + comments nhận
            let likes = 0;
            let comments = 0;
            myContents.forEach(c => {
                likes += (c.likes || []).length;
                comments += (c.comments || []).length;
            });
            document.getElementById('likesReceived').textContent = likes;
            document.getElementById('commentsReceived').textContent = comments;

            // theo chủ đề
            const counter = {};
            myContents.forEach(c => {
                const key = c.topic || 'Không có chủ đề';
                counter[key] = (counter[key] || 0) + 1;
            });

            const ul = document.getElementById('topicList');
            ul.innerHTML = '';
            const topics = Object.keys(counter);
            if (topics.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'Chưa có dữ liệu';
                ul.appendChild(li);
            } else {
                topics.forEach(t => {
                    const li = document.createElement('li');
                    li.textContent = t + ': ' + counter[t] + ' bài';
                    ul.appendChild(li);
                });
            }
        }

        function setupUI() {
            document.getElementById('logoutBtn').onclick = function () {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            };

            const btn = document.getElementById('themeToggleStats');
            let isDark = false;

            function applyTheme() {
                if (isDark) {
                    document.body.classList.remove('light-mode');
                    btn.textContent = 'Chế độ sáng';
                } else {
                    document.body.classList.add('light-mode');
                    btn.textContent = 'Chế độ tối';
                }
            }

            btn.onclick = function () {
                isDark = !isDark;
                applyTheme();
            };

            applyTheme();
        }

        window.onload = function () {
            const user = checkUserLogin();
            if (!user) return;

            setupUI();
            renderStats(user);
        };
