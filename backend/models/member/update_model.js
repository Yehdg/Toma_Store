const prisma = require('../prisma_client');

module.exports = function memberEdit(id, memberUpdateData) {
    let result = {};
    return new Promise(async (resolve, reject) => {
        try {
            // 檢查會員是否存在
            const existingMember = await prisma.member.findUnique({
                where: {
                    id: parseInt(id)
                }
            });

            if (!existingMember) {
                result.status = "會員資料更新失敗。"
                result.err = "找不到該會員！"
                reject(result);
                return;
            }

            // 更新會員資料
            console.log('Update data:', JSON.stringify(memberUpdateData, null, 2)); // 除錯用
            
            const updatedMember = await prisma.member.update({
                where: {
                    id: parseInt(id)
                },
                data: memberUpdateData
            });

            result.status = "會員資料更新成功。"
            result.memberUpdateData = memberUpdateData;
            resolve(result);
        } catch (err) {
            console.log('Update error:', err);
            if (err.code === 'P2032') {
                console.log('Data type error - check field types');
                console.log('Problematic data:', memberUpdateData);
            }
            result.status = "會員資料更新失敗。"
            result.err = "伺服器錯誤，請稍後在試！"
            reject(result);
        }
    });
}