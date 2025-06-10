<template>
  <div>
    <!-- Banner -->
    <div class="product-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold text-white">Sản phẩm</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Sản phẩm</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
    
    <div class="container-fluid py-5">
      <div class="container">
        <!-- Nút mở modal filter nâng cao -->
        <div class="d-flex gap-2 mb-3">
          <button
            v-if="filterAttributes.length > 0"
            class="btn btn-outline-secondary"
            @click="showFilter = true"
          >
            <i class="bi bi-funnel"></i> Lọc nâng cao
          </button>
          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-currency-dollar"></i> Lọc theo giá
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" @click.prevent="filterByPrice(null)">Tất cả giá</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="filterByPrice(5000000)">Dưới 5 triệu</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="filterByPrice(10000000)">Dưới 10 triệu</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="filterByPrice(15000000)">Dưới 15 triệu</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="filterByPrice(20000000)">Dưới 20 triệu</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="filterByPrice(20000000, true)">20 triệu trở lên</a></li>
            </ul>
          </div>
        </div>
        
        <!-- Filter Bar -->
        <div class="filter-bar mb-4">
          <div class="row">
            <div class="col-md-3 mb-3 mb-md-0">
              <select class="form-select" v-model="selectedCategory">
                <option value="">Tất cả danh mục</option>
                <option v-for="cat in categories" :key="cat.categoryID" :value="cat.categoryID">{{ cat.name }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <SearchBar @search="handleSearch" />
            </div>
            <div class="col-md-3">
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
        
        <!-- Modal Filter Nâng Cao -->
        <div v-if="showFilter" class="modal-backdrop">
          <div class="modal-content">
            <button class="btn-close" @click="showFilter = false">×</button>
            <h5>Lọc nâng cao</h5>
            <div v-for="att in filterAttributes" :key="att.attName" class="filter-group">
              <label>{{ att.attName }}</label>
              <div>
                <button
                  v-for="val in att.values"
                  :key="val"
                  :class="['btn', selectedFilter[att.attName] === val ? 'btn-primary' : 'btn-outline-secondary']"
                  @click="selectFilter(att.attName, val)"
                >{{ val }}</button>
              </div>
            </div>
            <div class="filter-actions">
              <button class="btn btn-outline-danger" @click="resetFilter">Bỏ chọn</button>
              <button class="btn btn-primary" @click="applyFilter">Xem kết quả</button>
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
            <h4>Không tìm thấy sản phẩm phù hợp</h4>
            <p class="text-muted">Vui lòng thử lại với từ khóa khác hoặc bỏ bộ lọc</p>
            <button class="btn btn-outline-primary" @click="resetFilters">Xóa bộ lọc</button>
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

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: 'Bearer ' + token };
}

export default {
  components: {
    ProductCard,
    SearchBar
  },
  data() {
    return {
      products: [],
      categories: [],
      selectedCategory: '',
      searchKeyword: '',
      sortOption: 'default',
      loadingProducts: true,
      showFilter: false,
      filterAttributes: [], // Sẽ lấy động từ API
      selectedFilter: {},
      currentPage: 1,
      pageSize: 8,
      maxPrice: null, // Thêm biến để lưu giá tối đa
      minPrice: null, // Thêm biến để lưu giá tối thiểu
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchProductsWithFilter();
    this.fetchFilterAttributes(this.selectedCategory);
    const catQuery = this.$route.query.category;
    if (catQuery) {
      this.selectedCategory = catQuery;
    }
    const searchQuery = this.$route.query.search;
    if (searchQuery) {
      this.searchKeyword = searchQuery;
    }
  },
  watch: {
    '$route.query.category'(newVal) {
      this.selectedCategory = newVal || '';
      this.fetchFilterAttributes(newVal);
      // Nếu vừa chọn category, mở lại modal filter nếu đang mở
      if (this.showFilter) {
        this.showFilter = false;
        this.$nextTick(() => { this.showFilter = true; });
      }
    },
    '$route.query.search'(newVal) {
      this.searchKeyword = newVal || '';
      this.fetchProductsWithFilter();
    },
    selectedCategory(newVal) {
      // Khi user chọn từ dropdown, cũng fetch lại filterAttributes
      this.fetchFilterAttributes(newVal);
      // Nếu vừa chọn category, mở lại modal filter nếu đang mở
      if (this.showFilter) {
        this.showFilter = false;
        this.$nextTick(() => { this.showFilter = true; });
      }
    },
    filteredProducts() {
      // Reset về trang 1 nếu filter thay đổi và currentPage vượt quá tổng số trang
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await axios.get(BASE_URL + '/api/categories');
        this.categories = res.data.categories || [];
      } catch (e) {
        this.categories = [];
      }
    },
    async fetchProductsWithFilter() {
      const params = {
        categoryID: this.selectedCategory,
        search: this.searchKeyword,
        maxPrice: this.maxPrice, // Thêm maxPrice vào params
        minPrice: this.minPrice, // Thêm minPrice vào params
        ...this.selectedFilter // Gửi filter động lên backend
      };
      this.loadingProducts = true;
      try {
        const res = await axios.get(BASE_URL + '/api/products', { params });
        this.products = (res.data.products || []).map(p => ({
          ...p,
          productId: p.productID, // map lại cho đồng bộ frontend
          image: (p.images && p.images.length > 0) ? (BASE_URL + '/uploads/' + p.images[0]) : require('@/assets/images/home/banner.jpg')
        }));
      } catch (e) {
        this.products = [];
      } finally {
        this.loadingProducts = false;
      }
    },
    async fetchFilterAttributes(categoryID) {
      if (!categoryID) {
        this.filterAttributes = [];
        return;
      }
      try {
        const res = await axios.get(BASE_URL + '/api/products/attributes', { params: { categoryID } });
        // Kỳ vọng trả về: [{ attName: 'CPU', values: ['i5', 'i7'] }, ...]
        this.filterAttributes = (res.data.attributes || []).map(att => ({
          ...att,
          values: (att.values || []).filter(v => v)
        }));
      } catch (e) {
        this.filterAttributes = [];
      }
    },
    handleSearch(keyword) {
      this.searchKeyword = keyword;
      this.fetchProductsWithFilter();
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
    resetFilters() {
      this.selectedCategory = '';
      this.sortOption = 'default';
      this.searchKeyword = '';
      this.maxPrice = null; // Reset maxPrice
      this.minPrice = null; // Reset minPrice
    },
    selectFilter(attName, value) {
      // Sửa lại cho Vue 3: Không dùng this.$set, chỉ cần gán trực tiếp
      if (this.selectedFilter[attName] === value) {
        this.selectedFilter[attName] = null;
      } else {
        this.selectedFilter[attName] = value;
      }
      // Đảm bảo selectedFilter luôn reactive
      this.selectedFilter = { ...this.selectedFilter };
    },
    resetFilter() {
      this.selectedFilter = {};
    },
    applyFilter() {
      this.showFilter = false;
      this.fetchProductsWithFilter();
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
    },
    filterByPrice(price, isMinPrice = false) {
      if (isMinPrice) {
        this.minPrice = price;
        this.maxPrice = null;
      } else {
        this.maxPrice = price;
        this.minPrice = null;
      }
      this.fetchProductsWithFilter();
    },
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];
      if (this.selectedCategory) {
        result = result.filter(p => String(p.categoryID) === String(this.selectedCategory));
      }
      if (this.searchKeyword) {
        result = result.filter(p => p.name && p.name.toLowerCase().includes(this.searchKeyword.toLowerCase()));
      }
      switch (this.sortOption) {
        case 'price-asc':
          result.sort((a, b) => {
            const priceA = a.discount ? a.price * (1 - a.discount.value / 100) : a.price;
            const priceB = b.discount ? b.price * (1 - b.discount.value / 100) : b.price;
            return priceA - priceB;
          }); 
          break;
        case 'price-desc':
          result.sort((a, b) => {
            const priceA = a.discount ? a.price * (1 - a.discount.value / 100) : a.price;
            const priceB = b.discount ? b.price * (1 - b.discount.value / 100) : b.price;
            return priceB - priceA;
          }); 
          break;
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

.category-nav {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
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

/* Modal filter nâng cao */
.modal-backdrop {
  position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.3); z-index: 1050; display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: #fff; padding: 2rem; border-radius: 8px; min-width: 400px; max-width: 90vw; position: relative;
}
.btn-close {
  position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem;
}
.filter-group { margin-bottom: 1rem; }
.filter-actions { display: flex; gap: 1rem; justify-content: flex-end; }

@media (max-width: 768px) {
  .product-banner {
    padding: 30px 0;
  }
  
  .filter-bar {
    padding: 15px;
  }
}
</style>
