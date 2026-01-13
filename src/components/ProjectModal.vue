<script setup>
/**
 * ProjectModal - Modal principal de gestión de proyecto
 *
 * Orquestador que utiliza componentes modulares:
 * - ProjectHeader: Cabecera con título editable
 * - TaskCard: Tarjetas de tareas con subtareas
 * - CommentsPanel: Panel de comentarios
 *
 * @author SABGOB Team
 * @version 1.0.0
 */
import { ref, watch, computed } from 'vue';
import axios from '../axios';
import { useAuthStore } from '../stores/auth';
import ProjectHeader from './project/ProjectHeader.vue';
import TaskCard from './project/TaskCard.vue';
import CommentsPanel from './project/CommentsPanel.vue';

// Props y Emits
const props = defineProps({
  isOpen: Boolean,
  projectId: Number
});

const emit = defineEmits(['close', 'project-updated', 'project-deleted']);

// === STATE ===
const project = ref(null);
const isLoading = ref(false);
const isDeleting = ref(false);
const isSendingComment = ref(false);
const newTaskTitle = ref('');

// Auth Store
const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);

// Comments State
const activeTarget = ref(null);

/**
 * Computed: Comentarios a mostrar en el panel
 * Agrega contexto cuando se visualizan todos los comentarios del proyecto
 */
const displayedComments = computed(() => {
  if (!activeTarget.value) return [];

  // Si es vista de proyecto, agregar todos los comentarios con contexto
  if (activeTarget.value.type === 'Proyecto' && project.value) {
    const all = [...(project.value.comments || [])];

    project.value.tasks?.forEach(task => {
      task.comments?.forEach(comment => {
        all.push({ ...comment, _context: `📋 ${task.titulo}` });
      });
      task.subtareas?.forEach(subtask => {
        subtask.comments?.forEach(comment => {
          all.push({ ...comment, _context: `📌 ${subtask.titulo}` });
        });
      });
    });

    return all.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  }

  return activeTarget.value.comments || [];
});

// === API CALLS ===

/**
 * Carga los detalles completos del proyecto
 */
const fetchDetails = async () => {
  if (!props.projectId) return;
  isLoading.value = true;

  try {
    const { data } = await axios.get(`/api/proyectos/${props.projectId}/completo`);
    project.value = data;

    // Inicializar arrays de comentarios en subtareas
    project.value.tasks?.forEach(task => {
      if (!task.comments) task.comments = [];
      task.subtareas?.forEach(subtask => {
        if (!subtask.comments) subtask.comments = [];
      });
    });

    // Establecer vista inicial de comentarios
    activeTarget.value = {
      type: 'Proyecto',
      id: data.id,
      title: 'Todos los Comentarios',
      comments: data.comments || []
    };
  } catch (error) {
    console.error('Error al cargar proyecto:', error);
    alert('Error al cargar proyecto');
  } finally {
    isLoading.value = false;
  }
};

// Watcher para abrir/cerrar modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    fetchDetails();
  } else {
    project.value = null;
    activeTarget.value = null;
  }
});

// === PROJECT HANDLERS ===

/**
 * Actualiza el título del proyecto
 */
const updateProjectTitle = async (newTitle) => {
  const original = project.value.titulo;
  project.value.titulo = newTitle;

  try {
    await axios.put(`/api/proyectos/${project.value.id}`, { titulo: newTitle });
    emit('project-updated', project.value);
  } catch (error) {
    project.value.titulo = original;
    console.error('Error al actualizar título:', error);
    alert('Error al actualizar');
  }
};

/**
 * Cambia el estado del proyecto
 */
const handleStatusChange = async (status) => {
  try {
    await axios.put(`/api/proyectos/${project.value.id}`, { estado: status });
    project.value.estado = status;
    emit('project-updated', project.value);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    alert('Error al actualizar estado');
  }
};

/**
 * Elimina el proyecto
 */
const handleDelete = async () => {
  if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return;
  isDeleting.value = true;

  try {
    await axios.delete(`/api/proyectos/${project.value.id}`);
    emit('project-deleted', project.value.id);
    emit('close');
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    alert('Error al eliminar');
  } finally {
    isDeleting.value = false;
  }
};

// === TASK HANDLERS ===

/**
 * Crea una nueva tarea
 */
const addTask = async () => {
  const titulo = newTaskTitle.value.trim();
  if (!titulo) return;

  try {
    const { data } = await axios.post('/api/tareas', {
      idProyecto: project.value.id,
      titulo,
      descripcion: '',
      estado: 'pendiente'
    });

    data.subtareas = [];
    data.comments = [];
    project.value.tasks.push(data);
    newTaskTitle.value = '';
    emit('project-updated', project.value);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    alert('Error al crear tarea');
  }
};

/**
 * Actualiza el título de una tarea
 */
const updateTaskTitle = async ({ task, newTitle }) => {
  const original = task.titulo;
  task.titulo = newTitle;

  try {
    await axios.put(`/api/tareas/${task.id}`, { titulo: newTitle });
  } catch (error) {
    task.titulo = original;
    console.error('Error al actualizar tarea:', error);
    alert('Error al actualizar');
  }
};

/**
 * Alterna el estado de una tarea
 */
const toggleTaskStatus = async (task) => {
  const newStatus = task.estado === 'pendiente' ? 'completado' : 'pendiente';
  const original = task.estado;
  task.estado = newStatus;

  try {
    await axios.put(`/api/tareas/${task.id}`, { estado: newStatus });
    emit('project-updated', project.value);
  } catch {
    task.estado = original;
  }
};

/**
 * Elimina una tarea
 */
const deleteTask = async (task) => {
  if (!confirm('¿Eliminar esta tarea?')) return;

  try {
    await axios.delete(`/api/tareas/${task.id}`);
    project.value.tasks = project.value.tasks.filter(t => t.id !== task.id);
    emit('project-updated', project.value);
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    alert('Error al eliminar');
  }
};

// === SUBTASK HANDLERS ===

/**
 * Crea una nueva subtarea
 */
const addSubtask = async ({ taskId, title }) => {
  const task = project.value.tasks.find(t => t.id === taskId);
  if (!task) return;

  try {
    const { data } = await axios.post('/api/subtareas', {
      idTarea: taskId,
      titulo: title,
      descripcion: '',
      estado: 'pendiente'
    });

    data.comments = [];
    if (!task.subtareas) task.subtareas = [];
    task.subtareas.push(data);
  } catch (error) {
    console.error('Error al crear subtarea:', error);
    alert('Error al crear subtarea');
  }
};

/**
 * Actualiza el título de una subtarea
 */
const updateSubtaskTitle = async ({ subtask, newTitle }) => {
  const original = subtask.titulo;
  subtask.titulo = newTitle;

  try {
    await axios.put(`/api/subtareas/${subtask.id}`, { titulo: newTitle });
  } catch (error) {
    subtask.titulo = original;
    console.error('Error al actualizar subtarea:', error);
    alert('Error al actualizar');
  }
};

/**
 * Elimina una subtarea
 */
const deleteSubtask = async ({ task, subtaskId }) => {
  try {
    await axios.delete(`/api/subtareas/${subtaskId}`);
    task.subtareas = task.subtareas.filter(s => s.id !== subtaskId);
  } catch (error) {
    console.error('Error al eliminar subtarea:', error);
  }
};

/**
 * Alterna el estado de una subtarea
 */
const toggleSubtaskStatus = async (subtask) => {
  const newStatus = subtask.estado === 'pendiente' ? 'completado' : 'pendiente';
  const original = subtask.estado;
  subtask.estado = newStatus;

  try {
    await axios.put(`/api/subtareas/${subtask.id}`, { estado: newStatus });
  } catch {
    subtask.estado = original;
  }
};

// === COMMENT HANDLERS ===

/**
 * Muestra comentarios del proyecto
 */
const viewProjectComments = () => {
  activeTarget.value = {
    type: 'Proyecto',
    id: project.value.id,
    title: 'Todos los Comentarios',
    comments: project.value.comments || []
  };
};

/**
 * Muestra comentarios de una tarea
 */
const viewTaskComments = (task) => {
  activeTarget.value = {
    type: 'Tarea',
    id: task.id,
    title: `💬 ${task.titulo}`,
    comments: task.comments || []
  };
};

/**
 * Muestra comentarios de una subtarea
 */
const viewSubtaskComments = (subtask) => {
  activeTarget.value = {
    type: 'Subtarea',
    id: subtask.id,
    title: `📌 ${subtask.titulo}`,
    comments: subtask.comments || []
  };
};

/**
 * Envía un nuevo comentario
 */
const sendComment = async (text) => {
  if (!activeTarget.value) return;
  isSendingComment.value = true;

  try {
    const { data } = await axios.post('/api/comentarios', {
      tipo: activeTarget.value.type,
      id_referencia: activeTarget.value.id,
      cuerpo: text
    });

    if (!data.estado) data.estado = 'enviado';
    activeTarget.value.comments.push(data);

    // Sincronizar con la estructura principal si es comentario de tarea
    if (activeTarget.value.type === 'Tarea') {
      const task = project.value.tasks.find(t => t.id === activeTarget.value.id);
      if (task && task.comments !== activeTarget.value.comments) {
        task.comments.push(data);
      }
    }
  } catch (error) {
    console.error('Error al enviar comentario:', error);
    alert('Error al enviar');
  } finally {
    isSendingComment.value = false;
  }
};

/**
 * Edita un comentario existente
 */
const editComment = async ({ comment, newText }) => {
  const original = comment.cuerpo;
  comment.cuerpo = newText;

  try {
    await axios.put(`/api/comentarios/${comment.id}`, { cuerpo: newText });
  } catch {
    comment.cuerpo = original;
    alert('Error al editar');
  }
};

/**
 * Elimina un comentario
 */
const deleteComment = async (commentId) => {
  if (!confirm('¿Eliminar comentario?')) return;

  const idx = activeTarget.value.comments.findIndex(c => c.id === commentId);
  if (idx !== -1) activeTarget.value.comments.splice(idx, 1);

  try {
    await axios.delete(`/api/comentarios/${commentId}`);
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
  }
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando proyecto...</p>
        </div>

        <!-- Main Content -->
        <template v-else-if="project">
          <div class="modal-layout">
            <!-- Left Column: Project Details -->
            <div class="main-column">
              <ProjectHeader
                :project="project"
                :is-deleting="isDeleting"
                @update-title="updateProjectTitle"
                @status-change="handleStatusChange"
                @delete="handleDelete"
                @view-comments="viewProjectComments"
              />

              <!-- Tasks Section -->
              <div class="tasks-section">
                <div class="section-header">
                  <h3>📋 Tareas</h3>
                  <span class="task-count">{{ project.tasks?.length || 0 }}</span>
                </div>

                <!-- Add Task Form -->
                <div class="add-task-form">
                  <input
                    v-model="newTaskTitle"
                    @keyup.enter="addTask"
                    placeholder="+ Agregar nueva tarea"
                  />
                  <button v-if="newTaskTitle.trim()" @click="addTask">Agregar</button>
                </div>

                <!-- Tasks List -->
                <div class="tasks-list">
                  <div v-if="!project.tasks?.length" class="empty-tasks">
                    <span class="icon">📝</span>
                    <p>No hay tareas aún</p>
                  </div>

                  <TaskCard
                    v-for="task in project.tasks"
                    :key="task.id"
                    :task="task"
                    :current-user-id="currentUser?.id"
                    @toggle-status="toggleTaskStatus"
                    @update-title="updateTaskTitle"
                    @delete="deleteTask"
                    @add-subtask="addSubtask"
                    @update-subtask="updateSubtaskTitle"
                    @delete-subtask="deleteSubtask"
                    @toggle-subtask="toggleSubtaskStatus"
                    @view-comments="viewTaskComments"
                    @view-subtask-comments="viewSubtaskComments"
                  />
                </div>
              </div>
            </div>

            <!-- Right Column: Comments Panel -->
            <div class="comments-column">
              <CommentsPanel
                :comments="displayedComments"
                :title="activeTarget?.title"
                :current-user-id="currentUser?.id"
                :is-sending="isSendingComment"
                @send="sendComment"
                @edit="editComment"
                @delete="deleteComment"
                @close="$emit('close')"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  width: 1000px;
  max-width: 100%;
  height: 85vh;
  max-height: 700px;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.modal-layout {
  display: flex;
  width: 100%;
  height: 100%;
}

.main-column {
  flex: 3;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  min-width: 0;
  background: #f8fafc;
}

.comments-column {
  flex: 2;
  min-width: 300px;
}

.tasks-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  min-height: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.task-count {
  background: #e2e8f0;
  color: #475569;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.add-task-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-task-form input {
  flex: 1;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.add-task-form input:focus {
  outline: none;
  border-color: #6366f1;
}

.add-task-form button {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.add-task-form button:hover {
  transform: scale(1.02);
}

.tasks-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.empty-tasks {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-tasks .icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.empty-tasks p {
  margin: 0;
  font-size: 0.95rem;
}
</style>
