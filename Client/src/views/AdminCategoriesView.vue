<template>
  <div class="admin-categories">
    <h2 class="mb-4">Quản lý danh mục</h2>
    
    <!-- Thanh công cụ -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm danh mục..." 
            v-model="searchQuery"
            @input="filterCategories"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="bi bi-search"></i>
          </button>
          <button class="btn btn-outline-danger" type="button" @click="resetFilters" v-if="searchQuery">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-primary" @click="openAddCategoryModal">
          <i class="bi bi-plus-lg me-2"></i> Thêm danh mục
        </button>
      </div>
    </div>
    
    <div class="row">
      <!-- Danh sách danh mục -->
      <div class="col-md-12">
        <div class="card">
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th scope="col">Mã danh mục</th>
                    <th scope="col">Tên danh mục</th>
                    <th scope="col">Mô tả</th>
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="filteredCategories.length === 0">
                    <td colspan="4" class="text-center text-muted py-4">
                      <i class="bi bi-search fs-2"></i><br>
                      Không tìm thấy danh mục phù hợp
                    </td>
                  </tr>
                  <tr v-for="category in filteredCategories" :key="category.categoryID" v-else>
                    <td>{{ category.categoryID }}</td>
                    <td>{{ category.name }}</td>
                    <td>{{ category.description }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger" @click="deleteCategory(category)"><i class="bi bi-trash"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Thêm danh mục mới -->
    <div class="modal fade" id="addCategoryModal" ref="addCategoryModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm danh mục mới</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <div class="mb-3">
                <label for="categoryName" class="form-label">Tên danh mục <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="categoryName" v-model="categoryForm.name" required>
              </div>
              <div class="mb-3">
                <label for="categoryDescription" class="form-label">Mô tả</label>
                <textarea class="form-control" id="categoryDescription" v-model="categoryForm.description" rows="3"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveCategory">Lưu</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Xác nhận xóa -->
    <div class="modal fade" id="deleteCategoryModal" ref="deleteCategoryModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa danh mục <strong>{{ selectedCategory.name }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteCategory">Xóa</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as bootstrap from 'bootstrap';
const BASE_URL = 'http://localhost:5000';

export default {
  data() {
    return {
      categories: [],
      filteredCategories: [],
      searchQuery: '',
      selectedCategory: {},
      categoryForm: {
        name: '',
        description: ''
      },
      addCategoryModalInstance: null,
      deleteCategoryModalInstance: null
    }
  },
  methods: {
    removeVietnameseTones(str) {
      return str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
    },
    filterCategories() {
      if (!this.searchQuery) {
        this.filteredCategories = [...this.categories];
        return;
      }
      const queryRaw = this.searchQuery.toLowerCase();
      const query = this.removeVietnameseTones(queryRaw);
      this.filteredCategories = this.categories.filter(category => {
        const name = this.removeVietnameseTones((category.name || '').toLowerCase());
        const description = this.removeVietnameseTones((category.description || '').toLowerCase());
        const id = String(category.categoryID).toLowerCase();
        return (
          name.includes(query) ||
          description.includes(query) ||
          id.includes(queryRaw)
        );
      });
    },
    openAddCategoryModal() {
      this.categoryForm = {
        name: '',
        description: ''
      };
      if (this.addCategoryModalInstance) {
        this.addCategoryModalInstance.hide();
      }
      this.$nextTick(() => {
        const modalEl = this.$refs.addCategoryModal;
        this.addCategoryModalInstance = new bootstrap.Modal(modalEl);
        this.addCategoryModalInstance.show();
      });
    },
    async saveCategory() {
      try {
        await axios.post(`${BASE_URL}/api/categories`, {
          name: this.categoryForm.name,
          description: this.categoryForm.description
        });
        await this.fetchCategories();
        if (this.addCategoryModalInstance) this.addCategoryModalInstance.hide();
        alert('Đã thêm danh mục mới thành công!');
      } catch (err) {
        alert(err.response?.data?.message || 'Thêm danh mục thất bại!');
      }
    },
    async fetchCategories() {
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`);
        this.categories = res.data.categories;
        this.filterCategories();
      } catch (err) {
        this.categories = [];
        this.filteredCategories = [];
      }
    },
    deleteCategory(category) {
      this.selectedCategory = category;
      if (this.deleteCategoryModalInstance) {
        this.deleteCategoryModalInstance.hide();
      }
      this.$nextTick(() => {
        const modalEl = this.$refs.deleteCategoryModal;
        this.deleteCategoryModalInstance = new bootstrap.Modal(modalEl);
        this.deleteCategoryModalInstance.show();
      });
    },
    async confirmDeleteCategory() {
      try {
        await axios.delete(`${BASE_URL}/api/categories/${this.selectedCategory.categoryID}`);
        await this.fetchCategories();
        if (this.deleteCategoryModalInstance) this.deleteCategoryModalInstance.hide();
        alert('Đã xóa danh mục thành công!');
      } catch (err) {
        alert(err.response?.data?.message || 'Xóa danh mục thất bại!');
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.filterCategories();
    }
  },
  async created() {
    await this.fetchCategories();
  }
}
</script>

<style scoped>
.table th, .table td {
  vertical-align: middle;
}
</style>
