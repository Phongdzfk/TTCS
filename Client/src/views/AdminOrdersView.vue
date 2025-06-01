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
        <div class="table-responsive">
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
              <tr v-for="order in paginatedOrders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>{{ formatDate(order.orderDate) }}</td>
                <td>{{ order.customer.name }}</td>
                <td>{{ formatPrice(order.total) }}</td>
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
                      :disabled="order.status === 'completed' || order.status === 'cancelled'"
                    >
                      <i class="bi bi-arrow-right"></i>
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
    <div class="d-flex justify-content-between align-items-center mt-4">
      <div>
        Hiển thị {{ paginatedOrders.length }} / {{ filteredOrders.length }} đơn hàng
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
            <h5 class="modal-title">Chi tiết đơn hàng #{{ selectedOrder.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <h6 class="mb-2">Thông tin đơn hàng</h6>
                <p class="mb-1"><strong>Mã đơn hàng:</strong> {{ selectedOrder.id }}</p>
                <p class="mb-1"><strong>Ngày đặt:</strong> {{ formatDate(selectedOrder.orderDate) }}</p>
                <p class="mb-1"><strong>Trạng thái:</strong> 
                  <span :class="getStatusClass(selectedOrder.status)">
                    {{ getStatusText(selectedOrder.status) }}
                  </span>
                </p>
                <p class="mb-1"><strong>Phương thức thanh toán:</strong> {{ getPaymentMethodName(selectedOrder.paymentMethod) }}</p>
                <p class="mb-1"><strong>Ghi chú:</strong> {{ selectedOrder.note || 'Không có' }}</p>
              </div>
              <div class="col-md-6">
                <h6 class="mb-2">Thông tin khách hàng</h6>
                <p class="mb-1"><strong>Họ tên:</strong> {{ selectedOrder.customer?.name }}</p>
                <p class="mb-1"><strong>Email:</strong> {{ selectedOrder.customer?.email }}</p>
                <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedOrder.customer?.phone }}</p>
                <p class="mb-1"><strong>Địa chỉ:</strong> {{ selectedOrder.shippingAddress }}</p>
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
                    <td>
                      <div class="d-flex align-items-center">
                        <img :src="item.image" alt="Product" class="product-thumbnail me-2">
                        <div>
                          <div>{{ item.name }}</div>
                          <small class="text-muted">{{ item.sku }}</small>
                        </div>
                      </div>
                    </td>
                    <td>{{ formatPrice(item.price) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ formatPrice(item.price * item.quantity) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-end"><strong>Tạm tính:</strong></td>
                    <td>{{ formatPrice(selectedOrder.subtotal) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end"><strong>Phí vận chuyển:</strong></td>
                    <td>{{ formatPrice(selectedOrder.shippingFee) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-end"><strong>Tổng cộng:</strong></td>
                    <td class="fw-bold">{{ formatPrice(selectedOrder.total) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div class="mt-4">
              <h6 class="mb-3">Lịch sử đơn hàng</h6>
              <ul class="list-group">
                <li v-for="(history, index) in selectedOrder.history" :key="index" class="list-group-item">
                  <div class="d-flex justify-content-between">
                    <span>
                      <i class="bi" :class="getHistoryIcon(history.status)"></i>
                      {{ getStatusText(history.status) }}
                    </span>
                    <small class="text-muted">{{ formatDateTime(history.timestamp) }}</small>
                  </div>
                  <small v-if="history.note" class="text-muted d-block mt-1">{{ history.note }}</small>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button 
              type="button" 
              class="btn btn-success" 
              @click="changeOrderStatus"
              :disabled="selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled'"
            >
              Cập nhật trạng thái
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Cập nhật trạng thái -->
    <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cập nhật trạng thái đơn hàng #{{ selectedOrder.id }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="orderStatus" class="form-label">Trạng thái mới</label>
              <select class="form-select" id="orderStatus" v-model="newStatus">
                <option 
                  v-for="status in availableStatuses" 
                  :key="status.value" 
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label for="statusNote" class="form-label">Ghi chú (tùy chọn)</label>
              <textarea class="form-control" id="statusNote" v-model="statusNote" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveStatusUpdate">Lưu</button>
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
      orders: [
        {
          id: 'ORD-2025-0001',
          orderDate: '2025-04-20T10:30:00',
          customer: {
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            phone: '0901234567'
          },
          shippingAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
          items: [
            {
              name: 'Laptop Dell XPS 13',
              sku: 'P001',
              price: 30000000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            },
            {
              name: 'Tai nghe Gaming Logitech',
              sku: 'P005',
              price: 2500000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ],
          subtotal: 32500000,
          shippingFee: 50000,
          total: 32550000,
          paymentMethod: 'cod',
          status: 'completed',
          note: '',
          history: [
            {
              status: 'pending',
              timestamp: '2025-04-20T10:30:00',
              note: 'Đơn hàng được tạo'
            },
            {
              status: 'processing',
              timestamp: '2025-04-20T11:15:00',
              note: 'Đơn hàng đã được xác nhận'
            },
            {
              status: 'shipping',
              timestamp: '2025-04-21T09:00:00',
              note: 'Đơn hàng đã được giao cho đơn vị vận chuyển'
            },
            {
              status: 'completed',
              timestamp: '2025-04-22T14:30:00',
              note: 'Đơn hàng đã được giao thành công'
            }
          ]
        },
        {
          id: 'ORD-2025-0002',
          orderDate: '2025-04-22T15:45:00',
          customer: {
            name: 'Trần Thị B',
            email: 'tranthib@example.com',
            phone: '0909876543'
          },
          shippingAddress: '456 Đường XYZ, Quận 2, TP. Hồ Chí Minh',
          items: [
            {
              name: 'PC Gaming Asus ROG',
              sku: 'P004',
              price: 35000000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ],
          subtotal: 35000000,
          shippingFee: 0,
          total: 35000000,
          paymentMethod: 'bank_transfer',
          status: 'processing',
          note: 'Giao hàng trong giờ hành chính',
          history: [
            {
              status: 'pending',
              timestamp: '2025-04-22T15:45:00',
              note: 'Đơn hàng được tạo'
            },
            {
              status: 'processing',
              timestamp: '2025-04-23T09:30:00',
              note: 'Đã xác nhận thanh toán chuyển khoản'
            }
          ]
        },
        {
          id: 'ORD-2025-0003',
          orderDate: '2025-04-23T08:15:00',
          customer: {
            name: 'Lê Văn C',
            email: 'levanc@example.com',
            phone: '0912345678'
          },
          shippingAddress: '789 Đường DEF, Quận 3, TP. Hồ Chí Minh',
          items: [
            {
              name: 'Màn hình Gaming 27" LG UltraGear',
              sku: 'P003',
              price: 8990000,
              quantity: 2,
              image: '@/assets/images/home/banner.jpg'
            }
          ],
          subtotal: 17980000,
          shippingFee: 50000,
          total: 18030000,
          paymentMethod: 'momo',
          status: 'shipping',
          note: '',
          history: [
            {
              status: 'pending',
              timestamp: '2025-04-23T08:15:00',
              note: 'Đơn hàng được tạo'
            },
            {
              status: 'processing',
              timestamp: '2025-04-23T08:20:00',
              note: 'Đã xác nhận thanh toán MoMo'
            },
            {
              status: 'shipping',
              timestamp: '2025-04-24T10:00:00',
              note: 'Đơn hàng đã được giao cho đơn vị vận chuyển'
            }
          ]
        },
        {
          id: 'ORD-2025-0004',
          orderDate: '2025-04-25T14:20:00',
          customer: {
            name: 'Phạm Thị D',
            email: 'phamthid@example.com',
            phone: '0987654321'
          },
          shippingAddress: '101 Đường GHI, Quận 4, TP. Hồ Chí Minh',
          items: [
            {
              name: 'Laptop Gaming Acer Nitro 5',
              sku: 'P002',
              price: 22990000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            },
            {
              name: 'Tai nghe Gaming Logitech',
              sku: 'P005',
              price: 2500000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ],
          subtotal: 25490000,
          shippingFee: 50000,
          total: 25540000,
          paymentMethod: 'cod',
          status: 'pending',
          note: 'Gọi trước khi giao hàng',
          history: [
            {
              status: 'pending',
              timestamp: '2025-04-25T14:20:00',
              note: 'Đơn hàng được tạo'
            }
          ]
        },
        {
          id: 'ORD-2025-0005',
          orderDate: '2025-04-18T09:30:00',
          customer: {
            name: 'Hoàng Văn E',
            email: 'hoangvane@example.com',
            phone: '0978123456'
          },
          shippingAddress: '202 Đường JKL, Quận 5, TP. Hồ Chí Minh',
          items: [
            {
              name: 'Laptop Dell XPS 13',
              sku: 'P001',
              price: 30000000,
              quantity: 1,
              image: '@/assets/images/home/banner.jpg'
            }
          ],
          subtotal: 30000000,
          shippingFee: 50000,
          total: 30050000,
          paymentMethod: 'bank_transfer',
          status: 'cancelled',
          note: '',
          history: [
            {
              status: 'pending',
              timestamp: '2025-04-18T09:30:00',
              note: 'Đơn hàng được tạo'
            },
            {
              status: 'cancelled',
              timestamp: '2025-04-19T10:15:00',
              note: 'Đơn hàng đã bị hủy do khách hàng yêu cầu'
            }
          ]
        }
      ],
      filteredOrders: [],
      searchQuery: '',
      statusFilter: '',
      dateFrom: '',
      dateTo: '',
      currentPage: 1,
      itemsPerPage: 10,
      selectedOrder: {},
      newStatus: '',
      statusNote: '',
      availableStatuses: []
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(date);
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    getPaymentMethodName(method) {
      const methodMap = {
        'cod': 'Thanh toán khi nhận hàng',
        'bank_transfer': 'Chuyển khoản ngân hàng',
        'momo': 'Ví MoMo',
        'zalopay': 'ZaloPay',
        'credit_card': 'Thẻ tín dụng'
      };
      return methodMap[method] || method;
    },
    getStatusText(status) {
      const statusMap = {
        'pending': 'Chờ xác nhận',
        'processing': 'Đang xử lý',
        'shipping': 'Đang giao hàng',
        'completed': 'Đã hoàn thành',
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
    getHistoryIcon(status) {
      const iconMap = {
        'pending': 'bi-clock',
        'processing': 'bi-gear',
        'shipping': 'bi-truck',
        'completed': 'bi-check-circle',
        'cancelled': 'bi-x-circle'
      };
      return iconMap[status] || 'bi-circle';
    },
    filterOrders() {
      let result = [...this.orders];
      
      // Lọc theo trạng thái
      if (this.statusFilter) {
        result = result.filter(o => o.status === this.statusFilter);
      }
      
      // Lọc theo từ khóa tìm kiếm
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(o => 
          o.id.toLowerCase().includes(query) || 
          o.customer.name.toLowerCase().includes(query) ||
          o.customer.email.toLowerCase().includes(query) ||
          o.customer.phone.includes(query)
        );
      }
      
      // Lọc theo khoảng thời gian
      if (this.dateFrom) {
        const fromDate = new Date(this.dateFrom);
        result = result.filter(o => new Date(o.orderDate) >= fromDate);
      }
      
      if (this.dateTo) {
        const toDate = new Date(this.dateTo);
        toDate.setHours(23, 59, 59, 999); // Đặt thời gian là cuối ngày
        result = result.filter(o => new Date(o.orderDate) <= toDate);
      }
      
      this.filteredOrders = result;
      this.currentPage = 1; // Reset về trang đầu tiên khi lọc
    },
    viewOrderDetails(order) {
      this.selectedOrder = JSON.parse(JSON.stringify(order)); // Tạo bản sao sâu
      
      const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
      modal.show();
    },
    updateOrderStatus(order) {
      this.selectedOrder = JSON.parse(JSON.stringify(order)); // Tạo bản sao sâu
      this.setAvailableStatuses(order.status);
      this.newStatus = this.getNextStatus(order.status);
      this.statusNote = '';
      
      const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
      modal.show();
    },
    changeOrderStatus() {
      // Đóng modal chi tiết
      const detailsModal = bootstrap.Modal.getInstance(document.getElementById('orderDetailsModal'));
      detailsModal.hide();
      
      // Mở modal cập nhật trạng thái
      this.setAvailableStatuses(this.selectedOrder.status);
      this.newStatus = this.getNextStatus(this.selectedOrder.status);
      this.statusNote = '';
      
      setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
        modal.show();
      }, 500);
    },
    saveStatusUpdate() {
      // Tìm đơn hàng trong danh sách
      const orderIndex = this.orders.findIndex(o => o.id === this.selectedOrder.id);
      if (orderIndex === -1) return;
      
      // Cập nhật trạng thái
      this.orders[orderIndex].status = this.newStatus;
      
      // Thêm vào lịch sử
      this.orders[orderIndex].history.push({
        status: this.newStatus,
        timestamp: new Date().toISOString(),
        note: this.statusNote || `Trạng thái đã được cập nhật thành "${this.getStatusText(this.newStatus)}"`
      });
      
      // Cập nhật danh sách lọc
      this.filterOrders();
      
      // Đóng modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('updateStatusModal'));
      modal.hide();
      
      // Hiển thị thông báo
      alert('Đã cập nhật trạng thái đơn hàng thành công!');
    },
    setAvailableStatuses(currentStatus) {
      // Xác định các trạng thái có thể chuyển đổi từ trạng thái hiện tại
      switch (currentStatus) {
        case 'pending':
          this.availableStatuses = [
            { value: 'processing', label: 'Đang xử lý' },
            { value: 'cancelled', label: 'Đã hủy' }
          ];
          break;
        case 'processing':
          this.availableStatuses = [
            { value: 'shipping', label: 'Đang giao hàng' },
            { value: 'cancelled', label: 'Đã hủy' }
          ];
          break;
        case 'shipping':
          this.availableStatuses = [
            { value: 'completed', label: 'Đã hoàn thành' },
            { value: 'cancelled', label: 'Đã hủy' }
          ];
          break;
        case 'completed':
        case 'cancelled':
          this.availableStatuses = [];
          break;
        default:
          this.availableStatuses = [
            { value: 'pending', label: 'Chờ xác nhận' },
            { value: 'processing', label: 'Đang xử lý' },
            { value: 'shipping', label: 'Đang giao hàng' },
            { value: 'completed', label: 'Đã hoàn thành' },
            { value: 'cancelled', label: 'Đã hủy' }
          ];
      }
    },
    getNextStatus(currentStatus) {
      // Xác định trạng thái tiếp theo theo quy trình
      switch (currentStatus) {
        case 'pending':
          return 'processing';
        case 'processing':
          return 'shipping';
        case 'shipping':
          return 'completed';
        default:
          return '';
      }
    }
  },
  created() {
    // Khởi tạo danh sách lọc
    this.filteredOrders = [...this.orders];
  }
}
</script>

<style scoped>
.product-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.table th, .table td {
  vertical-align: middle;
}
</style>
