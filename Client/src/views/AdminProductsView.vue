<template>
  <div class="admin-products">
    <h2 class="mb-4">Quản lý sản phẩm</h2>
    
    <!-- Thanh công cụ -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm sản phẩm..." 
            v-model="searchQuery"
            @input="filterProducts"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="bi bi-search"></i>
          </button>
          <button class="btn btn-outline-danger" type="button" @click="resetFilters" v-if="searchQuery || categoryFilter">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="categoryFilter" @change="filterProducts">
          <option value="">Tất cả danh mục</option>
          <option v-for="cat in categories" :key="cat.categoryID" :value="cat.categoryID">
            {{ cat.name }}
          </option>
        </select>
      </div>
      <div class="col-md-3 text-end">
        <button class="btn btn-primary" @click="openAddProductModal">
          <i class="bi bi-plus-lg me-2"></i> Thêm sản phẩm
        </button>
      </div>
    </div>
    
    <!-- Bảng sản phẩm -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Hình ảnh</th>
                <th scope="col">Tên sản phẩm</th>
                <th scope="col">Danh mục</th>
                <th scope="col">Giá</th>
                <th scope="col">Số lượng</th>
                <th scope="col">Trạng thái</th>
                <th scope="col">Ngày tạo</th>
                <th scope="col">Featured?</th>
                <th scope="col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="10" class="text-center text-muted py-4">
                  <i class="bi bi-search fs-2"></i><br>
                  Không tìm thấy sản phẩm phù hợp
                </td>
              </tr>
              <tr v-for="product in filteredProducts" :key="product.productID" v-else>
                <td>{{ product.productID }}</td>
                <td>
                  <img
                    :src="getProductImageUrl(product)"
                    alt="Product"
                    class="product-thumbnail"
                  >
                </td>
                <td>{{ product.name }}</td>
                <td>{{ getCategoryName(product.categoryID) }}</td>
                <td>{{ formatPrice(product.price) }}</td>
                <td>{{ product.stockQuantity }}</td>
                <td>
                  <span :class="getStatusClass(product.status)">
                    {{ getStatusText(product.status) }}
                  </span>
                </td>
                <td>{{ formatDate(product.createdAt) }}</td>
                <td>
                  <span v-if="product.isFeatured == 1" class="badge bg-success">Nổi bật</span>
                  <span v-else class="badge bg-secondary">Thường</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="editProduct(product)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" @click="openDiscountModal(product)">
                      <i class="bi bi-gift"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(product)">
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
        Hiển thị {{ filteredProducts.length }} / {{ products.length }} sản phẩm
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
    
    <!-- Modal Thêm/Sửa sản phẩm -->
    <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProduct">
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="productName" class="form-label">Tên sản phẩm <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="productName" 
                    v-model="productForm.name" 
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label for="productCategory" class="form-label">Danh mục <span class="text-danger">*</span></label>
                  <select 
                    class="form-select" 
                    id="productCategory" 
                    v-model="productForm.categoryID" 
                    required
                  >
                    <option value="" disabled>Chọn danh mục</option>
                    <option v-for="cat in categories" :key="cat.categoryID" :value="cat.categoryID">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="isFeatured" v-model="productForm.isFeatured">
                <label class="form-check-label" for="isFeatured">
                  Sản phẩm nổi bật
                </label>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="productPrice" class="form-label">Giá <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">₫</span>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="productPrice" 
                      v-model="productForm.price" 
                      min="0" 
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="productStock" class="form-label">Số lượng <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="productStock" 
                    v-model="productForm.stockQuantity" 
                    min="0" 
                    required
                  >
                </div>
              </div>
              
              <div class="mb-3">
                <label for="productDescription" class="form-label">Mô tả</label>
                <textarea 
                  class="form-control" 
                  id="productDescription" 
                  v-model="productForm.description" 
                  rows="3"
                ></textarea>
              </div>
              
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="productImages" class="form-label">Hình ảnh sản phẩm</label>
                  <input 
                    type="file" 
                    class="form-control" 
                    id="productImages" 
                    @change="handleImageUpload" 
                    accept="image/*" 
                    multiple
                  >
                  <div class="mt-2 d-flex flex-wrap">
                    <div v-for="(img, idx) in imagePreviews" :key="idx" class="me-2 mb-2">
                      <img :src="img" alt="Preview" style="width:60px;height:60px;object-fit:cover;border-radius:5px;border:1px solid #ccc;" />
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="productStatus" class="form-label">Trạng thái</label>
                  <select 
                    class="form-select" 
                    id="productStatus" 
                    v-model="productForm.status"
                  >
                    <option value="active">Đang bán</option>
                    <option value="outOfStock">Hết hàng</option>
                    <option value="discontinued">Ngừng kinh doanh</option>
                  </select>
                </div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Thuộc tính</label>
                <div class="card">
                  <div class="card-body">
                    <div v-for="(attr, idx) in productForm.attributes" :key="idx" class="row mb-2 align-items-center">
                      <div class="col-md-5">
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="productForm.attributes[idx].key" 
                          placeholder="Tên thuộc tính"
                        >
                      </div>
                      <div class="col-md-5">
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="productForm.attributes[idx].value" 
                          placeholder="Giá trị"
                        >
                      </div>
                      <div class="col-md-2">
                        <button 
                          type="button" 
                          class="btn btn-outline-danger" 
                          @click="removeAttribute(idx)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary mt-2" 
                      @click="addAttribute"
                    >
                      <i class="bi bi-plus"></i> Thêm thuộc tính
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveProduct">Lưu</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Xác nhận xóa -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{{ selectedProduct.name }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Thêm khuyến mại cho sản phẩm -->
    <div v-if="showDiscountModal" class="modal fade show d-block" tabindex="-1" aria-modal="true" style="background:rgba(0,0,0,0.3);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thêm khuyến mại cho sản phẩm: {{ selectedProductForDiscount?.name }}</h5>
            <button type="button" class="btn-close" @click="closeDiscountModal"></button>
          </div>
          <div class="modal-body">
            <template v-if="isLoadingCurrentDiscount">
              <div class="text-center py-3"><div class="spinner-border"></div></div>
            </template>
            <template v-else-if="currentProductDiscount && !showDiscountForm">
              <div class="alert alert-info">
                <strong>Sản phẩm đã có khuyến mại:</strong><br>
                <b>{{ currentProductDiscount.name }}</b> - {{ currentProductDiscount.value }}%<br>
                {{ currentProductDiscount.description }}<br>
                <span>Thời hạn: {{ currentProductDiscount.startDate }} - {{ currentProductDiscount.endDate }}</span>
              </div>
              <div class="text-center mt-3">
                <button class="btn btn-warning" @click="showDiscountForm = true; loadDiscountList();"><i class="bi bi-arrow-repeat"></i> Thay đổi khuyến mại</button>
              </div>
            </template>
            <template v-else>
              <template v-if="!showDiscountForm">
                <div v-if="isLoadingDiscounts" class="text-center py-3">
                  <div class="spinner-border"></div>
                </div>
                <div v-else>
                  <table class="table table-bordered align-middle">
                    <thead class="table-light">
                      <tr>
                        <th>Tên khuyến mại</th>
                        <th>Giá trị (%)</th>
                        <th>Mô tả</th>
                        <th>Thời hạn</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="discount in discountList" :key="discount.discountID">
                        <td>{{ discount.name }}</td>
                        <td>{{ discount.value }}</td>
                        <td>{{ discount.description }}</td>
                        <td>{{ discount.startDate }} - {{ discount.endDate }}</td>
                        <td>
                          <button class="btn btn-sm btn-success" @click="assignDiscountToProduct(discount)"><i class="bi bi-check2"></i> Chọn</button>
                        </td>
                      </tr>
                      <tr v-if="discountList.length === 0">
                        <td colspan="5" class="text-center text-muted">Không có khuyến mại nào còn hiệu lực</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="text-center mt-3">
                    <button class="btn btn-outline-primary" @click="showDiscountForm = true"><i class="bi bi-plus-lg"></i> Thêm khuyến mại mới</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <form @submit.prevent="saveDiscount">
                  <div class="mb-3">
                    <label class="form-label">Tên khuyến mại <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="discountForm.name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Giá trị (%) <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" v-model="discountForm.value" min="1" max="100" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Mô tả</label>
                    <textarea class="form-control" v-model="discountForm.description"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Ngày bắt đầu <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="discountForm.startDate" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Ngày kết thúc <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" v-model="discountForm.endDate" required>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showDiscountForm = false">Quay lại</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                  </div>
                </form>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const BASE_URL = 'http://localhost:5000';

export default {
  data() {
    return {
      products: [],
      filteredProducts: [],
      searchQuery: '',
      categoryFilter: '',
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      isLoading: false,
      errorMsg: '',
      categories: [],
      isEditing: false,
      selectedProduct: {},
      productForm: {
        name: '',
        price: 0,
        stockQuantity: 0,
        description: '',
        images: [], // mảng file
        status: 'active',
        categoryID: '',
        attributes: [] // mảng {key, value}
      },
      imagePreviews: [],
      showDiscountModal: false,
      discountForm: {
        name: '',
        value: '',
        description: '',
        startDate: '',
        endDate: ''
      },
      selectedProductForDiscount: null,
      showDiscountForm: false,
      discountList: [],
      isLoadingDiscounts: false,
      currentProductDiscount: null,
      isLoadingCurrentDiscount: false
    }
  },
  computed: {
    BASE_URL() {
      return 'http://localhost:5000';
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredProducts.slice(start, end);
    }
  },
  async created() {
    this.isLoading = true;
    try {
      const res = await axios.get(`${BASE_URL}/api/products`);
      this.products = res.data.products;
      this.filteredProducts = this.products;
      this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
      // Lấy danh mục luôn khi load trang
      const catRes = await axios.get(`${BASE_URL}/api/categories`);
      this.categories = catRes.data.categories;
    } catch (err) {
      this.errorMsg = err.response?.data?.message || 'Không lấy được danh sách sản phẩm!';
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    },
    getCategoryName(categoryID) {
      const cat = this.categories.find(c => c.categoryID === categoryID);
      return cat ? cat.name : categoryID;
    },
    getStatusText(status) {
      const statusMap = {
        'active': 'Đang bán',
        'outOfStock': 'Hết hàng',
        'discontinued': 'Ngừng kinh doanh'
      };
      return statusMap[status] || status;
    },
    getStatusClass(status) {
      const classMap = {
        'active': 'badge bg-success',
        'outOfStock': 'badge bg-warning text-dark',
        'discontinued': 'badge bg-danger'
      };
      return classMap[status] || 'badge bg-secondary';
    },
    filterProducts() {
      let result = [...this.products];
      // Lọc theo danh mục
      if (this.categoryFilter) {
        result = result.filter(p => p.categoryID === this.categoryFilter);
      }
      // Lọc theo từ khóa tìm kiếm
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) ||
          String(p.productID).toLowerCase().includes(query)
        );
      }
      this.filteredProducts = result;
      this.currentPage = 1; // Reset về trang đầu tiên khi lọc
      this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    },
    async openAddProductModal() {
      this.isEditing = false;
      this.productForm = {
        name: '',
        price: 0,
        stockQuantity: 0,
        description: '',
        images: [], // mảng file
        status: 'active',
        categoryID: '',
        attributes: [] // mảng {key, value}
      };
      this.imagePreviews = [];
      try {
        const res = await axios.get(`${BASE_URL}/api/categories`);
        this.categories = res.data.categories;
      } catch (err) {
        this.categories = [];
      }
      // Đảm bảo modal đã render xong
      this.$nextTick(() => {
        const modal = new Modal(document.getElementById('productModal'));
        modal.show();
      });
    },
    editProduct(product) {
      this.isEditing = true;
      this.selectedProduct = product;
      
      // Sao chép thông tin sản phẩm vào form
      this.productForm = { ...product };
      
      // Đảm bảo attributes luôn là mảng [{key, value}]
      if (Array.isArray(product.attributes)) {
        this.productForm.attributes = [...product.attributes];
      } else if (product.attributes && typeof product.attributes === 'object') {
        this.productForm.attributes = Object.keys(product.attributes).map(key => ({ key, value: product.attributes[key] }));
      } else {
        this.productForm.attributes = [];
      }
      // Luôn có một dòng trống cuối cùng để thêm mới
      this.productForm.attributes.push({ key: '', value: '' });
      
      // Hiển thị preview tất cả ảnh hiện có
      if (Array.isArray(product.images)) {
        this.imagePreviews = product.images.map(img => `${BASE_URL}/uploads/${img}`);
      } else {
        this.imagePreviews = [];
      }
      this.productForm.images = [];
      const modal = new Modal(document.getElementById('productModal'));
      modal.show();
    },
    deleteProduct(product) {
      this.selectedProduct = product;
      
      const modal = new Modal(document.getElementById('deleteModal'));
      modal.show();
    },
    async confirmDelete() {
      try {
        await axios.delete(`${BASE_URL}/api/products/${this.selectedProduct.productID}`);
        // Xóa sản phẩm khỏi danh sách
        this.products = this.products.filter(p => p.productID !== this.selectedProduct.productID);
        this.filterProducts();
        // Đóng modal
        const deleteModal = Modal.getInstance(document.getElementById('deleteModal'));
        deleteModal.hide();
        alert('Đã xóa sản phẩm thành công!');
        window.location.reload();
      } catch (err) {
        alert(err.response?.data?.message || 'Xóa sản phẩm thất bại!');
      }
    },
    async saveProduct() {
      try {
        const formData = new FormData();
        formData.append('name', this.productForm.name);
        formData.append('price', this.productForm.price);
        formData.append('stockQuantity', this.productForm.stockQuantity);
        formData.append('description', this.productForm.description);
        formData.append('categoryID', this.productForm.categoryID);
        formData.append('status', this.productForm.status);
        formData.append('attributes', JSON.stringify(this.productForm.attributes));
        formData.append('isFeatured', this.productForm.isFeatured ? 1 : 0);
        this.productForm.images.forEach(img => {
          formData.append('images', img);
        });
        let res;
        if (this.isEditing) {
          res = await axios.put(`${BASE_URL}/api/products/${this.selectedProduct.productID}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          // Cập nhật sản phẩm trong danh sách
          const idx = this.products.findIndex(p => p.productID === this.selectedProduct.productID);
          if (idx !== -1) this.products[idx] = res.data.product;
        } else {
          res = await axios.post(`${BASE_URL}/api/products`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          this.products.push(res.data.product);
        }
        this.filteredProducts = this.products;
        this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
        // Đóng modal
        const productModal = Modal.getInstance(document.getElementById('productModal'));
        productModal.hide();
        window.location.reload();
      } catch (err) {
        alert(err.response?.data?.message || (this.isEditing ? 'Cập nhật sản phẩm thất bại!' : 'Thêm sản phẩm thất bại!'));
      }
    },
    handleImageUpload(e) {
      const files = Array.from(e.target.files);
      this.productForm.images = files;
      // Hiển thị preview
      this.imagePreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    },
    addAttribute() {
      this.productForm.attributes.push({ key: '', value: '' });
    },
    removeAttribute(idx) {
      this.productForm.attributes.splice(idx, 1);
      // Nếu sau khi xóa mà không còn dòng trống cuối, tự động thêm dòng trống
      if (this.productForm.attributes.length === 0 || this.productForm.attributes[this.productForm.attributes.length-1].key || this.productForm.attributes[this.productForm.attributes.length-1].value) {
        this.productForm.attributes.push({ key: '', value: '' });
      }
    },
    getProductImageUrl(product) {
      if (product.images && product.images.length > 0) {
        return this.BASE_URL + '/uploads/' + product.images[0];
      } else {
        return require('@/assets/images/home/banner.jpg');
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    },
    resetFilters() {
      this.searchQuery = '';
      this.categoryFilter = '';
      this.filterProducts();
    },
    openDiscountModal(product) {
      this.selectedProductForDiscount = product;
      this.discountForm = {
        name: '',
        value: '',
        description: '',
        startDate: '',
        endDate: ''
      };
      this.showDiscountModal = true;
      this.showDiscountForm = false;
      this.discountList = [];
      this.isLoadingDiscounts = false;
      this.currentProductDiscount = null;
      // Lấy discount hiện tại của sản phẩm
      this.isLoadingCurrentDiscount = true;
      axios.get(`${this.BASE_URL}/api/products/${product.productID}/discount`).then(res => {
        this.currentProductDiscount = res.data.discount;
        this.isLoadingCurrentDiscount = false;
        if (!this.currentProductDiscount) {
          this.loadDiscountList();
        }
      }).catch(() => {
        this.currentProductDiscount = null;
        this.isLoadingCurrentDiscount = false;
        this.loadDiscountList();
      });
    },
    loadDiscountList() {
      this.isLoadingDiscounts = true;
      axios.get(`${this.BASE_URL}/api/discounts`).then(res => {
        const today = new Date();
        this.discountList = (res.data.discounts || []).filter(d => {
          const start = new Date(d.startDate);
          const end = new Date(d.endDate);
          return start <= today && end >= today;
        });
      }).finally(() => {
        this.isLoadingDiscounts = false;
      });
    },
    closeDiscountModal() {
      this.showDiscountModal = false;
      this.selectedProductForDiscount = null;
      this.showDiscountForm = false;
    },
    assignDiscountToProduct(discount) {
      if (!this.selectedProductForDiscount) return;
      axios.put(`${this.BASE_URL}/api/discounts/${discount.discountID}`, { productID: this.selectedProductForDiscount.productID })
        .then(() => {
          alert('Đã gán khuyến mại cho sản phẩm!');
          this.closeDiscountModal();
        })
        .catch(() => {
          alert('Gán khuyến mại thất bại!');
        });
    },
    saveDiscount() {
      if (!this.selectedProductForDiscount) return;
      axios.post(`${this.BASE_URL}/api/discounts`, { ...this.discountForm, productID: this.selectedProductForDiscount.productID })
        .then(() => {
          alert('Đã thêm và gán khuyến mại cho sản phẩm!');
          this.closeDiscountModal();
        })
        .catch(() => {
          alert('Thêm khuyến mại thất bại!');
        });
    }
  }
}
</script>

<style scoped>
.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
}

.table th, .table td {
  vertical-align: middle;
}
</style>
