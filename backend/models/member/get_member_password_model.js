const prisma = require("../prisma_client");

/**
 * 專門用於密碼驗證的會員資料查詢
 * 注意：此函數會返回密碼，僅用於密碼比對，請勿在其他地方使用
 */
module.exports = async function getMemberPassword(memberId) {
  try {
    const member = await prisma.member.findUnique({
      where: {
        id: parseInt(memberId)          
      },
      select: {
        id: true,
        password: true  // 只取得ID和密碼用於驗證
      }
    });

    if (!member) {
      throw new Error("會員不存在");
    }

    return {
      status: "success",
      member: member
    };

  } catch (error) {
    console.error("獲取會員密碼資料失敗:", error);
    throw {
      status: "error",
      message: error.message || "獲取會員密碼資料失敗"
    };
  }
};