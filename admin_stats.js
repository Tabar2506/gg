/************** HỖ TRỢ TÀI KHOẢN & NỘI DUNG **************/

function layNguoiDungHienTai() {
    return localStorage.getItem("nguoidunghientai");
}

function layDanhSachNguoiDung() {
    var text = localStorage.getItem("danhsachnguoidung");
    if (!text) {
        return {};
    }
    return JSON.parse(text);
}

function layDanhSachNoiDung() {
    var text = localStorage.getItem("danhsachnoidung");
    if (!text) {
        return [];
    }
    return JSON.parse(text);
}
//kiem tra quyen admin
function kiemTraQuyenAdmin() {
    var ten = layNguoiDungHienTai();
    var ds = layDanhSachNguoiDung();

    if (!ten || !ds[ten] || ds[ten].vaitro !== "admin") {
        alert("Bạn không có quyền xem thống kê ADMIN!");
        window.location.href = "login.html";
    }
}
/************** VẼ THỐNG KÊ DÀNH CHO ADMIN **************/

function veThongKeAdmin() {
    var dsNguoiDung = layDanhSachNguoiDung();
    var dsNoiDung = layDanhSachNoiDung();

    var soUser = 0;
    var tongNoiDung = dsNoiDung.length;
    var tongCongKhai = 0;
    var tongLike = 0;
    var tongBinhLuan = 0;

    // Đếm tài khoản có vai trò user
    var ten;
    for (ten in dsNguoiDung) {
        if (!dsNguoiDung.hasOwnProperty(ten)) continue;
        if (dsNguoiDung[ten].vaitro === "user") {
            soUser++;
        }
    }

    // Duyệt các bài viết
    var i;
    for (i = 0; i < dsNoiDung.length; i++) {
        var nd = dsNoiDung[i];

        if (nd.congkhai) {
            tongCongKhai++;
        }

        if (!nd.dsLike) nd.dsLike = [];
        if (!nd.dsBinhLuan) nd.dsBinhLuan = [];

        tongLike += nd.dsLike.length;
        tongBinhLuan += nd.dsBinhLuan.length;
    }

    // Gán lên giao diện
    var oUser = document.getElementById("tonguser");
    var oNoiDung = document.getElementById("tongnoidung");
    var oCongKhai = document.getElementById("tongcongkhai");
    var oLike = document.getElementById("tonglike");
    var oBinhLuan = document.getElementById("tongbinhluan");

    if (oUser) oUser.textContent = soUser;
    if (oNoiDung) oNoiDung.textContent = tongNoiDung;
    if (oCongKhai) oCongKhai.textContent = tongCongKhai;
    if (oLike) oLike.textContent = tongLike;
    if (oBinhLuan) oBinhLuan.textContent = tongBinhLuan;
}

/************** ĐĂNG XUẤT **************/

function dangXuat() {
    localStorage.removeItem("nguoidunghientai");
    window.location.href = "login.html";
}

/************** KHỞI TẠO TRANG **************/

window.onload = function () {
    kiemTraQuyenAdmin();//check 
    // Nút Đăng xuất
    var nutDangXuat = document.getElementById("nutdangxuat");
    if (nutDangXuat) {
        nutDangXuat.onclick = dangXuat;
    }

    // Vẽ thống kê
    veThongKeAdmin();
};
