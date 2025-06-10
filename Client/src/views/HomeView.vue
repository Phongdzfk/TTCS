<template>
  <div>
    <div v-if="!isLoggedIn" class="alert alert-warning text-center my-5">
      <h4>Vui lòng đăng nhập để sử dụng trang web</h4>
      <div class="mt-3">
        <router-link to="/login" class="btn btn-primary mx-2">Đăng nhập</router-link>
        <router-link to="/register" class="btn btn-outline-primary mx-2">Đăng ký</router-link>
      </div>
    </div>
    <div v-else>
      <!-- Banner -->
      <div class="home-banner">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h1 class="display-5 fw-bold">TPComputer</h1>
              <p class="lead">Chuyên cung cấp thiết bị điện tử, linh kiện máy tính chính hãng giá tốt</p>
              <router-link to="/products" class="btn btn-primary btn-lg btn-shop-now">Mua sắm ngay</router-link>
              <p class="mt-3 home-intro">
                <span class="intro-highlight text-white"><i class="bi bi-patch-check-fill"></i> TPComputer - Uy tín, chất lượng, giá tốt!</span><br>
                <span class="intro-benefit text-white">✔ Sản phẩm chính hãng, bảo hành rõ ràng</span><br>
                <span class="intro-benefit text-white">✔ Giao hàng toàn quốc, hỗ trợ tận tâm</span><br>
                <span class="intro-benefit text-white">✔ Đa dạng linh kiện, thiết bị điện tử mới nhất</span>
              </p>
            </div>
            <div class="col-md-6">
              <img src="@/assets/images/home/banner.jpg" class="img-fluid rounded shadow" alt="Banner">
            </div>
          </div>
        </div>
      </div>

      <!-- Danh mục nổi bật -->
      <div class="container-fluid py-5">
        <div class="container">
          <h2 class="section-title">Danh mục sản phẩm</h2>
          <div class="row">
            <div v-for="cat in categories.slice(0, 4)" :key="cat.categoryID" class="col-md-3 col-6 mb-4">
              <router-link :to="`/products?category=${cat.categoryID}`" class="category-card text-center d-block p-0" style="text-decoration: none; color: inherit;">
                <div class="category-icon bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                  <i :class="iconClassForCategory(cat) + ' fs-3'"></i>
                </div>
                <h5>{{ cat.name }}</h5>
              </router-link>
            </div>
          </div>
          <div class="text-center mt-4">
            <router-link to="/products" class="btn btn-outline-primary">
              <i class="bi bi-grid-3x3-gap me-2"></i>Xem thêm
            </router-link>
          </div>
        </div>
      </div>

      <!-- Flash Sale -->
      <div class="container-fluid py-5 bg-light">
        <div class="container">
          <div class="flash-sale-header d-flex justify-content-between align-items-center mb-4">
            <h2 class="section-title mb-0">Flash Sale</h2>
            <router-link to="/promotions" class="btn btn-outline-primary">
              <i class="bi bi-lightning-charge me-2"></i>Xem tất cả
            </router-link>
          </div>
          <div v-if="loadingDiscount">Đang tải khuyến mãi...</div>
          <div v-else-if="productDiscounts.length === 0">
            Chưa có khuyến mãi nào, vui lòng đợi thông tin từ chúng tôi
          </div>
          <div v-else class="row">
            <div v-for="item in productDiscounts" :key="item.productDiscountID" class="col-md-3 col-6 mb-4">
              <div class="product-card h-100">
                <div v-if="item.value" class="sale-badge">-{{ item.value }}%</div>
                <img :src="getImageUrl(item.image)" class="card-img-top" :alt="item.productName">
                <div class="card-body">
                  <h5 class="card-title">{{ item.productName }}</h5>
                  <div class="price mb-2">
                    <span class="text-danger fw-bold">
                      {{ formatPrice(item.value ? item.price * (1 - item.value / 100) : item.price) }}
                    </span>
                    <del v-if="item.value" class="text-muted ms-2">{{ formatPrice(item.price) }}</del>
                  </div>
                  <div v-if="item.description" class="discount-description mb-2 small text-muted">
                    {{ item.description }}
                  </div>
                  <div v-if="item.endDate" class="countdown mb-2 small text-danger">
                    <i class="bi bi-clock me-1"></i>Còn lại: {{ formatTimeLeft(item.endDate) }}
                  </div>
                  <div class="d-grid gap-2">
                    <router-link
                      :to="{ path: '/products/' + item.productID, hash: '#top' }"
                      class="btn btn-cart btn-detail-red"
                      @click.native="scrollToTop"
                    >
                      <i class="bi bi-eye"></i> Xem chi tiết
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sản phẩm nổi bật -->
      <div class="container-fluid py-5">
        <div class="container">
          <h2 class="section-title">Sản phẩm nổi bật</h2>
          <div class="row">
            <div v-if="featuredProducts.length === 0" class="text-center text-muted py-5">
              Chưa có sản phẩm nổi bật nào
            </div>
            <div v-else v-for="product in featuredProducts" :key="product.productID" class="col-md-3 col-6 mb-4">
              <div class="product-card h-100">
                <div v-if="product.discount" class="sale-badge">-{{ product.discount.value }}%</div>
                <img :src="getImageUrl(product.image)" class="product-img-fit" :alt="product.name">
                <div class="card-body">
                  <h5 class="card-title">{{ product.name }}</h5>
                  <div class="price mb-2">
                    <span class="text-danger fw-bold">
                      {{ formatPrice(product.discount ? product.price * (1 - product.discount.value / 100) : product.price) }}
                    </span>
                    <del v-if="product.discount" class="text-muted ms-2">{{ formatPrice(product.price) }}</del>
                  </div>
                  <div class="d-grid gap-2">
                    <router-link
                      :to="{ path: '/products/' + product.productID, hash: '#top' }"
                      class="btn btn-cart btn-detail-red"
                      @click.native="scrollToTop"
                    >
                      <i class="bi bi-eye"></i> Xem chi tiết
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner quảng cáo -->
      <div class="container-fluid py-5 bg-light">
        <div class="container">
          <div class="row">
            <div class="col-md-6 mb-4">
              <div class="promo-banner">
                <img src="@/assets/images/home/banner.jpg" class="img-fluid rounded" alt="Khuyến mãi">
                <div class="promo-content">
                  <h3>Laptop Gaming</h3>
                  <p>Giảm đến 20% cho tất cả laptop gaming</p>
                  <router-link to="/products?category=laptop" class="btn btn-light">Xem ngay</router-link>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-4">
              <div class="promo-banner">
                <img src="@/assets/images/home/banner.jpg" class="img-fluid rounded" alt="Khuyến mãi">
                <div class="promo-content">
                  <h3>Phụ kiện Gaming</h3>
                  <p>Mua 2 tặng 1 cho tất cả phụ kiện</p>
                  <router-link to="/products?category=accessory" class="btn btn-light">Xem ngay</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: 'Bearer ' + token };
}

export default {
  data() {
    return {
      categories: [],
      featuredProducts: [],
      isLoggedIn: false,
      productDiscounts: [],
      loadingDiscount: true,
    }
  },
  mounted() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.fetchCategories();
    this.fetchProductDiscounts();
    this.fetchFeaturedProducts();
    setTimeout(() => {
      console.log('Categories:', this.categories);
    }, 1500);
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    getImageUrl(image) {
      if (!image) return 'https://via.placeholder.com/300x200';
      if (image.startsWith('http') || image.startsWith('/uploads/')) return image;
      return 'http://localhost:5000/uploads/' + image;
    },
    iconClassForCategory(cat) {
      switch ((cat.name || '').toLowerCase()) {
        case 'laptop':
          return 'bi bi-laptop';
        case 'màn hình':
          return 'bi bi-tv';
        case 'ssd':
          return 'bi bi-hdd';
        case 'chuột':
          return 'bi bi-mouse';
        default:
          return 'bi bi-tags';
      }
    },
    async addToCart(product) {
      try {
        await axios.post(`${BASE_URL}/api/cart/add`, {
          productId: product.productId || product.productID,
          quantity: 1
        }, { headers: getAuthHeaders() });
        alert('Đã thêm vào giỏ hàng!');
        // Lấy lại số lượng giỏ hàng
        const res = await axios.get(`${BASE_URL}/api/cart`, { headers: getAuthHeaders() });
        const count = (res.data.cart || []).reduce((sum, i) => sum + i.quantity, 0);
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: count }));
      } catch (e) {
        alert('Lỗi khi thêm vào giỏ hàng!');
      }
    },
    async fetchCategories() {
      try {
        const res = await (this.$axios
          ? this.$axios.get('/api/categories')
          : (await import('axios')).default.get('http://localhost:5000/api/categories'));
        console.log('API /api/categories raw result:', res);
        if (res && res.data) {
          this.categories = res.data.categories || res.data || [];
        } else {
          this.categories = [];
        }
        console.log('Categories sau xử lý:', this.categories);
      } catch (err) {
        this.categories = [];
        console.error('Fetch categories error:', err);
      }
    },
    async fetchProductDiscounts() {
      this.loadingDiscount = true;
      try {
        const res = await (this.$axios
          ? this.$axios.get('/api/products/discounts')
          : (await import('axios')).default.get('http://localhost:5000/api/products/discounts'));
        this.productDiscounts = res.data.productDiscounts || [];
      } catch (e) {
        this.productDiscounts = [];
      } finally {
        this.loadingDiscount = false;
      }
    },
    async fetchFeaturedProducts() {
      try {
        const res = await (this.$axios
          ? this.$axios.get('/api/products/featured')
          : (await import('axios')).default.get('http://localhost:5000/api/products/featured'));
        this.featuredProducts = res.data.products || [];
      } catch (e) {
        this.featuredProducts = [];
      }
    },
    scrollToTop() {
      // Đảm bảo cuộn lên đầu trang khi vào ProductDetailView
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    formatTimeLeft(endDate) {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) return 'Đã kết thúc';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days} ngày ${hours} giờ`;
      if (hours > 0) return `${hours} giờ ${minutes} phút`;
      return `${minutes} phút`;
    },
  }
}
</script>

<style scoped>
.btn-detail-red {
  background-color: var(--primary-color) !important;
  color: #fff !important;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-detail-red:hover {
  background-color: #a51212 !important;
}

.btn-shop-now {
  background-color: #fff !important;
  color: #c82333 !important;
  border: 2px solid #c82333 !important;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s, color 0.2s;
}
.btn-shop-now:hover {
  background-color: #c82333 !important;
  color: #fff !important;
  border-color: #c82333 !important;
}

.home-intro {
  font-size: 1.1rem;
  color: #444;
  margin-top: 1rem;
  line-height: 1.7;
}
.intro-highlight {
  color: #fff;
  font-weight: 700;
  font-size: 1.15rem;
}
.intro-benefit {
  color: #fff;
  font-size: 1rem;
  margin-left: 8px;
  font-weight: 600;
}
.benefit-green {
  color: #28a745;
}
.benefit-blue {
  color: #0d6efd;
}
.benefit-orange {
  color: #fd7e14;
}
</style>
