<template>
  <div>
    <!-- Banner -->
    <div class="cart-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold">Giỏ hàng của bạn</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Giỏ hàng</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <div class="container-fluid py-5">
      <div class="container">
        <!-- Giỏ hàng trống -->
        <div v-if="!cartItems.length" class="empty-cart text-center py-5">
          <i class="bi bi-cart-x display-1 text-muted"></i>
          <h2 class="mt-4">Giỏ hàng của bạn đang trống</h2>
          <p class="lead mb-4">Hãy thêm sản phẩm vào giỏ hàng để tiến hành thanh toán</p>
          <router-link to="/products" class="btn btn-primary btn-lg">Tiếp tục mua sắm</router-link>
        </div>

        <!-- Giỏ hàng có sản phẩm -->
        <div v-else>
          <div class="row">
            <div class="col-lg-8">
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Sản phẩm trong giỏ hàng ({{ cartItems.length }})</h5>
                  <button class="btn btn-sm btn-outline-danger" @click="clearCart">
                    <i class="bi bi-trash"></i> Xóa tất cả
                  </button>
                </div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-borderless mb-0">
                      <thead class="bg-light">
                        <tr>
                          <th scope="col">Sản phẩm</th>
                          <th scope="col" class="text-center">Đơn giá</th>
                          <th scope="col" class="text-center">Số lượng</th>
                          <th scope="col" class="text-center">Thành tiền</th>
                          <th scope="col" class="text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in cartItems" :key="item.productId">
                          <td>
                            <div class="d-flex align-items-center">
                              <img :src="server + item.image" class="cart-item-image rounded" :alt="item.name">
                              <div class="ms-3">
                                <h6 class="mb-1">{{ item.name }}</h6>
                                <small class="text-muted">{{ item.description }}</small>
                              </div>
                            </div>
                          </td>
                          <td class="text-center align-middle">{{ formatPrice(item.price) }}</td>
                          <td class="text-center align-middle">
                            <div class="quantity-control d-flex align-items-center justify-content-center">
                              <button class="btn btn-sm btn-outline-secondary" @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">
                                <i class="bi bi-dash"></i>
                              </button>
                              <input type="number" class="form-control mx-2 text-center" v-model="item.quantity" min="1" max="10">
                              <button class="btn btn-sm btn-outline-secondary" @click="increaseQuantity(item)">
                                <i class="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td class="text-center align-middle fw-bold">{{ formatPrice(item.price * item.quantity) }}</td>
                          <td class="text-center align-middle">
                            <button class="btn btn-sm btn-outline-danger" @click="removeItem(item)">
                              <i class="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="card-footer bg-white">
                  <div class="d-flex justify-content-between">
                    <router-link to="/products" class="btn btn-outline-primary">
                      <i class="bi bi-arrow-left me-2"></i>Tiếp tục mua sắm
                    </router-link>
                    <button class="btn btn-outline-success" @click="updateCart">
                      <i class="bi bi-arrow-repeat me-2"></i>Cập nhật giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-lg-4">
              <div class="card mb-4">
                <div class="card-header">
                  <h5 class="mb-0">Tóm tắt đơn hàng</h5>
                </div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-3">
                    <span>Tạm tính:</span>
                    <span>{{ formatPrice(subtotal) }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-3">
                    <span>Giảm giá:</span>
                    <span>{{ formatPrice(discount) }}</span>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between mb-4">
                    <span class="fw-bold">Tổng cộng:</span>
                    <span class="fw-bold text-primary">{{ formatPrice(total) }}</span>
                  </div>
                  
                  <div class="mb-4">
                    <label for="couponCode" class="form-label">Mã giảm giá</label>
                    <div class="input-group">
                      <input type="text" class="form-control" id="couponCode" v-model="couponCode" placeholder="Nhập mã giảm giá">
                      <button class="btn btn-outline-primary" type="button" @click="applyCoupon">Áp dụng</button>
                    </div>
                  </div>
                  
                  <router-link to="/checkout" class="btn btn-primary w-100">
                    Tiến hành thanh toán
                  </router-link>
                  
                  <div class="payment-methods mt-4">
                    <p class="text-muted small mb-2">Chúng tôi chấp nhận:</p>
                    <div class="d-flex justify-content-between">
                      <i class="bi bi-credit-card fs-4"></i>
                      <i class="bi bi-paypal fs-4"></i>
                      <i class="bi bi-wallet2 fs-4"></i>
                      <i class="bi bi-bank fs-4"></i>
                    </div>
                  </div>
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
      cartItems: [
        {
          productId: 1,
          name: 'Laptop Gaming Acer Nitro 5',
          price: 22990000,
          quantity: 1,
          image: '@/assets/images/home/banner.jpg',
          description: 'Core i7-11800H, RAM 16GB, SSD 512GB, RTX 3060'
        },
        {
          productId: 3,
          name: 'Màn hình Gaming 27" LG UltraGear',
          price: 8990000,
          quantity: 2,
          image: '@/assets/images/home/banner.jpg',
          description: '27 inch, QHD, IPS, 165Hz, 1ms'
        }
      ],
      couponCode: ''
    }
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    discount() {
      // Giả lập giảm giá 10%
      return this.subtotal * 0.1;
    },
    total() {
      return this.subtotal - this.discount;
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    increaseQuantity(item) {
      if (item.quantity < 10) {
        item.quantity++;
      }
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--;
      }
    },
    removeItem(item) {
      this.cartItems = this.cartItems.filter(cartItem => cartItem.productId !== item.productId);
    },
    clearCart() {
      if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
        this.cartItems = [];
      }
    },
    updateCart() {
      alert('Giỏ hàng đã được cập nhật!');
    },
    applyCoupon() {
      if (this.couponCode) {
        alert(`Đã áp dụng mã giảm giá: ${this.couponCode}`);
        this.couponCode = '';
      } else {
        alert('Vui lòng nhập mã giảm giá!');
      }
    }
  }
}
</script>

<style scoped>
.cart-banner {
  background-color: var(--primary-color);
  color: white;
  padding: 40px 0;
  margin-bottom: 0;
  width: 100%;
}

.cart-banner h1 {
  margin-bottom: 10px;
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

.empty-cart {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.quantity-control .form-control {
  width: 60px;
}

.payment-methods i {
  color: var(--secondary-color);
}

.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

@media (max-width: 768px) {
  .cart-banner {
    padding: 30px 0;
  }
  
  .cart-item-image {
    width: 60px;
    height: 60px;
  }
  
  .quantity-control .form-control {
    width: 40px;
  }
}
</style>