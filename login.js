// Đăng ký/Đăng nhập bằng localStorage
        function getUsers() {
            return JSON.parse(localStorage.getItem('users') || '{}');
        }
        function setUsers(users) {
            localStorage.setItem('users', JSON.stringify(users));
        }
        let currentUser = null;

        // Chuẩn hóa & kiểm tra Gmail
        function canonicalizeEmail(raw) {
            const e = raw.trim().toLowerCase();
            const [local, domain] = e.split('@');
            if (domain !== 'gmail.com') return e; // chỉ chuẩn hóa với gmail
            // bỏ phần sau dấu + và bỏ dấu chấm
            const pureLocal = (local.split('+')[0] || '').replace(/\./g, '');
            return `${pureLocal}@gmail.com`;
        }
        function isValidGmail(raw) {
            // 6–30 ký tự, chữ/số/._, không dấu +, không .., không . đầu/cuối, domain gmail.com
            const re = /^(?!.*\.\.)(?!.*\+)(?!\.)([a-zA-Z0-9](?:[._]?[a-zA-Z0-9]){5,29})(?<!\.)@gmail\.com$/;
            return re.test(raw.trim().toLowerCase());
        }

        // Xử lý đăng nhập: đúng tài khoản thì lưu currentUser và chuyển sang manage.html
        document.getElementById('loginForm').onsubmit = function(e) {
            e.preventDefault();
            const emailVal = email.value.trim();
            const passVal = password.value.trim();
            const users = getUsers();

        if (users[emailVal] && users[emailVal] === passVal) {
        // lưu user hiện tại để trang khác dùng
            localStorage.setItem('currentUser', emailVal);
        // chuyển sang trang quản lý file
            window.location.href = 'manage.html';
    }   else {
        alert('Sai tài khoản hoặc mật khẩu!');
    }
};

        document.getElementById('registerBtn').onclick = function() {
            const emailVal = email.value.trim();
            const passVal = password.value.trim();
            if (!emailVal || !passVal) return alert('Nhập đủ thông tin!');
            const users = getUsers();
            if (users[emailVal]) return alert('Email đã tồn tại!');
            users[emailVal] = passVal;
            setUsers(users);
            alert('Đăng ký thành công!');
        };
   
        