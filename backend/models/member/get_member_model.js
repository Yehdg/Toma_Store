const prisma = require("../prisma_client");

module.exports = async function getMemberInfo(memberId) {
  try {
    const member = await prisma.member.findUnique({
      where: {
        id: parseInt(memberId)          
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        img: true,
        imgName: true,
        createDate: true,
        updateDate: true
        // 不回傳密碼資訊
      }
    });

    if (!member) {
      throw new Error("會員不存在");
    }

    // 格式化日期
    const formattedMember = {
      ...member,
      createDate: member.createDate.toISOString().split('T')[0], // 只取日期部分
      updateDate: member.updateDate ? member.updateDate.toISOString().split('T')[0] : null
    };

    return {
      status: "success",
      member: formattedMember
    };

  } catch (error) {
    console.error("獲取會員資料失敗:", error);
    throw {
      status: "error",
      message: error.message || "獲取會員資料失敗"
    };
  }
};