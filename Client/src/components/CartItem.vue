<template>
  <div class="card mb-3">
    <div class="row g-0">
      <div class="col-md-4">
        <img :src="item.image || 'https://via.placeholder.com/150'" class="img-fluid rounded-start" :alt="item.name">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">{{ item.name }}</h5>
          <p class="card-text text-danger">{{ formatPrice(item.price) }}</p>
          <div class="d-flex align-items-center mb-2">
            <button class="btn btn-sm btn-outline-secondary" @click="updateQuantity(-1)">-</button>
            <span class="mx-2">{{ item.quantity }}</span>
            <button class="btn btn-sm btn-outline-secondary" @click="updateQuantity(1)">+</button>
            <button class="btn btn-sm btn-danger ms-auto" @click="removeItem">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    updateQuantity(change) {
      if (this.item.quantity + change <= 0) return;
      this.$emit('update-quantity', this.item.productId, change);
    },
    removeItem() {
      this.$emit('remove-item', this.item.productId);
    }
  }
}
</script>
