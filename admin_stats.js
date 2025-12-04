        // ==== HÀM DÙNG CHUNG ====
        function getCurrentUser() {
            return localStorage.getItem('currentUser');
        }

        function getUsers() {
            return JSON.parse(localStorage.getItem('users') || '{}');
        }

        function getContents() {
            return JSON.parse(localStorage.getItem('contents') || '[]');
        }

        function checkAdminLogin() {
            const currentUser = getCurrentUser();
            const users = getUsers();

            if (!currentUser || !users[currentUser] || users[currentUser].role !== 'admin') {
                alert('Bạn không có quyền truy cập trang thống kê này!');
                window.location.href = 'index.html';
                return null;
            }
            return currentUser;
        }

        function renderStats(adminUser) {
            document.getElementById('welcomeText').textContent =
                'Xin chào, ' + adminUser + '!';

            const users = getUsers();
            const contents = getContents();

            // Đếm user role = user
            let totalUsers = 0;
            Object.keys(users).forEach(u => {
                if (users[u].role === 'user') totalUsers++;
            });

            const totalPosts = contents.length;
            const publicPosts = contents.filter(c => c.isPublic).length;

            let totalLikes = 0;
            let totalComments = 0;
            contents.forEach(c => {
                totalLikes += (c.likes || []).length;
                totalComments += (c.comments || []).length;
            });

            document.getElementById('totalUsers').textContent = totalUsers;
            document.getElementById('totalPosts').textContent = totalPosts;
            document.getElementById('publicPosts').textContent = publicPosts;
            document.getElementById('totalLikes').textContent = totalLikes;
            document.getElementById('totalComments').textContent = totalComments;
        }

        function setupUI() {
            // Đăng xuất
            document.getElementById('logoutBtn').onclick = function () {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            };

            // Chế độ sáng/tối
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
            const admin = checkAdminLogin();
            if (!admin) return;

            setupUI();
            renderStats(admin);
        };
