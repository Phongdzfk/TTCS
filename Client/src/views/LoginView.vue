<template>
  <div>
    <!-- Banner -->
    <div class="auth-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold text-white">Đăng nhập</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Đăng nhập</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <div class="container-fluid py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-5 col-md-8">
            <div class="auth-card">
              <div class="auth-card-header">
                <h2 class="text-center mb-0">Đăng nhập</h2>
              </div>
              <div class="auth-card-body">
                <form @submit.prevent="login">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
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
                    <label for="password" class="form-label">Mật khẩu</label>
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
                  </div>
                  
                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="rememberMe" v-model="rememberMe">
                    <label class="form-check-label" for="rememberMe">Ghi nhớ đăng nhập</label>
                  </div>
                  
                  <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-lg" :disabled="isLoading">
                      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}
                    </button>
                  </div>
                  
                  <div class="text-center mt-3">
                    <router-link to="/forgot-password" class="text-decoration-none">Quên mật khẩu?</router-link>
                  </div>
                </form>
                
                <div class="text-center mt-4">
                  <p class="mb-0">Bạn chưa có tài khoản? <router-link to="/register" class="text-decoration-none">Đăng ký ngay</router-link></p>
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
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      isLoading: false,
      errors: {},
      successMsg: '',
      errorMsg: ''
    }
  },
  methods: {
    validateForm() {
      let isValid = true;
      this.errors = {
        email: '',
        password: ''
      };
      
      // Kiểm tra email
      if (!this.email) {
        this.errors.email = 'Vui lòng nhập email';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.errors.email = 'Email không hợp lệ';
        isValid = false;
      }
      
      // Kiểm tra mật khẩu
      if (!this.password) {
        this.errors.password = 'Vui lòng nhập mật khẩu';
        isValid = false;
      } else if (this.password.length < 6) {
        this.errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        isValid = false;
      }
      
      return isValid;
    },
    async login() {
      this.successMsg = '';
      this.errorMsg = '';
      if (!this.validateForm()) return;
      this.isLoading = true;
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: this.email,
          password: this.password
        });
        // Lưu token vào localStorage
        localStorage.setItem('token', res.data.token);
        // Lưu roleID vào localStorage để tiện kiểm tra quyền
        localStorage.setItem('roleID', res.data.user.roleID);
        // Lưu userID vào localStorage để xác định tài khoản đang đăng nhập
        localStorage.setItem('userID', res.data.user.userID);
        this.successMsg = res.data.message || 'Đăng nhập thành công!';
        // Reset form
        this.email = '';
        this.password = '';
        this.errors = {};
        // Chuyển hướng theo quyền
        setTimeout(() => {
          if (res.data.user.roleID === 1) {
            this.$router.push('/admin');
          } else {
            this.$router.push('/');
          }
        }, 1000);
      } catch (err) {
        this.errorMsg = err.response?.data?.message || 'Đăng nhập thất bại!';
      } finally {
        this.isLoading = false;
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

@media (max-width: 768px) {
  .auth-banner {
    padding: 30px 0;
  }
  
  .auth-card-body {
    padding: 20px;
  }
}
</style>
