<template>
  <div class="admin-users">
    <h2 class="mb-4">Quản lý người dùng</h2>
    
    <!-- Thanh công cụ -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm theo tên, email, số điện thoại..." 
            v-model="searchQuery"
            @input="filterUsers"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="roleFilter" @change="filterUsers">
          <option value="">Tất cả vai trò</option>
          <option value="2">Khách hàng</option>
          <option value="1">Quản trị viên</option>
        </select>
      </div>
      <div class="col-md-3 text-end">
        <button class="btn btn-primary" @click="openAddUserModal">
          <i class="bi bi-plus-lg me-2"></i> Thêm người dùng
        </button>
      </div>
    </div>
    
    <!-- Bảng người dùng -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Họ tên</th>
                <th scope="col">Email</th>
                <th scope="col">Số điện thoại</th>
                <th scope="col">Vai trò</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>
                  {{ user.firstname }} {{ user.lastname }}
                  <span v-if="user.id == currentUserId" class="badge bg-success ms-2">đây là bạn</span>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone }}</td>
                <td>
                  <span :class="getRoleBadgeClass(user.roleID)">
                    {{ getRoleName(user.roleID) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="viewUserDetails(user)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" @click="editUser(user)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button v-if="user.id != currentUserId" class="btn btn-sm btn-outline-danger" @click="deleteUser(user)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Phân trang -->
    <div class="d-flex justify-content-between align-items-center mt-4">
      <div>
        Hiển thị {{ paginatedUsers.length }} / {{ filteredUsers.length }} người dùng
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="currentPage--">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          <li 
            v-for="page in totalPages" 
            :key="page" 
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="currentPage++">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- Modal Chi tiết người dùng -->
    <div v-if="selectedUser" class="modal fade" id="userDetailsModal" tabindex="-1" aria-hidden="true" ref="userDetailsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thông tin người dùng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <h6 class="mb-2">Thông tin cá nhân</h6>
                  <p class="mb-1"><strong>ID:</strong> {{ selectedUser?.id }}</p>
                  <p class="mb-1"><strong>Họ tên:</strong> {{ selectedUser?.firstname }} {{ selectedUser?.lastname }}</p>
                  <p class="mb-1"><strong>Email:</strong> {{ selectedUser?.email }}</p>
                  <p class="mb-1"><strong>Số điện thoại:</strong> {{ selectedUser?.phone }}</p>
                  <p class="mb-1"><strong>Ngày sinh:</strong> {{ formatDate(selectedUser?.birthDate) }}</p>
                  <p class="mb-1"><strong>Giới tính:</strong> {{ getGenderName(selectedUser?.gender) }}</p>
                  <p class="mb-1"><strong>Vai trò:</strong> {{ getRoleName(selectedUser?.roleID) }}</p>
                  <p class="mb-1"><strong>Trạng thái:</strong> {{ getStatusName(selectedUser?.status) }}</p>
                  <p class="mb-1"><strong>Ngày đăng ký:</strong> {{ formatDate(selectedUser?.registrationDate) }}</p>
                  <p class="mb-1"><strong>Đăng nhập lần cuối:</strong> {{ formatDateTime(selectedUser?.lastLogin) }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <h6 class="mb-2">Địa chỉ</h6>
                  <div v-if="selectedUser?.addresses && selectedUser.addresses.length > 0">
                    <div v-for="(address, index) in selectedUser.addresses" :key="index" class="mb-2">
                      <div class="card">
                        <div class="card-body py-2 px-3">
                          <p class="mb-1">
                            <strong>{{ address.isDefault ? 'Địa chỉ mặc định' : `Địa chỉ ${index + 1}` }}</strong>
                          </p>
                          <p class="mb-1">{{ address.fullName }}</p>
                          <p class="mb-1">{{ address.phone }}</p>
                          <p class="mb-1">{{ address.addressLine }}, {{ address.ward }}, {{ address.district }}, {{ address.city }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-muted">Không có địa chỉ nào được lưu</p>
                </div>
              </div>
            </div>
            
            <div class="row mt-3">
              <div class="col-12">
                <h6 class="mb-3">Lịch sử đơn hàng</h6>
                <div v-if="selectedUser?.orders && selectedUser.orders.length > 0">
                  <div class="table-responsive">
                    <table class="table table-bordered">
                      <thead class="table-light">
                        <tr>
                          <th>Mã đơn hàng</th>
                          <th>Ngày đặt</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="order in selectedUser.orders" :key="order.id">
                          <td>{{ order.id }}</td>
                          <td>{{ formatDate(order.orderDate) }}</td>
                          <td>{{ formatPrice(order.total) }}</td>
                          <td>
                            <span :class="getOrderStatusClass(order.status)">
                              {{ getOrderStatusName(order.status) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p v-else class="text-muted">Chưa có đơn hàng nào</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="editUser(selectedUser)">Chỉnh sửa</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Thêm/Sửa người dùng -->
    <div class="modal fade" id="userFormModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="firstname" class="form-label">Họ <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="firstname" 
                    v-model="userForm.firstname" 
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label for="lastname" class="form-label">Tên <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="lastname" 
                    v-model="userForm.lastname" 
                    required
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="userForm.email" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="phone" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone" 
                  v-model="userForm.phone" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="address" class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="address" 
                  v-model="userForm.address" 
                  required
                >
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="roleID" class="form-label">Vai trò <span class="text-danger">*</span></label>
                  <select class="form-select" id="roleID" v-model="userForm.roleID" required>
                    <option value="2">Khách hàng</option>
                    <option value="1">Quản trị viên</option>
                  </select>
                </div>
              </div>
              
              <div v-if="!isEditing" class="mb-3">
                <label for="password" class="form-label">Mật khẩu <span class="text-danger">*</span></label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="userForm.password" 
                  :required="!isEditing"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveUser">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const BASE_URL = 'http://localhost:5000';
export default {
  data() {
    return {
      users: [],
      filteredUsers: [],
      searchQuery: '',
      roleFilter: '',
      isEditing: false,
      selectedUser: null,
      userForm: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        roleID: '2',
        password: ''
      },
      currentPage: 1,
      currentUserId: localStorage.getItem('userID') || '',
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredUsers.length / 10);
    },
    paginatedUsers() {
      const page = this.currentPage || 1;
      const start = (page - 1) * 10;
      return this.filteredUsers.slice(start, start + 10);
    }
  },
  methods: {
    removeVietnameseTones(str) {
      return str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    },
    async fetchUsers() {
      try {
        const res = await axios.get(`${BASE_URL}/api/users`);
        this.users = res.data.users.map(u => ({
          ...u,
          id: u.userID,
          firstname: u.firstname,
          lastname: u.lastname,
          email: u.email,
          phone: u.phone,
          address: u.address,
          roleID: u.roleID
        }));
        this.filterUsers();
      } catch (err) {
        this.users = [];
        this.filteredUsers = [];
      }
    },
    filterUsers() {
      let users = [...this.users];
      if (this.roleFilter) {
        users = users.filter(u => String(u.roleID) === String(this.roleFilter));
      }
      if (this.searchQuery) {
        const queryRaw = this.searchQuery.toLowerCase();
        const query = this.removeVietnameseTones(queryRaw);
        users = users.filter(u => {
          const name = this.removeVietnameseTones(((u.firstname || '') + ' ' + (u.lastname || '')).toLowerCase());
          const email = this.removeVietnameseTones((u.email || '').toLowerCase());
          const phone = (u.phone || '').toLowerCase();
          return (
            name.includes(query) ||
            email.includes(query) ||
            phone.includes(queryRaw)
          );
        });
      }
      this.filteredUsers = users;
    },
    async saveUser() {
      try {
        if (this.isEditing) {
          await axios.put(`${BASE_URL}/api/users/${this.userForm.id}`, this.userForm);
          alert('Cập nhật người dùng thành công!');
        } else {
          await axios.post(`${BASE_URL}/api/users`, this.userForm);
          alert('Thêm người dùng mới thành công!');
        }
        await this.fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Lưu người dùng thất bại!');
      }
    },
    async deleteUser(user) {
      // Không cho phép admin tự xóa chính mình
      if (String(user.id) === String(this.currentUserId)) {
        alert('Bạn không thể xóa chính tài khoản của mình!');
        return;
      }
      if (!confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.firstname} ${user.lastname}?`)) return;
      try {
        await axios.delete(`${BASE_URL}/api/users/${user.id}`);
        await this.fetchUsers();
        alert('Đã xóa người dùng thành công!');
      } catch (err) {
        alert(err.response?.data?.message || 'Xóa người dùng thất bại!');
      }
    },
    openAddUserModal() {
      this.isEditing = false;
      this.userForm = {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        roleID: '2',
        password: ''
      };
      // Hiện modal thêm user
    },
    editUser(user) {
      this.isEditing = true;
      this.userForm = { ...user };
      // Hiện modal sửa user
    },
    viewUserDetails(user) {
      this.selectedUser = user;
      this.$nextTick(() => {
        const modalEl = this.$refs.userDetailsModal;
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
          // Reset selectedUser về null khi đóng modal
          modalEl.addEventListener('hidden.bs.modal', () => {
            this.selectedUser = null;
          }, { once: true });
        }
      });
    },
    getRoleBadgeClass(roleID) {
      // Đơn giản: 1 = admin, 2 = user
      if (String(roleID) === '1') return 'badge bg-danger';
      if (String(roleID) === '2') return 'badge bg-primary';
      return 'badge bg-secondary';
    },
    getRoleName(roleID) {
      if (String(roleID) === '1') return 'Quản trị viên';
      if (String(roleID) === '2') return 'Khách hàng';
      return 'Khác';
    },
    // ...Các hàm khác giữ nguyên
  },
  async created() {
    await this.fetchUsers();
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>
