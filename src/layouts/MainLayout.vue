<script setup>
import { useRouter } from 'vue-router';

// Usamos el router para la navegación explícita si fuera necesario, 
// o simplemente RouterLink en el template.
const router = useRouter();

const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-logo">P</div>
        <h1 class="brand-name">GestorPro</h1>
      </div>
      
      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-item" active-class="active">
          <span class="icon">📁</span>
          Proyectos
        </RouterLink>
        <RouterLink to="/calendario" class="nav-item" active-class="active">
          <span class="icon">📅</span>
          Calendario
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <span class="icon">🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="main-wrapper">
      <!-- Top Header -->
      <header class="top-header">
        <h2 class="page-title">
          <!-- Slot for page title or breadcrumbs -->
          <slot name="header">Bienvenido</slot>
        </h2>
        <div class="user-menu">
          <div class="avatar-circle">U</div>
          <span class="username">Usuario</span>
        </div>
      </header>
      
      <!-- Page Content -->
      <main class="page-content">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-body);
}

/* Sidebar Styling */
.sidebar {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed; /* Fixed sidebar */
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 50;
}

.sidebar-header {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--color-border);
  gap: 1rem;
}

.brand-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.5rem;
  box-shadow: var(--shadow-md);
}

.brand-name {
  font-size: 1.25rem;
  color: var(--color-text-main);
  letter-spacing: -0.025em;
}

.sidebar-nav {
  padding: 2rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-item:hover {
  background-color: #f9fafb;
  color: var(--color-primary);
}

.nav-item.active {
  background-color: #eef2ff; /* Indigo 50 */
  color: var(--color-primary-dark);
}

.nav-item .icon {
  font-size: 1.2rem;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: #ef4444; /* Red 500 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: #fef2f2;
}

/* Main Content Styling */
.main-wrapper {
  margin-left: 280px; /* Same as sidebar width */
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent flex overflow */
}

.top-header {
  height: 80px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.page-title {
  font-size: 1.5rem;
  color: var(--color-text-main);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #e0e7ff;
  color: var(--color-primary-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.username {
  font-weight: 500;
  color: var(--color-text-main);
}

.page-content {
  padding: 2rem;
  flex: 1;
}
</style>
