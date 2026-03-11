const toRegister = require("../../models/member/register_model");
const toLogin = require("../../models/member/login_model");
const getMemberInfoModel = require("../../models/member/get_member_model");
const getMemberPasswordModel = require("../../models/member/get_member_password_model");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const verifyToken = require("../../models/member/verification_model");
const check = require("../../service/member_check");
const updateMember = require("../../models/member/update_model");
const passwordHelper = require("../../models/member/password_helper");
const fs = require('fs');
const path = require('path');

require("dotenv").config();

module.exports = class Member {
  postRegister(req, res, next) {
    // 定義驗證規則
    const schema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(4).required(),
    });

    // 驗證輸入資料
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.json({
        status: "資料格式錯誤。",
        error: error.details[0].message,
      });
    }

    const memberData = {
      name: value.name,
      email: value.email,
      password: value.password,
      createDate: new Date(),
    };
    toRegister(memberData)
      .then((result) => {
        res.json({
          status: "註冊成功。",
          result: result,
        });
      })
      .catch((err) => {
        res.json({
          status: "註冊失敗。",
          result: err,
        });
      });
  }

  async postLogin(req, res, next) {
    try {
      // 使用 check 檢查必填欄位
      if (
        check.checkEmpty(req.body.email) ||
        check.checkEmpty(req.body.password)
      ) {
        return res.json({
          result: {
            status: "登入失敗。",
            err: "請輸入完整的帳號密碼！",
          },
        });
      }

      // 從請求中取得資料
      const memberData = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await toLogin(memberData);

      // 登入成功，產生 token
      const token = jwt.sign(
        {
          algorithm: "HS256",
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 小時後過期
          data: result.member.id, // 使用登入結果中的會員ID
        },
        process.env.JWT_SECRET
      );

      // 用 httpOnly Cookie（更安全）
      res.cookie('auth-token', token, {
        httpOnly: true,     // JavaScript 無法讀取
        secure: false,      // 本地開發用 false，正式環境改 true
        sameSite: 'lax',    // 防 CSRF 攻擊
        maxAge: 60 * 60 * 1000, // 1 小時（毫秒）
      });

      res.json({
        result: {
          status: "登入成功。",
          loginMember: "歡迎 " + result.member.name + " 的登入！",
        },
      });
    } catch (err) {
      res.json({
        result: {
          status: "登入失敗。",
          err: err.err || "請輸入正確的帳號或密碼。",
        },
      });
    }
  }

  // 🔥 新增：取得會員資料
  async getMemberInfo(req, res, next) {
    try {
      // 從 Cookie 讀取 token
      const token = req.cookies['auth-token'];

      // 檢查 token 是否存在
      if (check.checkEmpty(token)) {
        return res.json({
          result: {
            status: "取得資料失敗。",
            err: "請重新登入！",
          },
        });
      }

      // 驗證 token
      const tokenResult = await verifyToken(token);
      if (tokenResult === false) {
        return res.json({
          result: {
            status: "token錯誤。",
            err: "請重新登入。",
          },
        });
      }

      // 使用 token 中的會員ID 查詢會員資料
      const memberData = await getMemberInfoModel(tokenResult);

      res.json({
        result: {
          status: "取得資料成功。",
          member: memberData.member
        },
      });

    } catch (error) {
      console.error('取得會員資料失敗:', error);
      res.json({
        result: {
          status: "取得資料失敗。",
          err: error.message || "伺服器錯誤",
        },
      });
    }
  }

  async putUpdate(req, res, next) {
    try {
      // 🔥 從 Cookie 讀取 token，不是從 header
      const token = req.cookies["auth-token"];

      // 檢查 token 是否有輸入
      if (check.checkEmpty(token)) {
        return res.json({
          result: {
            status: "更新失敗。",
            err: "請重新登入！",
          },
        });
      }

      const tokenResult = await verifyToken(token);
      if (tokenResult === false) {
        return res.json({
          result: {
            status: "token錯誤。",
            err: "請重新登入。",
          },
        });
      }

      // 從 tokenResult 直接取得會員ID
      const id = tokenResult;

      // 定義驗證規則 - 只處理基本資料更新
      const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        phone: Joi.string().min(4).max(20).optional().allow('')
      });

      // 驗證輸入資料
      const { error, value } = schema.validate(req.body);

      if (error) {
        return res.json({
          result: {
            status: "資料格式錯誤。",
            err: error.details[0].message,
          },
        });
      }

      // 準備更新資料 - 只更新有值的欄位
      const memberUpdateData = {
        name: value.name,
        updateDate: new Date(),
      };

      // 只有當 phone 有提供時才加入更新
      if (value.phone !== undefined) {
        memberUpdateData.phone = value.phone;
      }

      const result = await updateMember(id, memberUpdateData);

      res.json({
        result: {
          status: "更新成功。"
        },
      });
    } catch (err) {
      console.log(err);
      res.json({
        result: {
          status: "更新失敗。",
          err: "伺服器錯誤，請稍後再試！",
        },
      });
    }
  }

  async putUpdatePassword(req, res, next) {
    try {
      const token = req.cookies['auth-token'];
      
      // 檢查 token 是否有輸入
      if (check.checkEmpty(token)) {
        return res.json({
          result: {
            status: "更新失敗。",
            err: "請重新登入！",
          },
        });
      }

      const tokenResult = await verifyToken(token);
      if (tokenResult === false) {
        return res.json({
          result: {
            status: "token錯誤。",
            err: "請重新登入。",
          },
        });
      }

      // 從 tokenResult 直接取得會員ID
      const id = tokenResult;

      // 定義驗證規則 - 密碼變更需要舊密碼和新密碼
      const schema = Joi.object({
        oldPassword: Joi.string().min(4).required(),
        newPassword: Joi.string().min(4).required(),
      });

      // 驗證輸入資料
      const { error, value } = schema.validate(req.body);

      if (error) {
        return res.json({
          result: {
            status: "資料格式錯誤。",
            err: error.details[0].message,
          },
        });
      }

      // 1. 取得會員密碼資料以驗證舊密碼
      const memberPasswordData = await getMemberPasswordModel(id);
      
      // 2. 驗證舊密碼是否正確
      const isOldPasswordValid = await passwordHelper.comparePassword(
        value.oldPassword, 
        memberPasswordData.member.password
      );

      if (!isOldPasswordValid) {
        return res.json({
          result: {
            status: "密碼更新失敗。",
            err: "舊密碼輸入錯誤！",
          },
        });
      }

      // 3. 新密碼加密
      const hashedNewPassword = await passwordHelper.hashPassword(value.newPassword);

      // 4. 準備更新資料
      const memberUpdateData = {
        password: hashedNewPassword, // 正確的欄位名稱
        updateDate: new Date(),
      };
      
      const result = await updateMember(id, memberUpdateData);

      res.json({
        result: {
          status: "密碼更新成功。",
          message: "請重新登入使用新密碼！"
        },
      });
    } catch (err) {
      console.log('putUpdatePassword 錯誤詳情:', err);
      console.log('錯誤堆疊:', err.stack);
      res.json({
        result: {
          status: "更新失敗。",
          err: "伺服器錯誤，請稍後再試！",
        },
      });
    }
  }
  
  async putUpdateImage(req, res, next) {
    try {
      // 🔥 從 Cookie 讀取 token
      const token = req.cookies['auth-token'];
      // 檢查 token 是否有輸入
      if (check.checkEmpty(token)) {
        return res.json({
          result: {
            status: "更新失敗。",
            err: "請輸入token！",
          },
        });
      }
      const tokenResult = await verifyToken(token);
      if (tokenResult === false) {
        return res.json({
          result: {
            status: "token錯誤。",
            err: "請重新登入。",
          },
        });
      }
      
      const memberId = tokenResult;
      if (!req.file) {
        return res.json({
          result: {
            status: "更新失敗。",
            err: "請上傳圖片！",
          },
        });
      }
      
      // 1. 先取得會員目前的頭像資訊，準備刪除舊檔案
      const prisma = require("../../models/prisma_client");
      const currentMember = await prisma.member.findUnique({
        where: { id: parseInt(memberId) }
      });
      
      // 2. 準備新檔案資訊
      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const uniqueFileName = req.file.filename; // 系統生成的唯一檔名
      
      const updateData = {
        img: String(avatarPath),
        imgName: String(uniqueFileName), // 儲存唯一檔名，不是原始檔名
        updateDate: new Date()
      }
      
      // 3. 更新資料庫
      const result = await updateMember(memberId, updateData);
      
      // 4. 刪除舊檔案（如果存在且不是預設值）
      if (currentMember && currentMember.imgName && currentMember.imgName !== uniqueFileName) {
        const oldFilePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'avatars', currentMember.imgName);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`已刪除舊檔案: ${currentMember.imgName}`);
          } else {
            console.log(`舊檔案不存在: ${oldFilePath}`);
          }
        } catch (deleteError) {
          console.log(`刪除舊檔案失敗: ${deleteError.message}`);
          // 不中斷流程，檔案刪除失敗不影響功能
        }
      }
      
      res.json({
        result: {
          status: "頭像上傳成功。",
          avatarURL: avatarPath,
          fileName: uniqueFileName
        }
      });
    }
    catch (err) {
      console.log(err);
        res.json({
            result: {
                status: "上傳失敗。",
                err: "系統錯誤，請稍後再試！"
            }
        });
    }
  }

  // 驗證登入狀態
  async getVerify(req, res, next) {
    try {
      const token = req.cookies['auth-token'];
      
      if (!token) {
        return res.json({
          result: { status: 'invalid', err: '未登入' }
        });
      }
      
      const tokenResult = await verifyToken(token);
      
      if (tokenResult === false) {
        return res.json({
          result: { status: 'invalid', err: 'Token已過期' }
        });
      }
      
      res.json({
        result: { status: 'valid', memberId: tokenResult }
      });
      
    } catch (error) {
      res.json({
        result: { status: 'invalid', err: '驗證失敗' }
      });
    }
  }

  // 登出
  postLogout(req, res, next) {
    // 清除 Cookie
    res.clearCookie('auth-token');
    res.json({
      result: {
        status: "登出成功。",
        message: "已安全登出"
      }
    });
  }
};
