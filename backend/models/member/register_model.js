const prisma = require('../prisma_client');
const passwordHelper = require('./password_helper');

module.exports = function register(memberData) {
    let result = {};
    return new Promise(async (resolve, reject) => {
        
        try {
            // 檢查是否有重複的信箱
            const existingMember = await prisma.member.findUnique({
                where: {
                    email: memberData.email
                }
            });

            if (existingMember) {
                result.status = "註冊失敗。"
                result.err = "此信箱已經註冊過了！"
                reject(result);
                return;
            }

            // 密碼加密 (加鹽雜湊)
            const hashedPassword = await passwordHelper.hashPassword(memberData.password);
            
            // 準備要寫入資料庫的資料 (將原始密碼替換為加密後的密碼)
            const encryptedMemberData = {
                ...memberData,
                password: hashedPassword
            };

            // 將資料寫入資料庫
            const newMember = await prisma.member.create({
                data: encryptedMemberData
            });
            
            // 回傳註冊的會員資料 (不包含密碼)
            const { password, ...memberInfo } = encryptedMemberData;
            result.registerMember = memberInfo;
            resolve(result);
        } catch (err) {
            console.log(err);
            result.status = "註冊失敗。"
            result.err = "伺服器錯誤，請稍後在試！"
            reject(result);
        }
    });
}
