/************** HỖ TRỢ TÀI KHOẢN & NỘI DUNG **************/

function layNguoiDungHienTai() {
    return localStorage.getItem("nguoidunghientai");
}

function layDanhSachNoiDung() {
    var text = localStorage.getItem("danhsachnoidung");
    if (!text) return [];
    return JSON.parse(text);
}
function layDanhSachNguoiDung() {
    var text = localStorage.getItem("danhsachnguoidung");
    if (!text) {
        return {};
    }
    return JSON.parse(text);
}
//check quyen
function kiemTraQuyenUser() {
    var ten = layNguoiDungHienTai();
    var dsNguoiDung = layDanhSachNguoiDung();

    if (!ten || !dsNguoiDung[ten] || dsNguoiDung[ten].vaitro !== "user") {
        alert("Bạn không có quyền truy cập thống kê USER!");
        window.location.href = "login.html";
    }
}

/************** VẼ THỐNG KÊ DÀNH CHO USER **************/

function veThongKeNguoiDung(tenNguoiDung) {
    var dsNoiDung = layDanhSachNoiDung();

    var tongBai = 0;
    var soCongKhai = 0;
    var soRiengTu = 0;
    var tongLuotThich = 0;
    var tongBinhLuan = 0;

    var demTheoChuDe = {}; // {chude: soBai}

    var i;
    for (i = 0; i < dsNoiDung.length; i++) {
        var nd = dsNoiDung[i];

        if (nd.nguoi !== tenNguoiDung) continue;

        tongBai++;

        if (nd.congkhai) {
            soCongKhai++;
        } else {
            soRiengTu++;
        }

        if (!nd.dsLike) nd.dsLike = [];
        if (!nd.dsBinhLuan) nd.dsBinhLuan = [];

        tongLuotThich += nd.dsLike.length;
        tongBinhLuan += nd.dsBinhLuan.length;

        var chude = nd.chude && nd.chude.trim() !== "" ? nd.chude.trim() : "Chưa có chủ đề";
        if (!demTheoChuDe[chude]) {
            demTheoChuDe[chude] = 0;
        }
        demTheoChuDe[chude]++;
    }

    var oTongBai = document.getElementById("tongbaicuatoi");
    var oCongKhai = document.getElementById("baicongkhaicuatoi");
    var oRiengTu = document.getElementById("bairiengtucuatoi");
    var oLuotThich = document.getElementById("tongluotthich");
    var oBinhLuan = document.getElementById("tongbinhluan");

    if (oTongBai) oTongBai.textContent = tongBai;
    if (oCongKhai) oCongKhai.textContent = soCongKhai;
    if (oRiengTu) oRiengTu.textContent = soRiengTu;
    if (oLuotThich) oLuotThich.textContent = tongLuotThich;
    if (oBinhLuan) oBinhLuan.textContent = tongBinhLuan;

    var ulChuDe = document.getElementById("danhsachchude");
    if (!ulChuDe) return;

    ulChuDe.innerHTML = "";

    if (tongBai === 0) {
        var liRong = document.createElement("li");
        liRong.textContent = "Chưa có nội dung nào để thống kê.";
        ulChuDe.appendChild(liRong);
        return;
    }

    var cacChuDe = [];
    var tenCd;
    for (tenCd in demTheoChuDe) {
        if (demTheoChuDe.hasOwnProperty(tenCd)) {
            cacChuDe.push(tenCd);
        }
    }
    cacChuDe.sort();

    var j;
    for (j = 0; j < cacChuDe.length; j++) {
        var cd = cacChuDe[j];
        var li = document.createElement("li");
        li.textContent = cd + ": " + demTheoChuDe[cd] + " bài";
        ulChuDe.appendChild(li);
    }

    // Lưu lại (nếu vừa thêm mảng dsLike/dsBinhLuan)
    localStorage.setItem("danhsachnoidung", JSON.stringify(dsNoiDung));
}

/************** ĐĂNG XUẤT **************/

function dangXuat() {
    localStorage.removeItem("nguoidunghientai");
    window.location.href = "login.html";
}

/************** KHỞI TẠO TRANG **************/

window.onload = function () {
    kiemTraQuyenUser();//check
    var tenNguoiDung = layNguoiDungHienTai();
    
    // Hiển thị tên user ở đầu trang nếu có
    var spanTen = document.getElementById("tennguoidung");
    if (spanTen && tenNguoiDung) {
        spanTen.textContent = tenNguoiDung;
    }

    // Nút Đăng xuất
    var nutDangXuat = document.getElementById("nutdangxuat");
    if (nutDangXuat) {
        nutDangXuat.onclick = dangXuat;
    }

    // Nếu có user đang đăng nhập thì mới vẽ thống kê
    if (tenNguoiDung) {
        veThongKeNguoiDung(tenNguoiDung);
    }
};
