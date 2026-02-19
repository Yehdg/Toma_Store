const prisma = require('../prisma_client');

module.exports = async function orderListData(orderList) {
    let result = {};

    try {
        // 1. 取得新的訂單ID
        let orderID = await getOrderID() + 1;

        // 2. 解析商品ID和數量
        const products = orderList.productID;
        const productArray = products.split(',');

        const quantitys = orderList.quantity;
        const quantityArray = quantitys.split(',');
        
        // 3. 合併商品ID與數量
        let productQuantity = {};
        for (let i in productArray) {
            productQuantity[productArray[i]] = quantityArray[i];
        }
        
        // 4. 建立所有訂單資料
        let orderAllData = [];
        for (let key in productQuantity) {
            const price = await getProductPrice(parseInt(key));  // 轉為數字
            const orderData = {
                orderId: orderID,             
                memberId: orderList.memberID, 
                productId: parseInt(key),     
                orderQuantity: parseInt(productQuantity[key]),
                orderPrice: parseInt(price) * parseInt(productQuantity[key]),
                orderDate: orderList.orderDate,
                isComplete: 0                 
            };
            // 把 orderData 推入陣列
            orderAllData.push(orderData);
        }
        
        // 5. 批次建立訂單
        const newOrder = await prisma.orderList.createMany({
            data: orderAllData
        });
        
        result.status = "新增訂單資料成功。";
        result.orderCount = newOrder.count;  // createMany 返回的是建立數量
        result.orderData = orderAllData;
        
        return result;
        
    } catch (error) {
        console.error('❌ 建立訂單失敗，詳細錯誤:', error);
        result.status = "新增訂單資料失敗。";
        result.err = error.message || "伺服器錯誤，請稍後再試！";
        result.originalError = error;
        throw result;
    }
}

const getOrderID = async () => {
  try {
    // 使用 aggregate 找最大訂單ID
    const result = await prisma.orderList.aggregate({
      _max: {
        orderId: true
      }
    });
    return result._max.orderId || 0;  // 如果沒有訂單，返回 0
  } catch (error) {
    console.error('獲取最大訂單ID失敗:', error);
    throw error;
  }
}

const getProductPrice = async(productID) => {
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: productID
            }
        }); 
        return product ? product.price : null;
    } catch (error) {
        console.error('獲取產品價格失敗:', error);
        throw error;
    }
}