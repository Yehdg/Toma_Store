<template>
  <div id="app">
    <nav class="navbar">
      <!-- 左側主選單 -->
      <div class="nav-left">
        <router-link class="nav-link" to="/store">商店首頁</router-link>
        <router-link class="nav-link" to="/about">關於我們</router-link>
      </div>

      <!-- 右側會員區 -->
      <div class="nav-right">
        <button v-if="!isLogined" @click="showRegister" class="auth-btn">註冊</button>
        <span class="Sep" v-if="!isLogined"> | </span>
        <button v-if="!isLogined" @click="showLogin" class="auth-btn">登入</button>
        <template v-if="isLogined">
          <router-link class="nav-link" to="/cart">購物車</router-link>
          <router-link class="nav-link" to="/member" >會員中心</router-link>
          <button @click="logout" class="auth-btn">登出</button>
        </template>
        
      </div>
      <LoginModal ref="loginModal" @login-success="handleLoginSuccess" />
      <RegisterModal ref="registerModal" @register-success="handleRegisterSuccess" />
    </nav>

    <main>
      <router-view/>
    </main>
    <footer>
      
    </footer>
  </div>
</template>

<script>
import LoginModal from './components/LoginModal.vue';
import RegisterModal from './components/RegisterModal.vue';

export default {
  components: {
    LoginModal,
    RegisterModal
  },
  name: 'App',
  data() {
    return {
      isLogined: false,  // 預設為未登入，由created中檢查token決定
      isHandlingTokenExpired: false,  // 防止重複處理 Token 過期
      tokenCheckInterval: null  // 定時檢查 Token 的定時器
    }
  },
  
  created() {
    // 🔥 1. 先設置攔截器（最重要）
    this.setupGlobalTokenHandler();
    
    // 🔥 2. 再檢查登入狀態
    this.verifyLoginStatus();
    
    // 🔥 3. 每 50 秒自動檢查一次 Token 是否過期
    this.tokenCheckInterval = setInterval(() => {
      if (this.isLogined) {
        this.verifyLoginStatus();
      }
    }, 50000); // 50 秒檢查一次
  },
  
  beforeDestroy() {
    // 清除定時器，避免記憶體洩漏
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  },
  methods: {
    // 登出
    async logout() {
      try {
        // await this.axios.post('http://localhost:3000/member/logout', {}, {
        await this.axios.post('https://tomastore-production.up.railway.app/member/logout', {}, {
          withCredentials: true
        });
      } catch (error) {
        // 登出請求失敗，但仍更新前端狀態
      }
      
      // 清除fallback token（無痕模式支援）
      sessionStorage.removeItem('auth-fallback-token');
      
      this.isLogined = false;
      
      if (this.$route.path !== '/store') {
        this.$router.replace('/store');
      }
    },
    
    // 顯示登入彈窗
    showLogin() {
      this.$refs.loginModal.openModal();
    },
    
    // 顯示註冊視窗
    showRegister() {
      this.$refs.registerModal.openModal();
    },
    
    // 處理登入成功事件
    handleLoginSuccess() {
      this.isLogined = true;
    },
    
    // 處理註冊成功事件
    handleRegisterSuccess() {
      // 註冊成功後可以執行其他操作
    },
    
    // 🔥 驗證登入狀態的方法
    async verifyLoginStatus() {
      try {
        //const response = await this.axios.get('http://localhost:3000/member/verify', {
        const response = await this.axios.get('https://tomastore-production.up.railway.app/member/verify', {
          withCredentials: true
        });
        
        if (response.data.result && response.data.result.status === 'valid') {
          this.isLogined = true;
        } else {
          // Token 無效或過期，清除所有認證資料
          sessionStorage.removeItem('auth-fallback-token');
          this.isLogined = false;
        }
      } catch (error) {
        // 請求失敗，清除所有認證資料並設為未登入
        sessionStorage.removeItem('auth-fallback-token');
        this.isLogined = false;
      }
    },
    
    // 🔥 設置全局 Token 過期處理
    setupGlobalTokenHandler() {
      // 保存 Vue 實例引用
      const vm = this;
      
      // 攔截所有 axios 回應，檢查 Token 過期
      this.axios.interceptors.response.use(
        (response) => {
          // 🔥 如果已經在處理或已是未登入狀態，直接返回
          if (vm.isHandlingTokenExpired || !vm.isLogined) {
            return response;
          }
          
          // 檢查正常響應（200）中的錯誤訊息
          const errMsg = response.data?.result?.err;
          if (errMsg === '請重新登入！' || 
              errMsg === '請重新登入。' ||
              errMsg === '未登入' ||
              errMsg === 'Token已過期') {
            
            vm.handleTokenExpired();
          }
          return response;
        },
        (error) => {
          // 🔥 如果已經在處理或已是未登入狀態，直接返回
          if (vm.isHandlingTokenExpired || !vm.isLogined) {
            return Promise.reject(error);
          }
          
          // 檢查 4xx/5xx 錯誤響應中的錯誤訊息
          const errMsg = error.response?.data?.result?.err;
          if (errMsg === '請重新登入！' ||
              errMsg === '請重新登入。' ||
              errMsg === '未登入' ||
              errMsg === 'Token已過期') {
            
            vm.handleTokenExpired();
          }
          return Promise.reject(error);
        }
      );
    },
    
    // 🔥 處理 Token 過期
    handleTokenExpired() {
      // 🔥 立即設置標記（在所有檢查之前）
      if (this.isHandlingTokenExpired) {
        return;
      }
      this.isHandlingTokenExpired = true;
      
      // 防止重複處理 - 如果已經是未登入狀態，直接返回
      if (!this.isLogined) {
        this.isHandlingTokenExpired = false;
        return;
      }
      
      // 🔥 清除fallback token（無痕模式支援）
      sessionStorage.removeItem('auth-fallback-token');
      
      // 更新登入狀態
      this.isLogined = false;
      
      // 只在非商店頁面時才跳轉
      if (this.$route.path !== '/store') {
        this.$router.replace('/store').catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error('路由跳轉失敗:', err);
          }
        });
      }
      
      // 重置標記
      setTimeout(() => {
        this.isHandlingTokenExpired = false;
      }, 3000);
    }
  }
}
</script>

<style>
#app {
  background: linear-gradient(135deg, #dce4ad 0%, #a7d5b2 80%);
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-link {
  padding: 8px 16px;
  text-decoration: none;
  color: white;
  background-color: rgba(248, 227, 227, 0.2);
  border: 1px solid rgba(192, 190, 190, 0.3);
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.762);
  transform: translateY(-2px);
  color : #332727;
}

.auth-btn {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  color: #6666ea;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.auth-btn:hover {
  background-color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.Sep {
  color: rgba(255, 255, 255, 0.7);
  padding: 0 5px;
  font-weight: 300;
}

/* 手機版響應式設計 */
@media screen and (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 15px;
    padding: 15px 15px;
  }
  
  .nav-left, .nav-right {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .nav-link {
    padding: 10px 14px;
    font-size: 14px;
    flex: 1;
    min-width: 100px;
    text-align: center;
  }
  
  .auth-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .Sep {
    display: none;
  }
}

/* 小手機優化 */
@media screen and (max-width: 480px) {
  .nav-link {
    font-size: 13px;
    padding: 8px 10px;
    min-width: 80px;
  }
  
  .auth-btn {
    font-size: 13px;
    padding: 8px 16px;
  }
}
</style>
