<template>
    <div v-if="showModal" class="modal-overlay" @mousedown="closeModal">
        <div class="modal-content" @mousedown.stop>
            <div class="modal-header">
                <h3>註冊會員</h3>
                <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="handleRegister">
                    <div class="form-group">
                        <label for="">名稱：</label>
                        <input
                            v-model="name" 
                            type="text"
                            placeholder="請輸入名稱"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="">信箱：</label>
                        <input
                            v-model="email" 
                            type="email"
                            placeholder="請輸入信箱"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="">密碼：</label>
                        <input
                            v-model="password" 
                            type="password"
                            placeholder="請輸入密碼"
                            required
                        >
                    </div>
                    <button type="submit" class="reg-btn" :disabled="loading">
                        {{ loading ? '註冊中...' : '註冊' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RegisterModal',
    data() {
        return {
            showModal: false,
            name: '',
            email: '',
            password: '',
            loading: false
        }
    },
    methods: {
        closeModal() {
            this.showModal = false;
            this.name = '';
            this.email = '';
            this.password = '';
        },
        openModal() {
            this.showModal = true;
        },
        async handleRegister() {
            try {
                this.loading = true;
                
                console.log('註冊資料:', {
                    name: this.name,
                    email: this.email,
                    password: this.password
                });
                
                const response = await this.axios.post('http://localhost:3000/member/register', {
                    name: this.name,
                    email: this.email,
                    password: this.password
                });
                
                console.log('註冊成功:', response.data);
                
                // 檢查註冊是否成功 - 檢查 controller 層的 status
                if (response.data.status === '註冊成功。') {
                    // 通知父組件註冊成功
                    this.$emit('register-success', {
                        message: response.data.status
                    });
                    
                    // 顯示成功訊息
                    alert(response.data.status || '註冊成功！');
                    
                    // 關閉彈窗
                    this.closeModal();
                } else {
                    // 失敗時，錯誤訊息在 result.err
                    throw new Error(response.data.result?.err || response.data.status || '註冊失敗');
                }
                
            } catch (error) {
                console.error('註冊失敗:', error);
                
                let errorMessage = '註冊失敗，請稍後再試';
                
                if (error.response && error.response.data && error.response.data.result) {
                    errorMessage = error.response.data.result.err || errorMessage;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                alert(errorMessage);
                
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
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

/* 註冊按鈕 */
.reg-btn {
  width: 100%;
  padding: 12px;
  background-color: #6f4dd5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.reg-btn:hover {
  background-color: #3b18c8;
}

.reg-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

</style>