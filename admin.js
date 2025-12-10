/************** HỖ TRỢ TÀI KHOẢN **************/

// Lấy tên người dùng hiện đang đăng nhập
function layNguoiDungHienTai() {
    return localStorage.getItem("nguoidunghientai");
}

// Lấy danh sách người dùng từ localStorage
function layDanhSachNguoiDung() {
    var text = localStorage.getItem("danhsachnguoidung");
    if (!text) {
        return {};
    }
    return JSON.parse(text);
}

// Lưu danh sách người dùng vào localStorage
function luuDanhSachNguoiDung(dsNguoiDung) {
    localStorage.setItem("danhsachnguoidung", JSON.stringify(dsNguoiDung));
}
//kiem tra quyen admin
function kiemTraQuyenAdmin() {
    var ten = layNguoiDungHienTai();
    var ds = layDanhSachNguoiDung();

    if (!ten || !ds[ten] || ds[ten].vaitro !== "admin") {
        alert("Bạn không có quyền truy cập trang ADMIN!");
        window.location.href = "indexindex.html";
    }
}
/************** HIỂN THỊ DANH SÁCH TÀI KHOẢN **************/

function veBangTaiKhoan() {
    var dsNguoiDung = layDanhSachNguoiDung();
    var tenDangNhapHienTai = layNguoiDungHienTai();

    var thanBang = document.getElementById("danhsachtaikhoan");
    if (!thanBang) return;

    thanBang.innerHTML = "";

    var ten;
    for (ten in dsNguoiDung) {
        if (!dsNguoiDung.hasOwnProperty(ten)) continue;

        var tk = dsNguoiDung[ten];

        var dong = document.createElement("tr");

        // Cột tên đăng nhập
        var cotTen = document.createElement("td");
        cotTen.textContent = ten;
        dong.appendChild(cotTen);

        // Cột vai trò
        var cotVaiTro = document.createElement("td");
        cotVaiTro.textContent = tk.vaitro;
        dong.appendChild(cotVaiTro);

        // Cột ngày tạo
        var cotNgay = document.createElement("td");
        cotNgay.textContent = tk.ngaytao || "";
        dong.appendChild(cotNgay);

        // Cột hành động
        var cotHanhDong = document.createElement("td");

        if (ten === tenDangNhapHienTai) {
            // Không cho xóa tài khoản đang đăng nhập
            cotHanhDong.textContent = "Đang đăng nhập";
        } else {
            var nutXoa = document.createElement("button");
            nutXoa.textContent = "Xóa";
            nutXoa.className = "nutxoa";

            // Gắn thêm thuộc tính tự tạo để lưu tên cần xóa
            nutXoa.tenCanXoa = ten;

            nutXoa.onclick = function () {
                xoaTaiKhoan(this.tenCanXoa);
            };

            cotHanhDong.appendChild(nutXoa);
        }

        dong.appendChild(cotHanhDong);
        thanBang.appendChild(dong);
    }
}

/************** TẠO TÀI KHOẢN MỚI **************/

function xuLyThemTaiKhoan(suKien) {
    suKien.preventDefault();

    var oTenDangNhap = document.getElementById("tendangnhapmoi");
    var oMatKhau = document.getElementById("matkhaumoi");
    var oVaiTro = document.getElementById("vaitro");

    var tenDangNhapMoi = oTenDangNhap.value.trim();
    var matKhauMoi = oMatKhau.value.trim();
    var vaiTroMoi = oVaiTro.value;

    if (tenDangNhapMoi === "" || matKhauMoi === "") {
        alert("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!");
        return;
    }

    var dsNguoiDung = layDanhSachNguoiDung();

    if (dsNguoiDung[tenDangNhapMoi]) {
        alert("Tài khoản đã tồn tại!");
        return;
    }

    // Tạo mới tài khoản
    dsNguoiDung[tenDangNhapMoi] = {
        matkhau: matKhauMoi,
        vaitro: vaiTroMoi,
        ngaytao: new Date().toLocaleString("vi-VN")
    };

    luuDanhSachNguoiDung(dsNguoiDung);

    // Xóa nội dung ô input
    oTenDangNhap.value = "";
    oMatKhau.value = "";
    oVaiTro.value = "user";

    // Hiện thông báo thành công
    var hopThongBao = document.getElementById("thongbaothem");
    if (hopThongBao) {
        hopThongBao.style.display = "block";
    }

    // Vẽ lại bảng
    veBangTaiKhoan();
}

/************** XÓA TÀI KHOẢN **************/

function xoaTaiKhoan(tenDangNhap) {
    var tenDangNhapHienTai = layNguoiDungHienTai();

    if (tenDangNhap === tenDangNhapHienTai) {
        alert("Không được xóa tài khoản đang đăng nhập!");
        return;
    }

    var xacNhan = confirm("Bạn có chắc muốn xóa tài khoản: " + tenDangNhap + " ?");
    if (!xacNhan) return;

    var dsNguoiDung = layDanhSachNguoiDung();
    delete dsNguoiDung[tenDangNhap];
    luuDanhSachNguoiDung(dsNguoiDung);

    veBangTaiKhoan();
}

/************** ĐĂNG XUẤT **************/

function dangXuat() {
    localStorage.removeItem("nguoidunghientai");
    window.location.href = "index.html";
}

/************** KHỞI TẠO TRANG **************/

window.onload = function () {
    kiemTraQuyenAdmin();//check 
    // Hiển thị tên admin (nếu có) ở dòng chào
    var tenAdmin = layNguoiDungHienTai();
    var spanTenAdmin = document.getElementById("tenadmin");
    if (spanTenAdmin && tenAdmin) {
        spanTenAdmin.textContent = tenAdmin;
    }

    // Ẩn thông báo lúc mới vào
    var hopThongBao = document.getElementById("thongbaothem");
    if (hopThongBao) {
        hopThongBao.style.display = "none";
    }

    // Nút Đăng xuất
    var nutDangXuat = document.getElementById("nutdangxuat");
    if (nutDangXuat) {
        nutDangXuat.onclick = dangXuat;
    }

    // Form tạo tài khoản
    var formTao = document.getElementById("formtaotaikhoan");
    if (formTao) {
        formTao.onsubmit = xuLyThemTaiKhoan;
    }

    // Lần đầu vẽ bảng
    veBangTaiKhoan();
};


