<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  errorMsg.value = '';
  isLoading.value = true;

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    });
    // Si tiene éxito, el store redirige automáticamente
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errorMsg.value = "Credenciales incorrectas. Verifica tu correo y contraseña.";
    } else {
      errorMsg.value = "Ocurrió un error al conectar con el servidor.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="header">
        <h1>Bienvenido</h1>
        <p>Sistema de Gestión de Tareas</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="••••••••"
          />
        </div>

        <div v-if="errorMsg" class="error-alert">
          {{ errorMsg }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn-primary">
          <span v-if="isLoading">Cargando...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <div class="footer">
        <p>¿No tienes cuenta? Contacta al administrador.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos modernos y limpios sin dependencias externas */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', sans-serif;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  text-align: center;
}

.header p {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #34495e;
  font-weight: 600;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 0.85rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #34495e;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.error-alert {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #95a5a6;
}
</style>
