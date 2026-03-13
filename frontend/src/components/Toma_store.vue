<template>
  <div>
    <div class="container">
      <div v-if="loading">載入中...</div>
        <ul class="grid-table" v-else>
          <li v-for="product in products" :key="product.id">
            <img :src="product.image_url" class="product-img" :alt="product.name">
            <p>{{ product.name }}</p>
            <p>價格: ${{ product.price }}</p>
            <p>庫存: {{ product.quantity }} 斤</p>
            <p class="remark">{{ product.remark }}</p>
            <button 
              class="btn btn-primary" 
              @click="addToCart(product)" 
              :disabled="!instock(product)"
            >
              {{ instock(product) ? '加入購物車' : '無庫存' }}
            </button>
          </li>
        </ul>
    </div>
    <br>
  </div>
</template>


<script>
export default {
  data() {
    return {
      products: [],     // 商品列表
      loading: true,     // 載入狀態
      cartItems: []      // 購物車資料
    }
  },
  
  // 組件載入時執行
  async mounted() {
    await this.fetchProducts();
  },
  
  methods: {
    // 從 API 獲取商品資料
    async fetchProducts() {
      try {
        this.loading = true;
        
        // 呼叫後端 API
        // const response = await this.axios.get('http://localhost:3000/api/products');
        const response = await this.axios.get('https://tomastore-production.up.railway.app/api/products');
        this.products = response.data.products || [];
        
        console.log('商品資料:', this.products);
        
      } catch (error) {
        console.error('載入商品失敗:', error);
        alert('載入商品失敗，請稍後再試');
      } finally {
        this.loading = false;
      }
    },
    
    // 加入購物車
    addToCart(product) {
      // 🔥 檢查登入狀態 - 透過發送請求來驗證
      this.verifyAndAddToCart(product);
    },
    
    // 🔥 驗證登入並加入購物車
    async verifyAndAddToCart(product) {
      try {
        // 發送驗證請求
        // const response = await this.axios.get('http://localhost:3000/member/verify', {
        const response = await this.axios.get('https://tomastore-production.up.railway.app/member/verify', {
          withCredentials: true
        });
        
        // 驗證成功，執行加入購物車
        if (response.data.result && response.data.result.status === 'valid') {
          const memberId = response.data.result.memberId;
          this.performAddToCart(product, memberId);
        } else {
          alert('請先登入才能加入購物車！');
        }
      } catch (error) {
        // 驗證失敗，提示登入
        alert('請先登入才能加入購物車！');
        console.log('未登入，無法加入購物車');
      }
    },
    
    // 🔥 實際執行加入購物車的邏輯
    performAddToCart(product, memberId) {
      // 取得該會員的購物車
      const cartKey = `cart_${memberId}`;
      const savedCart = localStorage.getItem(cartKey);
      this.cartItems = savedCart ? JSON.parse(savedCart) : [];
      
      // 檢查是否已存在相同商品
      const existingItem = this.cartItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        // 如果已存在，增加數量
        alert('此商品已在購物車中');
      } else {
        // 如果不存在，新增商品到購物車
        this.cartItems.push({
          productId: product.id,
          quantity: 1
        });
        alert(`${product.name} 已加入購物車！`);
      }
      
      // 儲存到該會員的 localStorage
      localStorage.setItem(cartKey, JSON.stringify(this.cartItems));
      
      console.log(`會員 ${memberId} 購物車更新:`, this.cartItems);
    },

    // 檢查商品是否有庫存
    instock(product) {
      return product.quantity > 0;
    }

  }
}
</script>

<style>
.container {
  margin: 30px auto 0;
  max-width: 1200px;
  padding: 0 20px;  /* 左右留白 */
}
.grid-table {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center; 
}

.grid-table li {
  width: 260px;
  /* 設定每個項目的寬度 */
  border: 1px solid rgb(133, 132, 132);
  /* 添加邊框 */
  padding: 15px;
  /* 內邊距，讓內容不貼邊框 */
  border-radius: 8px;
  text-align: center;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  /* 🔥 關鍵：使用 flex 垂直排列 */
  display: flex;
  flex-direction: column;
  align-items: center;  /* 水平置中對齊 */
}

.product-img {
  width: 100%;
  max-width: 100%;  /* 確保不超過容器寬度 */
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

.grid-table p {
  font-size: 18px;
  margin: 10px 0;
  color: #151515;
}

.grid-table p.remark {
  font-size: 14px;
  color: #745656;
  font-style: italic;
  min-height: 40px;  /* 固定最小高度 */
  max-height: 60px;  /* 最大高度 */
  overflow: hidden;  /* 超出隱藏 */
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: auto;  /* 🔥 關鍵：自動推到底部 */
}

.btn-primary {
  background-color: #007bff;
  color: white;
  
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary:disabled:hover {
  background-color: #ccc;
}

@media screen and (max-width: 750px) {
  .grid-table li {
    width: 150px;
  }
  .grid-table p {
    font-size: 14px;
    margin: 10px 0;
  }
  .grid-table p.remark {
    font-size: 12px;
    color: #9a8383;
    font-style: italic;
    min-height: 36px;
    max-height: 48px;
  }
}

@media screen and (max-width: 480px) {
  .grid-table p {
    font-size: 12px;
    margin: 10px 0;
  }
  .grid-table p.remark {
    font-size: 10px;
    color: #9a8383;
    font-style: italic;
  }
}
  
</style>