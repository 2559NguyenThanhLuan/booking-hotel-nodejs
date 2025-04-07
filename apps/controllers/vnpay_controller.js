app.get('/order', (req, res) => {
    res.render('vnpay/order', { title: 'Thanh toán VNPAY', amount: 100000 });
});


app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('vnpay/error', { 
        message: err.message, 
        error: err 
    });
});

app.get('/ipn-success', (req, res) => {
    const obj = { status: 'success', message: 'Payment received' };
    res.render('vnpay/ipn_success', { obj });
});

app.get('/orderlist', (req, res) => {
    res.render('vnpay/orderlist', { title: 'Order List' });
});

app.get('/querydr', (req, res) => {
    res.render('vnpay/querydr', { title: 'Query Transaction' });
});

app.get('/refund', (req, res) => {
    res.render('vnpay/refund', { title: 'Refund Transaction' });
});

app.get('/success', (req, res) => {
    res.render('vnpay/success', { code: "00" }); 
});