<template>
  <div id="app">
    <TheNavbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="!isAdminRoute" />
  </div>
</template>

<script>
import TheNavbar from './components/TheNavbar.vue';
import Footer from './components/Footer.vue';

export default { 
  components: { 
    TheNavbar,
    Footer
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith('/admin');
    }
  }
}
</script>

<style>
:root {
  --primary-color: #cd1818;
  --secondary-color: #343a40;
  --text-color: #333;
  --border-color: #e5e5e5;
  --light-bg: #f8f9fa;
  --dark-bg: #212529;
}

body {
  font-family: 'Roboto', sans-serif;
  color: var(--text-color);
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

#app {
  max-width: 100% !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
}

.main-content {
  padding-top: 76px; /* Điều chỉnh theo chiều cao của navbar */
  min-height: calc(100vh - 76px);
  width: 100%;
}

.container-fluid {
  width: 100%;
  padding-right: 0;
  padding-left: 0;
  margin-right: 0;
  margin-left: 0;
}

.container {
  max-width: 1200px;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

.section-title {
  position: relative;
  margin-bottom: 30px;
  font-weight: 700;
  color: var(--secondary-color);
  text-transform: uppercase;
  padding-bottom: 10px;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: var(--primary-color);
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: #b31515;
  border-color: #b31515;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .container {
    padding-right: 10px;
    padding-left: 10px;
  }
}

/* Ghi đè style từ main.css */
@media (min-width: 1024px) {
  body {
    display: block;
    place-items: normal;
  }

  #app {
    display: block;
    grid-template-columns: none;
    padding: 0;
  }
}
</style>