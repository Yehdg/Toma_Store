const multer = require('multer');
const path = require('path');

// 儲存設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 會員頭像儲存路徑
        cb(null, 'public/uploads/avatars/');
    },
    filename: (req, file, cb) => {
        // 檔案命名規則：avatar-時間戳-隨機數.副檔名
        const uniqueName = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

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
        fileSize: 5 * 1024 * 1024  // 5MB 檔案大小限制
    },
    fileFilter: fileFilter
});

module.exports = upload;