        // Đăng ký/Đăng nhập bằng localStorage
        function getUsers() {
            return JSON.parse(localStorage.getItem('users') || '{}');
        }
        function setUsers(users) {
            localStorage.setItem('users', JSON.stringify(users));
        }
        let currentUser = null;

        // Hiển thị thông báo lỗi
        function showError(message) {
            const errorDiv = document.getElementById('usernameError');
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }

        // Ẩn thông báo lỗi
        function hideError() {
            const errorDiv = document.getElementById('usernameError');
            errorDiv.classList.remove('show');
        }

        // Kiểm tra tên đăng nhập
        function isValidUsername(username) {
            if (!username) {
                showError('Tên đăng nhập không được bỏ trống!');
                return false;
            }
            if (username.includes(' ')) {
                showError('Tên đăng nhập không được chứa khoảng trắng!');
                return false;
            }
            if (/^[0-9]/.test(username)) {
                showError('Tên đăng nhập không được bắt đầu bằng số!');
                return false;
            }
            if (!/[a-zA-Z]/.test(username)) {
                showError('Tên đăng nhập phải có ít nhất một chữ cái!');
                return false;
            }
            if (!/^[a-zA-Z0-9@_]+$/.test(username)) {
                showError('Tên đăng nhập chỉ được chứa chữ, số, @ và _!');
                return false;
            }
            return true;
        }

        // Xóa thông báo lỗi khi người dùng nhập
        document.getElementById('username').addEventListener('input', hideError);

        // Xử lý đăng nhập
        document.getElementById('loginForm').onsubmit = function(e) {
            e.preventDefault();
            hideError();
            const usernameVal = username.value.trim();
            const passVal = password.value.trim();
            
            // Kiểm tra tên đăng nhập
            if (!isValidUsername(usernameVal)) return;
            
            // Kiểm tra mật khẩu
            if (!passVal) {
                showError('Mật khẩu không được bỏ trống!');
                return;
            }
            
            const users = getUsers();
            // Kiểm tra nếu tên đăng nhập đã đăng ký và mật khẩu đúng thì đăng nhập thành công
            if (users[usernameVal] && users[usernameVal].password === passVal) {
                currentUser = usernameVal;
                localStorage.setItem('currentUser', usernameVal);
                hideError();

                // Kiểm tra vai trò và chuyển hướng
                if (users[usernameVal].role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    alert('Đăng nhập thành công!');
                    window.location.href = 'user.html';
                }
            } else {
                showError('Sai tài khoản hoặc mật khẩu!');
            }
        };

        document.getElementById('registerBtn').onclick = function() {
            hideError();
            const usernameVal = username.value.trim();
            const passVal = password.value.trim();
            
            // Kiểm tra tên đăng nhập
            if (!isValidUsername(usernameVal)) return;
            
            // Kiểm tra mật khẩu
            if (!passVal) {
                showError('Mật khẩu không được bỏ trống!');
                return;
            }
            
            const users = getUsers();
            if (users[usernameVal]) {
                showError('Tên đăng nhập đã tồn tại!');
                return;
            }
            
            users[usernameVal] = {
                password: passVal,
                role: 'user',
                createdAt: new Date().toLocaleString('vi-VN')
            };
            setUsers(users);
            hideError();
            alert('Đăng ký thành công!');
        };

        // Xử lý chuyển đổi chế độ sáng/tối
        const themeToggle = document.getElementById('themeToggle');
        let isDarkMode = true;

        themeToggle.onclick = function() {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.body.classList.remove('light-mode');
                themeToggle.textContent = 'Chế độ tối';
            } else {
                document.body.classList.add('light-mode');
                themeToggle.textContent = 'Chế độ sáng';
            }
        };

        // Khởi tạo tài khoản admin mặc định
        function initializeAdmin() {
            const users = JSON.parse(localStorage.getItem('users') || '{}');
            if (!users['admin1']) {
                users['admin1'] = {
                    password: '1',
                    role: 'admin',
                    createdAt: new Date().toLocaleString('vi-VN')
                };
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        // Gọi hàm khởi tạo khi load trang
        initializeAdmin();