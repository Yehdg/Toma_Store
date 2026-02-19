<template>
  <div class="welcome">
    <h2>會員中心</h2>
    <p>歡迎來到會員中心！在左邊導覽列，您可以查看和管理您的個人資料及購買紀錄。</p>
  </div>
</template>

<script>
export default {
  name: 'MemberWelcome'
}
</script>

<style scoped>
.welcome {
  text-align: center;
  padding: 40px 20px;
}

.welcome h2 {
  color: #333;
  margin-bottom: 16px;
  font-size: 28px;
}

.welcome p {
  color: #666;
  line-height: 1.6;
  font-size: 16px;
}
</style>