var express = require('express');
var router = express.Router();

// 引用 Controller，不是直接引用 Model
const ProductControllerMethod = require('../controllers/product/get_controller');
const productController = new ProductControllerMethod();

//取得所有商品
router.get('/', productController.getAllProducts.bind(productController));

module.exports = router;