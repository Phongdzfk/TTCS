<template>
  <header>
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <router-link class="navbar-brand" to="/">TPComputer</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Trang chủ</router-link>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Danh mục
              </a>
              <ul class="dropdown-menu">
                <li v-for="cat in categories" :key="cat.categoryID">
                  <router-link class="dropdown-item" :to="`/products?category=${cat.categoryID}`">{{ cat.name }}</router-link>
                </li>
              </ul>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/products">Sản phẩm</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/promotions">Khuyến mãi</router-link>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="https://www.pcworld.com/news">Tin tức</a>
            </li>
          </ul>
          <div class="d-flex align-items-center">
            <div class="search-box me-3">
              <input
                type="text"
                class="form-control"
                placeholder="Tìm kiếm..."
                v-model="searchTerm"
                @keyup.enter="handleNavbarSearch"
              >
              <button class="btn btn-primary ms-2" @click="handleNavbarSearch">
                <i class="bi bi-search"></i>
              </button>
            </div>
            <div class="nav-icons d-flex">
              <router-link to="/profile" class="nav-icon me-3">
                <i class="bi bi-person"></i>
              </router-link>
              <router-link to="/orders" class="nav-icon me-3">
                <i class="bi bi-box-seam"></i>
              </router-link>
              <router-link to="/cart" class="nav-icon position-relative">
                <i class="bi bi-cart3"></i>
                <span class="cart-count">{{ cartCount }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'TheNavbar',
  data() {
    return {
      categories: [],
      BASE_URL: 'http://localhost:5000',
      searchTerm: '',
      cartCount: 0
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchCartCount();
    window.addEventListener('cart-updated', this.handleCartUpdated);
  },
  beforeUnmount() {
    window.removeEventListener('cart-updated', this.handleCartUpdated);
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await (this.$axios
          ? this.$axios.get('/api/categories')
          : (await import('axios')).default.get(this.BASE_URL + '/api/categories'));
        this.categories = res.data.categories || [];
      } catch (e) {
        this.categories = [];
      }
    },
    async handleNavbarSearch() {
      const term = this.searchTerm.trim();
      if (!term) return;
      // Tìm category theo tên (không phân biệt hoa thường)
      const foundCategory = this.categories.find(cat => cat.name.toLowerCase() === term.toLowerCase());
      if (foundCategory) {
        this.$router.push({ path: '/products', query: { category: foundCategory.categoryID } });
        this.searchTerm = '';
        return;
      }
      // Nếu không phải tên category, lấy sản phẩm đầu tiên khớp tên để lấy categoryID
      try {
        const res = await (this.$axios
          ? this.$axios.get('/api/products', { params: { search: term } })
          : (await import('axios')).default.get(this.BASE_URL + '/api/products', { params: { search: term } }));
        const products = res.data.products || [];
        if (products.length > 0) {
          const firstCategoryID = products[0].categoryID;
          this.$router.push({ path: '/products', query: { search: term, category: firstCategoryID } });
        } else {
          this.$router.push({ path: '/products', query: { search: term } });
        }
        this.searchTerm = '';
      } catch (e) {
        this.$router.push({ path: '/products', query: { search: term } });
        this.searchTerm = '';
      }
    },
    async fetchCartCount() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await (await import('axios')).default.get(this.BASE_URL + '/api/cart', { headers: { Authorization: 'Bearer ' + token } });
        this.cartCount = (res.data.cart || []).reduce((sum, i) => sum + i.quantity, 0);
      } catch (e) {
        this.cartCount = 0;
      }
    },
    handleCartUpdated(e) {
      this.cartCount = e.detail || 0;
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 0.75rem 0;
  z-index: 1030;
}

.navbar-brand {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--primary-color) !important;
}

.nav-link {
  font-weight: 500;
  color: var(--text-color) !important;
  padding: 0.5rem 1rem;
  transition: all 0.3s;
}

.nav-link:hover, 
.nav-link.active {
  color: var(--primary-color) !important;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 0.5rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.dropdown-item:hover {
  background-color: rgba(205, 24, 24, 0.1);
  color: var(--primary-color);
}

.search-box {
  width: 250px;
}

.search-box .form-control {
  border-radius: 20px;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.nav-icon {
  font-size: 1.3rem;
  color: var(--text-color);
  transition: all 0.3s;
}

.nav-icon:hover {
  color: var(--primary-color);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 992px) {
  .search-box {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .nav-icons {
    margin-left: auto;
  }
}
</style>
