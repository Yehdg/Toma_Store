var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var memberRouter  = require('./routes/member');
var orderRouter  = require('./routes/order');

var cors = require('cors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));  // 🔥 增加JSON payload限制
app.use(express.urlencoded({ extended: false, limit: '10mb' }));  // 🔥 增加URL encoded限制
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 啟用 CORS 並允許 credentials
app.use(cors({
  origin: [
    'https://yehdg.github.io',
    'http://localhost:8080'  // 開發環境
  ],
  credentials: true,                   // 允許傳送 cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']       // 允許前端讀取Set-Cookie header
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/member', memberRouter );
app.use('/api/products', productsRouter);
app.use('/api/orders', orderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
