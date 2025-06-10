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
                      <input type="text" class="form-control" id="firstName" v-model="customer.firstName" disabled>
                    </div>
                    <div class="col-md-6">
                      <label for="lastName" class="form-label">Tên <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="lastName" v-model="customer.lastName" disabled>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                    <input type="email" class="form-control" id="email" v-model="customer.email" disabled>
                  </div>
                  <div class="mb-3">
                    <label for="phone" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                    <input type="tel" class="form-control" id="phone" v-model="customer.phone" disabled>
                  </div>
                  <div class="mb-3">
                    <label for="address" class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="address" v-model="customer.address" required>
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
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="vietqr" value="vietqr" v-model="paymentMethod">
                    <label class="form-check-label d-flex align-items-center" for="vietqr">
                      <img src="https://img.vietqr.io/image/VCB-0123456789-compact2.png" alt="VietQR" style="height: 24px;" class="me-2" />
                      <div>
                        <div>VietQR (Chuyển khoản ngân hàng)</div>
                        <small class="text-muted">Quét mã QR để chuyển khoản nhanh</small>
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
                    <div class="d-flex align-items-center">
                      <img :src="getImageUrl(item.image)" class="order-item-image rounded flex-shrink-0" :alt="item.name">
                      <div class="ms-3 flex-grow-1">
                        <div class="fw-semibold">{{ item.name }}</div>
                        <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">
                            <span v-if="item.discount">
                              {{ formatPrice(item.price * (1 - item.discount.value / 100)) }} x {{ item.quantity }}
                            </span>
                            <span v-else>
                              {{ formatPrice(item.price) }} x {{ item.quantity }}
                            </span>
                          </small>
                          <span class="fw-bold ms-2">
                            <span v-if="item.discount">
                              {{ formatPrice((item.price * (1 - item.discount.value / 100)) * item.quantity) }}
                            </span>
                            <span v-else>
                              {{ formatPrice(item.price * item.quantity) }}
                            </span>
                          </span>
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

    <template v-if="showVietQr">
      <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.3);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Quét mã VietQR để thanh toán</h5>
              <button type="button" class="btn-close" @click="showVietQr = false"></button>
            </div>
            <div class="modal-body text-center">
              <img :src="vietQrUrl" alt="VietQR" style="max-width: 300px; width: 100%;" />
              <p class="mt-3">Mã đơn hàng: <b>{{ vietQrOrderId }}</b></p>
              <p>Nội dung chuyển khoản: <b>Thanh toán đơn hàng {{ vietQrOrderId }}</b></p>
              <p class="text-muted">Vui lòng chuyển khoản đúng nội dung để hệ thống xác nhận đơn hàng.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showVietQr = false">Đóng</button>
              <button type="button" class="btn btn-success" @click="goToSuccess">Hoàn thành</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios';

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
      shippingFee: 30000,
      orderItems: [],
      showVietQr: false,
      vietQrUrl: '',
      vietQrOrderId: ''
    }
  },
  computed: {
    subtotal() {
      return this.orderItems.reduce((total, item) => {
        const price = item.discount ? item.price * (1 - item.discount.value / 100) : item.price;
        return total + price * item.quantity;
      }, 0);
    },
    total() {
      return this.subtotal + this.shippingFee;
    }
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
    async placeOrder() {
      // Chỉ kiểm tra field địa chỉ
      if (!this.customer.address) {
        alert('Vui lòng điền địa chỉ giao hàng!');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/orders', {
          customer: this.customer,
          orderItems: this.orderItems,
          paymentMethod: this.paymentMethod,
          total: this.total
        }, { headers: { Authorization: 'Bearer ' + token } });

        if (this.paymentMethod === 'cod') {
          alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại TPComputer.');
          window.dispatchEvent(new CustomEvent('cart-updated', { detail: 0 }));
          this.$router.push('/order-success');
        } else if (this.paymentMethod === 'vietqr' && res.data.qrUrl) {
          // Hiển thị mã QR cho khách hàng quét
          this.vietQrUrl = res.data.qrUrl;
          this.vietQrOrderId = res.data.orderIdStr;
          this.showVietQr = true;
        }
      } catch (e) {
        console.error('Lỗi đặt hàng:', e);
        alert(e.response?.data?.message || 'Có lỗi khi đặt hàng!');
      }
    },
    goToSuccess() {
      this.showVietQr = false;
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: 0 }));
      this.$router.push('/order-success');
    }
  },
  async mounted() {
    console.log('CheckoutView mounted!');
    // Lấy thông tin user từ profile
    try {
      const token = localStorage.getItem('token');
      const profileRes = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const user = profileRes.data.user;
      // Tự động điền thông tin từ profile
      this.customer = {
        firstName: user.firstname || '',
        lastName: user.lastname || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: '',
        district: '',
        zipCode: '',
        note: ''
      };
    } catch (e) {
      console.error('Lỗi lấy thông tin user:', e);
    }

    // Lấy giỏ hàng thực tế từ backend
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: 'Bearer ' + token }
      });
      this.orderItems = res.data.cart || [];
      console.log('orderItems từ API cart:', this.orderItems);
    } catch (e) {
      this.orderItems = [];
      console.error('Lỗi lấy giỏ hàng:', e);
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
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
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