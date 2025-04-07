/**
 * Created by CTT VNPAY
 */

let express = require('express');
let router = express.Router();
let $ = require('jquery');
const request = require('request');
const moment = require('moment');


router.get('/', function (req, res) {
    const q = "SELECT * FROM booking ORDER BY id DESC"; // Fixed SQL syntax
    const userId = 1;
    db.execute(q, [userId], function (err, results) {
        if (err) {
            console.error("Error fetching booking: ", err.message);
            return res.status(500).send("Database error");
        }
        res.render('vnpay/orderlist.ejs', { title: 'Danh sách đơn hàng', bookings: results });
    });
});



router.get('/create_payment_url', function (req, res, next) {
    const { name, phone, email, checkin, checkout, amount } = req.query;

    // Kiểm tra nếu thiếu dữ liệu
    if (!name || !phone || !email || !checkin || !checkout || !amount) {
        return res.status(400).send('Thiếu thông tin cần thiết');
    }

    // Render trang order.ejs với dữ liệu từ query string
    res.render('vnpay/order.ejs', {
        title: 'Tạo mới đơn hàng',
        name,
        phone,
        email,
        checkin,
        checkout,
        amount,
    });
});

router.get('/querydr', function (req, res, next) {
    
    let desc = 'truy van ket qua thanh toan';
    res.render('vnpay/querydr.ejs', {title: 'Truy vấn kết quả thanh toán'})
});

router.get('/refund', function (req, res, next) {
    
    let desc = 'Hoan tien GD thanh toan';
    res.render('vnpay/refund.ejs', {title: 'Hoàn tiền giao dịch thanh toán'})
});

router.post('/create_payment_url', function (req, res) {
    try {
        const { amount, bankCode, language } = req.body;

        // Kiểm tra dữ liệu
        if (!amount || amount <= 0) {
            return res.status(400).send('Số tiền không hợp lệ');
        }

        process.env.TZ = 'Asia/Ho_Chi_Minh';

        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');

        // Sử dụng req.socket thay vì req.connection
        let ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        let config = require('../config/default.json');
        console.log(config.vnp_TmnCode); // Sửa lại để truy cập trực tiếp thuộc tính
        let tmnCode = config.vnp_TmnCode;
        let secretKey = config.vnp_HashSecret;
        let vnpUrl = config.vnp_Url;
        let returnUrl = config.vnp_ReturnUrl;
        let orderId = moment(date).format('DDHHmmss');

        let currLanguage = language || 'vn'; // Nếu không có language, mặc định là 'vn'
        let currCode = 'VND';

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = currLanguage;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // Chuyển đổi sang đơn vị VND
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sắp xếp tham số theo thứ tự alphabet
        vnp_Params = sortObject(vnp_Params);

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);

        // Sử dụng Buffer.from thay vì new Buffer
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;

        // Tạo URL thanh toán
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        // Chuyển hướng người dùng đến cổng thanh toán
        res.redirect(vnpUrl);
    } catch (error) {
        console.error('Lỗi xảy ra:', error.message);
        res.status(500).send('Đã xảy ra lỗi trong quá trình xử lý');
    }
});

const db = require('../database/db_config'); // Đường dẫn đến file kết nối MySQL

router.get('/vnpay_return', async function (req, res) {
    try {
        let vnp_Params = req.query;

        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        let config = require('../config/default.json');
        let secretKey = config.vnp_HashSecret;

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            if (vnp_Params['vnp_ResponseCode'] === '00') {
                const orderId = vnp_Params['vnp_TxnRef'];
                const amount = parseInt(vnp_Params['vnp_Amount']) / 100; 
                const orderInfo = vnp_Params['vnp_OrderInfo'];
                const transactionNo = vnp_Params['vnp_TransactionNo'];
                const bankCode = vnp_Params['vnp_BankCode'];
                const payDate = moment(vnp_Params['vnp_PayDate'], 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss');
                const status = 'success';
                const userId = 1;
                const note = 'Thanh toán thành công';
                const roomId = 1; 
                const checkIn = '2025-04-10';
                const checkOut = '2025-04-15'; 

                
                await db.execute(
                    `INSERT INTO booking (order_id, amount, order_info, transaction_no, bank_code, pay_date, status, user_id, note, room_id, check_in, check_out) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, amount, orderInfo, transactionNo, bankCode, payDate, status, userId, note, roomId, checkIn, checkOut]
                );

                // Hiển thị thông báo thành công
                return res.render('vnpay/success.ejs', { code: '00' });
            } else {
                // Giao dịch thất bại
                return res.render('vnpay/success.ejs', { code: vnp_Params['vnp_ResponseCode'] });
            }
        } else {
            // Sai chữ ký
            return res.render('vnpay/success.ejs', { code: '97' });
        }
    } catch (error) {
        console.error('Lỗi xảy ra:', error.message);
        res.status(500).send('Đã xảy ra lỗi trong quá trình xử lý');
    }
});

router.get('/vnpay_ipn', function (req, res, next) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let config = require('config');
    let secretKey = config.get('vnp_HashSecret');
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
    
    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó
    
    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if(secureHash === signed){ //kiểm tra checksum
        if(checkOrderId){
            if(checkAmount){
                if(paymentStatus=="0"){ //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    if(rspCode=="00"){
                        //thanh cong
                        //paymentStatus = '1'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                    else {
                        //that bai
                        //paymentStatus = '2'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                        res.status(200).json({RspCode: '00', Message: 'Success'})
                    }
                }
                else{
                    res.status(200).json({RspCode: '02', Message: 'This order has been updated to the payment status'})
                }
            }
            else{
                res.status(200).json({RspCode: '04', Message: 'Amount invalid'})
            }
        }       
        else {
            res.status(200).json({RspCode: '01', Message: 'Order not found'})
        }
    }
    else {
        res.status(200).json({RspCode: '97', Message: 'Checksum failed'})
    }
});

router.post('/querydr', function (req, res, next) {
    
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let config = require('config');
    let crypto = require("crypto");
    
    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');
    
    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    
    let vnp_RequestId =moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'querydr';
    let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;
    
    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let currCode = 'VND';
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    
    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
    
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex"); 
    
    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    // /merchant_webapi/api/transaction
    request({
        url: vnp_Api,
        method: "POST",
        json: true,   
        body: dataObj
            }, function (error, response, body){
                console.log(response);
            });

});

router.post('/refund', function (req, res, next) {
    
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let config = require('config');
    let crypto = require("crypto");
   
    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');
    
    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    let vnp_Amount = req.body.amount;
    let vnp_TransactionType = req.body.transType;
    let vnp_CreateBy = req.body.user;
            
    let currCode = 'VND';
    
    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'refund';
    let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;
            
    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');
    
    let vnp_TransactionNo = '0';
    
    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");
    
     let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionNo': vnp_TransactionNo,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    
    request({
        url: vnp_Api,
        method: "POST",
        json: true,   
        body: dataObj
            }, function (error, response, body){
                console.log(response);
            });
    
});

function sortObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be a non-null object');
    }

    let sorted = {};
    let keys = Object.keys(obj).sort(); // Lấy danh sách các key và sắp xếp theo thứ tự alphabet

    keys.forEach((key) => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
    });

    return sorted;
}

module.exports = router;