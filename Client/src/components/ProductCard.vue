<template>
  <div class="product-card h-100">
    <div v-if="product.discount" class="sale-badge">-{{ product.discount.value }}%</div>
    <img :src="getImageUrl(product.image)" class="card-img-top" :alt="product.name">
    <div class="card-body">
      <h5 class="card-title">{{ product.name }}</h5>
      <div class="price">
        <span class="text-danger fw-bold">
          {{ formatPrice(product.discount ? product.price * (1 - product.discount.value / 100) : product.price) }}
        </span>
        <del v-if="product.discount" class="text-muted ms-2">{{ formatPrice(product.price) }}</del>
      </div>
      <p class="description">{{ product.description }}</p>
      <div class="d-flex justify-content-between align-items-center">
        <router-link :to="'/products/' + (product.productID || product.productId)" class="btn btn-detail">Chi tiết</router-link>
        <button class="btn btn-cart" @click="addToCart(product)">
          <i class="bi bi-cart-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      BASE_URL: 'http://localhost:5000'
    };
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    addToCart(product) {
      this.$emit('add-to-cart', product);
    },
    getImageUrl(image) {
      if (!image) return 'https://via.placeholder.com/300x200';
      if (image.startsWith('http') || image.startsWith('/uploads/')) return image;
      return this.BASE_URL + '/uploads/' + image;
    }
  }
}
</script>

<style scoped>
.product-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border-color);
  background-color: #fff;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.product-card .card-img-top {
  height: 200px;
  object-fit: contain;
  padding: 1rem;
  background-color: #fff;
}

.product-card .card-body {
  padding: 1rem;
}

.product-card .card-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  height: 2.5rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; /* Standard property for compatibility */
}

.product-card .price {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.product-card .description {
  color: var(--text-muted);
  font-size: 0.9rem;
  height: 3rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2; /* Standard property for compatibility */
  margin-bottom: 1rem;
}

.product-card .btn-cart {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.product-card .btn-cart:hover {
  background-color: #a51212;
}

.product-card .btn-detail {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.product-card .btn-detail:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
</style>
