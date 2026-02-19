<template>
  <div class="container">
    <div class="left-content">
      <div class="account">
        <router-link 
          to="/member/personalinfo" 
          class="nav-link"
          active-class="active"
        >
          個人資料
        </router-link>
      </div>
      <div class="purchase">
        <router-link 
          to="/member/purchasehistory" 
          class="nav-link"
          active-class="active"
        >
          購買紀錄
        </router-link>
      </div>
    </div>
    <div class="right-content">
      <router-view>
        <div class="loading">載入中......</div>
      </router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TomaMember'
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
  gap: 50px;
  padding: 20px;
}
/* 左側選單區 */
.left-content {
  width: 180px;
  flex-shrink: 0;
  padding: 20px;
}
.left-content > div {
  margin-bottom: 30px;
}
.nav-link {
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  color: #333;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
  text-align: center;
}
.nav-link:hover,
.nav-link.active {
  background: linear-gradient(110deg, #6fd1f5 0%, #4b8ef9 80%);
  color: rgb(255, 255, 255);
  border-color: #96c4f5;
}


/* 右側主內容區 */
.right-content {
  flex: 1;
  background-color: rgb(244, 233, 233);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 載入中樣式 */
.loading {
  text-align: center;
  padding: 50px 20px;
  color: #666;
  font-size: 16px;
}

@media screen and (max-width: 750px) {
  .container {
    flex-direction: column;
    gap: 8px;
    margin-top: 0px;
  }
  .left-content {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px;
    gap: 15px;
  }
  
  /* 讓按鈕區域平均分配寬度 */
  .left-content > div {
    flex: 1;
    margin-bottom: 0;
  }
  
  /* 讓連結填滿父容器 */
  .left-content .nav-link {
    width: 100%;
  }
  
  .right-content {
    padding: 10px;
  }
}

</style>
