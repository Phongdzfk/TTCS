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
                            <tr v-for="order in activeOrders" :key="order.id">
                              <td>#{{ order.id }}</td>
                              <td>{{ formatDate(order.orderDate) }}</td>
                              <td>{{ formatPrice(order.total) }}</td>
                              <td>
                                <span :class="getStatusClass(order.status)">
                                  {{ getStatusText(order.status) }}
                                </span>
                              </td>
                              <td>
                                <button class="btn btn-sm btn-outline-primary me-2" @click="viewOrderDetails(order)">
                                  <i class="bi bi-eye"></i> Chi tiết
                                </button>
                                <button v-if="order.status === 'pending'" class="btn btn-sm btn-outline-danger" @click="cancelOrder(order)">
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
                            <tr v-for="order in filteredHistoryOrders" :key="order.id">
                              <td>#{{ order.id }}</td>
                              <td>{{ formatDate(order.orderDate) }}</td>
                              <td>{{ formatPrice(order.total) }}</td>
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
            <h5 class="modal-title">Chi tiết đơn hàng #{{ selectedOrder.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <h6>Thông tin đơn hàng</h6>
                <p class="mb-1">Mã đơn hàng: #{{ selectedOrder.id }}</p>
                <p class="mb-1">Ngày đặt: {{ formatDate(selectedOrder.orderDate) }}</p>
                <p class="mb-1">Trạng thái: 
                  <span :class="getStatusClass(selectedOrder.status)">
                    {{ getStatusText(selectedOrder.status) }}
                  </span>
                </p>
                <p class="mb-1">Phương thức thanh toán: {{ selectedOrder.paymentMethod }}</p>
              </div>
              <div class="col-md-6">
                <h6>Thông tin giao hàng</h6>
                <p class="mb-1">Người nhận: {{ selectedOrder.shippingAddress?.name }}</p>
                <p class="mb-1">Số điện thoại: {{ selectedOrder.shippingAddress?.phone }}</p>
                <p class="mb-1">Địa chỉ: {{ selectedOrder.shippingAddress?.address }}</p>
              </div>
            </div>
            
            <h6>Sản phẩm</h6>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th class="text-center">Đơn giá</th>
                    <th class="text-center">Số lượng</th>
                    <th class="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <img :src="item.image" alt="Product" class="order-item-image me-3">
                        <div>
                          <h6 class="mb-0">{{ item.name }}</h6>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">{{ formatPrice(item.price) }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-end">{{ formatPrice(item.price * item.quantity) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-end">Tạm tính:</td>
                    <td class="text-end">{{ formatPrice(selectedOrder.subtotal) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end">Phí vận chuyển:</td>
                    <td class="text-end">{{ formatPrice(selectedOrder.shippingFee) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end">Giảm giá:</td>
                    <td class="text-end">-{{ formatPrice(selectedOrder.discount) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end fw-bold">Tổng cộng:</td>
                    <td class="text-end fw-bold">{{ formatPrice(selectedOrder.total) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button 
              v-if="selectedOrder.status === 'pending'" 
              type="button" 
              class="btn btn-danger" 
              @click="cancelOrderFromModal"
            >
              Hủy đơn hàng
            </button>
            <button 
              v-if="selectedOrder.status === 'completed'" 
              type="button" 
              class="btn btn-primary" 
              @click="repurchaseFromModal"
            >
              Mua lại
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeOrders: [
        {
          id: 'ORD001',
          orderDate: '2025-04-25T10:30:00',
          total: 22990000,
          status: 'pending',
          paymentMethod: 'COD',
          shippingFee: 30000,
          discount: 0,
          subtotal: 22960000,
          shippingAddress: {
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
          },
          items: [
            {
              id: 1,
              name: 'Laptop Gaming Acer Nitro 5',
              price: 22990000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ]
        },
        {
          id: 'ORD002',
          orderDate: '2025-04-26T09:15:00',
          total: 17980000,
          status: 'processing',
          paymentMethod: 'Chuyển khoản ngân hàng',
          shippingFee: 0,
          discount: 0,
          subtotal: 17980000,
          shippingAddress: {
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
          },
          items: [
            {
              id: 3,
              name: 'Màn hình Gaming 27" LG UltraGear',
              price: 8990000,
              quantity: 2,
              image: '@/assets/images/home/banner.jpg'
            }
          ]
        }
      ],
      historyOrders: [
        {
          id: 'ORD003',
          orderDate: '2025-03-15T14:20:00',
          total: 30000000,
          status: 'completed',
          paymentMethod: 'Thẻ tín dụng',
          shippingFee: 0,
          discount: 0,
          subtotal: 30000000,
          shippingAddress: {
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
          },
          items: [
            {
              id: 1,
              name: 'Laptop Dell XPS 13',
              price: 30000000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ]
        },
        {
          id: 'ORD004',
          orderDate: '2025-02-20T11:45:00',
          total: 35000000,
          status: 'cancelled',
          paymentMethod: 'COD',
          shippingFee: 30000,
          discount: 0,
          subtotal: 34970000,
          shippingAddress: {
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
          },
          items: [
            {
              id: 4,
              name: 'PC Gaming Asus ROG',
              price: 35000000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ]
        },
        {
          id: 'ORD005',
          orderDate: '2025-01-10T16:30:00',
          total: 5700000,
          status: 'completed',
          paymentMethod: 'Ví điện tử',
          shippingFee: 30000,
          discount: 0,
          subtotal: 5670000,
          shippingAddress: {
            name: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
          },
          items: [
            {
              id: 5,
              name: 'Tai nghe Gaming Logitech',
              price: 2500000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            },
            {
              id: 6,
              name: 'Bàn phím cơ Corsair K95',
              price: 3200000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ]
        }
      ],
      selectedOrder: {},
      searchQuery: '',
      statusFilter: '',
      currentPage: 1,
      itemsPerPage: 5,
      filteredHistoryOrders: []
    }
  },
  computed: {
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
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    getStatusText(status) {
      const statusMap = {
        'pending': 'Chờ xác nhận',
        'processing': 'Đang xử lý',
        'shipping': 'Đang giao hàng',
        'completed': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
      };
      return statusMap[status] || status;
    },
    getStatusClass(status) {
      const classMap = {
        'pending': 'badge bg-warning text-dark',
        'processing': 'badge bg-info text-dark',
        'shipping': 'badge bg-primary',
        'completed': 'badge bg-success',
        'cancelled': 'badge bg-danger'
      };
      return classMap[status] || 'badge bg-secondary';
    },
    viewOrderDetails(order) {
      this.selectedOrder = { ...order };
      const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
      modal.show();
    },
    cancelOrder(order) {
      if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.id}?`)) {
        // Giả lập API call
        setTimeout(() => {
          // Cập nhật trạng thái đơn hàng
          order.status = 'cancelled';
          
          // Xóa khỏi danh sách đơn hàng đang xử lý
          this.activeOrders = this.activeOrders.filter(o => o.id !== order.id);
          
          // Thêm vào lịch sử đơn hàng
          this.historyOrders.unshift({ ...order });
          
          // Cập nhật danh sách lọc
          this.filterOrders();
          
          // Hiển thị thông báo
          alert('Đã hủy đơn hàng thành công!');
        }, 500);
      }
    },
    cancelOrderFromModal() {
      if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${this.selectedOrder.id}?`)) {
        // Giả lập API call
        setTimeout(() => {
          // Tìm đơn hàng trong danh sách đơn hàng đang xử lý
          const orderIndex = this.activeOrders.findIndex(o => o.id === this.selectedOrder.id);
          if (orderIndex !== -1) {
            // Cập nhật trạng thái đơn hàng
            this.activeOrders[orderIndex].status = 'cancelled';
            
            // Xóa khỏi danh sách đơn hàng đang xử lý
            this.activeOrders.splice(orderIndex, 1);
            
            // Thêm vào lịch sử đơn hàng
            this.historyOrders.unshift({ ...this.activeOrders[orderIndex] });
            
            // Cập nhật danh sách lọc
            this.filterOrders();
            
            // Đóng modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
            modal.hide();
            
            // Hiển thị thông báo
            alert('Đã hủy đơn hàng thành công!');
          }
        }, 500);
      }
    },
    repurchase(order) {
      // Giả lập thêm sản phẩm vào giỏ hàng
      alert(`Đã thêm các sản phẩm từ đơn hàng #${order.id} vào giỏ hàng!`);
      
      // Chuyển hướng đến trang giỏ hàng
      this.$router.push('/cart');
    },
    repurchaseFromModal() {
      // Giả lập thêm sản phẩm vào giỏ hàng
      alert(`Đã thêm các sản phẩm từ đơn hàng #${this.selectedOrder.id} vào giỏ hàng!`);
      
      // Đóng modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
      modal.hide();
      
      // Chuyển hướng đến trang giỏ hàng
      this.$router.push('/cart');
    },
    filterOrders() {
      let filtered = [...this.historyOrders];
      
      // Lọc theo trạng thái
      if (this.statusFilter) {
        filtered = filtered.filter(order => order.status === this.statusFilter);
      }
      
      // Lọc theo từ khóa tìm kiếm
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(order => 
          order.id.toLowerCase().includes(query)
        );
      }
      
      this.filteredHistoryOrders = filtered;
      this.currentPage = 1; // Reset về trang đầu tiên khi lọc
    }
  },
  created() {
    // Khởi tạo danh sách lọc
    this.filterOrders();
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
