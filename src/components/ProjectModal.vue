<script setup>
/**
 * ProjectModal - Modal principal de gestión de proyecto
 *
 * Orquestador que utiliza componentes modulares y composables:
 * - Components: ProjectHeader, TaskCard, CommentsPanel
 * - Composables: useProjectActions, useTaskActions, useSubtaskActions, useCommentActions
 *
 * @author David Chab
 * @version 2.0.0
 */
import { ref, watch, computed } from 'vue';
import axios from '../axios';
import { useAuthStore } from '../stores/auth';

// Components
import ProjectHeader from './project/ProjectHeader.vue';
import TaskCard from './project/TaskCard.vue';
import CommentsPanel from './project/CommentsPanel.vue';

// Composables
import { useProjectActions } from '../composables/useProjectActions';
import { useTaskActions } from '../composables/useTaskActions';
import { useSubtaskActions } from '../composables/useSubtaskActions';
import { useCommentActions } from '../composables/useCommentActions';

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
const newTaskTitle = ref('');

// Auth Store
const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);

// === COMPOSABLES ===
const { 
  updateProjectTitle, 
  updateProjectDetails,
  handleStatusChange, 
  handleDelete 
} = useProjectActions(project, emit);

const { 
  addTask: createTask, 
  updateTaskTitle, 
  updateTaskDetails,
  toggleTaskStatus, 
  deleteTask 
} = useTaskActions(project, emit);

const { 
  addSubtask: createSubtask, 
  updateSubtaskTitle, 
  updateSubtaskDetails,
  toggleSubtaskStatus, 
  deleteSubtask 
} = useSubtaskActions(project);

const {
  activeTarget,
  isSending: isSendingComment,
  displayedComments,
  initProjectComments,
  viewProjectComments,
  viewTaskComments,
  viewSubtaskComments,
  sendComment,
  editComment,
  deleteComment,
  reset: resetComments
} = useCommentActions(project);

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
    initProjectComments();
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
    resetComments();
  }
});

// === EVENT HANDLERS (Wrappers para eventos del template) ===

const onDeleteProject = () => handleDelete(isDeleting);

const addTask = async () => {
  const titulo = newTaskTitle.value.trim();
  if (!titulo) return;
  await createTask(titulo);
  newTaskTitle.value = '';
};

// Task event wrappers
const onUpdateTaskTitle = ({ task, newTitle }) => updateTaskTitle(task, newTitle);
const onUpdateTaskDetails = ({ task, data }) => updateTaskDetails(task, data);

// Subtask event wrappers
const onAddSubtask = ({ taskId, title }) => createSubtask(taskId, title);
const onUpdateSubtaskTitle = ({ subtask, newTitle }) => updateSubtaskTitle(subtask, newTitle);
const onUpdateSubtaskDetails = ({ subtask, data }) => updateSubtaskDetails(subtask, data);
const onDeleteSubtask = ({ task, subtaskId }) => deleteSubtask(task, subtaskId);

// Comment event wrapper
const onEditComment = ({ comment, newText }) => editComment(comment, newText);
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
                @update-project="updateProjectDetails"
                @status-change="handleStatusChange"
                @delete="onDeleteProject"
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
                    @update-title="onUpdateTaskTitle"
                    @update-task="onUpdateTaskDetails"
                    @delete="deleteTask"
                    @add-subtask="onAddSubtask"
                    @update-subtask="onUpdateSubtaskTitle"
                    @update-subtask-details="onUpdateSubtaskDetails"
                    @delete-subtask="onDeleteSubtask"
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
                @edit="onEditComment"
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
