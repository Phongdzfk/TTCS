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
        <div class="col-md-4">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Tổng doanh thu</h6>
              <h3 class="card-title mb-0">{{ formatPrice(totalRevenue) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Đơn hàng</h6>
              <h3 class="card-title mb-0">{{ totalOrders }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card stat-card">
            <div class="card-body">
              <h6 class="card-subtitle mb-2 text-muted">Tỷ lệ chuyển đổi</h6>
              <h3 class="card-title mb-0">{{ conversionRate }}%</h3>
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
              <h5 class="card-title">Doanh thu theo hãng</h5>
              <canvas ref="brandRevenueChart"></canvas>
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
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="category in categoryStats" :key="category.name">
                      <td>{{ category.name }}</td>
                      <td>{{ category.sold }}</td>
                      <td>{{ formatPrice(category.revenue) }}</td>
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
import axios from 'axios'

export default {
  data() {
    return {
      selectedPeriod: 'month',
      totalRevenue: 0,
      totalOrders: 0,
      conversionRate: 0,
      topProducts: [],
      recentOrders: [],
      categoryStats: [],
      charts: {
        revenue: null,
        orderDistribution: null,
        categoryRevenue: null,
        brandRevenue: null
      }
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    getStatusColor(status) {
      const colors = {
        'completed': 'success',
        'processing': 'warning',
        'shipping': 'info',
        'cancelled': 'danger'
      };
      return colors[status] || 'secondary';
    },
    async fetchSummary() {
      try {
        const response = await axios.get(`/api/statistics/summary?period=${this.selectedPeriod}`);
        const data = response.data;
        this.totalRevenue = data.totalRevenue;
        this.totalOrders = data.totalOrders;
        this.conversionRate = data.conversionRate;
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    },
    async fetchRevenueByTime() {
      try {
        const response = await axios.get(`/api/statistics/revenue-by-time?period=${this.selectedPeriod}`);
        const data = response.data;
        this.updateRevenueChart(data.labels, data.data);
      } catch (error) {
        console.error('Error fetching revenue by time:', error);
      }
    },
    async fetchOrderDistribution() {
      try {
        const response = await axios.get(`/api/statistics/order-distribution?period=${this.selectedPeriod}`);
        const data = response.data;
        this.updateOrderDistributionChart(data.labels, data.data);
      } catch (error) {
        console.error('Error fetching order distribution:', error);
      }
    },
    async fetchCategoryRevenue() {
      try {
        const response = await axios.get(`/api/statistics/category-revenue?period=${this.selectedPeriod}`);
        const data = response.data;
        this.updateCategoryRevenueChart(data.labels, data.data);
      } catch (error) {
        console.error('Error fetching category revenue:', error);
      }
    },
    async fetchBrandRevenue() {
      try {
        const response = await axios.get(`/api/statistics/brand-revenue?period=${this.selectedPeriod}`);
        const data = response.data;
        this.updateBrandRevenueChart(data.labels, data.data);
      } catch (error) {
        console.error('Error fetching brand revenue:', error);
      }
    },
    async fetchCategoryStats() {
      try {
        const response = await axios.get(`/api/statistics/category-stats?period=${this.selectedPeriod}`);
        this.categoryStats = response.data;
      } catch (error) {
        console.error('Error fetching category stats:', error);
      }
    },
    async fetchTopProducts() {
      try {
        const response = await axios.get(`/api/statistics/top-products?period=${this.selectedPeriod}`);
        this.topProducts = response.data;
      } catch (error) {
        console.error('Error fetching top products:', error);
      }
    },
    async fetchRecentOrders() {
      try {
        const response = await axios.get(`/api/statistics/recent-orders?period=${this.selectedPeriod}`);
        this.recentOrders = response.data;
      } catch (error) {
        console.error('Error fetching recent orders:', error);
      }
    },
    updateRevenueChart(labels, data) {
      if (this.charts.revenue) {
        this.charts.revenue.destroy();
      }
      const ctx = this.$refs.revenueChart.getContext('2d');
      this.charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Doanh thu',
            data: data,
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
    updateOrderDistributionChart(labels, data) {
      if (this.charts.orderDistribution) {
        this.charts.orderDistribution.destroy();
      }
      const ctx = this.$refs.orderDistributionChart.getContext('2d');
      this.charts.orderDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
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
    updateCategoryRevenueChart(labels, data) {
      if (this.charts.categoryRevenue) {
        this.charts.categoryRevenue.destroy();
      }
      const ctx = this.$refs.categoryRevenueChart.getContext('2d');
      this.charts.categoryRevenue = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Doanh thu',
            data: data,
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
    updateBrandRevenueChart(labels, data) {
      if (this.charts.brandRevenue) {
        this.charts.brandRevenue.destroy();
      }

      const ctx = this.$refs.brandRevenueChart.getContext('2d');
      this.charts.brandRevenue = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Doanh thu',
            data: data,
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
    async fetchData() {
      await Promise.all([
        this.fetchSummary(),
        this.fetchRevenueByTime(),
        this.fetchOrderDistribution(),
        this.fetchCategoryRevenue(),
        this.fetchBrandRevenue(),
        this.fetchCategoryStats(),
        this.fetchTopProducts(),
        this.fetchRecentOrders()
      ]);
    },
    exportPDF() {
      alert('Xuất PDF đang được phát triển');
    },
    exportExcel() {
      alert('Xuất Excel đang được phát triển');
    }
  },
  watch: {
    selectedPeriod() {
      this.fetchData();
    }
  },
  async mounted() {
    await this.fetchData();
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