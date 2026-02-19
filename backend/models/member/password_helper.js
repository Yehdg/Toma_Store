const bcrypt = require('bcryptjs');

/**
 * 密碼加密工具函數
 */
module.exports = {
    /**
     * 密碼加密 (加鹽雜湊)
     * @param {string} password - 原始密碼
     * @returns {Promise<string>} 加密後的密碼
     */
    async hashPassword(password) {
        try {
            // 生成鹽值，複雜度為 12 (推薦值)
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            return hashedPassword;
        } catch (error) {
            throw new Error('密碼加密失敗: ' + error.message);
        }
    },

    /**
     * 驗證密碼
     * @param {string} password - 原始密碼
     * @param {string} hashedPassword - 加密後的密碼
     * @returns {Promise<boolean>} 密碼是否正確
     */
    async comparePassword(password, hashedPassword) {
        try {
            const isMatch = await bcrypt.compare(password, hashedPassword);
            return isMatch;
        } catch (error) {
            throw new Error('密碼驗證失敗: ' + error.message);
        }
    }
};