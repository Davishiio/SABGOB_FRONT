import { defineStore } from 'pinia';
import axios from '../axios';
import router from '../router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    role: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    // ACCIÓN DE LOGIN (Correcta)
    async login(credentials) {
      try {
        const response = await axios.post('/api/login', credentials);

        // 1. Guardar datos en el estado
        this.token = response.data.access_token;
        this.user = response.data.user;
        this.role = response.data.user.role; // Guardamos el rol

        // 2. Persistir token
        localStorage.setItem('token', this.token);

        // 3. Configurar Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

        // 4. Redirigir (Usar la ruta URL, no la ruta del archivo)
        router.push('/dashboard');

        return true;
      } catch (error) {
        console.error("Error de login:", error);
        throw error;
      }
    },

    // ACCIÓN DE LOGOUT (Corregida)
    logout() {
      // 1. Limpiar estado (Poner todo en null)
      this.token = null;
      this.user = null;
      this.role = null;

      // 2. Limpiar almacenamiento local
      localStorage.removeItem('token');

      // 3. Limpiar cabecera de axios
      delete axios.defaults.headers.common['Authorization'];

      // 4. Redirigir al login
      router.push('/login');
    }
  }
});
