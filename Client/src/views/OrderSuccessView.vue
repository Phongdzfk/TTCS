<template>
  <div class="container py-5 text-center">
    <div class="mb-4">
      <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
      <h2 class="mt-3">Đặt hàng thành công!</h2>
      <p class="lead">Đơn hàng của bạn đã được ghi nhận.<br>Vui lòng đợi nhân viên liên hệ để xác nhận và giao hàng.</p>
    </div>
    <router-link to="/orders" class="btn btn-primary me-2">Xem đơn hàng</router-link>
    <router-link to="/" class="btn btn-outline-secondary">Về trang chủ</router-link>
  </div>
</template>

<script>
export default {
  name: 'OrderSuccessView'
}
</script> 