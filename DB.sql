IF EXISTS(SELECT *FROM SYS.SYSDATABASES WHERE NAME = 'AnhMenDB' )
DROP DATABASE AnhMenDB
GO
CREATE database AnhMenDB
GO
USE AnhMenDB
GO
CREATE TABLE NguoiDung (MaNguoiDung int IDENTITY NOT NULL, HoTen nvarchar(100) NOT NULL, Email varchar(100) NOT NULL UNIQUE, SoDienThoai varchar(20) NULL, MatKhau varchar(255) NOT NULL, VaiTro nvarchar(20) DEFAULT 'KhachHang' NOT NULL, TrangThai nvarchar(50) DEFAULT 'HoatDong' NOT NULL, NgayDangKy datetime DEFAULT GETDATE() NULL, PRIMARY KEY (MaNguoiDung));
CREATE TABLE SoDiaChi (MaDiaChi int IDENTITY NOT NULL, MaNguoiDung int NOT NULL, HoTenNguoiNhan nvarchar(100) NOT NULL, SoDienThoai varchar(20) NOT NULL, DiaChiChiTiet nvarchar(500) NOT NULL, LaMacDinh bit DEFAULT 0 NULL, PRIMARY KEY (MaDiaChi));
CREATE TABLE DanhMuc (MaDanhMuc int IDENTITY NOT NULL, TenDanhMuc nvarchar(100) NOT NULL, MaDanhMucCha int NULL, MoTa nvarchar(500) NULL, PRIMARY KEY (MaDanhMuc));
CREATE TABLE SanPham (MaSP int IDENTITY NOT NULL, TenSP nvarchar(255) NOT NULL, MoTa ntext NULL, MaDanhMuc int NULL, TrangThai nvarchar(50) DEFAULT N'Ä ang bÃ¡n' NULL, NgayTao datetime DEFAULT GETDATE() NULL, PRIMARY KEY (MaSP));
CREATE TABLE KichCo (MaKichCo int IDENTITY NOT NULL, TenKichCo varchar(20) NOT NULL UNIQUE, PRIMARY KEY (MaKichCo));
CREATE TABLE MauSac (MaMauSac int IDENTITY NOT NULL, TenMauSac nvarchar(50) NOT NULL UNIQUE, PRIMARY KEY (MaMauSac));
CREATE TABLE SanPham_BienThe (MaBienThe int IDENTITY NOT NULL, MaSP int NOT NULL, MaKichCo int NULL, MaMauSac int NULL, Gia decimal(18, 2) NOT NULL, SoLuongTon int NOT NULL, HinhAnh varchar(255) NULL, PRIMARY KEY (MaBienThe));
CREATE TABLE DanhGia (MaDanhGia int IDENTITY NOT NULL, MaSP int NOT NULL, MaNguoiDung int NOT NULL, SoSao int NULL CHECK(SoSao >= 1 AND SoSao <= 5), BinhLuan ntext NULL, NgayDanhGia datetime DEFAULT GETDATE() NULL, PRIMARY KEY (MaDanhGia));
CREATE TABLE DonHang (MaDonHang int IDENTITY NOT NULL, MaNguoiDung int NULL, HoTenNguoiNhan nvarchar(100) NOT NULL, DiaChiGiaoHang nvarchar(500) NOT NULL, SoDienThoaiGiaoHang varchar(20) NOT NULL, NgayDatHang datetime DEFAULT GETDATE() NULL, TongTien decimal(18, 2) NOT NULL, PhuongThucThanhToan nvarchar(100) NOT NULL, TrangThai nvarchar(50) DEFAULT N'Chá»  xÃ¡c nháº­n' NULL, MaGiamGia varchar(50) NULL, PRIMARY KEY (MaDonHang));
CREATE TABLE ChiTietDonHang (MaChiTietDH int IDENTITY NOT NULL, MaDonHang int NOT NULL, MaBienThe int NOT NULL, SoLuong int NOT NULL, DonGia decimal(18, 2) NOT NULL, PRIMARY KEY (MaChiTietDH));
CREATE TABLE MaGiamGia (MaCoupon int IDENTITY NOT NULL, Code varchar(50) NOT NULL UNIQUE, MoTa nvarchar(500) NULL, LoaiGiamGia nvarchar(20) NOT NULL, GiaTri decimal(18, 2) NOT NULL, DonHangToiThieu decimal(18, 2) DEFAULT 0 NULL, NgayBatDau datetime NOT NULL, NgayKetThuc datetime NOT NULL, SoLuong int NULL, PRIMARY KEY (MaCoupon));
CREATE TABLE BaiViet (MaBaiViet int IDENTITY NOT NULL, TieuDe nvarchar(255) NOT NULL, NoiDung ntext NOT NULL, LoaiBaiViet nvarchar(50) NOT NULL, MaNguoiDung int NULL, NgayDang datetime DEFAULT GETDATE() NULL, URL_SEO varchar(255) NULL UNIQUE, PRIMARY KEY (MaBaiViet));
CREATE TABLE GioHang (MaGioHang int IDENTITY NOT NULL, MaNguoiDung int NOT NULL UNIQUE, NgayCapNhatCuoi datetime DEFAULT GETDATE() NULL, PRIMARY KEY (MaGioHang));
CREATE TABLE ChiTietGioHang (MaChiTietGH int IDENTITY NOT NULL, MaGioHang int NOT NULL, MaBienThe int NOT NULL, SoLuong int NOT NULL, PRIMARY KEY (MaChiTietGH));
ALTER TABLE SoDiaChi ADD CONSTRAINT FKSoDiaChi760163 FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung (MaNguoiDung);
ALTER TABLE DanhMuc ADD CONSTRAINT FKDanhMuc972261 FOREIGN KEY (MaDanhMucCha) REFERENCES DanhMuc (MaDanhMuc);
ALTER TABLE SanPham ADD CONSTRAINT FKSanPham266652 FOREIGN KEY (MaDanhMuc) REFERENCES DanhMuc (MaDanhMuc);
ALTER TABLE SanPham_BienThe ADD CONSTRAINT FKSanPham_Bi107950 FOREIGN KEY (MaSP) REFERENCES SanPham (MaSP);
ALTER TABLE SanPham_BienThe ADD CONSTRAINT FKSanPham_Bi852268 FOREIGN KEY (MaKichCo) REFERENCES KichCo (MaKichCo);
ALTER TABLE SanPham_BienThe ADD CONSTRAINT FKSanPham_Bi690790 FOREIGN KEY (MaMauSac) REFERENCES MauSac (MaMauSac);
ALTER TABLE DanhGia ADD CONSTRAINT FKDanhGia201235 FOREIGN KEY (MaSP) REFERENCES SanPham (MaSP);
ALTER TABLE DanhGia ADD CONSTRAINT FKDanhGia995566 FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung (MaNguoiDung);
ALTER TABLE DonHang ADD CONSTRAINT FKDonHang875915 FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung (MaNguoiDung);
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FKChiTietDon661137 FOREIGN KEY (MaDonHang) REFERENCES DonHang (MaDonHang);
ALTER TABLE ChiTietDonHang ADD CONSTRAINT FKChiTietDon429678 FOREIGN KEY (MaBienThe) REFERENCES SanPham_BienThe (MaBienThe);
ALTER TABLE BaiViet ADD CONSTRAINT FKBaiViet134849 FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung (MaNguoiDung);
ALTER TABLE GioHang ADD CONSTRAINT FKGioHang433525 FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung (MaNguoiDung);
ALTER TABLE ChiTietGioHang ADD CONSTRAINT FKChiTietGio44279 FOREIGN KEY (MaGioHang) REFERENCES GioHang (MaGioHang);
ALTER TABLE ChiTietGioHang ADD CONSTRAINT FKChiTietGio739119 FOREIGN KEY (MaBienThe) REFERENCES SanPham_BienThe (MaBienThe);
