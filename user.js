/************** HỖ TRỢ TÀI KHOẢN & NỘI DUNG **************/

function layNguoiDungHienTai() {
    return localStorage.getItem("nguoidunghientai");
}

function layDanhSachNguoiDung() {
    var text = localStorage.getItem("danhsachnguoidung");
    if (!text) return {};
    return JSON.parse(text);
}

function layDanhSachNoiDung() {
    var text = localStorage.getItem("danhsachnoidung");
    if (!text) return [];
    return JSON.parse(text);
}

function luuDanhSachNoiDung(dsNoiDung) {
    localStorage.setItem("danhsachnoidung", JSON.stringify(dsNoiDung));
}
//check quyen user
function kiemTraQuyenUser() {
    var ten = layNguoiDungHienTai();
    var ds = layDanhSachNguoiDung();

    if (!ten || !ds[ten] || ds[ten].vaitro !== "user") {
        alert("Chỉ tài khoản USER mới được vào trang này!");
        window.location.href = "login.html";
    }
} 
// Lấy mã nội dung tiếp theo (tăng dần)
function layMaNoiDungTiepTheo() {
    var text = localStorage.getItem("maNoiDungTiepTheo");
    var ma = text ? parseInt(text, 10) : 1;
    localStorage.setItem("maNoiDungTiepTheo", ma + 1);
    return ma;
}

/************** BIẾN TOÀN CỤC **************/

var NGUOI_DUNG_HIEN_TAI = null;
var ID_NOIDUNG_DUOC_CHON = null;

/************** DANH SÁCH NỘI DUNG **************/

function veDanhSachNoiDung() {
    var vungDanhSach = document.getElementById("danhsachbaiviet");
    var thongBaoRong = document.getElementById("thongbaorong");
    if (!vungDanhSach) return;

    vungDanhSach.innerHTML = "";

    var tatCa = layDanhSachNoiDung();
    var dsHienThi = [];
    var i;

    // Lọc: bài của mình + bài công khai của người khác
    for (i = 0; i < tatCa.length; i++) {
        var nd = tatCa[i];
        if (nd.nguoi === NGUOI_DUNG_HIEN_TAI || nd.congkhai === true) {
            dsHienThi.push(nd);
        }
    }

    if (dsHienThi.length === 0) {
        if (thongBaoRong) thongBaoRong.style.display = "block";
        return;
    } else {
        if (thongBaoRong) thongBaoRong.style.display = "none";
    }

    for (i = 0; i < dsHienThi.length; i++) {
        var nd2 = dsHienThi[i];

        var theBai = document.createElement("div");
        theBai.className = "baiviet";

        var tieuDeEl = document.createElement("h3");
        tieuDeEl.textContent = nd2.tieude;
        theBai.appendChild(tieuDeEl);

        var thongTinEl = document.createElement("p");
        thongTinEl.className = "thongtinbaiviet";
        thongTinEl.textContent =
            "Chủ đề: " + nd2.chude + " • Ngày: " + (nd2.ngaytao || "");
        theBai.appendChild(thongTinEl);

        var nhanTrangThai = document.createElement("span");
        nhanTrangThai.className = "nhantrangthai";
        nhanTrangThai.textContent = nd2.congkhai ? "Công khai" : "Riêng tư";
        theBai.appendChild(nhanTrangThai);

        if (nd2.motangan && nd2.motangan.trim() !== "") {
            var moTaEl = document.createElement("p");
            moTaEl.textContent = nd2.motangan;
            theBai.appendChild(moTaEl);
        }

        if (!nd2.dsLike) nd2.dsLike = [];
        if (!nd2.dsBinhLuan) nd2.dsBinhLuan = [];

        var chanEl = document.createElement("div");
        chanEl.className = "chanbaiviet";

        var spanLike = document.createElement("span");
        spanLike.textContent = "♥ " + nd2.dsLike.length;
        chanEl.appendChild(spanLike);

        var spanBL = document.createElement("span");
        spanBL.textContent = "💬 " + nd2.dsBinhLuan.length;
        chanEl.appendChild(spanBL);

        theBai.appendChild(chanEl);

        var vungNut = document.createElement("div");
        vungNut.className = "hanhdongbaiviet";

        var nutXem = document.createElement("button");
        nutXem.textContent = "Xem chi tiết";
        nutXem.className = "nutvien";
        nutXem.maNoiDung = nd2.ma;
        nutXem.onclick = function () {
            hienChiTiet(this.maNoiDung);
        };
        vungNut.appendChild(nutXem);

        if (nd2.nguoi === NGUOI_DUNG_HIEN_TAI) {
            var nutSua = document.createElement("button");
            nutSua.textContent = "Sửa";
            nutSua.className = "nutvien";
            nutSua.maNoiDung = nd2.ma;
            nutSua.onclick = function () {
                napNoiDungLenForm(this.maNoiDung);
            };
            vungNut.appendChild(nutSua);

            var nutXoa = document.createElement("button");
            nutXoa.textContent = "Xóa";
            nutXoa.className = "nutvien nutxoa";
            nutXoa.maNoiDung = nd2.ma;
            nutXoa.onclick = function () {
                xoaNoiDung(this.maNoiDung);
            };
            vungNut.appendChild(nutXoa);
        }

        theBai.appendChild(vungNut);
        vungDanhSach.appendChild(theBai);
    }

    // Lưu lại danh sách (nếu ta vừa thêm thuộc tính dsLike/dsBinhLuan)
    luuDanhSachNoiDung(tatCa);
}

/************** THÊM / SỬA / XÓA NỘI DUNG **************/

function xoaFormNoiDung() {
    document.getElementById("mabaiviet").value = "";
    document.getElementById("tieude").value = "";
    document.getElementById("chude").value = "";
    document.getElementById("motangan").value = "";
    document.getElementById("noidung").value = "";
    document.getElementById("quyenhienthi").value = "public";
}

function luuNoiDung() {
    if (!NGUOI_DUNG_HIEN_TAI) {
        alert("Bạn cần đăng nhập trước!");
        return;
    }

    var maText = document.getElementById("mabaiviet").value;
    var tieuDe = document.getElementById("tieude").value.trim();
    var chuDe = document.getElementById("chude").value.trim();
    var moTaNgan = document.getElementById("motangan").value.trim();
    var noiDungChiTiet = document.getElementById("noidung").value.trim();
    var quyen = document.getElementById("quyenhienthi").value;

    if (tieuDe === "" || chuDe === "" || noiDungChiTiet === "") {
        alert("Vui lòng nhập đầy đủ tiêu đề, chủ đề và nội dung!");
        return;
    }

    var dsNoiDung = layDanhSachNoiDung();
    var i;

    if (maText !== "") {
        var ma = parseInt(maText, 10);
        for (i = 0; i < dsNoiDung.length; i++) {
            if (dsNoiDung[i].ma === ma && dsNoiDung[i].nguoi === NGUOI_DUNG_HIEN_TAI) {
                dsNoiDung[i].tieude = tieuDe;
                dsNoiDung[i].chude = chuDe;
                dsNoiDung[i].motangan = moTaNgan;
                dsNoiDung[i].noidung = noiDungChiTiet;
                dsNoiDung[i].congkhai = (quyen === "public");
                break;
            }
        }
    } else {
        var doiTuong = {
            ma: layMaNoiDungTiepTheo(),
            tieude: tieuDe,
            chude: chuDe,
            motangan: moTaNgan,
            noidung: noiDungChiTiet,
            congkhai: (quyen === "public"),
            nguoi: NGUOI_DUNG_HIEN_TAI,
            ngaytao: new Date().toLocaleString("vi-VN"),
            dsLike: [],
            dsBinhLuan: []
        };
        dsNoiDung.push(doiTuong);
    }

    luuDanhSachNoiDung(dsNoiDung);
    xoaFormNoiDung();
    veDanhSachNoiDung();
}

function napNoiDungLenForm(ma) {
    var dsNoiDung = layDanhSachNoiDung();
    var i;

    for (i = 0; i < dsNoiDung.length; i++) {
        var nd = dsNoiDung[i];
        if (nd.ma === ma && nd.nguoi === NGUOI_DUNG_HIEN_TAI) {
            document.getElementById("mabaiviet").value = nd.ma;
            document.getElementById("tieude").value = nd.tieude;
            document.getElementById("chude").value = nd.chude;
            document.getElementById("motangan").value = nd.motangan || "";
            document.getElementById("noidung").value = nd.noidung || "";
            document.getElementById("quyenhienthi").value = nd.congkhai ? "public" : "private";
            break;
        }
    }
}

function xoaNoiDung(ma) {
    var xacNhan = confirm("Bạn có chắc muốn xóa nội dung này?");
    if (!xacNhan) return;

    var dsNoiDung = layDanhSachNoiDung();
    var i;

    for (i = 0; i < dsNoiDung.length; i++) {
        if (dsNoiDung[i].ma === ma && dsNoiDung[i].nguoi === NGUOI_DUNG_HIEN_TAI) {
            dsNoiDung.splice(i, 1);
            break;
        }
    }

    luuDanhSachNoiDung(dsNoiDung);

    if (ID_NOIDUNG_DUOC_CHON === ma) {
        ID_NOIDUNG_DUOC_CHON = null;
        var hop = document.getElementById("hopchitiet");
        if (hop) {
            hop.innerHTML = "<p class='ghichu'>Chọn một bài viết ở danh sách để xem chi tiết, like và bình luận.</p>";
        }
    }

    veDanhSachNoiDung();
}

/************** CHI TIẾT + LIKE + BÌNH LUẬN **************/

function hienChiTiet(ma) {
    var dsNoiDung = layDanhSachNoiDung();
    var i;
    var nd = null;

    for (i = 0; i < dsNoiDung.length; i++) {
        if (dsNoiDung[i].ma === ma) {
            nd = dsNoiDung[i];
            break;
        }
    }
    if (!nd) return;

    ID_NOIDUNG_DUOC_CHON = ma;

    var hop = document.getElementById("hopchitiet");
    if (!hop) return;

    if (!nd.dsLike) nd.dsLike = [];
    if (!nd.dsBinhLuan) nd.dsBinhLuan = [];

    var html = "";
    html += "<h3>" + nd.tieude + "</h3>";
    html += "<p>Chủ đề: " + nd.chude + "</p>";
    html += "<p>Ngày tạo: " + (nd.ngaytao || "") + "</p>";
    html += "<p>Trạng thái: " + (nd.congkhai ? "Công khai" : "Riêng tư") + "</p>";
    html += "<div class='noidungchitiet'>" + nd.noidung + "</div>";
    html += "<p>Lượt like: " + nd.dsLike.length + "</p>";
    html += "<button id='nutlikechitiet' class='nutvien'>Like / Bỏ like</button>";

    html += "<h4 style='margin-top:12px;'>Bình luận</h4>";
    html += "<ul>";
    for (i = 0; i < nd.dsBinhLuan.length; i++) {
        var bl = nd.dsBinhLuan[i];
        html += "<li>" + bl.nguoi + " (" + bl.thoigian + "): " + bl.noidung + "</li>";
    }
    html += "</ul>";

    if (nd.congkhai && nd.nguoi !== NGUOI_DUNG_HIEN_TAI) {
        html += "<div class='comment-area'>";
        html += "<label for='noidungbinhluan'>Thêm bình luận</label>";
        html += "<textarea id='noidungbinhluan' class='comment-input' rows='2' placeholder='Nhập bình luận...'></textarea>";
        html += "<div class='comment-actions'>";
        html += "<button id='nutguibinhluan' class='nut nutchinh'>Gửi bình luận</button>";
        html += "</div>";
        html += "</div>";
    } else {
        html += "<p class='ghichu'><i>Chỉ được bình luận bài công khai của người khác.</i></p>";
    }

    hop.innerHTML = html;

    var nutLike = document.getElementById("nutlikechitiet");
    if (nutLike) nutLike.onclick = chuyenTrangThaiLike;

    var nutGuiBL = document.getElementById("nutguibinhluan");
    if (nutGuiBL) nutGuiBL.onclick = guiBinhLuan;
}

function chuyenTrangThaiLike() {
    if (!NGUOI_DUNG_HIEN_TAI) {
        alert("Bạn cần đăng nhập trước!");
        return;
    }
    if (!ID_NOIDUNG_DUOC_CHON) return;

    var dsNoiDung = layDanhSachNoiDung();
    var i;
    var nd = null;

    for (i = 0; i < dsNoiDung.length; i++) {
        if (dsNoiDung[i].ma === ID_NOIDUNG_DUOC_CHON) {
            nd = dsNoiDung[i];
            break;
        }
    }
    if (!nd) return;

    if (nd.nguoi === NGUOI_DUNG_HIEN_TAI) {
        alert("Không được like bài của chính mình!");
        return;
    }
    if (!nd.congkhai) {
        alert("Chỉ like được bài công khai!");
        return;
    }

    if (!nd.dsLike) nd.dsLike = [];
    var viTri = nd.dsLike.indexOf(NGUOI_DUNG_HIEN_TAI);

    if (viTri === -1) {
        nd.dsLike.push(NGUOI_DUNG_HIEN_TAI);
    } else {
        nd.dsLike.splice(viTri, 1);
    }

    luuDanhSachNoiDung(dsNoiDung);
    hienChiTiet(ID_NOIDUNG_DUOC_CHON);
    veDanhSachNoiDung();
}

function guiBinhLuan() {
    if (!NGUOI_DUNG_HIEN_TAI) {
        alert("Bạn cần đăng nhập trước!");
        return;
    }
    if (!ID_NOIDUNG_DUOC_CHON) return;

    var oNoiDungBL = document.getElementById("noidungbinhluan");
    if (!oNoiDungBL) return;

    var text = oNoiDungBL.value.trim();
    if (text === "") {
        alert("Vui lòng nhập bình luận!");
        return;
    }

    var dsNoiDung = layDanhSachNoiDung();
    var i;
    var nd = null;

    for (i = 0; i < dsNoiDung.length; i++) {
        if (dsNoiDung[i].ma === ID_NOIDUNG_DUOC_CHON) {
            nd = dsNoiDung[i];
            break;
        }
    }
    if (!nd) return;

    if (!nd.congkhai || nd.nguoi === NGUOI_DUNG_HIEN_TAI) {
        alert("Chỉ bình luận bài công khai của người khác!");
        return;
    }

    if (!nd.dsBinhLuan) nd.dsBinhLuan = [];
    nd.dsBinhLuan.push({
        nguoi: NGUOI_DUNG_HIEN_TAI,
        noidung: text,
        thoigian: new Date().toLocaleString("vi-VN")
    });

    luuDanhSachNoiDung(dsNoiDung);
    hienChiTiet(ID_NOIDUNG_DUOC_CHON);
    veDanhSachNoiDung();
}

/************** ĐĂNG XUẤT **************/

function dangXuat() {
    localStorage.removeItem("nguoidunghientai");
    window.location.href = "login.html";
}

/************** KHỞI TẠO TRANG **************/

window.onload = function () {
    kiemTraQuyenUser();//check
    NGUOI_DUNG_HIEN_TAI = layNguoiDungHienTai();

    // Hiển thị tên user trên đầu trang nếu có
    var spanTen = document.getElementById("tennguoidung");
    if (spanTen && NGUOI_DUNG_HIEN_TAI) {
        spanTen.textContent = NGUOI_DUNG_HIEN_TAI;
    }

    // Nút Đăng xuất
    var nutDangXuat = document.getElementById("nutdangxuat");
    if (nutDangXuat) {
        nutDangXuat.onclick = dangXuat;
    }

    // Nút Lưu / Làm mới
    var nutLuu = document.getElementById("nutluu");
    if (nutLuu) nutLuu.onclick = luuNoiDung;

    var nutLaiLai = document.getElementById("nutlailai");
    if (nutLaiLai) nutLaiLai.onclick = xoaFormNoiDung;

    // Vẽ danh sách lần đầu
    veDanhSachNoiDung();
};
