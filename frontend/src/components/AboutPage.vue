<template>
  <div class="about-page">
    <!-- 頭部區域 -->
    <div class="header">
      <h1>關於XXXX</h1>
      <p class="subtitle">用心提供最優質的產品</p>
    </div>

    <!-- 主要內容區 -->
    <div class="body">
      <!-- 公司介紹 -->
      <section class="intro-section">
        <h2>我們的故事</h2>
        <p>
          創立於 XXXX 年，我們致力於為消費者帶來最新鮮、最優質的農產品。
          從產地直送到您的餐桌，讓每一位顧客都能吃得安心、吃得健康。
        </p>
      </section>

      
      <!-- 特色服務 -->
      <section class="features-section">
        <h2>我們的優勢</h2>
        <div class="features-list">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h4>產地直送</h4>
              <p>與在地農民合作，確保最短的運送時間與最佳的新鮮度</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h4>嚴格把關</h4>
              <p>每批商品都經過檢驗，確保符合食品安全標準</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h4>快速配送</h4>
              <p>24 小時內出貨，讓新鮮直達您家</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <div class="feature-content">
              <h4>客戶至上</h4>
              <p>專業客服團隊隨時為您服務，解決任何問題</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 底部聯絡資訊 -->
    <div class="footer">
      <h3>聯絡我們</h3>
      <div class="contact-info">
        <div class="contact-item">
          <span class="label">📧 Email：</span>
          <span>123456@example.com</span>
        </div>
        <div class="contact-item">
          <span class="label">📱 電話：</span>
          <span>(02) 1234-5678</span>
        </div>
        <div class="contact-item">
          <span class="label">📍 地址：</span>
          <span>雲林縣虎尾鎮虎興冬五街22號</span>
        </div>
        <div class="contact-item">
          <span class="label">⏰ 營業時間：</span>
          <span>週一至週五 09:00 - 18:00</span>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'AboutPage',
  data () {
    return {
     
    }
  }
}
</script>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 頭部區域 */
.header {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 48px;
  margin: 0 0 15px 0;
  font-weight: 700;
}

.subtitle {
  font-size: 20px;
  opacity: 0.95;
  margin: 0;
}

/* 主要內容區 */
.body {
  padding: 0 20px;
}

section {
  margin-bottom: 60px;
}

section h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
  padding-bottom: 15px;
}

section h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
}

/* 公司介紹 */
.intro-section p {
  font-size: 18px;
  line-height: 1.8;
  color: #555;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}




.icon {
  font-size: 48px;
  margin-bottom: 20px;
}


/* 特色服務 */
.features-list {
  max-width: 800px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 25px;
  margin-bottom: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  transition: background 0.3s ease;
}

.feature-item:hover {
  background: #e9ecef;
}

.feature-icon {
  font-size: 24px;
  color: #667eea;
  font-weight: bold;
  flex-shrink: 0;
}

.feature-content h4 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
}

.feature-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* 底部聯絡資訊 */
.footer {
  background: #2d3748;
  color: white;
  padding: 50px 40px;
  border-radius: 12px;
  margin-top: 60px;
}

.footer h3 {
  font-size: 28px;
  margin: 0 0 30px 0;
  text-align: center;
}

.contact-info {
  max-width: 600px;
  margin: 0 auto;
}

.contact-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 16px;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item .label {
  font-weight: 600;
  min-width: 150px;
  color: #a0aec0;
}

@media screen and (max-width: 768px) {
  .feature-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .feature-icon {
    margin-bottom: 10px;
  }

  .contact-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .contact-item .label {
    min-width: auto;
    margin-bottom: 5px;
  }
}

</style>