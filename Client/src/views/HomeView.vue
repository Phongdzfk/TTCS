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
              <router-link to="/products" class="btn btn-primary btn-lg">Mua sắm ngay</router-link>
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
        </div>
      </div>

      <!-- Flash Sale -->
      <div class="container-fluid py-5 bg-light">
        <div class="container">
          <div class="flash-sale-header d-flex justify-content-between align-items-center mb-4">
            <h2 class="section-title mb-0">Flash Sale</h2>
          </div>
          <div v-if="loadingDiscount">Đang tải khuyến mãi...</div>
          <div v-else-if="productDiscounts.length === 0">
            Chưa có khuyến mãi nào, vui lòng đợi thông tin từ chúng tôi
          </div>
          <div v-else class="row">
            <div v-for="item in productDiscounts" :key="item.productDiscountID" class="col-md-3 col-6 mb-4">
              <div class="product-card h-100">
                <div class="sale-badge">-{{ item.value }}%</div>
                <img :src="item.image" class="card-img-top" :alt="item.productName">
                <div class="card-body">
                  <h5 class="card-title">{{ item.productName }}</h5>
                  <div class="price mb-2">
                    <span class="text-danger fw-bold">
                      {{ formatPrice(item.price * (1 - item.value / 100)) }}
                    </span>
                    <del class="text-muted ms-2">{{ formatPrice(item.price) }}</del>
                  </div>
                  <div class="d-grid gap-2">
                    <button class="btn btn-cart" @click="addToCart(item)">
                      <i class="bi bi-cart-plus"></i> Thêm vào giỏ
                    </button>
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
                <img :src="product.image ? (BASE_URL + '/uploads/' + product.image) : require('@/assets/images/home/banner.jpg')"
                  class="product-img-fit" :alt="product.name">
                <div class="card-body">
                  <h5 class="card-title">{{ product.name }}</h5>
                  <div class="price mb-2">
                    <span class="text-danger fw-bold">{{ formatPrice(product.price) }}</span>
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
export default {
  data() {
    return {
      categories: [],
      featuredProducts: [],
      isLoggedIn: false,
      productDiscounts: [],
      loadingDiscount: true,
      BASE_URL: 'http://localhost:5000'
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
    addToCart(product) {
      alert(`Đã thêm ${product.productName || product.name} vào giỏ hàng!`);
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
    }
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
</style>
