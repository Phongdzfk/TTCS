<template>
  <div>
    <!-- Banner -->
    <div class="profile-banner">
      <div class="container-fluid">
        <div class="container">
          <h1 class="display-5 fw-bold text-white">Thông tin tài khoản</h1>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><router-link to="/">Trang chủ</router-link></li>
              <li class="breadcrumb-item active" aria-current="page">Tài khoản</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <div class="container-fluid py-5">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-md-10">
            <div class="profile-card">
              <div class="profile-card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Thông tin cá nhân</h5>
                <button class="btn btn-sm btn-outline-primary" @click="editMode = !editMode">
                  <i class="bi" :class="editMode ? 'bi-x' : 'bi-pencil'"></i>
                  {{ editMode ? 'Hủy' : 'Chỉnh sửa' }}
                </button>
              </div>
              
              <div class="profile-card-body">
                <div class="profile-user-info text-center mb-4">
                  <div class="profile-user-avatar">
                    <template v-if="user.avatar">
                      <img :src="user.avatar" alt="User Avatar">
                    </template>
                    <template v-else>
                      <div class="avatar-default-bg d-flex align-items-center justify-content-center">
                        <i class="bi bi-person-fill fs-1 text-white"></i>
                      </div>
                    </template>
                  </div>
                  <h4 class="mt-3">{{ user.lastname }} {{ user.firstname }}</h4>
                  <div class="text-muted">{{ user.email }}</div>
                </div>
                
                <form @submit.prevent="updateProfile">
                  <div class="row mb-3">
                    <div class="col-md-6 mb-3 mb-md-0">
                      <label for="lastname" class="form-label">Họ</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="lastname" 
                        v-model="userForm.lastname" 
                        :disabled="!editMode"
                      >
                    </div>
                    <div class="col-md-6">
                      <label for="firstname" class="form-label">Tên</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="firstname" 
                        v-model="userForm.firstname" 
                        :disabled="!editMode"
                      >
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      id="email" 
                      v-model="userForm.email" 
                      disabled
                    >
                    <div class="form-text">Email không thể thay đổi</div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="phone" class="form-label">Số điện thoại</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      id="phone" 
                      v-model="userForm.phone" 
                      :disabled="!editMode"
                    >
                  </div>
                  
                  <div class="mb-3">
                    <label for="address" class="form-label">Địa chỉ</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="address" 
                      v-model="userForm.address" 
                      :disabled="!editMode"
                    >
                  </div>
                  
                  <div class="text-end">
                    <button v-if="editMode" type="submit" class="btn btn-success">Lưu thay đổi</button>
                  </div>
                </form>
              </div>
            </div>
            
            <div class="text-end mt-3">
              <button class="btn btn-danger" @click="logout">Đăng xuất</button>
            </div>
            
            <div class="profile-card mt-4">
              <div class="profile-card-header">
                <h5 class="mb-0">Đổi mật khẩu</h5>
              </div>
              <div class="profile-card-body">
                <form @submit.prevent="changePassword">
                  <div class="mb-3">
                    <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
                    <div class="input-group">
                      <input 
                        :type="showCurrentPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="currentPassword" 
                        v-model="passwordForm.currentPassword"
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      >
                      <button 
                        class="input-group-text btn-toggle-password" 
                        type="button"
                        @click="showCurrentPassword = !showCurrentPassword"
                      >
                        <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="newPassword" class="form-label">Mật khẩu mới</label>
                    <div class="input-group">
                      <input 
                        :type="showNewPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="newPassword" 
                        v-model="passwordForm.newPassword"
                        placeholder="Nhập mật khẩu mới"
                        required
                      >
                      <button 
                        class="input-group-text btn-toggle-password" 
                        type="button"
                        @click="showNewPassword = !showNewPassword"
                      >
                        <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                      </button>
                    </div>
                    <div class="form-text">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Xác nhận mật khẩu mới</label>
                    <div class="input-group">
                      <input 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        class="form-control" 
                        id="confirmPassword" 
                        v-model="passwordForm.confirmPassword"
                        placeholder="Nhập lại mật khẩu mới"
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
                  </div>
                  
                  <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="submit" class="btn btn-primary" :disabled="isLoading">
                      <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {{ isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
                    </button>
                  </div>
                </form>
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
      user: {},
      userForm: {
        lastname: '',
        firstname: '',
        email: '',
        phone: '',
        address: ''
      },
      editMode: false,
      isLoading: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      errorMsg: '',
      successMsg: ''
    }
  },
  async created() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/login');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.user = res.data.user;
      this.userForm.lastname = this.user.lastname || '';
      this.userForm.firstname = this.user.firstname || '';
      this.userForm.email = this.user.email || '';
      this.userForm.phone = this.user.phone || '';
      this.userForm.address = this.user.address || '';
    } catch (err) {
      this.errorMsg = err.response?.data?.message || 'Không lấy được thông tin người dùng!';
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        this.$router.push('/login');
      }
    }
  },
  methods: {
    updateProfile() {
      this.isLoading = true;
      
      // Giả lập API call
      setTimeout(() => {
        this.isLoading = false;
        this.user = { ...this.userForm };
        this.editMode = false;
        
        // Hiển thị thông báo thành công
        alert('Cập nhật thông tin thành công!');
      }, 1000);
    },
    changePassword() {
      // Kiểm tra mật khẩu mới và xác nhận mật khẩu
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
      
      // Kiểm tra độ mạnh của mật khẩu
      if (this.passwordForm.newPassword.length < 8) {
        alert('Mật khẩu phải có ít nhất 8 ký tự!');
        return;
      }
      
      this.isLoading = true;
      
      // Giả lập API call
      setTimeout(() => {
        this.isLoading = false;
        
        // Reset form
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        // Hiển thị thông báo thành công
        alert('Đổi mật khẩu thành công!');
      }, 1000);
    },
    logout() {
      if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        this.$router.push('/login');
        this.successMsg = 'Đăng xuất thành công!';
      }
    }
  }
}
</script>

<style scoped>
.profile-banner {
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

.profile-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-card-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.profile-card-body {
  padding: 30px;
}

.profile-user-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  border: 5px solid #f8f9fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-toggle-password {
  background-color: transparent;
  border-left: none;
  cursor: pointer;
}

.btn-toggle-password:hover {
  background-color: #f8f9fa;
}

.avatar-default-bg {
  width: 100%;
  height: 100%;
  background: #c82333;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .profile-banner {
    padding: 30px 0;
  }
  
  .profile-card-body {
    padding: 20px;
  }
  
  .profile-user-avatar {
    width: 100px;
    height: 100px;
  }
}
</style>
