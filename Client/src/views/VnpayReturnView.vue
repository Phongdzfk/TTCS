<template>
  <div class="container py-5 text-center">
    <div v-if="success">
      <i class="bi bi-check-circle text-success" style="font-size: 4rem;"></i>
      <h2 class="mt-3">Thanh toán VNPay thành công!</h2>
      <p>Mã đơn hàng: {{ orderId }}</p>
      <router-link to="/" class="btn btn-primary mt-3">Về trang chủ</router-link>
    </div>
    <div v-else>
      <i class="bi bi-x-circle text-danger" style="font-size: 4rem;"></i>
      <h2 class="mt-3">Thanh toán VNPay thất bại!</h2>
      <router-link to="/checkout" class="btn btn-outline-primary mt-3">Thử lại</router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      success: false,
      orderId: null
    }
  },
  async mounted() {
    // Lấy kết quả từ query params
    const params = new URLSearchParams(window.location.search);
    this.orderId = params.get('vnp_TxnRef');
    const responseCode = params.get('vnp_ResponseCode');
    this.success = responseCode === '00';

    if (this.success) {
      // Lấy orderData từ localStorage
      const orderData = JSON.parse(localStorage.getItem('pendingOrder'));
      const token = localStorage.getItem('token');
      if (orderData && token) {
        try {
          const res = await axios.post('http://localhost:5000/api/orders/confirm-payment', orderData, {
            headers: { Authorization: 'Bearer ' + token }
          });
          localStorage.removeItem('pendingOrder');
          // Có thể cập nhật orderId từ kết quả backend nếu muốn
          this.orderId = res.data.orderID;
        } catch (e) {
          alert('Có lỗi khi xác nhận đơn hàng!');
        }
      }
    }
  }
}
</script> 