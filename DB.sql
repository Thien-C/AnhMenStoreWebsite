USE [master]
GO
/****** Object:  Database [AnhMenDB]    Script Date: 12/23/2025 6:54:19 PM ******/
CREATE DATABASE [AnhMenDB]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'AnhMenDB', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\AnhMenDB.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'AnhMenDB_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\AnhMenDB_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [AnhMenDB] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [AnhMenDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [AnhMenDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [AnhMenDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [AnhMenDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [AnhMenDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [AnhMenDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [AnhMenDB] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [AnhMenDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [AnhMenDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [AnhMenDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [AnhMenDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [AnhMenDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [AnhMenDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [AnhMenDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [AnhMenDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [AnhMenDB] SET  ENABLE_BROKER 
GO
ALTER DATABASE [AnhMenDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [AnhMenDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [AnhMenDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [AnhMenDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [AnhMenDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [AnhMenDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [AnhMenDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [AnhMenDB] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [AnhMenDB] SET  MULTI_USER 
GO
ALTER DATABASE [AnhMenDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [AnhMenDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [AnhMenDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [AnhMenDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [AnhMenDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [AnhMenDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [AnhMenDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [AnhMenDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [AnhMenDB]
GO
/****** Object:  Table [dbo].[BaiViet]    Script Date: 12/23/2025 6:54:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BaiViet](
	[MaBaiViet] [int] IDENTITY(1,1) NOT NULL,
	[TieuDe] [nvarchar](255) NOT NULL,
	[NoiDung] [ntext] NOT NULL,
	[LoaiBaiViet] [nvarchar](50) NOT NULL,
	[MaNguoiDung] [int] NULL,
	[NgayDang] [datetime] NULL,
	[URL_SEO] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBaiViet] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChiTietDonHang]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietDonHang](
	[MaChiTietDH] [int] IDENTITY(1,1) NOT NULL,
	[MaDonHang] [int] NOT NULL,
	[MaBienThe] [int] NOT NULL,
	[SoLuong] [int] NOT NULL,
	[DonGia] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaChiTietDH] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ChiTietGioHang]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ChiTietGioHang](
	[MaChiTietGH] [int] IDENTITY(1,1) NOT NULL,
	[MaGioHang] [int] NOT NULL,
	[MaBienThe] [int] NOT NULL,
	[SoLuong] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaChiTietGH] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DanhGia]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DanhGia](
	[MaDanhGia] [int] IDENTITY(1,1) NOT NULL,
	[MaSP] [int] NOT NULL,
	[MaNguoiDung] [int] NOT NULL,
	[SoSao] [int] NULL,
	[BinhLuan] [ntext] NULL,
	[NgayDanhGia] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDanhGia] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DanhMuc]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DanhMuc](
	[MaDanhMuc] [int] IDENTITY(1,1) NOT NULL,
	[TenDanhMuc] [nvarchar](100) NOT NULL,
	[MaDanhMucCha] [int] NULL,
	[MoTa] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDanhMuc] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DonHang]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DonHang](
	[MaDonHang] [int] IDENTITY(1,1) NOT NULL,
	[MaNguoiDung] [int] NULL,
	[HoTenNguoiNhan] [nvarchar](100) NOT NULL,
	[DiaChiGiaoHang] [nvarchar](500) NOT NULL,
	[SoDienThoaiGiaoHang] [varchar](20) NOT NULL,
	[NgayDatHang] [datetime] NULL,
	[TongTien] [decimal](18, 2) NOT NULL,
	[PhuongThucThanhToan] [nvarchar](100) NOT NULL,
	[TrangThai] [nvarchar](50) NULL,
	[MaGiamGia] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDonHang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GioHang]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GioHang](
	[MaGioHang] [int] IDENTITY(1,1) NOT NULL,
	[MaNguoiDung] [int] NOT NULL,
	[NgayCapNhatCuoi] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaGioHang] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[KichCo]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[KichCo](
	[MaKichCo] [int] IDENTITY(1,1) NOT NULL,
	[TenKichCo] [varchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaKichCo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MaGiamGia]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MaGiamGia](
	[MaCoupon] [int] IDENTITY(1,1) NOT NULL,
	[Code] [varchar](50) NOT NULL,
	[MoTa] [nvarchar](500) NULL,
	[LoaiGiamGia] [nvarchar](20) NOT NULL,
	[GiaTri] [decimal](18, 2) NOT NULL,
	[DonHangToiThieu] [decimal](18, 2) NULL,
	[NgayBatDau] [datetime] NOT NULL,
	[NgayKetThuc] [datetime] NOT NULL,
	[SoLuong] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaCoupon] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MauSac]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MauSac](
	[MaMauSac] [int] IDENTITY(1,1) NOT NULL,
	[TenMauSac] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[MaMauSac] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NguoiDung]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NguoiDung](
	[MaNguoiDung] [int] IDENTITY(1,1) NOT NULL,
	[HoTen] [nvarchar](100) NOT NULL,
	[Email] [varchar](100) NOT NULL,
	[SoDienThoai] [varchar](20) NULL,
	[MatKhau] [varchar](255) NOT NULL,
	[VaiTro] [nvarchar](20) NOT NULL,
	[TrangThai] [nvarchar](50) NOT NULL,
	[NgayDangKy] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaNguoiDung] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SanPham]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SanPham](
	[MaSP] [int] IDENTITY(1,1) NOT NULL,
	[TenSP] [nvarchar](255) NOT NULL,
	[MoTa] [ntext] NULL,
	[MaDanhMuc] [int] NULL,
	[TrangThai] [nvarchar](50) NULL,
	[NgayTao] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaSP] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SanPham_BienThe]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SanPham_BienThe](
	[MaBienThe] [int] IDENTITY(1,1) NOT NULL,
	[MaSP] [int] NOT NULL,
	[MaKichCo] [int] NULL,
	[MaMauSac] [int] NULL,
	[Gia] [decimal](18, 2) NOT NULL,
	[SoLuongTon] [int] NOT NULL,
	[HinhAnh] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[MaBienThe] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SoDiaChi]    Script Date: 12/23/2025 6:54:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SoDiaChi](
	[MaDiaChi] [int] IDENTITY(1,1) NOT NULL,
	[MaNguoiDung] [int] NOT NULL,
	[HoTenNguoiNhan] [nvarchar](100) NOT NULL,
	[SoDienThoai] [varchar](20) NOT NULL,
	[DiaChiChiTiet] [nvarchar](500) NOT NULL,
	[LaMacDinh] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[MaDiaChi] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[ChiTietDonHang] ON 
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (1, 1, 1, 1, CAST(450000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (2, 2, 1, 5, CAST(450000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (3, 3, 1, 3, CAST(450000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (4, 4, 1, 6, CAST(450000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (5, 5, 1, 36, CAST(450000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (6, 6, 3, 3, CAST(450000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (7, 7, 11, 2, CAST(488000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (8, 8, 14, 1, CAST(435000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (9, 8, 12, 1, CAST(456000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (10, 9, 20, 3, CAST(599000.00 AS Decimal(18, 2)))
GO
INSERT [dbo].[ChiTietDonHang] ([MaChiTietDH], [MaDonHang], [MaBienThe], [SoLuong], [DonGia]) VALUES (11, 9, 31, 1, CAST(799000.00 AS Decimal(18, 2)))
GO
SET IDENTITY_INSERT [dbo].[ChiTietDonHang] OFF
GO
SET IDENTITY_INSERT [dbo].[ChiTietGioHang] ON 
GO
INSERT [dbo].[ChiTietGioHang] ([MaChiTietGH], [MaGioHang], [MaBienThe], [SoLuong]) VALUES (38, 1, 11, 6)
GO
SET IDENTITY_INSERT [dbo].[ChiTietGioHang] OFF
GO
SET IDENTITY_INSERT [dbo].[DanhGia] ON 
GO
INSERT [dbo].[DanhGia] ([MaDanhGia], [MaSP], [MaNguoiDung], [SoSao], [BinhLuan], [NgayDanhGia]) VALUES (1, 8, 1, 5, N'Áo đẹp, đúng mô tả', CAST(N'2025-12-23T13:26:21.300' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[DanhGia] OFF
GO
SET IDENTITY_INSERT [dbo].[DanhMuc] ON 
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (0, N'Áo', NULL, N'Các loại áo nam thời trang')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (1, N'Quần', NULL, N'Các loại quần nam')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (2, N'Phụ Kiện', NULL, N'Giày, dép, thắt lưng, ví...')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (3, N'Áo Phông', 0, N'Áo phông năng động')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (4, N'Áo Sơ Mi', 0, N'Sơ mi công sở, đi chơi')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (5, N'Áo Thun', 0, N'Áo thun cotton, polo')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (6, N'Áo Khoác', 0, N'Áo khoác gió, bomber')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (7, N'Quần Ngố Bò', 1, N'Short jean, kaki ngố')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (8, N'Quần Jean', 1, N'Jean dài ống suông, slimfit')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (9, N'Giày Dép', 2, N'Sneaker, giày tây')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (10, N'Đồng Hồ', 2, N'Đồng hồ nam')
GO
INSERT [dbo].[DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MaDanhMucCha], [MoTa]) VALUES (11, N'Thắt Lưng', 2, N'Dây nịt da bò')
GO
SET IDENTITY_INSERT [dbo].[DanhMuc] OFF
GO
SET IDENTITY_INSERT [dbo].[DonHang] ON 
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (1, 1, N'Nguyễn Văn Cư', N'a', N'0123456789', CAST(N'2025-12-16T13:57:46.410' AS DateTime), CAST(450000.00 AS Decimal(18, 2)), N'COD', N'Đã hủy', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (2, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-18T15:37:50.500' AS DateTime), CAST(2250000.00 AS Decimal(18, 2)), N'COD', N'Đã hủy', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (3, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-18T15:46:36.187' AS DateTime), CAST(1350000.00 AS Decimal(18, 2)), N'COD', N'Chờ xác nhận', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (4, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-18T15:56:29.760' AS DateTime), CAST(2700000.00 AS Decimal(18, 2)), N'COD', N'Chờ xác nhận', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (5, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-18T15:58:28.140' AS DateTime), CAST(16200000.00 AS Decimal(18, 2)), N'COD', N'Chờ xác nhận', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (6, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-18T16:02:43.870' AS DateTime), CAST(1350000.00 AS Decimal(18, 2)), N'COD', N'Chờ xác nhận', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (7, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-19T10:17:25.313' AS DateTime), CAST(976000.00 AS Decimal(18, 2)), N'COD', N'Hoàn thành', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (8, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-19T10:26:50.080' AS DateTime), CAST(891000.00 AS Decimal(18, 2)), N'COD', N'Đã hủy', NULL)
GO
INSERT [dbo].[DonHang] ([MaDonHang], [MaNguoiDung], [HoTenNguoiNhan], [DiaChiGiaoHang], [SoDienThoaiGiaoHang], [NgayDatHang], [TongTien], [PhuongThucThanhToan], [TrangThai], [MaGiamGia]) VALUES (9, 1, N'Nguyễn Văn C', N'Số nhà X, đường Y, ...', N'097654213', CAST(N'2025-12-19T10:27:50.143' AS DateTime), CAST(2596000.00 AS Decimal(18, 2)), N'COD', N'Hoàn thành', NULL)
GO
SET IDENTITY_INSERT [dbo].[DonHang] OFF
GO
SET IDENTITY_INSERT [dbo].[GioHang] ON 
GO
INSERT [dbo].[GioHang] ([MaGioHang], [MaNguoiDung], [NgayCapNhatCuoi]) VALUES (1, 1, CAST(N'2025-12-16T13:57:04.900' AS DateTime))
GO
INSERT [dbo].[GioHang] ([MaGioHang], [MaNguoiDung], [NgayCapNhatCuoi]) VALUES (2, 3, CAST(N'2025-12-19T00:37:08.170' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[GioHang] OFF
GO
SET IDENTITY_INSERT [dbo].[KichCo] ON 
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (5, N'29')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (6, N'30')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (7, N'31')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (8, N'32')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (9, N'40')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (10, N'41')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (11, N'Freesize')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (3, N'L')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (2, N'M')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (1, N'S')
GO
INSERT [dbo].[KichCo] ([MaKichCo], [TenKichCo]) VALUES (4, N'XL')
GO
SET IDENTITY_INSERT [dbo].[KichCo] OFF
GO
SET IDENTITY_INSERT [dbo].[MaGiamGia] ON 
GO
INSERT [dbo].[MaGiamGia] ([MaCoupon], [Code], [MoTa], [LoaiGiamGia], [GiaTri], [DonHangToiThieu], [NgayBatDau], [NgayKetThuc], [SoLuong]) VALUES (1, N'SALE50', N'Giảm giá 5% cho mọi sản phẩm', N'Percentage', CAST(5.00 AS Decimal(18, 2)), CAST(0.00 AS Decimal(18, 2)), CAST(N'2025-12-23T06:25:00.000' AS DateTime), CAST(N'2026-01-22T06:25:00.000' AS DateTime), 98)
GO
SET IDENTITY_INSERT [dbo].[MaGiamGia] OFF
GO
SET IDENTITY_INSERT [dbo].[MauSac] ON 
GO
INSERT [dbo].[MauSac] ([MaMauSac], [TenMauSac]) VALUES (1, N'Đen')
GO
INSERT [dbo].[MauSac] ([MaMauSac], [TenMauSac]) VALUES (5, N'Nâu')
GO
INSERT [dbo].[MauSac] ([MaMauSac], [TenMauSac]) VALUES (2, N'Trắng')
GO
INSERT [dbo].[MauSac] ([MaMauSac], [TenMauSac]) VALUES (4, N'Xám')
GO
INSERT [dbo].[MauSac] ([MaMauSac], [TenMauSac]) VALUES (6, N'Xanh Dương')
GO
INSERT [dbo].[MauSac] ([MaMauSac], [TenMauSac]) VALUES (7, N'Xanh Lá')
GO
INSERT [dbo].[MauSac] ([MaMauSac], [TenMauSac]) VALUES (3, N'Xanh Navy')
GO
SET IDENTITY_INSERT [dbo].[MauSac] OFF
GO
SET IDENTITY_INSERT [dbo].[NguoiDung] ON 
GO
INSERT [dbo].[NguoiDung] ([MaNguoiDung], [HoTen], [Email], [SoDienThoai], [MatKhau], [VaiTro], [TrangThai], [NgayDangKy]) VALUES (1, N'Nguyễn Văn Cư', N'nguyenvancu@gmail.com', N'0987654321', N'$2b$10$PpcipWRyL0gAE3WAZXvwq.Q4IBJKQj2MMKLf6fn20uYKOruLmYPkK', N'KhachHang', N'HoatDong', CAST(N'2025-12-16T13:57:04.897' AS DateTime))
GO
INSERT [dbo].[NguoiDung] ([MaNguoiDung], [HoTen], [Email], [SoDienThoai], [MatKhau], [VaiTro], [TrangThai], [NgayDangKy]) VALUES (2, N'Super Admin', N'admin@anhmen.store', N'0999999999', N'$2b$10$PpcipWRyL0gAE3WAZXvwq.Q4IBJKQj2MMKLf6fn20uYKOruLmYPkK', N'Admin', N'HoatDong', CAST(N'2025-12-18T15:06:34.637' AS DateTime))
GO
INSERT [dbo].[NguoiDung] ([MaNguoiDung], [HoTen], [Email], [SoDienThoai], [MatKhau], [VaiTro], [TrangThai], [NgayDangKy]) VALUES (3, N'Nguyễn Văn Cưu', N'cudragon2k5@gmail.com', N'0987654321', N'$2b$10$hy1vnEaONor38Xll.3tcGON2iwBLNs8eygVeV6IhNdf/xB.0NPKv6', N'KhachHang', N'HoatDong', CAST(N'2025-12-19T00:37:08.157' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[NguoiDung] OFF
GO
SET IDENTITY_INSERT [dbo].[SanPham] ON 
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (1, N'Áo Sơ Mi Oxford Tay Dài', N'Áo sơ mi chất liệu Oxford thoáng mát, form dáng hiện đại.', 4, N'Đang bán', CAST(N'2025-12-16T13:37:44.957' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (5, N'Áo Thun Nam Cotton 220GSM', N'Áo thun đẹp dành cho Nam', 5, N'Đang bán', CAST(N'2025-12-18T22:20:55.930' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (6, N'Áo Thun Training Hidden Graphic', N'Áo thun Training Hidden Graphic...', 5, N'Đang bán', CAST(N'2025-12-18T22:21:41.830' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (7, N'Áo Phông Regular GRP POWER BANGER', N'Áo phông....', 3, N'Đang bán', CAST(N'2025-12-18T22:22:29.237' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (8, N'Áo Phông Unisex Người Lớn Thêu Họa Tiết Cờ đỏ Sao Vàng', N'Áo phông cờ đỏ Sao Vàng...', 3, N'Đang bán', CAST(N'2025-12-18T22:23:21.623' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (9, N'Áo Sơ Mi Dài Tay Modal Essential', N'Áo sơ mi dài tayy', 4, N'Đang bán', CAST(N'2025-12-18T22:24:25.397' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (10, N'Áo Sơ Mi Nam Casual Kẻ Sọc', N'Áo sơ mi Nam kẻ sọcc', 4, N'Đang bán', CAST(N'2025-12-18T22:25:11.520' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (11, N'Đồng hồ Seiko 5 Sports SRPJ45K1', N'Đồng hồ Seikoo', 10, N'Đang bán', CAST(N'2025-12-18T22:25:56.830' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (12, N'Đồng hồ Titoni Impetus Ceramtech ZrO2', N'Đồng hồ Titoni', 10, N'Đang bán', CAST(N'2025-12-18T22:26:31.920' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (13, N'Dép Da Luca', N'Dép da lucaaa', 9, N'Đang bán', CAST(N'2025-12-18T22:27:17.100' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (14, N'Giày Nam Cao Cấp Da Thật LECOS – LG33', N'Giày nam cao cấp da thật', 9, N'Ngừng bán', CAST(N'2025-12-18T22:28:23.503' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (15, N'Quần Jeans Nam Basics dáng Straight', N'Quần Jeans dáng Straight', 8, N'Ngừng bán', CAST(N'2025-12-18T22:29:26.983' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (16, N'Giày Nam Cao Cấp Da Thật LECOS – LG33', N'Giày Nam Cao Cấp Da Thật LECOS – LG33', 9, N'Đang bán', CAST(N'2025-12-18T22:30:43.477' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (17, N'Quần Jeans Nam Copper Denim Straight', N'Quần Jeans Nam Copper Denim Straighttttttt', 8, N'Đang bán', CAST(N'2025-12-18T22:31:43.390' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (18, N'Quần Ngố Bò Nam Col Cơ Bản', N'Quần Ngố Bò Nam Col Cơ Bảnnnn', 7, N'Đang bán', CAST(N'2025-12-18T22:32:26.823' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (19, N'Quần Ngố Bò Nam Ống Đứng', N'Quần Ngố Bò Nam Ống Đứngggg', 7, N'Đang bán', CAST(N'2025-12-18T22:33:05.323' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (20, N'Thắt lưng nam AnhMen da bò Mill khoá gài bấm', N'Thắt lưng nam AnhMen da bò Mill khoá gài bấmmmm', 11, N'Đang bán', CAST(N'2025-12-18T22:34:07.283' AS DateTime))
GO
INSERT [dbo].[SanPham] ([MaSP], [TenSP], [MoTa], [MaDanhMuc], [TrangThai], [NgayTao]) VALUES (21, N'Thắt lưng nam AnhMen da bò Mill Lau khoá cài bấm giả đầu kim', N'Thắt lưng nam AnhMen da bò Mill Lau khoá cài bấm giả đầu kim', 11, N'Đang bán', CAST(N'2025-12-18T22:34:47.257' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[SanPham] OFF
GO
SET IDENTITY_INSERT [dbo].[SanPham_BienThe] ON 
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (1, 1, 3, 6, CAST(450000.00 AS Decimal(18, 2)), 50, N'asset/ao-so-mi-blue.avif')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (2, 1, 4, 6, CAST(450000.00 AS Decimal(18, 2)), 50, N'asset/ao-so-mi-blue.avif')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (3, 1, 3, 7, CAST(450000.00 AS Decimal(18, 2)), 47, N'asset/ao-so-mi-green.avif')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (4, 1, 4, 7, CAST(450000.00 AS Decimal(18, 2)), 50, N'asset/ao-so-mi-green.avif')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (8, 5, 4, 5, CAST(559000.00 AS Decimal(18, 2)), 35, N'/asset/images-1766071255895-326488498.jpg,/asset/images-1766071255897-751760985.jpg,/asset/images-1766071255897-946812198.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (9, 6, 1, 6, CAST(469000.00 AS Decimal(18, 2)), 53, N'/asset/images-1766071301810-921956285.jpg,/asset/images-1766071301811-287305873.jpg,/asset/images-1766071301811-621186403.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (10, 7, 3, 1, CAST(499000.00 AS Decimal(18, 2)), 40, N'/asset/images-1766071349215-567706261.jpg,/asset/images-1766071349215-445795356.jpg,/asset/images-1766071349218-554245523.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (11, 8, 4, 2, CAST(488000.00 AS Decimal(18, 2)), 43, N'/asset/images-1766071401605-605585145.jpg,/asset/images-1766071401605-678117482.jpg,/asset/images-1766071401606-34835725.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (12, 9, 1, 4, CAST(456000.00 AS Decimal(18, 2)), 45, N'/asset/images-1766071465371-924310838.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (13, 9, 4, 4, CAST(465000.00 AS Decimal(18, 2)), 64, N'/asset/images-1766071465378-659994757.jpg,/asset/images-1766071465378-999905793.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (14, 10, 4, 3, CAST(435000.00 AS Decimal(18, 2)), 24, N'/asset/images-1766071511501-199607896.jpg,/asset/images-1766071511502-644876410.jpg,/asset/images-1766071511502-513419280.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (15, 11, 11, 2, CAST(5499000.00 AS Decimal(18, 2)), 25, N'/asset/images-1766071556808-314901646.jpg,/asset/images-1766071556808-255930254.jpg,/asset/images-1766071556811-870018579.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (16, 12, 11, 6, CAST(119000000.00 AS Decimal(18, 2)), 14, N'/asset/images-1766071591900-733475464.jpg,/asset/images-1766071591900-36757043.jpg,/asset/images-1766071591901-80785829.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (17, 13, 8, 1, CAST(199000.00 AS Decimal(18, 2)), 42, N'/asset/images-1766071637081-451005272.jpg,/asset/images-1766071637081-542521706.jpg,/asset/images-1766071637081-943425182.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (18, 14, 10, 2, CAST(2989000.00 AS Decimal(18, 2)), 13, N'/asset/images-1766071703471-818687161.jpg,/asset/images-1766071703472-475240988.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (19, 14, 9, 1, CAST(2999000.00 AS Decimal(18, 2)), 16, N'/asset/images-1766071703480-648779160.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (20, 15, 2, 3, CAST(599000.00 AS Decimal(18, 2)), 31, N'/asset/images-1766071766957-32375675.jpg,/asset/images-1766071766957-967596811.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (21, 15, 3, 3, CAST(579000.00 AS Decimal(18, 2)), 27, N'/asset/images-1766071766966-817907117.jpg,/asset/images-1766071766966-344643890.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (22, 16, 9, 2, CAST(2899000.00 AS Decimal(18, 2)), 36, N'/asset/images-1766071843451-473474853.jpg,/asset/images-1766071843452-491110487.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (23, 16, 10, 2, CAST(2999000.00 AS Decimal(18, 2)), 34, N'/asset/images-1766071843459-357017681.jpg,/asset/images-1766071843461-187882434.jpg,/asset/images-1766071843461-555895435.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (24, 17, 2, 5, CAST(789000.00 AS Decimal(18, 2)), 32, N'/asset/images-1766071903350-375573977.jpg,/asset/images-1766071903351-225411635.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (25, 17, 3, 1, CAST(819000.00 AS Decimal(18, 2)), 30, N'/asset/images-1766071903360-432219412.jpg,/asset/images-1766071903360-897402012.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (26, 17, 4, 1, CAST(759000.00 AS Decimal(18, 2)), 31, N'/asset/images-1766071903368-965409933.jpg,/asset/images-1766071903368-991429321.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (27, 18, 4, 6, CAST(289000.00 AS Decimal(18, 2)), 26, N'/asset/images-1766071946779-978865616.jpg,/asset/images-1766071946780-891354905.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (28, 18, 3, 6, CAST(299000.00 AS Decimal(18, 2)), 32, N'/asset/images-1766071946789-378194272.jpg,/asset/images-1766071946790-9050909.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (29, 19, 1, 1, CAST(269000.00 AS Decimal(18, 2)), 23, N'/asset/images-1766071985295-480400812.jpg,/asset/images-1766071985296-637544615.jpg,/asset/images-1766071985296-599627167.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (30, 19, 2, 1, CAST(279000.00 AS Decimal(18, 2)), 42, N'/asset/images-1766071985306-472882064.jpg,/asset/images-1766071985307-287951071.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (31, 20, 11, 5, CAST(799000.00 AS Decimal(18, 2)), 31, N'/asset/images-1766072047266-980383252.jpg,/asset/images-1766072047266-111967646.jpg,/asset/images-1766072047268-207097986.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (32, 21, 11, 5, CAST(899000.00 AS Decimal(18, 2)), 43, N'/asset/images-1766072087237-740054915.jpg,/asset/images-1766072087237-721641086.jpg,/asset/images-1766072087238-935169806.jpg')
GO
INSERT [dbo].[SanPham_BienThe] ([MaBienThe], [MaSP], [MaKichCo], [MaMauSac], [Gia], [SoLuongTon], [HinhAnh]) VALUES (33, 19, 3, 1, CAST(289000.00 AS Decimal(18, 2)), 45, N'/asset/images-1766074991492-95467527.jpg,/asset/images-1766074991493-556796175.jpg')
GO
SET IDENTITY_INSERT [dbo].[SanPham_BienThe] OFF
GO
SET IDENTITY_INSERT [dbo].[SoDiaChi] ON 
GO
INSERT [dbo].[SoDiaChi] ([MaDiaChi], [MaNguoiDung], [HoTenNguoiNhan], [SoDienThoai], [DiaChiChiTiet], [LaMacDinh]) VALUES (1, 1, N'Nguyễn Văn C', N'097654213', N'Số nhà X, đường Y, ...', 1)
GO
SET IDENTITY_INSERT [dbo].[SoDiaChi] OFF
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__BaiViet__EE3CD4C8B7407C6F]    Script Date: 12/23/2025 6:54:20 PM ******/
ALTER TABLE [dbo].[BaiViet] ADD UNIQUE NONCLUSTERED 
(
	[URL_SEO] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__GioHang__C539D763B7D9DB45]    Script Date: 12/23/2025 6:54:20 PM ******/
ALTER TABLE [dbo].[GioHang] ADD UNIQUE NONCLUSTERED 
(
	[MaNguoiDung] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__KichCo__01CD3C21DDF38187]    Script Date: 12/23/2025 6:54:20 PM ******/
ALTER TABLE [dbo].[KichCo] ADD UNIQUE NONCLUSTERED 
(
	[TenKichCo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__MaGiamGi__A25C5AA792477B6A]    Script Date: 12/23/2025 6:54:20 PM ******/
ALTER TABLE [dbo].[MaGiamGia] ADD UNIQUE NONCLUSTERED 
(
	[Code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__MauSac__23D77400E1ABD426]    Script Date: 12/23/2025 6:54:20 PM ******/
ALTER TABLE [dbo].[MauSac] ADD UNIQUE NONCLUSTERED 
(
	[TenMauSac] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__NguoiDun__A9D10534C8F09E9D]    Script Date: 12/23/2025 6:54:20 PM ******/
ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[BaiViet] ADD  DEFAULT (getdate()) FOR [NgayDang]
GO
ALTER TABLE [dbo].[DanhGia] ADD  DEFAULT (getdate()) FOR [NgayDanhGia]
GO
ALTER TABLE [dbo].[DonHang] ADD  DEFAULT (getdate()) FOR [NgayDatHang]
GO
ALTER TABLE [dbo].[DonHang] ADD  DEFAULT (N'Chờ xác nhận') FOR [TrangThai]
GO
ALTER TABLE [dbo].[GioHang] ADD  DEFAULT (getdate()) FOR [NgayCapNhatCuoi]
GO
ALTER TABLE [dbo].[MaGiamGia] ADD  DEFAULT ((0)) FOR [DonHangToiThieu]
GO
ALTER TABLE [dbo].[NguoiDung] ADD  DEFAULT ('KhachHang') FOR [VaiTro]
GO
ALTER TABLE [dbo].[NguoiDung] ADD  DEFAULT ('HoatDong') FOR [TrangThai]
GO
ALTER TABLE [dbo].[NguoiDung] ADD  DEFAULT (getdate()) FOR [NgayDangKy]
GO
ALTER TABLE [dbo].[SanPham] ADD  DEFAULT (N'Đang bán') FOR [TrangThai]
GO
ALTER TABLE [dbo].[SanPham] ADD  DEFAULT (getdate()) FOR [NgayTao]
GO
ALTER TABLE [dbo].[SoDiaChi] ADD  DEFAULT ((0)) FOR [LaMacDinh]
GO
ALTER TABLE [dbo].[BaiViet]  WITH CHECK ADD  CONSTRAINT [FKBaiViet134849] FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NguoiDung] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[BaiViet] CHECK CONSTRAINT [FKBaiViet134849]
GO
ALTER TABLE [dbo].[ChiTietDonHang]  WITH CHECK ADD  CONSTRAINT [FKChiTietDon429678] FOREIGN KEY([MaBienThe])
REFERENCES [dbo].[SanPham_BienThe] ([MaBienThe])
GO
ALTER TABLE [dbo].[ChiTietDonHang] CHECK CONSTRAINT [FKChiTietDon429678]
GO
ALTER TABLE [dbo].[ChiTietDonHang]  WITH CHECK ADD  CONSTRAINT [FKChiTietDon661137] FOREIGN KEY([MaDonHang])
REFERENCES [dbo].[DonHang] ([MaDonHang])
GO
ALTER TABLE [dbo].[ChiTietDonHang] CHECK CONSTRAINT [FKChiTietDon661137]
GO
ALTER TABLE [dbo].[ChiTietGioHang]  WITH CHECK ADD  CONSTRAINT [FKChiTietGio44279] FOREIGN KEY([MaGioHang])
REFERENCES [dbo].[GioHang] ([MaGioHang])
GO
ALTER TABLE [dbo].[ChiTietGioHang] CHECK CONSTRAINT [FKChiTietGio44279]
GO
ALTER TABLE [dbo].[ChiTietGioHang]  WITH CHECK ADD  CONSTRAINT [FKChiTietGio739119] FOREIGN KEY([MaBienThe])
REFERENCES [dbo].[SanPham_BienThe] ([MaBienThe])
GO
ALTER TABLE [dbo].[ChiTietGioHang] CHECK CONSTRAINT [FKChiTietGio739119]
GO
ALTER TABLE [dbo].[DanhGia]  WITH CHECK ADD  CONSTRAINT [FKDanhGia201235] FOREIGN KEY([MaSP])
REFERENCES [dbo].[SanPham] ([MaSP])
GO
ALTER TABLE [dbo].[DanhGia] CHECK CONSTRAINT [FKDanhGia201235]
GO
ALTER TABLE [dbo].[DanhGia]  WITH CHECK ADD  CONSTRAINT [FKDanhGia995566] FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NguoiDung] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[DanhGia] CHECK CONSTRAINT [FKDanhGia995566]
GO
ALTER TABLE [dbo].[DanhMuc]  WITH CHECK ADD  CONSTRAINT [FKDanhMuc972261] FOREIGN KEY([MaDanhMucCha])
REFERENCES [dbo].[DanhMuc] ([MaDanhMuc])
GO
ALTER TABLE [dbo].[DanhMuc] CHECK CONSTRAINT [FKDanhMuc972261]
GO
ALTER TABLE [dbo].[DonHang]  WITH CHECK ADD  CONSTRAINT [FKDonHang875915] FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NguoiDung] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[DonHang] CHECK CONSTRAINT [FKDonHang875915]
GO
ALTER TABLE [dbo].[GioHang]  WITH CHECK ADD  CONSTRAINT [FKGioHang433525] FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NguoiDung] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[GioHang] CHECK CONSTRAINT [FKGioHang433525]
GO
ALTER TABLE [dbo].[SanPham]  WITH CHECK ADD  CONSTRAINT [FKSanPham266652] FOREIGN KEY([MaDanhMuc])
REFERENCES [dbo].[DanhMuc] ([MaDanhMuc])
GO
ALTER TABLE [dbo].[SanPham] CHECK CONSTRAINT [FKSanPham266652]
GO
ALTER TABLE [dbo].[SanPham_BienThe]  WITH CHECK ADD  CONSTRAINT [FKSanPham_Bi107950] FOREIGN KEY([MaSP])
REFERENCES [dbo].[SanPham] ([MaSP])
GO
ALTER TABLE [dbo].[SanPham_BienThe] CHECK CONSTRAINT [FKSanPham_Bi107950]
GO
ALTER TABLE [dbo].[SanPham_BienThe]  WITH CHECK ADD  CONSTRAINT [FKSanPham_Bi690790] FOREIGN KEY([MaMauSac])
REFERENCES [dbo].[MauSac] ([MaMauSac])
GO
ALTER TABLE [dbo].[SanPham_BienThe] CHECK CONSTRAINT [FKSanPham_Bi690790]
GO
ALTER TABLE [dbo].[SanPham_BienThe]  WITH CHECK ADD  CONSTRAINT [FKSanPham_Bi852268] FOREIGN KEY([MaKichCo])
REFERENCES [dbo].[KichCo] ([MaKichCo])
GO
ALTER TABLE [dbo].[SanPham_BienThe] CHECK CONSTRAINT [FKSanPham_Bi852268]
GO
ALTER TABLE [dbo].[SoDiaChi]  WITH CHECK ADD  CONSTRAINT [FKSoDiaChi760163] FOREIGN KEY([MaNguoiDung])
REFERENCES [dbo].[NguoiDung] ([MaNguoiDung])
GO
ALTER TABLE [dbo].[SoDiaChi] CHECK CONSTRAINT [FKSoDiaChi760163]
GO
ALTER TABLE [dbo].[DanhGia]  WITH CHECK ADD CHECK  (([SoSao]>=(1) AND [SoSao]<=(5)))
GO
USE [master]
GO
ALTER DATABASE [AnhMenDB] SET  READ_WRITE 
GO
