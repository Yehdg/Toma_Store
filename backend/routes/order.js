var express = require('express');
var router = express.Router();

const OrderModifyMethod = require('../controllers/order/modify_controller');
const GetOrderMethod = require('../controllers/order/get_controller');

const orderModify = new OrderModifyMethod();
const getOrder  = new GetOrderMethod();

// 建立訂單
router.post('/', orderModify.postOrderAllProduct.bind(orderModify));

// 查詢當前會員的訂單
router.get('/member', getOrder.getMemberOrders.bind(getOrder));

// 查詢所有訂單（管理員用）
router.get('/all', getOrder.getAllOrders.bind(getOrder));

module.exports = router;