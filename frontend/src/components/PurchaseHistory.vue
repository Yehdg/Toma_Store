<template>
  <div class="purchase-history">
    <h2>購買紀錄</h2>
    
    <div class="filters">
      <select v-model="statusFilter" @change="filterOrders">
        <option value="">全部訂單</option>
        <option value="completed">已完成</option>
        <option value="pending">處理中</option>
        <option value="cancelled">已取消</option>
      </select>
      
      <input 
        v-model="searchDate" 
        @change="filterOrders"
        type="date" 
        class="search-input"
      >
    </div>
    
    <div class="orders-container">
      <div v-if="loading" class="loading">載入中...</div>
      
      <div v-else-if="filteredOrders.length === 0" class="no-orders">
        <p>{{ statusFilter ? '沒有符合條件的訂單' : '目前還沒有購買紀錄' }}</p>
      </div>
      
      <div v-else class="orders-list">
        <div 
          v-for="order in displayedOrdersPage" 
          :key="order.id" 
          class="order-item"
          :class="{ 'completed': order.status === 'completed' }"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">訂單編號：{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.date) }}</span>
            </div>
            <span class="order-status" :class="order.status">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          
          <div class="order-items">
            <div 
              v-for="item in order.items" 
              :key="item.productId" 
              class="order-product"
            >
              <div class="product-info">
                <span class="product-name">{{ item.name }}</span>
                <span class="product-quantity">數量：{{ item.quantity }}</span>
              </div>
              <span class="product-price">${{ item.price }}</span>
            </div>
          </div>
          
          <div class="order-footer">
            <span class="total-price">總金額：${{ order.total }}</span>
          </div>
        </div>
        
        <!-- 分頁控制 -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="page-btn"
          >
            上一頁
          </button>
          
          <span class="page-info">
            第 {{ currentPage }} / {{ totalPages }} 頁
          </span>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PurchaseHistory',
  data() {
    return {
      loading: true,
      orders: [],
      filteredOrders: [],
      statusFilter: '',
      searchDate: '',  // 改為日期搜尋
      currentPage: 1,
      pageSize: 5
    }
  },
  
  computed: {
    // 當前頁顯示的訂單
    displayedOrdersPage() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredOrders.slice(start, end);
    },
    
    // 總頁數
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.pageSize);
    }
  },


  mounted() {
    this.loadOrders();
  },
  
  methods: {
    // 載入訂單資料
    async loadOrders() {
      try {
        this.loading = true;
        const response = await this.axios.get('http://localhost:3000/api/orders/member', {
          withCredentials: true
        });
        
        console.log('後端回應:', response.data);
        
        if (response.data && response.data.orders) {
          // 將扁平的訂單明細轉換成分組的訂單結構
          this.orders = this.transformOrders(response.data.orders);
          this.filteredOrders = [...this.orders];
          console.log('轉換後的訂單資料:', this.orders);
        }
        
        this.loading = false;
        
      } catch (error) {
        console.error('載入訂單失敗:', error);
        alert('載入訂單失敗：' + (error.response?.data?.result?.err || error.message));
        this.loading = false;
      }
    },
    
    // 轉換訂單資料格式
    transformOrders(orderDetails) {
      // 按 orderId 分組
      const grouped = {};
      
      orderDetails.forEach(detail => {
        const orderId = detail.orderId;
        
        if (!grouped[orderId]) {
          grouped[orderId] = {
            id: orderId,
            date: detail.orderDate,
            status: detail.isComplete === 1 ? 'completed' : 'pending',
            items: [],
            total: 0
          };
        }
        
        // 加入商品項目
        grouped[orderId].items.push({
          productId: detail.productId,
          name: detail.product.name,
          quantity: detail.orderQuantity,
          price: parseFloat(detail.orderPrice)
        });
        
        // 累加總金額
        grouped[orderId].total += parseFloat(detail.orderPrice);
      });
      
      // 轉成陣列並依日期排序（最新的在前）
      return Object.values(grouped).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
    },
    
    // 篩選訂單
    filterOrders() {
      let filtered = [...this.orders];
      
      // 依狀態篩選
      if (this.statusFilter) {
        filtered = filtered.filter(order => order.status === this.statusFilter);
      }
      
      // 依日期篩選
      if (this.searchDate) {
        filtered = filtered.filter(order => {
          // 將訂單日期轉換為 YYYY-MM-DD 格式
          const orderDate = new Date(order.date);
          const orderDateString = orderDate.toISOString().split('T')[0];
          
          // 比對是否為同一天
          return orderDateString === this.searchDate;
        });
      }
      
      this.filteredOrders = filtered;
      // 篩選後回到第一頁
      this.currentPage = 1;
    },
    
    // 上一頁
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    // 下一頁
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-TW');
    },
    
    // 取得狀態文字
    getStatusText(status) {
      const statusMap = {
        'completed': '已完成',
        'pending': '處理中',
        'cancelled': '已取消'
      };
      return statusMap[status] || status;
    }
  }
}
</script>

<style scoped>
.purchase-history {
  padding: 20px;
}

.filters {
  margin-bottom: 25px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.filters select,
.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}

.no-orders {
  text-align: center;
  padding: 50px;
  color: #666;
}

.order-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.order-item.completed {
  border-left: 4px solid #28a745;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-id {
  font-weight: 600;
  color: #333;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.order-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.order-status.completed {
  background-color: #d4edda;
  color: #155724;
}

.order-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.order-status.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-items {
  margin-bottom: 15px;
}

.order-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
}

.product-quantity {
  font-size: 14px;
  color: #666;
}

.product-price {
  font-weight: 600;
  color: #007bff;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.total-price {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.review-btn,
.reorder-btn {
  padding: 6px 12px;
  border: 1px solid #007bff;
  background-color: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.review-btn:hover,
.reorder-btn:hover {
  background-color: #007bff;
  color: white;
}

/* 分頁樣式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #64a7ee;
  background-color: white;
  color: #549be8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #4d97e7;
  color: white;
}

.page-btn:disabled {
  border-color: #ddd;
  color: #999;
  cursor: not-allowed;
  opacity: 0.5;
}

.page-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
</style>