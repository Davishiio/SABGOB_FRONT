<script setup>
/**
 * DashboardView - Gestión de Proyectos
 * 
 * Main dashboard view for project management.
 * Uses modular components for better maintainability.
 */
import { ref, onMounted } from 'vue';
import axios from '../axios';
import { useAuthStore } from '../stores/auth';

// Layout
import MainLayout from '../layouts/MainLayout.vue';

// Dashboard Components
import ActionBar from '../components/dashboard/ActionBar.vue';
import ProjectRow from '../components/dashboard/ProjectRow.vue';

// Modals
import ProjectModal from '../components/ProjectModal.vue';
import CreateProjectModal from '../components/CreateProjectModal.vue';

// --- STATE ---
const authStore = useAuthStore();
const projects = ref([]);
const isLoading = ref(true);
const projectTasks = ref({});

// Modals
const showCreateModal = ref(false);
const isProjectModalOpen = ref(false);
const selectedProjectId = ref(null);

// --- API CALLS ---

const fetchProjects = async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get('/api/proyectos');
    projects.value = data;
    
    // Eager load tasks for progress calculation
    await Promise.allSettled(
      data.map(p => loadProjectTasks(p.id))
    );
  } catch (error) {
    console.error('Error loading projects:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadProjectTasks = async (projectId) => {
  try {
    const { data } = await axios.get(`/api/proyectos/${projectId}/tareas`);
    projectTasks.value[projectId] = data;
  } catch (error) {
    console.error(`Error loading tasks for project ${projectId}:`, error);
  }
};

// --- COMPUTED HELPERS ---

const calculateProgress = (projectId) => {
  const tasks = projectTasks.value[projectId];
  if (!tasks?.length) return 0;
  const completed = tasks.filter(t => t.estado === 'completado').length;
  return Math.round((completed / tasks.length) * 100);
};

// --- EVENT HANDLERS ---

const openProjectModal = (projectId) => {
  selectedProjectId.value = projectId;
  isProjectModalOpen.value = true;
};

const handleProjectCreated = (newProject) => {
  projects.value.unshift(newProject);
  showCreateModal.value = false;
};

const handleProjectUpdated = (updatedProject) => {
  const index = projects.value.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) {
    projects.value[index] = { ...projects.value[index], ...updatedProject };
  }
  if (updatedProject.tasks) {
    projectTasks.value[updatedProject.id] = updatedProject.tasks;
  }
};

const handleProjectDeleted = (projectId) => {
  projects.value = projects.value.filter(p => p.id !== projectId);
  isProjectModalOpen.value = false;
};

// --- LIFECYCLE ---
onMounted(fetchProjects);
</script>

<template>
  <MainLayout>
    <template #header>
      <h2 class="page-title">Gestión de Proyectos</h2>
    </template>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <!-- Content -->
    <div v-else class="dashboard">
      <ActionBar 
        :project-count="projects.length"
        @create="showCreateModal = true"
      />

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th v-if="authStore.role === 'Supervisor'">Usuario</th>
              <th style="width: 35%">Proyecto</th>
              <th>Fecha Límite</th>
              <th>Estado</th>
              <th>Progreso</th>
            </tr>
          </thead>
          <tbody>
            <ProjectRow
              v-for="project in projects"
              :key="project.id"
              :project="project"
              :progress="calculateProgress(project.id)"
              :show-user="authStore.role === 'Supervisor'"
              @click="openProjectModal"
            />
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="!projects.length" class="empty-state">
          <div class="icon">📂</div>
          <h3>No hay proyectos</h3>
          <p>Comienza creando tu primer proyecto</p>
          <button class="btn-primary" @click="showCreateModal = true">
            Crear Proyecto
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateProjectModal 
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @project-created="handleProjectCreated"
    />

    <ProjectModal 
      :is-open="isProjectModalOpen"
      :project-id="selectedProjectId"
      @close="isProjectModalOpen = false"
      @project-updated="handleProjectUpdated"
      @project-deleted="handleProjectDeleted"
    />
  </MainLayout>
</template>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.table-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #e2e8f0;
  text-align: left;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-state .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
</style>