        // Kiểm tra đăng nhập admin
        function checkAdminLogin() {
            const currentUser = localStorage.getItem('currentUser');
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            
            if (!currentUser || !users[currentUser] || users[currentUser].role !== 'admin') {
                alert('Bạn không có quyền truy cập!');
                window.location.href = 'index.html';
            }
        }

        checkAdminLogin();

        // Lấy danh sách user
        function getUsers() {
            return JSON.parse(localStorage.getItem('users') || '{}');
        }

        function setUsers(users) {
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Hiển thị danh sách tài khoản
        function displayUsers(searchTerm = '') {
            const users = getUsers();
            const tbody = document.getElementById('userList');
            tbody.innerHTML = '';

            for (let username in users) {
                if (searchTerm && !username.toLowerCase().includes(searchTerm.toLowerCase())) {
                    continue;
                }

                const user = users[username];
                const tr = document.createElement('tr');
                const isCurrentAdmin = username === localStorage.getItem('currentUser');
                
                tr.innerHTML = `
                    <td>${username}</td>
                    <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role}</span></td>
                    <td>${user.createdAt || new Date().toLocaleString('vi-VN')}</td>
                    <td>
                        ${!isCurrentAdmin ? `<button class="btn-delete" onclick="deleteUser('${username}')">Xóa</button>` : '<span class="current-user">Đang đăng nhập</span>'}
                    </td>
                `;
                tbody.appendChild(tr);
            }
        }

        // Xóa tài khoản
        function deleteUser(username) {
            if (confirm(`Bạn có chắc muốn xóa tài khoản "${username}"?`)) {
                const users = getUsers();
                delete users[username];
                setUsers(users);
                displayUsers();
                showSuccess('Đã xóa tài khoản thành công!', 'addSuccess');
            }
        }

        // Hiển thị thông báo thành công
        function showSuccess(message, elementId) {
            const successDiv = document.getElementById(elementId);
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }

        // Thêm tài khoản mới
        document.getElementById('addUserForm').onsubmit = function(e) {
            e.preventDefault();
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const role = document.getElementById('userRole').value;

            if (!username || !password) {
                alert('Vui lòng nhập đầy đủ thông tin!');
                return;
            }

            const users = getUsers();
            if (users[username]) {
                alert('Tên đăng nhập đã tồn tại!');
                return;
            }

            users[username] = {
                password: password,
                role: role,
                createdAt: new Date().toLocaleString('vi-VN')
            };
            setUsers(users);
            
            document.getElementById('newUsername').value = '';
            document.getElementById('newPassword').value = '';
            displayUsers();
            showSuccess('Tạo tài khoản thành công!', 'addSuccess');
        };

        // Tìm kiếm
        document.getElementById('searchInput').addEventListener('input', function(e) {
            displayUsers(e.target.value);
        });

        // Đăng xuất
        document.getElementById('logoutBtn').onclick = function() {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        };
        // Nút xem thống kê admin
        document.getElementById('viewStats').onclick = function (e) {
        e.preventDefault();
        window.location.href = 'admin_stats.html';
        };
        // Chế độ sáng/tối - giống trang index
        const themeToggle = document.getElementById('themeToggleAdmin');
        let isDarkMode = true;

        themeToggle.onclick = function() {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.body.classList.remove('light-mode');
                themeToggle.textContent = 'Chế độ sáng';
            } else {
                document.body.classList.add('light-mode');
                themeToggle.textContent = 'Chế độ tối';
            }
        };

        // Hiển thị danh sách khi load trang
        displayUsers();
