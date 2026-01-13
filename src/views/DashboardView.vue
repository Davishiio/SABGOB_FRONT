<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../axios';
import MainLayout from '../layouts/MainLayout.vue';

const router = useRouter();

// --- ESTADO ---
const projects = ref([]);
const isLoading = ref(true);
const showCreateModal = ref(false);
const isSubmitting = ref(false);

const expandedProjectId = ref(null);
const expandedTaskIds = ref([]);
const projectTasks = ref({});
const taskSubtasks = ref({});
const loadingTasks = ref({});
const loadingSubtasks = ref({});

const newProjectForm = ref({ titulo: '', descripcion: '' });
const newTaskForm = ref({ titulo: '' });
const newSubtaskTitles = ref({});

// --- ACCIONES ---

const fetchProjects = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get('/api/proyectos');
    projects.value = response.data;
  } catch (error) {
    console.error("Error cargando proyectos:", error);
  } finally {
    isLoading.value = false;
  }
};

const createProject = async () => {
  if (!newProjectForm.value.titulo) return;
  isSubmitting.value = true;
  try {
    const response = await axios.post('/api/proyectos', newProjectForm.value);
    projects.value.unshift(response.data);
    showCreateModal.value = false;
    newProjectForm.value = { titulo: '', descripcion: '' };
  } catch (error) {
    alert("Error al crear proyecto");
  } finally {
    isSubmitting.value = false;
  }
};

const toggleProjectExpand = async (projectId) => {
  if (expandedProjectId.value === projectId) {
    expandedProjectId.value = null;
    return;
  }
  expandedProjectId.value = projectId;

  if (!projectTasks.value[projectId]) {
      loadingTasks.value[projectId] = true;
      try {
        const response = await axios.get(`/api/proyectos/${projectId}/tareas`);
        projectTasks.value[projectId] = response.data;
      } catch (error) {
        console.error("Error cargando tareas:", error);
      } finally {
        loadingTasks.value[projectId] = false;
      }
  }
};

const quickCreateTask = async (projectId) => {
  if (!newTaskForm.value.titulo) return;
  try {
    const response = await axios.post('/api/tareas', {
      idProyecto: projectId,
      titulo: newTaskForm.value.titulo,
      descripcion: 'Tarea rápida creada desde el dashboard'
    });

    if (!projectTasks.value[projectId]) projectTasks.value[projectId] = [];
    projectTasks.value[projectId].push(response.data);
    newTaskForm.value.titulo = '';
  } catch (error) {
    alert("Error al crear tarea");
  }
};

const toggleTaskStatus = async (task) => {
  const newStatus = task.estado === 'pendiente' ? 'completado' : 'pendiente';
  const originalStatus = task.estado;
  task.estado = newStatus;
  try {
    await axios.put(`/api/tareas/${task.id}`, { estado: newStatus });
  } catch (error) {
    task.estado = originalStatus;
    alert("Error de conexión");
  }
};

const toggleTaskExpand = async (taskId) => {
  const index = expandedTaskIds.value.indexOf(taskId);
  if (index > -1) {
    expandedTaskIds.value.splice(index, 1);
    return;
  }
  expandedTaskIds.value.push(taskId);

  if (!taskSubtasks.value[taskId]) {
    loadingSubtasks.value[taskId] = true;
    try {
      const response = await axios.get(`/api/tareas/${taskId}/subtareas`);
      taskSubtasks.value[taskId] = response.data;
    } catch (error) {
      console.error(error);
    } finally {
      loadingSubtasks.value[taskId] = false;
    }
  }
};

const quickCreateSubtask = async (taskId) => {
  const title = newSubtaskTitles.value[taskId];
  if (!title) return;

  try {
    const response = await axios.post('/api/subtareas', {
      idTarea: taskId,
      titulo: title,
      descripcion: 'Subtarea rápida'
    });

    if (!taskSubtasks.value[taskId]) taskSubtasks.value[taskId] = [];
    taskSubtasks.value[taskId].push(response.data);
    newSubtaskTitles.value[taskId] = '';
  } catch (error) {
    alert("Error al crear subtarea");
  }
};

const toggleSubtaskStatus = async (subtask) => {
  const newStatus = subtask.estado === 'pendiente' ? 'completado' : 'pendiente';
  const originalStatus = subtask.estado;
  subtask.estado = newStatus;
  try {
    await axios.put(`/api/subtareas/${subtask.id}`, { estado: newStatus });
  } catch (error) {
    subtask.estado = originalStatus;
  }
};

const calculateProgress = (project) => {
  if (project.estado === 'completado') return 100;
  // If tasks are loaded calculate, otherwise return placeholder or 0
  const tasks = projectTasks.value[project.id];
  if (tasks && tasks.length > 0) {
    const completed = tasks.filter(t => t.estado === 'completado').length;
    return Math.round((completed / tasks.length) * 100);
  }
  return 0; 
};

onMounted(fetchProjects);
</script>

<template>
  <MainLayout>
    <template #header>
      <div class="header-content">
        <span>Gestión de Proyectos</span>
        <button class="btn-primary" @click="showCreateModal = true">
          <span class="plus-icon">+</span> Nuevo Proyecto
        </button>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-lg"></div>
      <p>Consultando proyectos...</p>
    </div>

    <!-- MAIN TABLE CARD -->
    <div v-else class="table-card">
      <table class="modern-table">
        <thead>
          <tr>
            <th class="th-main">Proyecto</th>
            <th class="th-status">Estado</th>
            <th class="th-progress">Progreso</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="project in projects" :key="project.id">
            <!-- Project Row -->
            <tr class="project-row" :class="{ 'active-row': expandedProjectId === project.id }" @click="toggleProjectExpand(project.id)">
              <td>
                <div class="project-info">
                   <div class="icon-box">{{ project.titulo.charAt(0).toUpperCase() }}</div>
                   <div class="text-content">
                     <span class="project-name">{{ project.titulo }}</span>
                     <span class="project-desc">{{ project.descripcion }}</span>
                   </div>
                </div>
              </td>
              <td>
                <span class="status-pill" :class="project.estado">{{ project.estado }}</span>
              </td>
              <td>
                <div class="progress-wrapper">
                   <div class="progress-bar-bg">
                      <div class="progress-bar-fill" :style="{ width: calculateProgress(project) + '%' }"></div>
                   </div>
                   <span class="progress-text">{{ calculateProgress(project) }}%</span>
                </div>
              </td>
              <td class="td-actions">
                <button class="btn-expand">
                  {{ expandedProjectId === project.id ? 'Cerrar' : 'Ver Detalles' }}
                  <span class="chevron">{{ expandedProjectId === project.id ? '▲' : '▼' }}</span>
                </button>
              </td>
            </tr>

            <!-- Expanded Details Row -->
            <tr v-if="expandedProjectId === project.id" class="details-row">
              <td colspan="4">
                <div class="details-container">
                    
                    <div class="details-header-actions">
                       <h4>Tareas del Proyecto</h4>
                       <button class="btn-secondary sm" @click.stop="router.push(`/proyecto/${project.id}`)">
                         Ir a página del proyecto →
                       </button>
                    </div>

                    <div v-if="loadingTasks[project.id]" class="loading-block">
                        <div class="spinner-sm"></div> Cargando tareas...
                    </div>

                    <div v-else class="tasks-area">
                        <!-- Add Task -->
                        <div class="quick-add">
                           <input 
                             v-model="newTaskForm.titulo" 
                             @keyup.enter="quickCreateTask(project.id)"
                             placeholder="Agregar nueva tarea..." 
                             class="input-rounded"
                           />
                           <button class="btn-circle-add" @click="quickCreateTask(project.id)">+</button>
                        </div>

                        <!-- Tasks List -->
                        <div class="tasks-list">
                            <div v-if="!projectTasks[project.id] || projectTasks[project.id].length === 0" class="empty-msg">
                                No hay tareas registradas.
                            </div>

                            <div v-for="task in projectTasks[project.id]" :key="task.id" class="task-block">
                                <div class="task-main-row">
                                    <div class="left-group">
                                        <label class="check-round">
                                            <input type="checkbox" :checked="task.estado === 'completado'" @change="toggleTaskStatus(task)">
                                            <span class="checkmark"></span>
                                        </label>
                                        <span class="task-title" :class="{ done: task.estado === 'completado' }" @click="toggleTaskExpand(task.id)">
                                            {{ task.titulo }}
                                        </span>
                                    </div>
                                    <button class="btn-mini-toggle" @click="toggleTaskExpand(task.id)">
                                        {{ expandedTaskIds.includes(task.id) ? 'Ocultar Subtareas' : 'Ver Subtareas' }}
                                    </button>
                                </div>

                                <!-- Subtasks -->
                                <div v-if="expandedTaskIds.includes(task.id)" class="subtasks-nest">
                                    <div v-if="loadingSubtasks[task.id]" class="sub-loading">...</div>
                                    <div v-else>
                                        <ul class="sub-list">
                                            <li v-for="sub in taskSubtasks[task.id]" :key="sub.id" class="sub-item">
                                                <label class="check-round sm">
                                                    <input type="checkbox" :checked="sub.estado === 'completado'" @change="toggleSubtaskStatus(sub)">
                                                    <span class="checkmark"></span>
                                                </label>
                                                <span :class="{ done: sub.estado === 'completado' }">{{ sub.titulo }}</span>
                                            </li>
                                        </ul>
                                        <div class="sub-add">
                                            <input 
                                              v-model="newSubtaskTitles[task.id]" 
                                              @keyup.enter="quickCreateSubtask(task.id)"
                                              placeholder="Nueva subtarea..." 
                                              class="input-clean"
                                            />
                                            <small class="hint">Enter para guardar</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      
      <div v-if="projects.length === 0" class="empty-state-card">
         <p>No tienes proyectos activos.</p>
         <button class="btn-text" @click="showCreateModal = true">Crear mi primer proyecto</button>
      </div>
    </div>

    <!-- Modal Nuevo Proyecto -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-card">
        <div class="modal-header">
           <h3>Crear Nuevo Proyecto</h3>
           <button class="close-btn" @click="showCreateModal = false">×</button>
        </div>
        <form @submit.prevent="createProject" class="modal-form">
          <div class="form-group">
            <label>Título del Proyecto</label>
            <input v-model="newProjectForm.titulo" required placeholder="Ej. Rediseño Web" />
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="newProjectForm.descripcion" rows="3" placeholder="Detalles opcionales..."></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-ghost">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">Crear Proyecto</button>
          </div>
        </form>
      </div>
    </div>

  </MainLayout>
</template>

<style scoped>
/* Header Wrapper */
.header-content {
  display: flex; justify-content: space-between; align-items: center; width: 100%;
}

.loading-container { text-align: center; padding: 4rem; color: var(--color-text-muted); }
.spinner-lg { width: 40px; height: 40px; border: 4px solid #eee; border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }

/* Table Card Container */
.table-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden; /* For rounded corners on table */
  border: 1px solid var(--color-border);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.modern-table thead th {
  background-color: #f9fafb;
  padding: 1rem 1.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
  border-bottom: 2px solid #f3f4f6;
}

.project-row {
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.project-row:hover {
  background-color: #f8fafc;
}

.project-row.active-row {
  background-color: #eff6ff;
  border-bottom-color: transparent;
}

.project-row td {
  padding: 1.5rem;
  vertical-align: middle;
}

/* Project Info Column */
.project-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-box {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: var(--color-primary-dark);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; font-weight: 800;
  box-shadow: var(--shadow-sm);
}

.text-content {
  display: flex; flex-direction: column;
}

.project-name {
  font-weight: 600;
  color: var(--color-text-main);
  font-size: 1.05rem;
}

.project-desc {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Pill */
.status-pill {
  padding: 0.4rem 1rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}
.status-pill.pendiente { background: #fff7ed; color: #c2410c; }
.status-pill.completado { background: #ecfdf5; color: #047857; }

/* Progress Bar */
.progress-wrapper {
  display: flex; align-items: center; gap: 0.75rem;
  width: 100%; max-width: 200px;
}
.progress-bar-bg {
  flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;
}
.progress-bar-fill {
  height: 100%; background: var(--color-primary); transition: width 0.5s ease;
}
.progress-text {
  font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); min-width: 3ch;
}

/* Actions Column */
.td-actions { text-align: right; }
.btn-expand {
  background: white;
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-main);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 0.5rem;
}
.btn-expand:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}
.chevron { font-size: 0.7rem; }

/* Expanded Details Row */
.details-row td {
  padding: 0;
  background-color: #f9fafb;
  border-bottom: 1px solid var(--color-border);
}

.details-container {
  padding: 2rem;
  animation: slideDown 0.3s ease;
}

.details-header-actions {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;
}
.details-header-actions h4 { margin: 0; color: var(--color-text-main); font-size: 1.1rem; }

.tasks-area {
  background: white;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.quick-add {
  display: flex; gap: 0.75rem; margin-bottom: 1.5rem;
}
.input-rounded {
  flex: 1; padding: 0.75rem 1.25rem; border: 1px solid var(--color-border); border-radius: 99px;
  font-size: 0.95rem; background: #f9fafb;
}
.input-rounded:focus { outline: none; border-color: var(--color-primary); background: white; }
.btn-circle-add {
  width: 42px; height: 42px; border-radius: 50%; background: var(--color-primary); color: white;
  border: none; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: transform 0.2s;
}
.btn-circle-add:hover { transform: scale(1.05); }

/* Task Items */
.task-block {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem; margin-bottom: 1rem;
}
.task-block:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }

.task-main-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;
}
.left-group { display: flex; align-items: center; gap: 0.75rem; }

.check-round {
  position: relative; width: 22px; height: 22px; cursor: pointer;
}
.check-round input { opacity: 0; width: 0; height: 0; }
.check-round .checkmark {
  position: absolute; top: 0; left: 0; width: 22px; height: 22px;
  background: white; border: 2px solid #cbd5e1; border-radius: 50%;
}
.check-round:hover .checkmark { border-color: var(--color-primary); }
.check-round input:checked ~ .checkmark { background: var(--color-primary); border-color: var(--color-primary); }
.check-round .checkmark:after {
  content: ""; position: absolute; display: none;
  left: 7px; top: 3px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
}
.check-round input:checked ~ .checkmark:after { display: block; }
.check-round.sm { width: 16px; height: 16px; }
.check-round.sm .checkmark { width: 16px; height: 16px; border-width: 1.5px; }
.check-round.sm .checkmark:after { left: 5px; top: 2px; width: 3px; height: 7px; border-width: 0 1.5px 1.5px 0; }

.task-title { font-weight: 500; font-size: 1rem; color: var(--color-text-main); cursor: pointer; }
.task-title.done { text-decoration: line-through; color: var(--color-text-muted); }

.btn-mini-toggle {
  font-size: 0.75rem; color: var(--color-primary); background: none; border: none; cursor: pointer; font-weight: 600;
}

/* Subtasks */
.subtasks-nest {
  margin-left: 2.2rem; margin-top: 0.5rem; padding-left: 1rem; border-left: 2px solid #e5e7eb;
}
.sub-list { list-style: none; padding: 0; margin: 0 0 0.5rem 0; }
.sub-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; font-size: 0.9rem; color: #4b5563; }
.sub-add { display: flex; gap: 0.5rem; align-items: center; }
.input-clean { border: none; border-bottom: 1px dashed #cbd5e1; padding: 0.25rem; font-size: 0.85rem; background: transparent; }
.input-clean:focus { outline: none; border-color: var(--color-primary); }
.hint { font-size: 0.7rem; color: #9ca3af; }

.empty-state-card { text-align: center; padding: 3rem; }
.btn-text { background: none; border: none; color: var(--color-primary); font-weight: 600; cursor: pointer; }

/* Modal & Button Shared */
.btn-primary { 
  background: var(--color-primary); color: white; border: none; padding: 0.75rem 1.5rem; 
  border-radius: 99px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; 
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3); transition: transform 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); }
.btn-secondary { background: white; border: 1px solid var(--color-border); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; color: var(--color-text-main); }
.btn-secondary:hover { background: #f3f4f6; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 100; backdrop-filter: blur(5px);
}
.modal-card {
  background: white; width: 450px; border-radius: 1.5rem; box-shadow: var(--shadow-lg); overflow: hidden;
}
.modal-header { padding: 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.25rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; }
.modal-form { padding: 2rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
.form-group input, .form-group textarea { width: 100%; padding: 0.85rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; font-family: inherit; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.btn-ghost { background: none; border: none; color: #6b7280; font-weight: 500; cursor: pointer; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>
