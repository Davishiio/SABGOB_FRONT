<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../axios';

const route = useRoute();
const router = useRouter();
const projectId = route.params.id;

// --- ESTADO ---
const project = ref(null);
const tasks = ref([]);
const isLoading = ref(true);
const showCreateModal = ref(false);
const isSubmitting = ref(false);

const newTaskForm = ref({
  titulo: '',
  descripcion: ''
});

// --- ACCIONES ---

// 1. Cargar Datos (Proyecto y sus Tareas)
const loadData = async () => {
  isLoading.value = true;
  try {
    // a) Obtenemos info del proyecto para el título
    const projectReq = axios.get(`/api/proyectos/${projectId}`);

    // b) Obtenemos las tareas filtrando por idProyecto (según tu backend)
    const tasksReq = axios.get('/api/tareas', {
      params: { idProyecto: projectId }
    });

    const [projectRes, tasksRes] = await Promise.all([projectReq, tasksReq]);

    project.value = projectRes.data;
    tasks.value = tasksRes.data;
  } catch (error) {
    console.error("Error cargando datos:", error);
    if (error.response && error.response.status === 404) {
      router.push('/dashboard'); // Si no existe, volver
    }
  } finally {
    isLoading.value = false;
  }
};

// 2. Crear Tarea
const createTask = async () => {
  if (!newTaskForm.value.titulo) return;

  isSubmitting.value = true;
  try {
    const response = await axios.post('/api/tareas', {
      idProyecto: projectId, // Importante: enviamos la relación
      titulo: newTaskForm.value.titulo,
      descripcion: newTaskForm.value.descripcion
    });

    // Agregamos a la lista localmente
    tasks.value.push(response.data);

    // Limpieza
    showCreateModal.value = false;
    newTaskForm.value = { titulo: '', descripcion: '' };
  } catch (error) {
    console.error("Error creando tarea:", error);
    alert("No se pudo crear la tarea");
  } finally {
    isSubmitting.value = false;
  }
};

// 3. Cambiar Estado (Pendiente <-> Completado)
const toggleStatus = async (task) => {
  const newStatus = task.estado === 'pendiente' ? 'completado' : 'pendiente';
  // Optimistic UI: Cambiamos visualmente antes de esperar al servidor
  const oldStatus = task.estado;
  task.estado = newStatus;

  try {
    await axios.put(`/api/tareas/${task.id}`, {
      estado: newStatus
    });
  } catch (error) {
    // Si falla, revertimos
    task.estado = oldStatus;
    alert("Error actualizando estado");
  }
};

// 4. Eliminar Tarea
const deleteTask = async (taskId) => {
  if(!confirm("¿Estás seguro de eliminar esta tarea?")) return;

  try {
    await axios.delete(`/api/tareas/${taskId}`);
    tasks.value = tasks.value.filter(t => t.id !== taskId);
  } catch (error) {
    console.error(error);
    alert("Error al eliminar");
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="detail-layout">
    <!-- Header de Navegación -->
    <header class="top-bar">
      <button @click="router.push('/dashboard')" class="back-btn">
        ← Volver
      </button>
      <div class="project-info" v-if="project">
        <h1>{{ project.titulo }}</h1>
        <span class="badge" :class="project.estado">{{ project.estado }}</span>
      </div>
    </header>

    <main class="content-area">

      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <!-- Toolbar -->
        <div class="toolbar">
          <h2>Lista de Tareas ({{ tasks.length }})</h2>
          <button class="btn-primary" @click="showCreateModal = true">
            + Nueva Tarea
          </button>
        </div>

        <!-- Empty State Tareas -->
        <div v-if="tasks.length === 0" class="empty-tasks">
          <p>Este proyecto no tiene tareas aún.</p>
        </div>

        <!-- Lista de Tareas -->
        <div v-else class="task-list">
          <div v-for="task in tasks" :key="task.id" class="task-item" :class="{ 'done': task.estado === 'completado' }">

            <!-- Checkbox Customizado -->
            <div class="check-area" @click="toggleStatus(task)">
              <div class="checkbox" :class="{ 'checked': task.estado === 'completado' }">
                <span v-if="task.estado === 'completado'">✓</span>
              </div>
            </div>

            <div class="task-content">
              <h3 class="task-title" @click="toggleStatus(task)">{{ task.titulo }}</h3>
              <p class="task-desc">{{ task.descripcion }}</p>
            </div>

            <div class="task-actions">
              <button class="btn-icon delete" @click="deleteTask(task.id)" title="Eliminar">
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Crear Tarea -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <div class="modal-card">
        <h3>Nueva Tarea</h3>
        <form @submit.prevent="createTask">
          <div class="form-group">
            <label>Título</label>
            <input v-model="newTaskForm.titulo" required placeholder="Ej: Diseñar base de datos" autoFocus />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="newTaskForm.descripcion" rows="2"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-text">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reutilizando variables del estilo anterior */
.detail-layout {
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: 'Inter', sans-serif;
}

.top-bar {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-btn {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  font-weight: 500;
}
.back-btn:hover { background: #f9fafb; color: #1f2937; }

.project-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.project-info h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  text-transform: capitalize;
  font-weight: 600;
}
.badge.pendiente { background: #fef3c7; color: #d97706; }
.badge.completado { background: #d1fae5; color: #059669; }

.content-area {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.task-list {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.task-item {
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}
.task-item:last-child { border-bottom: none; }
.task-item:hover { background: #f9fafb; }

.check-area {
  padding-right: 1rem;
  display: flex;
  align-items: flex-start;
  padding-top: 0.25rem;
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
}

.checkbox.checked {
  background-color: #2563eb;
  border-color: #2563eb;
}

.task-content { flex: 1; }

.task-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #1f2937;
  cursor: pointer;
}

.task-desc {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.task-item.done .task-title {
  text-decoration: line-through;
  color: #9ca3af;
}

.task-actions {
  padding-left: 1rem;
  display: flex;
  align-items: center;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.btn-icon:hover { opacity: 1; color: #ef4444; }

/* Modal y Botones (Estilos compartidos) */
.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-text { background: none; border: none; cursor: pointer; color: #6b7280; }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
}
.modal-card {
  background: white; padding: 2rem; border-radius: 12px; width: 400px;
}
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; }
.form-group input, .form-group textarea {
  width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 4px;
  box-sizing: border-box;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }

.spinner {
  width: 40px; height: 40px; border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
