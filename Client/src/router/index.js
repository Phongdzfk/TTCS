import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import VnpayReturnView from '@/views/VnpayReturnView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductListView.vue')
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue')
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('../views/AdminDashboardView.vue'),
    children: [
      {
        path: '',
        name: 'admin-home',
        component: () => import('../views/AdminProductsView.vue')
      },
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('../views/AdminProductsView.vue')
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('../views/AdminOrdersView.vue')
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/AdminUsersView.vue')
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('../views/AdminCategoriesView.vue')
      },
      {
        path: 'statistics',
        name: 'admin-statistics',
        component: () => import('../views/StatisticsView.vue')
      }
    ]
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue')
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrderView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/promotions',
    name: 'promotions',
    component: () => import('@/views/PromotionListView.vue')
  },
  {
    path: '/vnpay-return',
    name: 'VnpayReturn',
    component: VnpayReturnView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard: bảo vệ tất cả các route cần đăng nhập
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem('token');
  if (authRequired && !token) {
    return next('/login');
  }
  // Chỉ admin mới vào được /admin
  if (to.path.startsWith('/admin')) {
    const roleID = parseInt(localStorage.getItem('roleID'));
    if (roleID !== 1) {
      return next('/');
    }
  }
  next();
});

export default router
