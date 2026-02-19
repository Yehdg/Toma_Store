const getAllOrdersModel = require('../../models/order/getAllOrder_model');
const verifyToken = require('../../models/member/verification_model');

module.exports = class GetOrder  {
    // 查詢所有訂單
    async getAllOrders(req, res, next) {
        try {
            const result = await getAllOrdersModel();
            res.json(result);
        } catch (error) {
            console.error('查詢所有訂單失敗:', error);
            res.status(500).json(error);
        }
    }

    // 查詢當前會員的訂單（會員用）
    async getMemberOrders(req, res, next) {
        try {
            // 從 cookie 取得 token
            const token = req.cookies['auth-token'];
            
            if (!token) {
                return res.json({
                    result: {
                        status: "查詢失敗。",
                        err: "請先登入！"
                    }
                });
            }

            // 驗證 token 並取得會員 ID
            const memberId = await verifyToken(token);
            
            if (memberId === false) {
                return res.json({
                    result: {
                        status: "查詢失敗。",
                        err: "請重新登入！"
                    }
                });
            }

            // 傳入 memberId，Model 會用 where 過濾
            const result = await getAllOrdersModel(memberId);
            res.json(result);

        } catch (error) {
            console.error('查詢會員訂單失敗:', error);
            res.status(500).json(error);
        }
    }
}
