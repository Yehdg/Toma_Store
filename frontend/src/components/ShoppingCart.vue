<template>
<div class="shopping-cart">
  <!-- 功能列表 -->
  <div class="cart-header">
    <div class="header-row">
      <div class="col-select">
        <input type="checkbox">
      </div>
      <div class="col-product">商品</div>
      <div class="col-price">單價(1斤)</div>
      <div class="col-quantity">數量</div>
      <div class="col-total">總計</div>
      <div class="col-action">操作</div>
    </div>
    </div>
  
  <!-- 商品列表 -->
  <div class="cart-body">
    <ul class="cart-list">
      <li v-for="product in products" :key="product.id" class="cart-products">
        <div class="col-select"> 
          <input type="checkbox" v-model="product.selected">
        </div>
        <div class="col-product">
          <img :src="product.image_url" :alt="product.name" class="product-img">
          <span class="product-name">{{ product.name }}</span>
        </div>
        <div class="col-price">
          <span class="price">{{ product.price }}</span>
        </div>
        <div class="col-quantity">
          <button @click="decreaseQuantity(product)">-</button>
          <input type="number" v-model="product.cartQuantity">
          <button @click="increaseQuantity(product)">+</button>
        </div>
        <div class="col-total">
          <span class="total-price">${{ totalPrice(product) }}</span>
        </div>
        <div class="col-delete">
          <button class="remove-btn" @click="removeProduct(product)">刪除</button>
        </div>
      </li>
    </ul>
  </div>

  <!-- 底部：結帳區域 -->
  <div class="cart-footer">
    <button class="checked-btn" @click="OrderProducts">結帳</button>
  </div>
</div>
</template>


<script>
export default {
  data() {
    return {
      products: [],     // 顯示-商品
      cartItems: [],    // 儲存-購物車商品
      memberId: null    // 會員 ID
    }
  },
  
  // 組件載入時執行
  async mounted() {
    // 1. 先取得會員 ID
    await this.getMemberId();
    
    // 如果沒有會員 ID，直接返回（攔截器會處理登入失效）
    if (!this.memberId) {
      return;
    }
    
    // 2. 從 localStorage 讀取該會員的購物車
    const cartKey = `cart_${this.memberId}`;
    this.cartItems = JSON.parse(localStorage.getItem(cartKey)) || [];
    console.log(`會員 ${this.memberId} 的購物車資料:`, this.cartItems);
    
    if (this.cartItems.length > 0) {
      console.log('載入購物車商品...');
      await this.loadCartProducts();
    } else {
      console.log('購物車為空');
      alert('購物車是空的，請先到商店頁面加入商品！');
    }
  },
  
  methods: {
    // 取得會員 ID
    async getMemberId() {
      try {
        const response = await this.axios.get('http://localhost:3000/member/verify', {
          withCredentials: true
        });
        
        if (response.data.result && response.data.result.status === 'valid') {
          this.memberId = response.data.result.memberId;
          console.log('會員 ID:', this.memberId);
        }
      } catch (error) {
        console.error('取得會員 ID 失敗:', error);
      }
    },
    
    async loadCartProducts() {
      try {
        console.log('載入購物車商品:', this.cartItems);
        
        // 先獲取所有商品資料
        const response = await this.axios.get('http://localhost:3000/api/products', {
          withCredentials: true
        });
        
        const allProducts = response.data.products || [];
        console.log('所有商品資料:', allProducts);
        
        // 清空現有商品列表
        this.products = [];
        
        // 根據購物車ID過濾商品並結合數量
        for (let cartItem of this.cartItems) {
          const product = allProducts.find(p => p.id === cartItem.productId);
          
          if (product) {
            // 結合商品資料和購物車數量
            const cartProduct = {
              ...product,
              cartQuantity: cartItem.quantity || 1,  // 購物車中的數量
              selected: false  // 預設未選中
            };
            
            this.products.push(cartProduct);
            console.log('載入商品:', cartProduct.name, '數量:', cartProduct.cartQuantity);
          } else {
            console.warn(`找不到商品 ID: ${cartItem.productId}`);
          }
        }
        
        console.log('最終商品列表:', this.products);
        
      } catch (error) {
        console.error('載入購物車商品失敗:', error);
        alert('載入購物車商品失敗：' + error.message);
      }
    },
    
    // 增加數量
    increaseQuantity(product) {
      product.cartQuantity++;
      this.updateLocalStorage();
    },
    
    // 減少數量
    decreaseQuantity(product) {
      if (product.cartQuantity > 1) {
        product.cartQuantity--;
        this.updateLocalStorage();
      }
    },
    
    // 計算總價
    totalPrice(product) {
      return (product.cartQuantity || 1) * (product.price || 0);
    },
    
    // 更新 localStorage
    updateLocalStorage() {
      const updatedCart = this.products.map(product => ({
        productId: product.id,
        quantity: product.cartQuantity
      }));
      const cartKey = `cart_${this.memberId}`;
      localStorage.setItem(cartKey, JSON.stringify(updatedCart));
      console.log(`會員 ${this.memberId} 購物車已更新:`, updatedCart);
    },
    
    // 刪除商品
    removeProduct(product) {
      if (confirm(`確定要從購物車中移除「${product.name}」嗎？`)) {
        // 從商品列表中移除
        const productIndex = this.products.findIndex(p => p.id === product.id);
        if (productIndex > -1) {
          this.products.splice(productIndex, 1);
        }
        
        // 從購物車資料中移除
        const cartIndex = this.cartItems.findIndex(item => item.productId === product.id);
        if (cartIndex > -1) {
          this.cartItems.splice(cartIndex, 1);
        }
        
        // 更新 localStorage（綁定會員 ID）
        const cartKey = `cart_${this.memberId}`;
        localStorage.setItem(cartKey, JSON.stringify(this.cartItems));
        
        console.log(`商品 ${product.name} 已從購物車移除`);
        console.log('更新後的購物車:', this.cartItems);
        
        // 如果購物車空了，顯示提示
        if (this.products.length === 0) {
          alert('購物車已清空！');
        }
      }
    },
    async OrderProducts() {
      try {
        // 檢查是否有商品
        if (this.products.length === 0) {
          alert('購物車是空的！');
          return;
        }

        const response = await this.axios.post('http://localhost:3000/api/orders', {
          productID: this.products.map(p => p.id).join(','),        
          quantity: this.products.map(p => p.cartQuantity).join(',') 
        }, {
          withCredentials: true
        });

        // 處理回應
        if (response.data.result.status === "訂單已成功建立。") {
          alert('訂單建立成功！');
          
          // 清空購物車
          this.products = [];
          this.cartItems = [];
          localStorage.removeItem(`cart_${this.memberId}`);
          
          console.log('購物車已清空');
        } else {
          alert('訂單建立失敗：' + (response.data.result.err || '未知錯誤'));
        }
        
      } catch (error) {
        console.error('建立訂單失敗:', error);
        alert('建立訂單失敗：' + (error.response?.data?.result?.err || error.message));
      }
    }

  }
}
</script>

<style>
.header-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px 150px 120px 100px;
  gap: 15px;
  align-items: center;
  padding: 20px;
  margin: 20px auto 0 auto;  /* 自動置中 */
  max-width: 950px;         /* 固定最大寬度 */
  border: 1px solid #e2dddd;
}

.col-select { text-align: center; }
.col-product, .col-price, .col-quantity, .col-total, .col-action, .col-delete { text-align: center; }
.col-quantity input {
  width: 50px;
  text-align: center; 
}
/* 重置 ul 的預設樣式 */
.cart-list {
  list-style: none;  /* 移除列表符號 */
  padding: 0;        /* 移除預設 padding */
  margin: 0;         /* 移除預設 margin */
}

.cart-products {
  display: grid;
  grid-template-columns: 60px 1fr 120px 150px 120px 100px;
  gap: 15px;
  align-items: center;
  padding: 10px 20px;           /* 與 header-row 相同的左右 padding */
  margin: 15px auto;            /* 自動置中對齊 */
  max-width: 950px;             /* 與 header-row 相同的最大寬度 */
  border: 1px solid #5f4444;
}


.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 10px;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.cart-footer {
  text-align: right;
  padding: 20px;
  max-width: 950px;
  margin: 0 auto 30px auto;
}

@media screen and (max-width: 768px) {
  .cart-header {
    display: none;
  }
  
  .col-select, 
  .col-price,
  .price {
    display: none !important;
  }

  .cart-products {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 12px;
    margin: 10px;
    max-width: 100%;
  }

  /* 圖片+名稱區域 */
  .col-product {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 120px;
  }

  .product-img {
    width: 50px;
    height: 50px;
    margin-right: 8px;
    margin-bottom: 0;
  }
  
  .product-name {
    font-size: 14px;
  }

  /* 數量區域 */
  .col-quantity {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 12px;
  }
  
  .col-quantity button {
    width: 28px;
    height: 28px;
    padding: 0;
    font-size: 16px;
  }
  
  .col-quantity input {
    width: 40px;
    height: 28px;
    text-align: center;
    font-size: 14px;
  }

  /* 總計 */
  .col-total {
    font-weight: bold;
    color: #c83a3a;
    font-size: 16px;
    flex: 0.3;
  }

  /* 刪除按鈕 */
  .col-delete {
    margin-left: auto;
    font-size: 9px;
  }
  
  .remove-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}

</style>