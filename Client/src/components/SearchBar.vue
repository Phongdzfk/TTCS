<template>
  <div class="input-group">
    <input type="text" class="form-control" v-model="searchTerm" placeholder="Tìm kiếm sản phẩm..." @keyup.enter="search">
    <button class="btn btn-primary" type="button" @click="search">
      <i class="bi bi-search"></i> Tìm kiếm
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchTerm: ''
    }
  },
  methods: {
    search() {
      this.$emit('search', this.searchTerm);
    }
  }
}
</script>
