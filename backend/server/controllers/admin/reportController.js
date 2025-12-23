const sql = require('mssql');
const dbConfig = require('../../config/dbConfig');

// API lấy dữ liệu báo cáo doanh thu
exports.getRevenue = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        // Validate input
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chỉ định loại báo cáo (type)'
            });
        }

        if (type === 'custom' && (!startDate || !endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn khoảng thời gian (startDate, endDate)'
            });
        }

        const pool = await sql.connect(dbConfig);

        let query = '';
        let params = {};
        let chartData = [];
        let totalRevenue = 0;
        let totalOrders = 0;
        let cancelledOrders = 0;

        // Lấy số đơn hàng bị hủy trong khoảng thời gian
        let cancelledQuery = '';

        switch (type) {
            case 'day': // Doanh thu hôm nay
                query = `
                    SELECT 
                        CONVERT(VARCHAR, NgayDatHang, 23) as Label,
                        SUM(TongTien) as Revenue,
                        COUNT(*) as OrderCount
                    FROM DonHang
                    WHERE TrangThai = N'Hoàn thành'
                        AND CAST(NgayDatHang AS DATE) = CAST(GETDATE() AS DATE)
                    GROUP BY CONVERT(VARCHAR, NgayDatHang, 23)
                `;
                
                cancelledQuery = `
                    SELECT COUNT(*) as CancelledCount
                    FROM DonHang
                    WHERE TrangThai = N'Đã hủy'
                        AND CAST(NgayDatHang AS DATE) = CAST(GETDATE() AS DATE)
                `;
                break;

            case 'week': // Doanh thu tuần này (7 ngày gần nhất)
                query = `
                    SELECT 
                        CONVERT(VARCHAR, NgayDatHang, 23) as Label,
                        SUM(TongTien) as Revenue,
                        COUNT(*) as OrderCount
                    FROM DonHang
                    WHERE TrangThai = N'Hoàn thành'
                        AND NgayDatHang >= DATEADD(DAY, -7, GETDATE())
                    GROUP BY CONVERT(VARCHAR, NgayDatHang, 23)
                    ORDER BY Label
                `;

                cancelledQuery = `
                    SELECT COUNT(*) as CancelledCount
                    FROM DonHang
                    WHERE TrangThai = N'Đã hủy'
                        AND NgayDatHang >= DATEADD(DAY, -7, GETDATE())
                `;
                break;

            case 'month': // Doanh thu tháng này (theo từng ngày)
                query = `
                    SELECT 
                        CONVERT(VARCHAR, NgayDatHang, 23) as Label,
                        SUM(TongTien) as Revenue,
                        COUNT(*) as OrderCount
                    FROM DonHang
                    WHERE TrangThai = N'Hoàn thành'
                        AND MONTH(NgayDatHang) = MONTH(GETDATE())
                        AND YEAR(NgayDatHang) = YEAR(GETDATE())
                    GROUP BY CONVERT(VARCHAR, NgayDatHang, 23)
                    ORDER BY Label
                `;

                cancelledQuery = `
                    SELECT COUNT(*) as CancelledCount
                    FROM DonHang
                    WHERE TrangThai = N'Đã hủy'
                        AND MONTH(NgayDatHang) = MONTH(GETDATE())
                        AND YEAR(NgayDatHang) = YEAR(GETDATE())
                `;
                break;

            case 'quarter': // Doanh thu quý này (theo từng tháng)
                query = `
                    SELECT 
                        CONCAT(N'Tháng ', MONTH(NgayDatHang)) as Label,
                        SUM(TongTien) as Revenue,
                        COUNT(*) as OrderCount
                    FROM DonHang
                    WHERE TrangThai = N'Hoàn thành'
                        AND DATEPART(QUARTER, NgayDatHang) = DATEPART(QUARTER, GETDATE())
                        AND YEAR(NgayDatHang) = YEAR(GETDATE())
                    GROUP BY MONTH(NgayDatHang)
                    ORDER BY MONTH(NgayDatHang)
                `;

                cancelledQuery = `
                    SELECT COUNT(*) as CancelledCount
                    FROM DonHang
                    WHERE TrangThai = N'Đã hủy'
                        AND DATEPART(QUARTER, NgayDatHang) = DATEPART(QUARTER, GETDATE())
                        AND YEAR(NgayDatHang) = YEAR(GETDATE())
                `;
                break;

            case 'year': // Doanh thu năm nay (theo từng tháng)
                query = `
                    SELECT 
                        CONCAT(N'Tháng ', MONTH(NgayDatHang)) as Label,
                        SUM(TongTien) as Revenue,
                        COUNT(*) as OrderCount
                    FROM DonHang
                    WHERE TrangThai = N'Hoàn thành'
                        AND YEAR(NgayDatHang) = YEAR(GETDATE())
                    GROUP BY MONTH(NgayDatHang)
                    ORDER BY MONTH(NgayDatHang)
                `;

                cancelledQuery = `
                    SELECT COUNT(*) as CancelledCount
                    FROM DonHang
                    WHERE TrangThai = N'Đã hủy'
                        AND YEAR(NgayDatHang) = YEAR(GETDATE())
                `;
                break;

            case 'custom': // Tùy chọn khoảng thời gian
                query = `
                    SELECT 
                        CONVERT(VARCHAR, NgayDatHang, 23) as Label,
                        SUM(TongTien) as Revenue,
                        COUNT(*) as OrderCount
                    FROM DonHang
                    WHERE TrangThai = N'Hoàn thành'
                        AND NgayDatHang >= @startDate
                        AND NgayDatHang < DATEADD(DAY, 1, @endDate)
                    GROUP BY CONVERT(VARCHAR, NgayDatHang, 23)
                    ORDER BY Label
                `;

                cancelledQuery = `
                    SELECT COUNT(*) as CancelledCount
                    FROM DonHang
                    WHERE TrangThai = N'Đã hủy'
                        AND NgayDatHang >= @startDate
                        AND NgayDatHang < DATEADD(DAY, 1, @endDate)
                `;

                params = { startDate, endDate };
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Loại báo cáo không hợp lệ'
                });
        }

        // Thực hiện query chính
        const request = pool.request();
        
        if (params.startDate) {
            request.input('startDate', sql.Date, params.startDate);
        }
        if (params.endDate) {
            request.input('endDate', sql.Date, params.endDate);
        }

        const result = await request.query(query);

        // Tính tổng doanh thu và số đơn hàng
        if (result.recordset.length > 0) {
            totalRevenue = result.recordset.reduce((sum, row) => sum + (row.Revenue || 0), 0);
            totalOrders = result.recordset.reduce((sum, row) => sum + (row.OrderCount || 0), 0);
            chartData = result.recordset.map(row => ({
                label: row.Label,
                value: row.Revenue || 0
            }));
        }

        // Lấy số đơn hàng bị hủy
        const cancelledRequest = pool.request();
        if (params.startDate) {
            cancelledRequest.input('startDate', sql.Date, params.startDate);
        }
        if (params.endDate) {
            cancelledRequest.input('endDate', sql.Date, params.endDate);
        }

        const cancelledResult = await cancelledRequest.query(cancelledQuery);
        cancelledOrders = cancelledResult.recordset[0]?.CancelledCount || 0;

        res.json({
            success: true,
            data: {
                totalRevenue: totalRevenue || 0,
                totalOrders: totalOrders || 0,
                cancelledOrders: cancelledOrders || 0,
                chartData: chartData
            }
        });

    } catch (error) {
        console.error('Lỗi khi lấy báo cáo doanh thu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// API lấy chi tiết đơn hàng trong khoảng thời gian
exports.getOrderDetails = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chỉ định loại báo cáo (type)'
            });
        }

        const pool = await sql.connect(dbConfig);

        let query = `
            SELECT 
                dh.MaDonHang,
                dh.NgayDatHang,
                dh.TongTien,
                dh.TrangThai,
                dh.PhuongThucThanhToan,
                nd.HoTen as TenKhachHang
            FROM DonHang dh
            LEFT JOIN NguoiDung nd ON dh.MaNguoiDung = nd.MaNguoiDung
            WHERE 1=1
        `;

        const request = pool.request();
        let params = {};

        switch (type) {
            case 'day':
                query += ` AND CAST(dh.NgayDatHang AS DATE) = CAST(GETDATE() AS DATE)`;
                break;

            case 'week':
                query += ` AND dh.NgayDatHang >= DATEADD(DAY, -7, GETDATE())`;
                break;

            case 'month':
                query += ` AND MONTH(dh.NgayDatHang) = MONTH(GETDATE()) AND YEAR(dh.NgayDatHang) = YEAR(GETDATE())`;
                break;

            case 'quarter':
                query += ` AND DATEPART(QUARTER, dh.NgayDatHang) = DATEPART(QUARTER, GETDATE()) AND YEAR(dh.NgayDatHang) = YEAR(GETDATE())`;
                break;

            case 'year':
                query += ` AND YEAR(dh.NgayDatHang) = YEAR(GETDATE())`;
                break;

            case 'custom':
                if (!startDate || !endDate) {
                    return res.status(400).json({
                        success: false,
                        message: 'Vui lòng chọn khoảng thời gian'
                    });
                }
                query += ` AND dh.NgayDatHang >= @startDate AND dh.NgayDatHang < DATEADD(DAY, 1, @endDate)`;
                request.input('startDate', sql.Date, startDate);
                request.input('endDate', sql.Date, endDate);
                break;
        }

        query += ` ORDER BY dh.NgayDatHang DESC`;

        const result = await request.query(query);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};
