<template>
  <div v-if="product">
    <!-- Banner -->
    <div class="product-banner">
      <div class="container-fluid">
        <div class="container">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><router-link to="/" class="text-white">Trang chủ</router-link></li>
              <li class="breadcrumb-item"><router-link to="/products" class="text-white">Sản phẩm</router-link></li>
              <li class="breadcrumb-item active text-white" aria-current="page">{{ product.name }}</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <div class="container-fluid py-5">
      <div class="container">
        <div class="product-detail">
          <div class="row">
            <div class="col-md-5">
              <div class="product-image-container">
                <img :src="product.image" class="img-fluid product-image" :alt="product.name">
              </div>
              <div class="product-thumbnails mt-3 d-flex">
                <div v-for="(img, idx) in product.images" :key="idx" class="thumbnail-item me-2" :class="{active: img === product.image}" @click="product.image = img">
                  <img :src="img" class="img-fluid" :alt="product.name + ' thumbnail ' + (idx+1)">
                </div>
              </div>
            </div>
            <div class="col-md-7">
              <h1 class="product-title">{{ product.name }}</h1>
              <div class="product-meta d-flex align-items-center mb-3">
                <div class="me-3">
                  <span class="text-muted">Mã sản phẩm:</span> <span class="fw-medium">SP{{ product.productId }}</span>
                </div>
                <div class="me-3">
                  <span class="text-muted">Tình trạng:</span> 
                  <span v-if="product.stockQuantity > 0" class="text-success">
                    <i class="bi bi-check-circle"></i> Còn hàng
                  </span>
                  <span v-else class="text-danger">
                    <i class="bi bi-x-circle"></i> Hết hàng
                  </span>
                </div>
                <div>
                  <span class="text-muted">Bảo hành:</span> <span class="fw-medium">24 tháng</span>
                </div>
              </div>
              <div class="price mb-4">
                <span v-if="product.discount" class="sale-badge">-{{ product.discount.value }}%</span>
                <span class="text-danger fw-bold">
                  {{ formatPrice(product.discount ? product.price * (1 - product.discount.value / 100) : product.price) }}
                </span>
                <del v-if="product.discount" class="text-muted ms-2">{{ formatPrice(product.price) }}</del>
              </div>
              <div class="product-short-desc mb-4">
                <p>{{ product.description }}</p>
              </div>
              <div class="product-promotion mb-4">
                <div class="promotion-title">
                  <i class="bi bi-gift text-primary me-2"></i> Khuyến mãi
                </div>
                <ul class="promotion-list">
                  <li>Tặng balo laptop chính hãng</li>
                  <li>Chuột không dây trị giá 350.000đ</li>
                  <li>Giảm 10% khi mua phụ kiện kèm theo</li>
                  <li>Bảo hành tại nhà</li>
                </ul>
              </div>
              <div class="quantity-control mb-4">
                <div class="d-flex align-items-center">
                  <button class="btn-quantity" @click="quantity > 1 ? quantity-- : null">-</button>
                  <input type="number" class="form-control quantity-input" v-model="quantity" min="1">
                  <button class="btn-quantity" @click="quantity++">+</button>
                </div>
              </div>
              <button class="btn btn-add-cart w-100 mb-3" @click="addToCart" :disabled="product.stockQuantity <= 0">
                <i class="bi bi-cart-plus me-2"></i> Thêm vào giỏ hàng
              </button>
              <button class="btn btn-buy-now w-100">
                <i class="bi bi-lightning-fill me-2"></i> Mua ngay
              </button>
            </div>
          </div>
        </div>
        <!-- Tabs: Thông số kỹ thuật -->
        <div class="product-tabs mt-5">
          <ul class="nav nav-tabs" id="productTab" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="specs-tab" data-bs-toggle="tab" data-bs-target="#specs-tab-pane" type="button" role="tab" aria-controls="specs-tab-pane" aria-selected="true">Thông số kỹ thuật</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="desc-tab" data-bs-toggle="tab" data-bs-target="#desc-tab-pane" type="button" role="tab" aria-controls="desc-tab-pane" aria-selected="false">Mô tả sản phẩm</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="review-tab" data-bs-toggle="tab" data-bs-target="#review-tab-pane" type="button" role="tab" aria-controls="review-tab-pane" aria-selected="false">Đánh giá</button>
            </li>
          </ul>
          <div class="tab-content" id="productTabContent">
            <div class="tab-pane fade show active" id="specs-tab-pane" role="tabpanel" aria-labelledby="specs-tab">
              <table class="table table-bordered mt-3">
                <tbody>
                  <tr v-for="att in product.attributes" :key="att.key">
                    <th class="w-25">{{ att.key }}</th>
                    <td>{{ att.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="tab-pane fade" id="desc-tab-pane" role="tabpanel" aria-labelledby="desc-tab">
              <div class="mt-3">
                <p>{{ product.description }}</p>
              </div>
            </div>
            <div class="tab-pane fade" id="review-tab-pane" role="tabpanel" aria-labelledby="review-tab">
              <div class="mt-3">
                <h5>Đánh giá sản phẩm</h5>
                <template v-if="reviews.length === 0">
                  <div class="text-muted mb-3">Chưa có đánh giá nào.</div>
                </template>
                <template v-else>
                  <div v-for="(review, idx) in reviews" :key="idx" class="mb-3 border-bottom pb-2">
                    <div>
                      <b>{{ review.user }}</b>
                      <span class="ms-2 text-warning">
                        <i v-for="n in review.rating" :key="n" class="bi bi-star-fill"></i>
                        <i v-for="n in (5 - review.rating)" :key="n" class="bi bi-star"></i>
                      </span>
                      <span class="text-muted ms-2">{{ formatDateTime(review.date) }}</span>
                    </div>
                    <div>{{ review.comment }}</div>
                  </div>
                </template>
                <form class="mt-4" @submit.prevent="addReview">
                  <div class="mb-2">
                    <label class="form-label">Đánh giá của bạn:</label>
                    <select v-model="newReviewRating" class="form-select w-auto d-inline-block ms-2">
                      <option v-for="n in 5" :key="n" :value="n">{{ n }} sao</option>
                    </select>
                  </div>
                  <div class="mb-2">
                    <textarea v-model="newReviewComment" class="form-control" rows="2" placeholder="Nhận xét của bạn..."></textarea>
                  </div>
                  <button class="btn btn-primary" type="submit">Gửi đánh giá</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="container py-5 text-center text-danger">
    <h2>Không tìm thấy sản phẩm!</h2>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue';
import axios from 'axios';
const BASE_URL = 'http://localhost:5000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: 'Bearer ' + token };
}

export default {
  components: {
    ProductCard
  },
  data() {
    return {
      product: null,
      quantity: 1,
      reviews: [],
      newReviewRating: 5,
      newReviewComment: ''
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    async addToCart() {
      try {
        await axios.post(`${BASE_URL}/api/cart/add`, {
          productId: this.product.productId || this.product.productID,
          quantity: this.quantity
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
    formatDateTime(dateString) {
      return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
    },
    addReview() {
      this.reviews.push({ user: 'Khách hàng', rating: this.newReviewRating, comment: this.newReviewComment, date: new Date() });
      this.newReviewComment = '';
      this.newReviewRating = 5;
    },
    async fetchProductDetail(productId) {
      try {
        const res = await axios.get(BASE_URL + `/api/products/${productId}`);
        const p = res.data.product;
        this.product = {
          ...p,
          productId: p.productID,
          image: (p.images && p.images.length > 0) ? (BASE_URL + '/uploads/' + p.images[0]) : require('@/assets/images/home/banner.jpg'),
          images: (p.images || []).map(img => BASE_URL + '/uploads/' + img)
        };
      } catch (e) {
        this.product = null;
      }
    }
  },
  mounted() {
    // Lấy chi tiết sản phẩm từ API bằng this.$route.params.id
    const productId = this.$route.params.id;
    this.fetchProductDetail(productId);
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

.product-detail {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 30px;
}

.product-image-container {
  border: 1px solid var(--border-color);
  border-radius: 5px;
  overflow: hidden;
  background-color: white;
}

.product-image {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
}

.thumbnail-item.active {
  border-color: var(--primary-color);
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.product-meta {
  font-size: 0.9rem;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

.product-short-desc {
  line-height: 1.6;
  color: var(--text-color);
}

.promotion-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.promotion-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 0;
}

.promotion-list li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 8px;
}

.promotion-list li:before {
  content: "✓";
  color: var(--primary-color);
  position: absolute;
  left: 0;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.btn-quantity {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background-color: #f8f9fa;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quantity-input {
  width: 60px;
  height: 40px;
  text-align: center;
  border-left: 0;
  border-right: 0;
  border-radius: 0;
}

.btn-add-cart {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add-cart:hover {
  background-color: #b31515;
}

.btn-buy-now {
  background-color: #ff6a00;
  color: white;
  border: none;
  padding: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-buy-now:hover {
  background-color: #e05e00;
}

.product-tabs {
  margin-top: 30px;
}

.nav-tabs .nav-link {
  color: var(--text-color);
  font-weight: 500;
  border: none;
  padding: 12px 20px;
}

.nav-tabs .nav-link.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

.tab-content {
  background-color: white;
  border-radius: 0 0 10px 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table th, .specs-table td {
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
}

.specs-table th {
  width: 30%;
  background-color: #f8f9fa;
  font-weight: 600;
}

.section-title {
  position: relative;
  margin-bottom: 30px;
  font-weight: 700;
  color: var(--secondary-color);
  text-transform: uppercase;
  padding-bottom: 10px;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
}

.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

@media (max-width: 768px) {
  .product-banner {
    padding: 30px 0;
  }
  
  .product-detail {
    padding: 15px;
  }
  
  .product-title {
    font-size: 1.5rem;
  }
  
  .price {
    font-size: 1.5rem;
  }
  
  .thumbnail-item {
    width: 60px;
    height: 60px;
  }
  
  .tab-content {
    padding: 15px;
  }
}
</style>
