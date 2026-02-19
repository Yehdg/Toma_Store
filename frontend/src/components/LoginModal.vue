<template>
  <!-- 彈窗背景遮罩 -->
  <div v-if="showModal" class="modal-overlay" @mousedown="closeModal">
    
    <!-- 彈窗內容 -->
    <div class="modal-content" @mousedown.stop>
      <div class="modal-header">
        <h3>會員登入</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>電子信箱：</label>
            <input 
              v-model="email" 
              type="email" 
              placeholder="請輸入電子信箱" 
              required
            >
          </div>
          
          <div class="form-group">
            <label>密碼：</label>
            <input 
              v-model="password" 
              type="password" 
              placeholder="請輸入密碼" 
              required
            >
          </div>
          
          <!-- 記住密碼和忘記密碼區域 -->
          <div class="form-options">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                v-model="rememberMe" 
                class="checkbox"
              >
              <span class="checkbox-text">記住帳號</span>
            </label>
            
            <a 
              href="#" 
              class="forgot-password" 
              @click.prevent="handleForgotPassword"
            >
              忘記密碼？
            </a>
          </div>
          
          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginModal',
  data() {
    return {
      showModal: false,  // 控制彈窗顯示/隱藏
      email: '',         // 電子信箱
      password: '',      // 密碼
      loading: false,    // 登入狀態
      rememberMe: false  // 記住密碼選項
    }
  },
  
  methods: {
    // 顯示彈窗
    openModal() {
      this.showModal = true;
      
      // 🔥 只記住帳號，不記住密碼（安全考量）
      const rememberedEmail = localStorage.getItem('remembered-email');
      if (rememberedEmail) {
        this.email = rememberedEmail;
        this.rememberMe = true;
      }
    },
    
    // 關閉彈窗
    closeModal() {
      this.showModal = false
      this.email = ''
      this.password = ''
      this.rememberMe = false
    },
    
    // 處理登入
    async handleLogin() {
      try {
        // 設置載入狀態
        this.loading = true;
        
        console.log('登入資料:', {
          email: this.email,
          password: this.password,
          rememberMe: this.rememberMe
        })
        
        // 發送登入請求到後端（Cookie 會自動設定）
        const response = await this.axios.post('http://localhost:3000/member/login', {
          email: this.email,
          password: this.password
        }, {
          withCredentials: true  // 🔥 重要：允許接收 Cookie
        });
        
        console.log('API 回應:', response.data);
        
        // 檢查登入是否成功
        if (response.data.result.status === '登入成功。') {
          // 🔥 不需要手動保存 token，Cookie 自動處理
          
          // 🔥 只記住帳號，不記住密碼
          if (this.rememberMe) {
            localStorage.setItem('remembered-email', this.email);
            console.log('已記住帳號');
          } else {
            // 如果沒勾選，移除之前記住的帳號
            localStorage.removeItem('remembered-email');
          }
          
          // 通知父組件登入成功
          this.$emit('login-success', {
            message: response.data.result.loginMember
          });
          
          // 顯示成功訊息
          alert(response.data.result.loginMember || '登入成功！');
          
          // 關閉彈窗
          this.closeModal();
          
        } else {
          // 登入失敗
          throw new Error(response.data.result.err || '登入失敗');
        }
        
      } catch (error) {
        console.error('登入失敗:', error);
        
        let errorMessage = '登入失敗，請稍後再試';
        
        if (error.response && error.response.data && error.response.data.result) {
          errorMessage = error.response.data.result.err || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
        
      } finally {
        // 關閉載入狀態
        this.loading = false;
      }
    },
    
    // 處理忘記密碼
    handleForgotPassword() {
      alert('忘記密碼功能尚未實作！\n未來可以開啟重設密碼的modal或跳轉到重設頁面。')
    }
  }
}
</script>

<style scoped>
/* 彈窗背景遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 彈窗主體 */
.modal-content {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: modalShow 0.3s ease-out;
}

/* 彈窗動畫 */
@keyframes modalShow {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 彈窗標題 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-btn:hover {
  color: #666;
}

/* 彈窗內容 */
.modal-body {
  padding: 20px;
}

/* 表單樣式 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

/* 登入按鈕 */
.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.login-btn:hover {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 記住密碼和忘記密碼區域 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
  font-size: 14px;
}

/* 記住密碼 checkbox */
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}

.checkbox {
  margin-right: 6px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-text {
  color: #666;
  font-weight: normal;
}

/* 忘記密碼連結 */
.forgot-password {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>