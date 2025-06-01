<template>
  <div>
    <!-- Banner -->
    <div class="checkout-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold">Thanh toán</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item"><router-link to="/cart">Giỏ hàng</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Thanh toán</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <div class="container-fluid py-5">
      <div class="container">
        <!-- Checkout Steps -->
        <div class="checkout-steps mb-5">
          <div class="row">
            <div class="col-12">
              <div class="d-flex justify-content-center">
                <div class="step completed">
                  <div class="step-icon">
                    <i class="bi bi-cart-check"></i>
                  </div>
                  <div class="step-label">Giỏ hàng</div>
                </div>
                <div class="step-connector"></div>
                <div class="step active">
                  <div class="step-icon">
                    <i class="bi bi-credit-card"></i>
                  </div>
                  <div class="step-label">Thanh toán</div>
                </div>
                <div class="step-connector"></div>
                <div class="step">
                  <div class="step-icon">
                    <i class="bi bi-check-circle"></i>
                  </div>
                  <div class="step-label">Hoàn tất</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- Thông tin đặt hàng -->
          <div class="col-lg-8 mb-4">
            <div class="card mb-4">
              <div class="card-header">
                <h5 class="mb-0">Thông tin giao hàng</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="placeOrder">
                  <div class="row mb-3">
                    <div class="col-md-6 mb-3 mb-md-0">
                      <label for="firstName" class="form-label">Họ <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="firstName" v-model="customer.firstName" required>
                    </div>
                    <div class="col-md-6">
                      <label for="lastName" class="form-label">Tên <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="lastName" v-model="customer.lastName" required>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                    <input type="email" class="form-control" id="email" v-model="customer.email" required>
                  </div>

                  <div class="mb-3">
                    <label for="phone" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                    <input type="tel" class="form-control" id="phone" v-model="customer.phone" required>
                  </div>

                  <div class="mb-3">
                    <label for="address" class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="address" v-model="customer.address" required>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-4 mb-3 mb-md-0">
                      <label for="city" class="form-label">Thành phố <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="city" v-model="customer.city" required>
                    </div>
                    <div class="col-md-4 mb-3 mb-md-0">
                      <label for="district" class="form-label">Quận/Huyện <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="district" v-model="customer.district" required>
                    </div>
                    <div class="col-md-4">
                      <label for="zipCode" class="form-label">Mã bưu điện</label>
                      <input type="text" class="form-control" id="zipCode" v-model="customer.zipCode">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="note" class="form-label">Ghi chú</label>
                    <textarea class="form-control" id="note" rows="3" v-model="customer.note"></textarea>
                  </div>
                </form>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Phương thức thanh toán</h5>
              </div>
              <div class="card-body">
                <div class="payment-methods">
                  <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="cod" value="cod" v-model="paymentMethod" checked>
                    <label class="form-check-label d-flex align-items-center" for="cod">
                      <i class="bi bi-cash me-2 fs-4"></i>
                      <div>
                        <div>Thanh toán khi nhận hàng (COD)</div>
                        <small class="text-muted">Thanh toán bằng tiền mặt khi nhận hàng</small>
                      </div>
                    </label>
                  </div>
                  <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="banking" value="banking" v-model="paymentMethod">
                    <label class="form-check-label d-flex align-items-center" for="banking">
                      <i class="bi bi-bank me-2 fs-4"></i>
                      <div>
                        <div>Chuyển khoản ngân hàng</div>
                        <small class="text-muted">Thanh toán qua tài khoản ngân hàng</small>
                      </div>
                    </label>
                  </div>
                  <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="credit" value="credit" v-model="paymentMethod">
                    <label class="form-check-label d-flex align-items-center" for="credit">
                      <i class="bi bi-credit-card me-2 fs-4"></i>
                      <div>
                        <div>Thẻ tín dụng/Ghi nợ</div>
                        <small class="text-muted">Thanh toán an toàn qua cổng thanh toán</small>
                      </div>
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="ewallet" value="ewallet" v-model="paymentMethod">
                    <label class="form-check-label d-flex align-items-center" for="ewallet">
                      <i class="bi bi-wallet2 me-2 fs-4"></i>
                      <div>
                        <div>Ví điện tử</div>
                        <small class="text-muted">Thanh toán qua Momo, ZaloPay, VNPay</small>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tóm tắt đơn hàng -->
          <div class="col-lg-4">
            <div class="card mb-4 order-summary">
              <div class="card-header">
                <h5 class="mb-0">Tóm tắt đơn hàng</h5>
              </div>
              <div class="card-body">
                <div class="order-items">
                  <div v-for="item in orderItems" :key="item.productId" class="order-item mb-3">
                    <div class="d-flex">
                      <img :src="item.image" class="order-item-image rounded" :alt="item.name">
                      <div class="ms-3">
                        <h6 class="mb-1">{{ item.name }}</h6>
                        <div class="d-flex justify-content-between">
                          <small class="text-muted">{{ formatPrice(item.price) }} x {{ item.quantity }}</small>
                          <span class="fw-bold">{{ formatPrice(item.price * item.quantity) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr>

                <div class="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span>{{ formatPrice(shippingFee) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span>Giảm giá:</span>
                  <span>-{{ formatPrice(discount) }}</span>
                </div>

                <div class="mb-3">
                  <div class="input-group">
                    <input type="text" class="form-control" placeholder="Mã giảm giá" v-model="couponCode">
                    <button class="btn btn-outline-primary" type="button" @click="applyCoupon">Áp dụng</button>
                  </div>
                </div>

                <hr>

                <div class="d-flex justify-content-between mb-4">
                  <span class="fw-bold">Tổng cộng:</span>
                  <span class="fw-bold fs-5 text-primary">{{ formatPrice(total) }}</span>
                </div>

                <button class="btn btn-primary w-100" @click="placeOrder">
                  Đặt hàng
                </button>

                <div class="mt-3 text-center">
                  <small class="text-muted">
                    Bằng cách nhấn "Đặt hàng", bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a> của chúng tôi
                  </small>
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
      customer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        zipCode: '',
        note: ''
      },
      paymentMethod: 'cod',
      couponCode: '',
      discount: 0,
      shippingFee: 30000,
      orderItems: [
        {
          productId: 1,
          name: 'Laptop Gaming Acer Nitro 5',
          price: 22990000,
          quantity: 1,
          image: '@/assets/images/home/banner.jpg'
        },
        {
          productId: 3,
          name: 'Màn hình Gaming 27" LG UltraGear',
          price: 8990000,
          quantity: 2,
          image: '@/assets/images/home/banner.jpg'
        }
      ]
    }
  },
  computed: {
    subtotal() {
      return this.orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    total() {
      return this.subtotal + this.shippingFee - this.discount;
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    applyCoupon() {
      if (this.couponCode) {
        if (this.couponCode.toLowerCase() === 'giamgia10') {
          this.discount = this.subtotal * 0.1;
          alert('Áp dụng mã giảm giá thành công!');
        } else {
          alert('Mã giảm giá không hợp lệ!');
          this.discount = 0;
        }
        this.couponCode = '';
      } else {
        alert('Vui lòng nhập mã giảm giá!');
      }
    },
    placeOrder() {
      // Kiểm tra thông tin khách hàng
      if (!this.customer.firstName || !this.customer.lastName || !this.customer.email || 
          !this.customer.phone || !this.customer.address || !this.customer.city || 
          !this.customer.district) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng!');
        return;
      }
      
      // Xử lý đặt hàng
      alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại TPComputer.');
      
      // Chuyển hướng đến trang hoàn tất
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.checkout-banner {
  background-color: var(--primary-color);
  color: white;
  padding: 40px 0;
  margin-bottom: 0;
  width: 100%;
}

.checkout-banner h1 {
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

.checkout-steps {
  position: relative;
  padding: 20px 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border: 2px solid var(--border-color);
  color: var(--text-color);
  font-size: 1.2rem;
}

.step.active .step-icon {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.step.completed .step-icon {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.step-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.step-connector {
  flex: 1;
  height: 2px;
  background-color: var(--border-color);
  margin: 0 15px;
  position: relative;
  top: -30px;
  min-width: 60px;
}

.order-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.form-label {
  font-weight: 500;
}

.payment-methods .form-check-label {
  cursor: pointer;
}

.py-5 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

@media (max-width: 768px) {
  .checkout-banner {
    padding: 30px 0;
  }
  
  .step-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .step-label {
    font-size: 0.8rem;
  }
  
  .step-connector {
    min-width: 30px;
    margin: 0 5px;
    top: -25px;
  }
  
  .order-item-image {
    width: 50px;
    height: 50px;
  }
}
</style>