<template>
  <div class="statistics-container">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Thống kê</h2>
        <div class="date-filter">
          <select class="form-select" v-model="selectedPeriod">
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Tổng doanh thu</h6>
              <h3 class="card-title mb-0">{{ formatPrice(totalRevenue) }}</h3>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> 12% so với kỳ trước
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Đơn hàng</h6>
              <h3 class="card-title mb-0">{{ totalOrders }}</h3>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> 8% so với kỳ trước
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Khách hàng mới</h6>
              <h3 class="card-title mb-0">{{ newCustomers }}</h3>
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> 15% so với kỳ trước
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Tỷ lệ chuyển đổi</h6>
              <h3 class="card-title mb-0">{{ conversionRate }}%</h3>
              <small class="text-danger">
                <i class="bi bi-arrow-down"></i> 3% so với kỳ trước
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Doanh thu theo thời gian</h5>
              <canvas ref="revenueChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Phân bố đơn hàng</h5>
              <canvas ref="orderDistributionChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- New Dashboard Section -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Doanh thu theo danh mục</h5>
              <canvas ref="categoryRevenueChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Thời gian mua hàng</h5>
              <canvas ref="purchaseTimeChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">Báo cáo chi tiết</h5>
                <div class="btn-group">
                  <button class="btn btn-outline-primary" @click="exportPDF">
                    <i class="bi bi-file-pdf"></i> Xuất PDF
                  </button>
                  <button class="btn btn-outline-success" @click="exportExcel">
                    <i class="bi bi-file-excel"></i> Xuất Excel
                  </button>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Danh mục</th>
                      <th>Số lượng bán</th>
                      <th>Doanh thu</th>
                      <th>Tỷ lệ tăng trưởng</th>
                      <th>Lợi nhuận</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="category in categoryStats" :key="category.name">
                      <td>{{ category.name }}</td>
                      <td>{{ category.sold }}</td>
                      <td>{{ formatPrice(category.revenue) }}</td>
                      <td>
                        <span :class="category.growth >= 0 ? 'text-success' : 'text-danger'">
                          <i :class="category.growth >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                          {{ Math.abs(category.growth) }}%
                        </span>
                      </td>
                      <td>{{ formatPrice(category.profit) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products & Recent Orders -->
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Sản phẩm bán chạy</h5>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Đã bán</th>
                      <th>Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in topProducts" :key="product.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img :src="product.image" class="product-thumbnail me-2" :alt="product.name">
                          <span>{{ product.name }}</span>
                        </div>
                      </td>
                      <td>{{ product.sold }}</td>
                      <td>{{ formatPrice(product.revenue) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Đơn hàng gần đây</h5>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in recentOrders" :key="order.id">
                      <td>#{{ order.id }}</td>
                      <td>{{ order.customer }}</td>
                      <td>{{ formatPrice(order.total) }}</td>
                      <td>
                        <span :class="'badge bg-' + getStatusColor(order.status)">
                          {{ order.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  data() {
    return {
      selectedPeriod: 'month',
      totalRevenue: 125000000,
      totalOrders: 156,
      newCustomers: 45,
      conversionRate: 3.2,
      topProducts: [
        {
          id: 1,
          name: 'Laptop Gaming Acer Nitro 5',
          image: '/images/products/laptop-1.jpg',
          sold: 25,
          revenue: 574750000
        },
        {
          id: 2,
          name: 'Màn hình Gaming 27" LG',
          image: '/images/products/monitor-1.jpg',
          sold: 18,
          revenue: 161820000
        },
        {
          id: 3,
          name: 'Bàn phím cơ Logitech G Pro',
          image: '/images/products/keyboard-1.jpg',
          sold: 32,
          revenue: 128000000
        }
      ],
      recentOrders: [
        {
          id: 'ORD001',
          customer: 'Nguyễn Văn A',
          total: 22990000,
          status: 'Hoàn thành'
        },
        {
          id: 'ORD002',
          customer: 'Trần Thị B',
          total: 8990000,
          status: 'Đang xử lý'
        },
        {
          id: 'ORD003',
          customer: 'Lê Văn C',
          total: 15990000,
          status: 'Đang giao'
        }
      ],
      categoryStats: [
        {
          name: 'Laptop',
          sold: 156,
          revenue: 3580000000,
          growth: 12.5,
          profit: 716000000
        },
        {
          name: 'Màn hình',
          sold: 89,
          revenue: 1780000000,
          growth: 8.3,
          profit: 356000000
        },
        {
          name: 'Phụ kiện',
          sold: 234,
          revenue: 1170000000,
          growth: -2.1,
          profit: 234000000
        }
      ]
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    getStatusColor(status) {
      const colors = {
        'Hoàn thành': 'success',
        'Đang xử lý': 'warning',
        'Đang giao': 'info',
        'Đã hủy': 'danger'
      };
      return colors[status] || 'secondary';
    },
    initRevenueChart() {
      const ctx = this.$refs.revenueChart.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
          datasets: [{
            label: 'Doanh thu',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    },
    initOrderDistributionChart() {
      const ctx = this.$refs.orderDistributionChart.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Hoàn thành', 'Đang xử lý', 'Đang giao', 'Đã hủy'],
          datasets: [{
            data: [65, 20, 10, 5],
            backgroundColor: [
              '#28a745',
              '#ffc107',
              '#17a2b8',
              '#dc3545'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    },
    initCategoryRevenueChart() {
      const ctx = this.$refs.categoryRevenueChart.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Laptop', 'Màn hình', 'Phụ kiện'],
          datasets: [{
            label: 'Doanh thu',
            data: [3580000000, 1780000000, 1170000000],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(153, 102, 255, 0.6)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return (value / 1000000).toFixed(0) + 'M';
                }
              }
            }
          }
        }
      });
    },
    initPurchaseTimeChart() {
      const ctx = this.$refs.purchaseTimeChart.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
          datasets: [{
            label: 'Số đơn hàng',
            data: [5, 2, 1, 8, 15, 20, 25, 18],
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    },
    exportPDF() {
      // Implement PDF export
      alert('Xuất PDF đang được phát triển');
    },
    exportExcel() {
      // Implement Excel export
      alert('Xuất Excel đang được phát triển');
    }
  },
  mounted() {
    this.initRevenueChart();
    this.initOrderDistributionChart();
    this.initCategoryRevenueChart();
    this.initPurchaseTimeChart();
  }
}
</script>

<style scoped>
.statistics-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.stat-card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-card .card-body {
  padding: 1.5rem;
}

.product-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
}

.card-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.table th {
  font-weight: 600;
  color: #666;
}

.badge {
  padding: 0.5em 0.75em;
}

canvas {
  height: 300px !important;
  min-height: unset !important;
  max-height: 350px;
}
</style> 