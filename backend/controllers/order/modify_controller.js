const orderProductListData  = require('../../models/order/order_model');
const check = require("../../service/member_check");
const verifyToken = require("../../models/member/verification_model");

module.exports = class ModifyOrder {
    async postOrderAllProduct(req, res, next) {
        try {
            const token = req.cookies['auth-token'];
        
            // 檢查 token 是否有輸入
            if (check.checkEmpty(token)) {
                return res.json({
                result: {
                    status: "更新失敗。",
                    err: "請重新登入！",
                },
                });
            }

            const tokenResult = await verifyToken(token);
            if (tokenResult === false) {
                return res.json({
                result: {
                    status: "token錯誤。",
                    err: "請重新登入。",
                },
                });
            }

            const id = tokenResult;
            const orderList = {
                memberID: id,
                productID: req.body.productID,
                quantity: req.body.quantity,
                orderDate: new Date()
            }
            const result = await orderProductListData(orderList);
            res.json({
                result:{
                    status: "訂單已成功建立。",
                    data: result
                }
            });
        } catch (error) {
            console.error('Controller 錯誤:', error);
            res.json({
                result:{
                    status: "建立訂單失敗。",
                    err: error.message || error,
                    details: error
                }
            });
        }
    }
}