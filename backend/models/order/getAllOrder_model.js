const prisma = require('../prisma_client');

module.exports = async function getOrders(memberId = null) {
    let result = {};
    try {
        // 建立查詢條件：有 memberId 就過濾，沒有就查全部
        const whereCondition = memberId ? { memberId: memberId } : {};
        
        // 查詢訂單，並包含關聯的會員和商品資訊
        const orders = await prisma.orderList.findMany({
            where: whereCondition,
            include: {
                member: true,   // 包含會員資訊（姓名、email等）
                product: true   // 包含商品資訊（名稱、價格等）
            },
            orderBy: {
                orderDate: 'desc'  // 依訂單日期降冪排序（最新的在前）
            }
        });
        
        result.status = "取得訂單資料成功。";
        result.orders = orders;
        return result;
    }
    catch (error) {
        console.error('取得訂單失敗:', error);
        result.status = "取得訂單資料失敗。";
        result.err = "伺服器錯誤，請稍後再試！";
        throw result;
    }
}