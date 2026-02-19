const prisma = require('../prisma_client');

module.exports = async function getAllProducts() {
    let result = {};
    try {
        const products = await prisma.product.findMany();
        
        result.status = "取得商品資料成功。";
        result.products = products;
        return result;
    }
    catch (error) {
        console.log(error);
        result.status = "取得商品資料失敗。";
        result.err = "伺服器錯誤，請稍後再試！";
        throw result;
    }
}

