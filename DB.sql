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
CREATE TABLE DonHang (MaDonHang int IDENTITY NOT NULL, MaNguoiDung int NULL, HoTenNguoiNhan nvarchar(100) NOT NULL, DiaChiGiaoHang nvarchar(500) NOT NULL, SoDienThoaiGiaoHang varchar(20) NOT NULL, NgayDatHang datetime DEFAULT GETDATE() NULL, TongTien decimal(18, 2) NOT NULL, PhuongThucThanhToan nvarchar(100) NOT NULL, TrangThai nvarchar(50) DEFAULT N'Chờ xác nhận' NULL, MaGiamGia varchar(50) NULL, PRIMARY KEY (MaDonHang));
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


-- Reset ID về 0
DBCC CHECKIDENT ('DanhMuc', RESEED, 0); 
GO

-- 2. Khai báo biến để lưu ID của các Danh mục Cha
DECLARE @IdAo int, @IdQuan int, @IdPhuKien int;

-- === A. THÊM DANH MỤC CHA ===
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Áo', N'Các loại áo nam thời trang', NULL);
SET @IdAo = SCOPE_IDENTITY(); -- Lưu ID của 'Áo' (Thường là 1)

INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Quần', N'Các loại quần nam', NULL);
SET @IdQuan = SCOPE_IDENTITY(); -- Lưu ID của 'Quần' (Thường là 2)

INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Phụ Kiện', N'Giày, dép, thắt lưng, ví...', NULL);
SET @IdPhuKien = SCOPE_IDENTITY(); -- Lưu ID của 'Phụ Kiện' (Thường là 3)


-- === B. THÊM DANH MỤC CON (Liên kết với ID Cha ở trên) ===

-- 1. Con của 'Áo'
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Áo Phông', N'Áo phông năng động', @IdAo);
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Áo Sơ Mi', N'Sơ mi công sở, đi chơi', @IdAo);
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Áo Thun', N'Áo thun cotton, polo', @IdAo);
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Áo Khoác', N'Áo khoác gió, bomber', @IdAo);

-- 2. Con của 'Quần'
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Quần Ngố Bò', N'Short jean, kaki ngố', @IdQuan);
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Quần Jean', N'Jean dài ống suông, slimfit', @IdQuan);

-- 3. Con của 'Phụ Kiện'
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Giày Dép', N'Sneaker, giày tây', @IdPhuKien);
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Đồng Hồ', N'Đồng hồ nam', @IdPhuKien);
INSERT INTO DanhMuc (TenDanhMuc, MoTa, MaDanhMucCha) VALUES (N'Thắt Lưng', N'Dây nịt da bò', @IdPhuKien);

GO

-- Kiểm tra kết quả
SELECT * FROM DanhMuc;

IF NOT EXISTS (SELECT * FROM MauSac WHERE TenMauSac = N'Đen') INSERT INTO MauSac (TenMauSac) VALUES (N'Đen');
IF NOT EXISTS (SELECT * FROM MauSac WHERE TenMauSac = N'Trắng') INSERT INTO MauSac (TenMauSac) VALUES (N'Trắng');
IF NOT EXISTS (SELECT * FROM MauSac WHERE TenMauSac = N'Xanh Navy') INSERT INTO MauSac (TenMauSac) VALUES (N'Xanh Navy');
IF NOT EXISTS (SELECT * FROM MauSac WHERE TenMauSac = N'Xám') INSERT INTO MauSac (TenMauSac) VALUES (N'Xám');
IF NOT EXISTS (SELECT * FROM MauSac WHERE TenMauSac = N'Nâu') INSERT INTO MauSac (TenMauSac) VALUES (N'Nâu');

IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = 'S') INSERT INTO KichCo (TenKichCo) VALUES ('S');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = 'M') INSERT INTO KichCo (TenKichCo) VALUES ('M');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = 'L') INSERT INTO KichCo (TenKichCo) VALUES ('L');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = 'XL') INSERT INTO KichCo (TenKichCo) VALUES ('XL');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = '29') INSERT INTO KichCo (TenKichCo) VALUES ('29'); -- Size quần
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = '30') INSERT INTO KichCo (TenKichCo) VALUES ('30');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = '31') INSERT INTO KichCo (TenKichCo) VALUES ('31');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = '32') INSERT INTO KichCo (TenKichCo) VALUES ('32');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = '40') INSERT INTO KichCo (TenKichCo) VALUES ('40'); -- Size giày
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = '41') INSERT INTO KichCo (TenKichCo) VALUES ('41');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = 'Freesize') INSERT INTO KichCo (TenKichCo) VALUES ('Freesize'); -- Cho phụ kiện

GO

USE AnhMenDB
GO

-- 1. Thêm Màu Sắc (Dựa trên tên file: Blue, Green)
IF NOT EXISTS (SELECT * FROM MauSac WHERE TenMauSac = N'Xanh Dương')
    INSERT INTO MauSac (TenMauSac) VALUES (N'Xanh Dương');
IF NOT EXISTS (SELECT * FROM MauSac WHERE TenMauSac = N'Xanh Lá')
    INSERT INTO MauSac (TenMauSac) VALUES (N'Xanh Lá');

-- 2. Thêm Kích Cỡ
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = 'L')
    INSERT INTO KichCo (TenKichCo) VALUES ('L');
IF NOT EXISTS (SELECT * FROM KichCo WHERE TenKichCo = 'XL')
    INSERT INTO KichCo (TenKichCo) VALUES ('XL');

-- 3. Thêm Danh Mục "Áo Sơ Mi" (Nếu chưa có)
DECLARE @MaDmCha int;
SELECT @MaDmCha = MaDanhMuc FROM DanhMuc WHERE TenDanhMuc = N'Nam'; -- Giả sử đã có danh mục Nam

IF NOT EXISTS (SELECT * FROM DanhMuc WHERE TenDanhMuc = N'Áo Sơ Mi')
BEGIN
    INSERT INTO DanhMuc (TenDanhMuc, MaDanhMucCha, MoTa) VALUES (N'Áo Sơ Mi', @MaDmCha, N'Các loại áo sơ mi nam thời trang');
END

-- 4. Thêm Sản Phẩm "Áo Sơ Mi Oxford"
DECLARE @MaDmMoi int;
SELECT @MaDmMoi = MaDanhMuc FROM DanhMuc WHERE TenDanhMuc = N'Áo Sơ Mi';

INSERT INTO SanPham (TenSP, MoTa, MaDanhMuc, TrangThai)
VALUES (N'Áo Sơ Mi Oxford Tay Dài', N'Áo sơ mi chất liệu Oxford thoáng mát, form dáng hiện đại.', @MaDmMoi, N'Đang bán');

DECLARE @MaSPNew int = SCOPE_IDENTITY();

-- 5. Thêm Biến Thể (Kèm Ảnh từ Asset)
DECLARE @MauXanhDuong int, @MauXanhLa int, @SizeL int, @SizeXL int;
SELECT @MauXanhDuong = MaMauSac FROM MauSac WHERE TenMauSac = N'Xanh Dương';
SELECT @MauXanhLa = MaMauSac FROM MauSac WHERE TenMauSac = N'Xanh Lá';


-- Biến thể Xanh Dương (L & XL) - Dùng ảnh ao-so-mi-blue.avif
INSERT INTO SanPham_BienThe (MaSP, MaKichCo, MaMauSac, Gia, SoLuongTon, HinhAnh)
VALUES 
(@MaSPNew, @SizeL, @MauXanhDuong, 450000, 50, 'asset/ao-so-mi-blue.avif'),
(@MaSPNew, @SizeXL, @MauXanhDuong, 450000, 50, 'asset/ao-so-mi-blue.avif');

-- Biến thể Xanh Lá (L & XL) - Dùng ảnh ao-so-mi-green.avif
INSERT INTO SanPham_BienThe (MaSP, MaKichCo, MaMauSac, Gia, SoLuongTon, HinhAnh)
VALUES 
(@MaSPNew, @SizeL, @MauXanhLa, 450000, 50, 'asset/ao-so-mi-green.avif'),
(@MaSPNew, @SizeXL, @MauXanhLa, 450000, 50, 'asset/ao-so-mi-green.avif');
GO