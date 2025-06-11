<template>
  <div>
    <!-- Banner -->
    <div class="order-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold text-white">Đơn hàng của tôi</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Đơn hàng</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <div class="container-fluid py-5">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <!-- Tab Navigation -->
            <ul class="nav nav-tabs mb-4" id="orderTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button 
                  class="nav-link active" 
                  id="active-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#active-orders" 
                  type="button" 
                  role="tab" 
                  aria-controls="active-orders" 
                  aria-selected="true"
                >
                  Đơn hàng đang xử lý
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button 
                  class="nav-link" 
                  id="history-tab" 
                  data-bs-toggle="tab" 
                  data-bs-target="#order-history" 
                  type="button" 
                  role="tab" 
                  aria-controls="order-history" 
                  aria-selected="false"
                >
                  Lịch sử đơn hàng
                </button>
              </li>
            </ul>
            
            <!-- Tab Content -->
            <div class="tab-content" id="orderTabContent">
              <!-- Đơn hàng đang xử lý -->
              <div class="tab-pane fade show active" id="active-orders" role="tabpanel" aria-labelledby="active-tab" tabindex="0">
                <div class="card">
                  <div class="card-header">
                    <h5 class="mb-0">Đơn hàng đang xử lý</h5>
                  </div>
                  <div class="card-body">
                    <div v-if="activeOrders.length === 0" class="text-center py-5">
                      <i class="bi bi-box fs-1 text-muted"></i>
                      <h5 class="mt-3">Bạn không có đơn hàng đang xử lý</h5>
                      <p class="text-muted mb-4">Hãy mua sắm và quay lại đây để xem đơn hàng của bạn</p>
                      <router-link to="/products" class="btn btn-primary">Mua sắm ngay</router-link>
                    </div>
                    
                    <div v-else>
                      <div class="table-responsive">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>Mã đơn hàng</th>
                              <th>Ngày đặt</th>
                              <th>Tổng tiền</th>
                              <th>Trạng thái</th>
                              <th>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="order in activeOrders" :key="order.orderID">
                              <td>#{{ order.orderID }}</td>
                              <td>{{ formatDate(order.orderDate) }}</td>
                              <td>{{ formatPrice(order.totalAmount) }}</td>
                              <td>
                                <span :class="getStatusClass(order.status)">
                                  {{ getStatusText(order.status) }}
                                </span>
                              </td>
                              <td>
                                <button class="btn btn-sm btn-outline-primary me-2" @click="viewOrderDetails(order)">
                                  <i class="bi bi-eye"></i> Chi tiết
                                </button>
                                <button v-if="canCancel(order)" class="btn btn-sm btn-outline-danger" @click="cancelOrder(order)">
                                  <i class="bi bi-x-circle"></i> Hủy
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Lịch sử đơn hàng -->
              <div class="tab-pane fade" id="order-history" role="tabpanel" aria-labelledby="history-tab" tabindex="0">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Lịch sử đơn hàng</h5>
                    <div class="d-flex">
                      <div class="input-group me-2" style="width: 200px;">
                        <input 
                          type="text" 
                          class="form-control" 
                          placeholder="Tìm mã đơn hàng" 
                          v-model="searchQuery"
                          @input="filterOrders"
                        >
                        <button class="btn btn-outline-secondary" type="button">
                          <i class="bi bi-search"></i>
                        </button>
                      </div>
                      <select class="form-select" style="width: 150px;" v-model="statusFilter" @change="filterOrders">
                        <option value="">Tất cả</option>
                        <option value="completed">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                  </div>
                  <div class="card-body">
                    <div v-if="filteredHistoryOrders.length === 0" class="text-center py-5">
                      <i class="bi bi-clock-history fs-1 text-muted"></i>
                      <h5 class="mt-3">Không tìm thấy đơn hàng nào</h5>
                      <p class="text-muted mb-4" v-if="searchQuery || statusFilter">Vui lòng thử với điều kiện tìm kiếm khác</p>
                      <p class="text-muted mb-4" v-else>Bạn chưa có đơn hàng nào trong lịch sử</p>
                    </div>
                    
                    <div v-else>
                      <div class="table-responsive">
                        <table class="table table-hover">
                          <thead>
                            <tr>
                              <th>Mã đơn hàng</th>
                              <th>Ngày đặt</th>
                              <th>Tổng tiền</th>
                              <th>Trạng thái</th>
                              <th>Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="order in paginatedHistoryOrders" :key="order.orderID">
                              <td>#{{ order.orderID }}</td>
                              <td>{{ formatDate(order.orderDate) }}</td>
                              <td>{{ formatPrice(order.totalAmount) }}</td>
                              <td>
                                <span :class="getStatusClass(order.status)">
                                  {{ getStatusText(order.status) }}
                                </span>
                              </td>
                              <td>
                                <button class="btn btn-sm btn-outline-primary me-2" @click="viewOrderDetails(order)">
                                  <i class="bi bi-eye"></i> Chi tiết
                                </button>
                                <button v-if="order.status === 'completed'" class="btn btn-sm btn-outline-success" @click="repurchase(order)">
                                  <i class="bi bi-arrow-repeat"></i> Mua lại
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <!-- Pagination -->
                      <nav aria-label="Page navigation" class="mt-4">
                        <ul class="pagination justify-content-center">
                          <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <a class="page-link" href="#" @click.prevent="currentPage--">
                              <i class="bi bi-chevron-left"></i>
                            </a>
                          </li>
                          <li 
                            v-for="page in totalPages" 
                            :key="page" 
                            class="page-item"
                            :class="{ active: currentPage === page }"
                          >
                            <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                          </li>
                          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                            <a class="page-link" href="#" @click.prevent="currentPage++">
                              <i class="bi bi-chevron-right"></i>
                            </a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Chi tiết đơn hàng -->
    <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết đơn hàng #{{ selectedOrder.orderID }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <h6 class="mb-2">Thông tin đơn hàng</h6>
                <p class="mb-1"><strong>Mã đơn hàng:</strong> {{ selectedOrder.orderID }}</p>
                <p class="mb-1"><strong>Ngày đặt:</strong> {{ formatDate(selectedOrder.orderDate) }}</p>
                <p class="mb-1"><strong>Trạng thái:</strong> 
                  <span :class="getStatusClass(selectedOrder.status)">
                    {{ getStatusText(selectedOrder.status) }}
                  </span>
                </p>
                <p class="mb-1"><strong>Phương thức thanh toán:</strong> {{ selectedOrder.paymentMethod }}</p>
                <p class="mb-1"><strong>Địa chỉ giao hàng:</strong> {{ selectedOrder.shippingAddress }}</p>
              </div>
              <div class="col-md-6">
                <h6 class="mb-2">Thông tin khách hàng</h6>
                <p class="mb-1"><strong>Họ tên:</strong> {{ selectedOrder.customerName }}</p>
                <p class="mb-1"><strong>Email:</strong> {{ selectedOrder.customerEmail }}</p>
                <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedOrder.customerPhone }}</p>
              </div>
            </div>
            <h6 class="mb-3">Sản phẩm</h6>
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Ảnh</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedOrder.items" :key="index">
                    <td>{{ item.productName }}</td>
                    <td>
                      <img 
                        :src="getImageUrl(item.imageUrl)" 
                        :alt="item.productName"
                        style="width:50px;height:50px;object-fit:cover;"
                        class="img-thumbnail"
                      >
                    </td>
                    <td>{{ formatPrice(item.price) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatPrice(item.price * item.quantity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-3 text-end">
              <strong>Tổng cộng: {{ formatPrice(selectedOrder.totalAmount) }}</strong>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: 'Bearer ' + token } : {};
}

export default {
  data() {
    return {
      orders: [],
      searchQuery: '',
      statusFilter: '',
      currentPage: 1,
      itemsPerPage: 10,
      selectedOrder: {},
      loading: false,
      error: null,
      orderDetailsModal: null
    };
  },
  computed: {
    activeOrders() {
      return this.orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    },
    historyOrders() {
      return this.orders.filter(o => o.status === 'completed' || o.status === 'cancelled');
    },
    filteredHistoryOrders() {
      let result = this.historyOrders;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        result = result.filter(o => String(o.orderID).includes(q));
      }
      if (this.statusFilter) {
        result = result.filter(o => o.status === this.statusFilter);
      }
      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredHistoryOrders.length / this.itemsPerPage);
    },
    paginatedHistoryOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredHistoryOrders.slice(start, end);
    }
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true;
        const res = await axios.get('/api/orders', { headers: getAuthHeaders() });
        this.orders = res.data.orders || [];
      } catch (err) {
        this.error = 'Không thể tải danh sách đơn hàng';
        this.orders = [];
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    getStatusText(status) {
      const statusMap = {
        waiting_payment: 'Chờ xác nhận',
        pending: 'Chờ xác nhận',
        processing: 'Đang xử lý',
        shipping: 'Đang giao hàng',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã hủy'
      };
      return statusMap[status] || status;
    },
    getStatusClass(status) {
      const classMap = {
        waiting_payment: 'badge bg-warning',
        pending: 'badge bg-warning',
        processing: 'badge bg-info',
        shipping: 'badge bg-primary',
        completed: 'badge bg-success',
        cancelled: 'badge bg-danger'
      };
      return classMap[status] || 'badge bg-secondary';
    },
    getImageUrl(image) {
      if (!image) return 'https://via.placeholder.com/300x200';
      if (image.startsWith('http') || image.startsWith('/uploads/')) return image;
      return 'http://localhost:5000/uploads/' + image;
    },
    async viewOrderDetails(order) {
      try {
        const response = await axios.get(`/api/orders/${order.orderID}`, {
          headers: getAuthHeaders()
        });
        console.log('Order details response:', response.data);
        this.selectedOrder = response.data;
        this.orderDetailsModal.show();
      } catch (err) {
        console.error('Error fetching order details:', err);
        alert('Không thể tải chi tiết đơn hàng');
      }
    },
    canCancel(order) {
      return ['pending', 'waiting_payment', 'processing'].includes(order.status);
    },
    async cancelOrder(order) {
      if (!this.canCancel(order)) return;
      if (!confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.orderID}?`)) return;
      try {
        await axios.put(`/api/orders/${order.orderID}/status`, { status: 'cancelled' }, { headers: getAuthHeaders() });
        await this.fetchOrders();
        alert('Đã hủy đơn hàng thành công!');
      } catch (err) {
        alert('Không thể hủy đơn hàng!');
        console.error(err);
      }
    },
    async repurchase(order) {
      try {
        // Lấy chi tiết đơn hàng
        const response = await axios.get(`/api/orders/${order.orderID}`, {
          headers: getAuthHeaders()
        });
        const orderDetails = response.data;

        // Thêm từng sản phẩm vào giỏ hàng
        for (const item of orderDetails.items) {
          await axios.post('/api/cart/add', {
            productId: item.productID,
            quantity: item.quantity
          }, {
            headers: getAuthHeaders()
          });
        }

      alert(`Đã thêm các sản phẩm từ đơn hàng #${order.orderID} vào giỏ hàng!`);
      this.$router.push('/cart');
      } catch (error) {
        console.error('Error repurchasing:', error);
        alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!');
      }
    },
    filterOrders() {
      this.currentPage = 1;
    }
  },
  mounted() {
    this.orderDetailsModal = new Modal(document.getElementById('orderDetailsModal'));
    this.fetchOrders();
  }
}
</script>

<style scoped>
.order-banner {
  background-color: var(--primary-color);
  color: white;
  padding: 40px 0;
  margin-bottom: 0;
  width: 100%;
}

.breadcrumb {
  background-color: transparent;
  margin-bottom: 0;
}

.breadcrumb-item a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
}

.breadcrumb-item.active {
  color: white;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: rgba(255, 255, 255, 0.6);
}

.nav-tabs .nav-link {
  color: var(--text-color);
  font-weight: 500;
  padding: 12px 20px;
}

.nav-tabs .nav-link.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
}

.order-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

.pagination .page-link {
  color: var(--primary-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

@media (max-width: 768px) {
  .order-banner {
    padding: 30px 0;
  }
  
  .nav-tabs .nav-link {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
  
  .card-header {
    padding: 12px 15px;
  }
  
  .order-item-image {
    width: 50px;
    height: 50px;
  }
}
</style>
