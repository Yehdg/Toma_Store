<template>
    <div v-if="showModal" class="modal-overlay" @mousedown="OverlayClick">
        <div class="modal-content" @mousedown.stop>
            <div class="modal-header">
                <h3>變更密碼</h3>
                <button class="close-btn" @click="closeModal">&times;</button>
            </div>
            <div class="modal-body">
                <form @submit.prevent="handleChangePassword">
                    <div class="form-group">
                        <label for="">舊密碼：</label>
                        <input
                            v-model="oldPassword" 
                            type="password"
                            placeholder="請輸入舊密碼"
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label for="">新密碼：</label>
                        <input
                            v-model="newPassword" 
                            type="password"
                            placeholder="請輸入密碼"
                            required
                        >
                    </div>
                    <button type="submit" class="reg-btn" :disabled="loading">
                        {{ loading ? '變更中...' : '變更密碼' }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChangePasswordModal',
    data() {
        return {
            showModal: false,
            oldPassword: '',
            newPassword: '',
            loading: false
        }
    },
    methods: {
        closeModal() {
            this.showModal = false;
            this.oldPassword = '';
            this.newPassword = '';
        },
        OverlayClick(event) {
            // 只有當點擊的是 overlay 本身（不是子元素）時才關閉
            if (event.target === event.currentTarget) {
                this.closeModal();
            }
        },
        openModal() {
            this.showModal = true;
        },
        async handleChangePassword() {
            this.loading = true;
            try {
                const response = await this.axios.put('http://localhost:3000/member/update-password', {
                    oldPassword: this.oldPassword,
                    newPassword: this.newPassword
                }, {
                    withCredentials: true
                });
                
                if (response.data.result.status === '密碼更新成功。') {
                    alert('密碼更新成功！請重新登入。');
                    this.closeModal();
                    
                    // 觸發成功事件給父組件
                    this.$emit('changePassword-success', response.data.result);
                    
                    // 可選：自動登出
                    // this.$router.push('/login');
                } else {
                    alert(response.data.result.err || '密碼更新失敗');
                }
                
            } catch (error) {
                console.error('變更密碼失敗:', error);
                alert('密碼更新失敗：' + (error.response?.data?.result?.err || '網路錯誤'));
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