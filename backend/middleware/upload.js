const multer = require('multer');
const path = require('path');

// 記憶體儲存，避免檔案系統問題
const storage = multer.memoryStorage();

// 檔案格式過濾器
const fileFilter = (req, file, cb) => {
    // 只允許圖片格式
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
    
    //提取附檔名，並轉成小寫
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);  // 接受檔案
    } else {
        cb(new Error('只能上傳圖片檔案 (JPEG, JPG, PNG, GIF)！'), false);  // 拒絕檔案
    }
};

// Multer 設定
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024  // 提高到 5MB
    },
    fileFilter: fileFilter
});

module.exports = upload;