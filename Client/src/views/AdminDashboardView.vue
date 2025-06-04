<template>
  <div class="admin-dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 bg-light vh-100 p-3">
          <h4 class="mb-4">Bảng điều khiển</h4>
          <div class="list-group">
            <router-link to="/admin/products" class="list-group-item list-group-item-action">
              Quản lý sản phẩm
            </router-link>
            <router-link to="/admin/orders" class="list-group-item list-group-item-action">
              Quản lý đơn hàng
            </router-link>
            <router-link to="/admin/users" class="list-group-item list-group-item-action">
              Quản lý người dùng
            </router-link>
            <router-link to="/admin/categories" class="list-group-item list-group-item-action">
              Quản lý danh mục
            </router-link>
            <router-link to="/admin/statistics" class="list-group-item list-group-item-action">
              Thống kê
            </router-link>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9 p-4">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>
