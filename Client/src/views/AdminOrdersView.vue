<template>
  <div class="admin-orders">
    <h2 class="mb-4">Quản lý đơn hàng</h2>
    
    <!-- Thanh công cụ -->
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..." 
            v-model="searchQuery"
            @input="filterOrders"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="statusFilter" @change="filterOrders">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipping">Đang giao hàng</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
      <div class="col-md-3">
        <div class="input-group">
          <span class="input-group-text">Từ ngày</span>
          <input type="date" class="form-control" v-model="dateFrom" @change="filterOrders">
        </div>
      </div>
      <div class="col-md-2">
        <div class="input-group">
          <span class="input-group-text">Đến</span>
          <input type="date" class="form-control" v-model="dateTo" @change="filterOrders">
        </div>
      </div>
    </div>
    
    <!-- Bảng đơn hàng -->
    <div class="card">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center p-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger m-3">
          {{ error }}
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">Mã đơn hàng</th>
                <th scope="col">Ngày đặt</th>
                <th scope="col">Khách hàng</th>
                <th scope="col">Tổng tiền</th>
                <th scope="col">Phương thức thanh toán</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!paginatedOrders || paginatedOrders.length === 0">
                <td colspan="7" class="text-center py-4">Không có đơn hàng nào</td>
              </tr>
              <tr v-else v-for="order in paginatedOrders" :key="order.orderID">
                <td>{{ order.orderID }}</td>
                <td>{{ formatDate(order.orderDate) }}</td>
                <td>{{ order.customerName }}</td>
                <td>{{ formatPrice(order.totalAmount) }}</td>
                <td>{{ getPaymentMethodName(order.paymentMethod) }}</td>
                <td>
                  <span :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="viewOrderDetails(order)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-success" 
                      @click="updateOrderStatus(order)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-outline-danger" 
                      @click="confirmDeleteOrder(order)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Phân trang -->
    <div v-if="!loading && !error && filteredOrders && filteredOrders.length > 0" class="d-flex justify-content-between align-items-center mt-4">
      <div>
        Hiển thị {{ paginatedOrders?.length || 0 }} / {{ filteredOrders?.length || 0 }} đơn hàng
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination mb-0">
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
                <p class="mb-1"><strong>Phương thức thanh toán:</strong> {{ getPaymentMethodName(selectedOrder.paymentMethod) }}</p>
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
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedOrder.items" :key="index">
                    <td>{{ item.productName }}</td>
                    <td>{{ formatPrice(item.price) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatPrice(item.price * item.quantity) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Cập nhật trạng thái -->
    <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cập nhật trạng thái đơn hàng #{{ selectedOrder.orderID }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="orderStatus" class="form-label">Trạng thái mới</label>
              <select class="form-select" id="orderStatus" v-model="newStatus">
                <option value="pending">Chờ xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="changeOrderStatus">Lưu</button>
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
  name: 'AdminOrdersView',
  data() {
    return {
      orders: [],
      filteredOrders: [],
      selectedOrder: {},
      searchQuery: '',
      statusFilter: '',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      itemsPerPage: 10,
      newStatus: '',
      orderDetailsModal: null,
      updateStatusModal: null,
      loading: false,
      error: null
    };
  },
  computed: {
    totalPages() {
      return Math.ceil((this.filteredOrders?.length || 0) / this.itemsPerPage);
    },
    paginatedOrders() {
      if (!this.filteredOrders) return [];
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    },
    availableStatuses() {
      const statuses = [
        { value: 'pending', label: 'Chờ xác nhận' },
        { value: 'processing', label: 'Đang xử lý' },
        { value: 'shipping', label: 'Đang giao hàng' },
        { value: 'completed', label: 'Đã hoàn thành' },
        { value: 'cancelled', label: 'Đã hủy' }
      ];
      
      // Lọc ra các trạng thái có thể chuyển đến từ trạng thái hiện tại
      const currentStatus = this.selectedOrder.status;
      if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        return [];
      }
      
      const statusFlow = {
        waiting_payment: ['processing', 'cancelled'],
        pending: ['processing', 'cancelled'],
        processing: ['shipping', 'cancelled'],
        shipping: ['completed', 'cancelled']
      };
      
      return statuses.filter(status => 
        statusFlow[currentStatus]?.includes(status.value)
      );
    }
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true;
        const response = await axios.get('/api/orders/admin', {
          headers: getAuthHeaders(),
          params: {
            page: this.currentPage,
            limit: this.itemsPerPage,
            status: this.statusFilter,
            search: this.searchQuery,
            dateFrom: this.dateFrom,
            dateTo: this.dateTo
          }
        });
        
        // Kiểm tra và xử lý response
        if (response.data && Array.isArray(response.data)) {
          this.orders = response.data;
          this.filteredOrders = response.data;
        } else if (response.data && response.data.orders) {
          this.orders = response.data.orders;
          this.filteredOrders = response.data.orders;
        } else {
          this.orders = [];
          this.filteredOrders = [];
        }
        
        console.log('Orders data:', this.orders); // Debug log
      } catch (err) {
        console.error('Error fetching orders:', err);
        this.error = 'Không thể tải danh sách đơn hàng';
        this.orders = [];
        this.filteredOrders = [];
      } finally {
        this.loading = false;
      }
    },
    async viewOrderDetails(order) {
      try {
        const response = await axios.get(`/api/orders/${order.orderID}`, {
          headers: getAuthHeaders()
        });
        this.selectedOrder = response.data;
        this.orderDetailsModal.show();
      } catch (err) {
        this.error = 'Không thể tải chi tiết đơn hàng';
        console.error(err);
      }
    },
    async updateOrderStatus(order) {
      this.selectedOrder = order;
      this.newStatus = '';
      this.updateStatusModal.show();
    },
    async changeOrderStatus() {
      try {
        await axios.put(`/api/orders/${this.selectedOrder.orderID}/status`, {
          status: this.newStatus
        }, {
          headers: getAuthHeaders()
        });
        await this.fetchOrders();
        this.updateStatusModal.hide();
        this.orderDetailsModal.hide();
      } catch (err) {
        this.error = 'Không thể cập nhật trạng thái đơn hàng';
        console.error(err);
      }
    },
    filterOrders() {
      this.currentPage = 1;
      this.fetchOrders();
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('vi-VN');
    },
    formatDateTime(date) {
      return new Date(date).toLocaleString('vi-VN');
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
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
    getPaymentMethodName(method) {
      const methodMap = {
        cod: 'Thanh toán khi nhận hàng',
        momo: 'Ví MoMo',
        vnpay: 'VNPay',
        vietqr: 'Chuyển khoản VietQR'
      };
      return methodMap[method] || method;
    },
    getHistoryIcon(status) {
      const iconMap = {
        waiting_payment: 'bi-hourglass-split',
        pending: 'bi-hourglass-split',
        processing: 'bi-gear',
        shipping: 'bi-truck',
        completed: 'bi-check-circle',
        cancelled: 'bi-x-circle'
      };
      return iconMap[status] || 'bi-circle';
    },
    async confirmDeleteOrder(order) {
      if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${order.orderID}?`)) return;
      try {
        await axios.delete(`/api/orders/${order.orderID}`, { headers: getAuthHeaders() });
        await this.fetchOrders();
      } catch (err) {
        alert('Không thể xóa đơn hàng!');
        console.error(err);
      }
    }
  },
  mounted() {
    this.orderDetailsModal = new Modal(document.getElementById('orderDetailsModal'));
    this.updateStatusModal = new Modal(document.getElementById('updateStatusModal'));
    this.fetchOrders();
  }
};
</script>

<style scoped>
.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
}
</style>
