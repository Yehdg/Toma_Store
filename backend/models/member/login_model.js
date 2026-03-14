const prisma = require('../prisma_client');
const passwordHelper = require('./password_helper');

module.exports = function memberLogin(memberData) {
    let result = {};
    return new Promise(async (resolve, reject) => {
        try {
            // 先用 email 找到該會員
            const existMember = await prisma.member.findUnique({
                where: {
                    email: memberData.email
                }
            });

            // 🔍 DEBUG: 檢查會員是否存在
            console.log('登入嘗試 - Email:', memberData.email);
            console.log('找到會員:', !!existMember);

            if (!existMember) {
                throw new Error("帳號或密碼錯誤！");
            }

            // 🔍 DEBUG: 檢查密碼比對
            console.log('資料庫密碼長度:', existMember.password?.length);
            console.log('輸入密碼:', memberData.password);

            // 用 bcrypt 比對密碼
            const isPasswordValid = await passwordHelper.comparePassword(
                memberData.password,    // 用戶輸入的原始密碼
                existMember.password    // 資料庫中的加密密碼
            );

            console.log('密碼比對結果:', isPasswordValid);

            if (!isPasswordValid) {
                throw new Error("帳號或密碼錯誤！");
            }

            // 移除密碼後回傳會員資料
            const { password, img, ...memberInfo } = existMember;
            result.status = "登入成功。"
            result.member = memberInfo;
            resolve(result);
        }
        catch (err) {
            console.log(err);
            result.status = "登入失敗。"
            
            if (err.message === "帳號或密碼錯誤！") {
                result.err = err.message;
            } else {
                result.err = "伺服器錯誤，請稍後在試！"
            }
            reject(result);
        }
    })
}