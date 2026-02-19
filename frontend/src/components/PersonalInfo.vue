<template>
  <div class="personal-info">
    <h2>個人資料</h2>
    <div class="info-form">
      <div class="form-group avatar-group">
        <div class="avatar-container">
          <img 
            :src="userInfo.picture || defaultAvatar" 
            @error="handleImageError"
            class="avatar-image" 
          >
          <div v-if="editMode" class="avatar-upload">
            <input 
              type="file" 
              @change="handleImageUpload"
              accept="image/*"
              class="file-input"
              id="avatar-upload"
              ref="fileInput"
            >
            <button type="button" @click="$refs.fileInput.click()" class="upload-btn">
              變更頭貼
            </button>
          </div>
        </div>
      </div>
    
      <div class="form-group">
        <label>帳號名稱：</label>
        <input v-model="userInfo.name" type="text" :readonly="!editMode">
      </div>
    
      <div class="form-group">
        <label>電子信箱：</label>
        <input v-model="userInfo.email" type="email" readonly>
      </div>

      <div class="form-group">
        <label>手機號碼：</label>
        <input v-model="userInfo.phone" type="text" :readonly="!editMode">
      </div>

      <div class="form-group">
        <label>註冊日期：</label>
        <input v-model="userInfo.createDate" type="text" readonly>
      </div>
      
      <div class="buttons">
        <button class="edit-btn" @click="toggleEditMode">
          {{ editMode ? '取消編輯' : '編輯資料' }}
        </button>
        <button v-if="editMode" class="save-btn" @click="saveUserInfo">
          儲存修改
        </button>
        <button v-if="!editMode" class="changpassword-btn" @click="changePassword">
          修改密碼
        </button>
      </div>
    </div>
    <ChangePasswordModal ref="changePasswordModal" @changePassword-success="handleChangePasswordSuccess" />
  </div>
</template>

<script>
import ChangePasswordModal from './ChangePassword.vue';

export default {
  components: {
    ChangePasswordModal
  },
  name: 'PersonalInfo',
  data() {
    return {
      editMode: false,
      defaultAvatar: '',
      selectedFile: null, // 🔥 新增：儲存選中的檔案
      userInfo: {
        name: 'Loading....',
        email: 'Loading.....',
        phone: 'Loading......',
        createDate: 'Loading.......',
        picture: null
      }
    }
  },
  
  mounted() {
    this.loadUserInfo();
  },
  
  methods: {
    // 載入用戶資料
    async loadUserInfo() {
      try {
        // 🔥 調用後端 API 獲取會員資料
        const response = await this.axios.get('http://localhost:3000/member');
        
        if (response.data.result.status === '取得資料成功。') {
          const memberData = response.data.result.member;
          
          // 更新用戶資料
          this.userInfo = {
            name: memberData.name,
            email: memberData.email,
            phone: memberData.phone || '尚未設定',  // 如果沒有電話資料
            createDate: memberData.createDate,
            picture: memberData.img ? `http://localhost:3000${memberData.img}` : null
          };
          
          console.log('用戶資料載入成功:', this.userInfo);
        } else {
          throw new Error(response.data.result.err || '載入失敗');
        }
        
      } catch (error) {
        console.error('載入用戶資料失敗:', error);
      }
    },
    
    // 處理圖片上傳（只做預覽，不上傳）
    handleImageUpload(event) {
      const file = event.target.files[0];
      
      if (file) {
        console.log('選擇的檔案:', file);
        
        // 儲存檔案供稍後上傳
        this.selectedFile = file;
        
        // 顯示預覽
        const reader = new FileReader();
        reader.onload = (e) => {
          this.userInfo.picture = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    
    // 處理圖片載入錯誤
    handleImageError() {
      console.log('圖片載入失敗，使用預設頭貼');
      this.userInfo.picture = null;
    },
    
    // 切換編輯模式
    toggleEditMode() {
      // 如果目前是編輯模式，要切換到非編輯模式（取消編輯）
      if (this.editMode && this.selectedFile) {
        // 取消編輯時恢復原始頭像
        this.selectedFile = null;
        this.loadUserInfo(); // 重新載入原始頭像和資料
      }
      
      // 切換編輯模式
      this.editMode = !this.editMode;
    },
    
    // 儲存用戶資料
    async saveUserInfo() {
      try {
        // 1. 先更新基本資料
        const response = await this.axios.put('http://localhost:3000/member/update', {
          name: this.userInfo.name,
          phone: this.userInfo.phone
        }, {
          withCredentials: true
        });
        
        if (response.data.result.status !== '更新成功。') {
          throw new Error(response.data.result.err || '更新失敗');
        }
        
        // 2. 如果有選擇新頭像，再上傳
        if (this.selectedFile) {
          const formData = new FormData();
          formData.append('avatar', this.selectedFile);
          
          const avatarResponse = await this.axios.post('http://localhost:3000/member/update-avatar', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true
          });
          
          if (avatarResponse.data.result.status === '頭像上傳成功。') {
            // 更新頭像為伺服器路徑
            this.userInfo.picture = `http://localhost:3000${avatarResponse.data.result.avatarURL}`;
            this.selectedFile = null; // 清除選中的檔案
          } else {
            throw new Error(avatarResponse.data.result.err || '頭像上傳失敗');
          }
        }
        
        
        
      } catch (error) {
        console.error('更新用戶資料失敗:', error);
        alert('更新資料失敗：' + (error.response?.data?.result?.err || error.message));
      } finally {
        this.editMode = false;
      }
    },
    async changePassword() {
      this.$refs.changePasswordModal.openModal();
    },
    handleChangePasswordSuccess(data) {
      console.log('收到登入成功事件:', data);
    }
  }
}
</script>

<style scoped>
.personal-info {
  padding: 20px;
}

.info-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.form-group label {
  width: 100px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group input[readonly] {
  background-color: #e0dfdf;
  cursor: not-allowed;
}

/* 頭貼相關樣式 */
.avatar-group {
  align-items: flex-start !important;
  justify-content: center;
  flex-direction: column;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ddd;
  background-color: #f8f9fa;
  display: block;
  margin: 0 auto;
}

.avatar-upload {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.upload-btn {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 5px;
}

.upload-btn:hover {
  background-color: #5a6268;
}


.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status.active {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.buttons {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.edit-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.save-btn {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.save-btn:hover {
  background-color: #218838;
}

.changpassword-btn {
  padding: 10px 20px;
  background-color: #a54949;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.changpassword-btn:hover {
  background-color: #622929;
}
</style>