var express = require('express');
var router = express.Router();
const upload = require('../middleware/upload');

const MemberModifyMethod = require('../controllers/member/modify_controller');
const memberModify = new MemberModifyMethod();

router.post('/register', memberModify.postRegister.bind(memberModify));

router.post('/login', memberModify.postLogin.bind(memberModify));

// 🔥 新增：取得會員資料的路由
router.get('/', memberModify.getMemberInfo.bind(memberModify));

// 🔥 登出路由
router.post('/logout', memberModify.postLogout.bind(memberModify));

// 🔥 驗證路由
router.get('/verify', memberModify.getVerify.bind(memberModify));

router.put('/update', memberModify.putUpdate.bind(memberModify));
router.put('/update-password', memberModify.putUpdatePassword.bind(memberModify));

router.post('/update-avatar', upload.single('avatar'), memberModify.putUpdateImage.bind(memberModify));

module.exports = router;