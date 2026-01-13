<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../axios'; // Usamos tu instancia configurada con interceptores

const router = useRouter();

// --- ESTADO ---
const projects = ref([]);
const isLoading = ref(true);
const showCreateModal = ref(false);
const isSubmitting = ref(false);

// Formulario reactivo para nuevo proyecto
const newProjectForm = ref({
  titulo: '',
  descripcion: ''
});

// --- ACCIONES ---

// 1. Cargar Proyectos (GET /api/proyectos)
const fetchProjects = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('/api/proyectos');
    projects.value = response.data;
  } catch (error) {
    console.error("Error cargando proyectos:", error);
    // Aquí podrías mostrar una notificación toast de error
  } finally {
    isLoading.value = false;
  }
};

// 2. Crear Proyecto (POST /api/proyectos)
const createProject = async () => {
  if (!newProjectForm.value.titulo) return;

  isSubmitting.value = true;
  try {
    const response = await axios.post('/api/proyectos', {
      titulo: newProjectForm.value.titulo,
      descripcion: newProjectForm.value.descripcion
    });

    // Agregamos el nuevo proyecto a la lista sin recargar
    projects.value.unshift(response.data);

    // Limpieza
    showCreateModal.value = false;
    newProjectForm.value = { titulo: '', descripcion: '' };
  } catch (error) {
    console.error("Error creando proyecto:", error);
    alert("Error al crear el proyecto. Verifica los datos.");
  } finally {
    isSubmitting.value = false;
  }
};

// 3. Cerrar Sesión
const handleLogout = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
  router.push('/login');
};

// 4. Navegación (Placeholder para el futuro detalle)
const goToProject = (id) => {
  // router.push(`/proyectos/${id}`); // Descomentar cuando tengas la vista de detalle
  console.log("Navegar al proyecto:", id);
};

// --- CICLO DE VIDA ---
onMounted(() => {
  fetchProjects();
});
</script>

<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR (Navegación Lateral) -->
    <aside class="sidebar">
      <div class="brand">
        <div class="logo-icon">Tasks</div>
        <h2>GestorPro</h2>
      </div>

      <nav class="nav-menu">
        <a href="#" class="nav-item active">
          <span class="icon">📂</span> Proyectos
        </a>
        <a href="#" class="nav-item">
          <span class="icon">✅</span> Mis Tareas
        </a>
        <a href="#" class="nav-item">
          <span class="icon">📊</span> Reportes
        </a>
      </nav>

      <div class="user-profile">
        <div class="avatar">U</div>
        <div class="user-info">
          <span class="name">Usuario</span>
          <button @click="handleLogout" class="logout-link">Cerrar Sesión</button>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <!-- Header Superior -->
      <header class="top-bar">
        <div class="breadcrumbs">
          <span>Inicio</span> / <span class="current">Proyectos</span>
        </div>
        <button class="btn-primary" @click="showCreateModal = true">
          + Nuevo Proyecto
        </button>
      </header>

      <!-- Área de Contenido -->
      <div class="content-area">
        <h1 class="page-title">Mis Proyectos</h1>

        <!-- Estado de Carga -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando información...</p>
        </div>

        <!-- Estado Vacío (Empty State) - Muy importante para UX -->
        <div v-else-if="projects.length === 0" class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>Aún no tienes proyectos</h3>
          <p>Crea tu primer proyecto para empezar a organizar tus tareas.</p>
          <button class="btn-outline" @click="showCreateModal = true">Crear Proyecto</button>
        </div>

        <!-- Grid de Proyectos -->
        <div v-else class="projects-grid">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-card"
            @click="goToProject(project.id)"
          >
            <div class="card-header">
              <span class="status-badge" :class="project.estado">
                {{ project.estado }}
              </span>
              <div class="options-dots">⋮</div>
            </div>

            <h3>{{ project.titulo }}</h3>
            <p class="description">
              {{ project.descripcion || 'Sin descripción' }}
            </p>

            <div class="card-footer">
              <span class="date">Creado: {{ new Date(project.created_at).toLocaleDateString() }}</span>
              <span class="arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- MODAL DE CREACIÓN -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Nuevo Proyecto</h2>
          <button class="close-btn" @click="showCreateModal = false">×</button>
        </div>

        <form @submit.prevent="createProject">
          <div class="form-group">
            <label>Título del Proyecto *</label>
            <input
              v-model="newProjectForm.titulo"
              type="text"
              placeholder="Ej: Desarrollo Web Corporativo"
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea
              v-model="newProjectForm.descripcion"
              rows="3"
              placeholder="Detalles sobre el objetivo del proyecto..."
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-text" @click="showCreateModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Crear Proyecto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- VARIABLES & BASE --- */
:root {
  --primary: #2563eb; /* Azul Profesional */
  --primary-dark: #1e40af;
  --bg-light: #f3f4f6;
  --text-main: #1f2937;
  --text-sec: #6b7280;
  --sidebar-w: 260px;
}

.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f3f4f6; /* Gris muy suave de fondo */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1f2937;
}

/* --- SIDEBAR --- */
.sidebar {
  width: 260px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 10;
}

.brand {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: #2563eb;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.brand h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.nav-menu {
  padding: 1.5rem 1rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #4b5563;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-item:hover, .nav-item.active {
  background-color: #eff6ff;
  color: #2563eb;
}

.user-profile {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 36px;
  height: 36px;
  background-color: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #4b5563;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info .name {
  font-size: 0.9rem;
  font-weight: 600;
}

.logout-link {
  background: none;
  border: none;
  padding: 0;
  color: #ef4444;
  font-size: 0.75rem;
  cursor: pointer;
  text-align: left;
}

.logout-link:hover { text-decoration: underline; }

/* --- MAIN CONTENT --- */
.main-content {
  margin-left: 260px; /* Ancho del sidebar */
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 64px;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.breadcrumbs {
  font-size: 0.9rem;
  color: #6b7280;
}

.breadcrumbs .current {
  color: #111827;
  font-weight: 500;
}

.content-area {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

/* --- BUTTONS --- */
.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover:not(:disabled) { background-color: #1d4ed8; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
}
.btn-outline:hover { background-color: #f9fafb; border-color: #9ca3af; }

.btn-text {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem 1rem;
}
.btn-text:hover { color: #111827; }

/* --- GRID & CARDS --- */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #bfdbfe;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pendiente { background-color: #fef3c7; color: #d97706; }
.status-badge.completado { background-color: #d1fae5; color: #059669; }

.project-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #111827;
}

.description {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1; /* Empuja el footer hacia abajo */
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}

.arrow { color: #2563eb; font-weight: bold; }

/* --- STATES --- */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* --- MODAL --- */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 { margin: 0; font-size: 1.25rem; }

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
}

.form-group { margin-bottom: 1.25rem; }

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box; /* IMPORTANTE para inputs */
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* --- RESPONSIVE --- */
@media (max-width: 768px) {
  .sidebar { display: none; } /* Ocultar sidebar en móvil por ahora */
  .main-content { margin-left: 0; }
  .top-bar { padding: 0 1rem; }
  .content-area { padding: 1rem; }
}
</style>
