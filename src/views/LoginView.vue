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
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errorMsg.value = "Credenciales incorrectas.";
    } else {
      errorMsg.value = "Error de conexión.";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-wrapper">
    <div class="login-decoration">
       <!-- Decorative circle or pattern -->
       <div class="circle-splotch"></div>
    </div>
    
    <div class="login-card-container">
      <div class="card-content">
        <div class="brand-section">
          <div class="logo-box">G</div>
          <h1>GestorPro</h1>
        </div>

        <h2 class="welcome-text">¡Hola de nuevo!</h2>
        <p class="subtitle">Ingresa tus credenciales para acceder.</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="ejemplo@correo.com"
              class="modern-input"
            />
          </div>

          <div class="input-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              v-model="password"
              required
              placeholder="••••••••"
              class="modern-input"
            />
          </div>

          <div v-if="errorMsg" class="error-msg">
            <span class="error-icon">⚠️</span> {{ errorMsg }}
          </div>

          <button type="submit" :disabled="isLoading" class="btn-submit">
            <span v-if="isLoading" class="spinner-mini"></span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </form>

        <p class="footer-links">
          ¿Problemas para acceder? <a href="#">Contacta a soporte</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  overflow: hidden;
}

/* Decorative background */
.login-wrapper::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
  z-index: 0;
}

.circle-splotch {
  position: absolute;
  top: -10%; right: -10%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  z-index: 1;
}

.login-card-container {
  position: relative;
  background: white;
  width: 90%;
  max-width: 450px;
  border-radius: var(--radius-lg);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 10;
  overflow: hidden;
}

.card-content {
  padding: 3rem 2.5rem;
}

.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-box {
  width: 42px; height: 42px;
  background: var(--color-primary);
  color: white;
  font-size: 1.5rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
}

.brand-section h1 {
  font-size: 1.5rem;
  color: var(--color-text-main);
  margin: 0;
}

.welcome-text {
  text-align: center;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
}

.subtitle {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.modern-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: #f9fafb;
  font-size: 1rem;
  transition: all 0.2s;
}

.modern-input:focus {
  background-color: white;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  outline: none;
}

.btn-submit {
  width: 100%;
  padding: 0.85rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex; align-items: center; justify-content: center;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-submit:disabled {
  opacity: 0.7; cursor: not-allowed;
}

.error-msg {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex; align-items: center; gap: 0.5rem;
}

.footer-links {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.footer-links a {
  color: var(--color-primary);
  font-weight: 500;
}

.spinner-mini {
  width: 20px; height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
