<template>
  <div>
    <!-- Banner -->
    <div class="product-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold text-white">Khuyến mãi</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Khuyến mãi</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
    
    <div class="container-fluid py-5">
      <div class="container">
        <!-- Không có filter nâng cao, chỉ có sort và search -->
        <div class="filter-bar mb-4">
          <div class="row">
            <div class="col-md-6">
              <SearchBar @search="handleSearch" />
            </div>
            <div class="col-md-6">
              <select class="form-select" v-model="sortOption">
                <option value="default">Sắp xếp mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Product Grid -->
        <div class="row">
          <div v-for="product in paginatedProducts" :key="product.productId" class="col-lg-3 col-md-4 col-6 mb-4">
            <ProductCard :product="product" @add-to-cart="addToCart" />
          </div>
        </div>
        <!-- Empty State -->
        <div v-if="filteredProducts.length === 0 && !loadingProducts" class="text-center py-5">
          <div class="empty-state">
            <i class="bi bi-search fs-1 text-muted mb-3"></i>
            <h4>Không có sản phẩm khuyến mãi nào</h4>
            <p class="text-muted">Vui lòng quay lại sau hoặc xem các sản phẩm khác</p>
          </div>
        </div>
        <!-- Loading State -->
        <div v-if="loadingProducts" class="text-center py-5">
          <div class="loading-state">
            <i class="bi bi-spinner fs-1 text-muted mb-3"></i>
            <h4>Đang tải sản phẩm...</h4>
          </div>
        </div>
        <!-- Pagination -->
        <div v-if="filteredProducts.length > 0" class="d-flex justify-content-center mt-4">
          <nav aria-label="Page navigation">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" aria-label="Previous" @click.prevent="prevPage">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" aria-label="Next" @click.prevent="nextPage">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';
import SearchBar from '@/components/SearchBar.vue';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

export default {
  components: {
    ProductCard,
    SearchBar
  },
  data() {
    return {
      products: [],
      searchKeyword: '',
      sortOption: 'default',
      loadingProducts: true,
      currentPage: 1,
      pageSize: 8,
    }
  },
  mounted() {
    this.fetchPromotionProducts();
  },
  methods: {
    async fetchPromotionProducts() {
      this.loadingProducts = true;
      try {
        const res = await axios.get(BASE_URL + '/api/products', { params: { hasDiscount: true } });
        this.products = (res.data.products || []).map(p => ({
          ...p,
          productId: p.productID,
          image: (p.images && p.images.length > 0) ? (BASE_URL + '/uploads/' + p.images[0]) : require('@/assets/images/home/banner.jpg')
        })).filter(p => p.discount); // Chỉ lấy sản phẩm có discount
      } catch (e) {
        this.products = [];
      } finally {
        this.loadingProducts = false;
      }
    },
    handleSearch(keyword) {
      this.searchKeyword = keyword;
    },
    addToCart(product) {
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    }
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];
      if (this.searchKeyword) {
        result = result.filter(p => p.name && p.name.toLowerCase().includes(this.searchKeyword.toLowerCase()));
      }
      switch (this.sortOption) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price); break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price); break;
        case 'name-asc':
          result.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc':
          result.sort((a, b) => b.name.localeCompare(a.name)); break;
        default:
          break;
      }
      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredProducts.slice(start, start + this.pageSize);
    }
  }
}
</script>

<style scoped>
.product-banner {
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

.filter-bar {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.empty-state {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.pagination .page-link {
  color: var(--primary-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}
</style> 