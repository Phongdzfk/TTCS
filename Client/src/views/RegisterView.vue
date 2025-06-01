<template>
  <div>
    <!-- Banner -->
    <div class="auth-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold text-white">Đăng ký tài khoản</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Đăng ký</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <div class="container-fluid py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-md-10">
            <div class="auth-card">
              <div class="auth-card-header">
                <h2 class="text-center mb-0">Đăng ký tài khoản mới</h2>
              </div>
              <div class="auth-card-body">
                <form @submit.prevent="register">
                  <div class="row mb-3">
                    <div class="col-md-6 mb-3 mb-md-0">
                      <label for="firstName" class="form-label">Họ <span class="text-danger">*</span></label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="firstName" 
                        v-model="firstName" 
                        placeholder="Nhập họ của bạn"
                        required
                      >
                      <div class="form-text text-danger" v-if="errors.firstName">{{ errors.firstName }}</div>
                    </div>
                    <div class="col-md-6">
                      <label for="lastName" class="form-label">Tên <span class="text-danger">*</span></label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="lastName" 
                        v-model="lastName" 
                        placeholder="Nhập tên của bạn"
                        required
                      >
                      <div class="form-text text-danger" v-if="errors.lastName">{{ errors.lastName }}</div>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                      <input 
                        type="email" 
                        class="form-control" 
                        id="email" 
                        v-model="email" 
                        placeholder="Nhập email của bạn"
                        required
                      >
                    </div>
                    <div class="form-text text-danger" v-if="errors.email">{{ errors.email }}</div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="phone" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                      <input 
                        type="tel" 
                        class="form-control" 
                        id="phone" 
                        v-model="phone" 
                        placeholder="Nhập số điện thoại của bạn"
                        required
                      >
                    </div>
                    <div class="form-text text-danger" v-if="errors.phone">{{ errors.phone }}</div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="address" class="form-label">Địa chỉ (không bắt buộc)</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="address" 
                      v-model="address" 
                      placeholder="Nhập địa chỉ (nếu có)"
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label for="password" class="form-label">Mật khẩu <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock"></i></span>
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="password" 
                        v-model="password"
                        placeholder="Nhập mật khẩu của bạn"
                        required
                      >
                      <button 
                        class="input-group-text btn-toggle-password" 
                        type="button"
                        @click="showPassword = !showPassword"
                      >
                        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                    <div class="form-text text-danger" v-if="errors.password">{{ errors.password }}</div>
                    <div class="form-text" v-else>Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Xác nhận mật khẩu <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-lock"></i></span>
                      <input 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="confirmPassword" 
                        v-model="confirmPassword"
                        placeholder="Nhập lại mật khẩu của bạn"
                        required
                      >
                      <button 
                        class="input-group-text btn-toggle-password" 
                        type="button"
                        @click="showConfirmPassword = !showConfirmPassword"
                      >
                        <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                    <div class="form-text text-danger" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
                  </div>
                  
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="agreeTerms" v-model="agreeTerms" required>
                    <label class="form-check-label" for="agreeTerms">
                      Tôi đồng ý với <a href="#" class="text-decoration-none">Điều khoản dịch vụ</a> và <a href="#" class="text-decoration-none">Chính sách bảo mật</a>
                    </label>
                    <div class="form-text text-danger" v-if="errors.agreeTerms">{{ errors.agreeTerms }}</div>
                  </div>
                  
                  <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
                      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
                    </button>
                  </div>
                </form>
                
                <div class="divider my-4">
                  <span>Hoặc đăng ký với</span>
                </div>
                
                <div class="social-login">
                  <button class="btn btn-outline-primary social-btn">
                    <i class="bi bi-facebook me-2"></i> Facebook
                  </button>
                  <button class="btn btn-outline-danger social-btn">
                    <i class="bi bi-google me-2"></i> Google
                  </button>
                </div>
                
                <div class="text-center mt-4">
                  <p class="mb-0">Bạn đã có tài khoản? <router-link to="/login" class="text-decoration-none">Đăng nhập ngay</router-link></p>
                </div>
                
                <div v-if="successMsg" class="alert alert-success">{{ successMsg }}</div>
                <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      address: '',
      showPassword: false,
      showConfirmPassword: false,
      errors: {},
      successMsg: '',
      errorMsg: ''
    }
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: ''
      };
      
      // Kiểm tra họ
      if (!this.firstName.trim()) {
        this.errors.firstName = 'Vui lòng nhập họ của bạn';
        isValid = false;
      }
      
      // Kiểm tra tên
      if (!this.lastName.trim()) {
        this.errors.lastName = 'Vui lòng nhập tên của bạn';
        isValid = false;
      }
      
      // Kiểm tra email
      if (!this.email) {
        this.errors.email = 'Vui lòng nhập email';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.errors.email = 'Email không hợp lệ';
        isValid = false;
      }
      
      // Kiểm tra số điện thoại
      if (!this.phone) {
        this.errors.phone = 'Vui lòng nhập số điện thoại';
        isValid = false;
      } else if (!/^[0-9]{10,11}$/.test(this.phone.replace(/\s/g, ''))) {
        this.errors.phone = 'Số điện thoại không hợp lệ';
        isValid = false;
      }
      
      // Kiểm tra mật khẩu
      if (!this.password) {
        this.errors.password = 'Vui lòng nhập mật khẩu';
        isValid = false;
      } else if (this.password.length < 8) {
        this.errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
        isValid = false;
      } else if (!/[A-Z]/.test(this.password) || !/[a-z]/.test(this.password) || !/[0-9]/.test(this.password)) {
        this.errors.password = 'Mật khẩu phải bao gồm chữ hoa, chữ thường và số';
        isValid = false;
      }
      
      // Kiểm tra xác nhận mật khẩu
      if (!this.confirmPassword) {
        this.errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        isValid = false;
      } else if (this.confirmPassword !== this.password) {
        this.errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }
      
      // Kiểm tra đồng ý điều khoản
      if (!this.agreeTerms) {
        this.errors.agreeTerms = 'Bạn phải đồng ý với điều khoản dịch vụ và chính sách bảo mật';
        isValid = false;
      }
      
      return isValid;
    },
    async register() {
      this.successMsg = '';
      this.errorMsg = '';
      if (!this.validateForm()) return;
      try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
          email: this.email,
          password: this.password,
          lastname: this.lastName,
          firstname: this.firstName,
          phone: this.phone,
          address: this.address
        });
        this.successMsg = res.data.message || 'Đăng ký thành công!';
        // Reset form
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.password = '';
        this.confirmPassword = '';
        this.address = '';
        this.errors = {};
        // Chuyển hướng sau 1.5 giây
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);
      } catch (err) {
        this.errorMsg = err.response?.data?.message || 'Đăng ký thất bại!';
      }
    }
  }
}
</script>

<style scoped>
.auth-banner {
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

.auth-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-card-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.auth-card-body {
  padding: 30px;
}

.btn-toggle-password {
  background-color: transparent;
  border-left: none;
  cursor: pointer;
}

.btn-toggle-password:hover {
  background-color: #f8f9fa;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 10px;
  color: #6c757d;
  font-size: 0.9rem;
}

.social-login {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .auth-banner {
    padding: 30px 0;
  }
  
  .auth-card-body {
    padding: 20px;
  }
  
  .social-login {
    flex-direction: column;
  }
}
</style>
