import { createRouter, createWebHistory } from 'vue-router'
// Asegúrate de que LoginView esté en esta ruta correcta
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      // ESTA ES LA RUTA QUE TE FALTA
      path: '/dashboard',
      name: 'dashboard',
      // Lazy loading: Carga el archivo solo cuando entras
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Guardia de navegación para proteger /dashboard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.name === 'login' && token) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router
