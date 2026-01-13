<script setup>
/**
 * TaskCard - Tarjeta de tarea con edición y subtareas
 * 
 * @author David Chab
 */
import { ref, computed } from 'vue';
import SubtaskItem from './SubtaskItem.vue';
import AddSubtaskForm from './AddSubtaskForm.vue';

const props = defineProps({
  task: Object,
  currentUserId: Number,
  projectFechaInicio: String,
  projectFechaLimite: String
});

// Computed para límites de fechas de tarea
const taskDateMin = computed(() => props.projectFechaInicio?.split('T')[0] || null);
const taskDateMax = computed(() => props.projectFechaLimite?.split('T')[0] || null);
const dateError = ref('');

const emit = defineEmits([
  'toggle-status',
  'update-title',
  'update-task',
  'delete',
  'add-subtask',
  'update-subtask',
  'update-subtask-details',
  'delete-subtask',
  'toggle-subtask',
  'view-comments',
  'view-subtask-comments'
]);

const isExpanded = ref(false);

// Task editing
const isEditingTask = ref(false);
const editTaskTitle = ref('');
const isEditingTaskDates = ref(false);
const editTaskFechaInicio = ref('');
const editTaskFechaLimite = ref('');

const toggle = () => isExpanded.value = !isExpanded.value;

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short'
  });
};

// Task Title Edit
const startEditTask = () => {
  editTaskTitle.value = props.task.titulo;
  isEditingTask.value = true;
};

const saveTaskEdit = () => {
  if (editTaskTitle.value.trim() && editTaskTitle.value !== props.task.titulo) {
    emit('update-title', { task: props.task, newTitle: editTaskTitle.value });
  }
  isEditingTask.value = false;
};

// Task Dates Edit
const startEditTaskDates = () => {
  editTaskFechaInicio.value = props.task.fecha_inicio?.split('T')[0] || '';
  editTaskFechaLimite.value = props.task.fecha_limite?.split('T')[0] || '';
  isEditingTaskDates.value = true;
};

const saveTaskDates = () => {
  dateError.value = '';
  
  // Validar contra fechas del proyecto
  if (taskDateMin.value && editTaskFechaInicio.value && editTaskFechaInicio.value < taskDateMin.value) {
    dateError.value = 'Fecha inicio no puede ser anterior al proyecto';
    return;
  }
  if (taskDateMax.value && editTaskFechaLimite.value && editTaskFechaLimite.value > taskDateMax.value) {
    dateError.value = 'Fecha límite no puede ser posterior al proyecto';
    return;
  }
  
  emit('update-task', {
    task: props.task,
    data: {
      fecha_inicio: editTaskFechaInicio.value || null,
      fecha_limite: editTaskFechaLimite.value || null
    }
  });
  isEditingTaskDates.value = false;
};

const cancelTaskDates = () => {
  isEditingTaskDates.value = false;
};

const getUnreadCount = (comments) => {
  if (!comments || !props.currentUserId) return 0;
  return comments.filter(c => c.estado === 'enviado' && c.idUsuario !== props.currentUserId).length;
};

// Subtask handlers
const handleSubtaskTitleUpdate = (subtask, newTitle) => {
  emit('update-subtask', { subtask, newTitle });
};

const handleSubtaskDatesUpdate = (subtask, data) => {
  emit('update-subtask-details', { subtask, data });
};

const handleAddSubtask = (title) => {
  emit('add-subtask', { taskId: props.task.id, title });
};
</script>

<template>
  <div class="task-card" :class="{ completed: task.estado === 'completado', expanded: isExpanded }">
    <div class="task-main">
      <!-- Checkbox -->
      <label class="checkbox-wrapper">
        <input
          type="checkbox"
          :checked="task.estado === 'completado'"
          @change="$emit('toggle-status', task)"
        />
        <span class="checkmark">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </span>
      </label>

      <!-- Title & Dates -->
      <div class="task-content">
        <!-- Title Editing -->
        <div v-if="isEditingTask" class="edit-inline">
          <input
            v-model="editTaskTitle"
            @keyup.enter="saveTaskEdit"
            @keyup.escape="isEditingTask = false"
            @blur="saveTaskEdit"
            class="edit-input"
            autofocus
          />
        </div>
        <div v-else class="title-row">
          <span class="task-title" :class="{ done: task.estado === 'completado' }">
            {{ task.titulo }}
          </span>
          <button class="btn-edit" @click="startEditTask" title="Editar título">✏️</button>
        </div>

        <!-- Dates Display/Edit -->
        <div v-if="isEditingTaskDates" class="dates-edit-inline">
          <div class="date-field">
            <label>📅 Inicio</label>
            <input 
              type="date" 
              v-model="editTaskFechaInicio" 
              :min="taskDateMin" 
              :max="taskDateMax"
              class="date-input-sm" 
            />
          </div>
          <div class="date-field">
            <label>🎯 Límite</label>
            <input 
              type="date" 
              v-model="editTaskFechaLimite" 
              :min="taskDateMin" 
              :max="taskDateMax"
              class="date-input-sm" 
            />
          </div>
          <div class="date-actions">
            <button class="btn-save-sm" @click="saveTaskDates">✓</button>
            <button class="btn-cancel-sm" @click="cancelTaskDates">✕</button>
          </div>
          <span v-if="dateError" class="date-error">{{ dateError }}</span>
        </div>
        <div v-else class="dates-display" @click="startEditTaskDates">
          <span v-if="task.fecha_inicio || task.fecha_limite" class="dates-info">
            <span v-if="task.fecha_inicio" class="date-tag">📅 {{ formatDate(task.fecha_inicio) }}</span>
            <span v-if="task.fecha_limite" class="date-tag deadline">🎯 {{ formatDate(task.fecha_limite) }}</span>
          </span>
          <span v-else class="add-dates-hint">+ Agregar fechas</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="task-actions">
        <button class="btn-icon expand" @click="toggle" :class="{ active: isExpanded }">
          <span class="chevron">▼</span>
          <span class="count" v-if="task.subtareas?.length">{{ task.subtareas.length }}</span>
        </button>

        <button
          class="btn-icon comments"
          :class="{ 'has-unread': getUnreadCount(task.comments) > 0 }"
          @click="$emit('view-comments', task)"
          title="Comentarios"
        >
          💬
          <span v-if="getUnreadCount(task.comments)" class="badge">
            {{ getUnreadCount(task.comments) }}
          </span>
        </button>

        <button class="btn-icon delete" @click="$emit('delete', task)" title="Eliminar">✕</button>
      </div>
    </div>

    <!-- Subtasks Panel -->
    <div v-if="isExpanded" class="subtasks-panel">
      <div class="subtasks-list">
        <SubtaskItem
          v-for="sub in task.subtareas"
          :key="sub.id"
          :subtask="sub"
          :current-user-id="currentUserId"
          :task-fecha-inicio="task.fecha_inicio"
          :task-fecha-limite="task.fecha_limite"
          @toggle-status="$emit('toggle-subtask', sub)"
          @update-title="handleSubtaskTitleUpdate(sub, $event)"
          @update-dates="handleSubtaskDatesUpdate(sub, $event)"
          @delete="$emit('delete-subtask', { task, subtaskId: sub.id })"
          @view-comments="$emit('view-subtask-comments', sub)"
        />
      </div>

      <AddSubtaskForm @add-subtask="handleAddSubtask" />
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  overflow: hidden;
}

.task-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.task-card.expanded {
  border-color: #6366f1;
}

.task-card.completed {
  opacity: 0.7;
  background: #f8fafc;
}

.task-main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

/* Custom Checkbox */
.checkbox-wrapper {
  position: relative;
  width: 22px;
  height: 22px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}

.checkbox-wrapper input {
  opacity: 0;
  position: absolute;
}

.checkmark {
  position: absolute;
  inset: 0;
  background: white;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark svg {
  width: 14px;
  height: 14px;
  fill: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.checkbox-wrapper:hover .checkmark {
  border-color: #6366f1;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-color: transparent;
}

.checkbox-wrapper input:checked ~ .checkmark svg {
  opacity: 1;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
}

.task-title.done {
  text-decoration: line-through;
  color: #94a3b8;
}

.btn-edit {
  border: none;
  background: none;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
  padding: 0.2rem;
}

.btn-edit:hover {
  opacity: 1;
}

.edit-inline {
  display: flex;
  flex: 1;
}

.edit-input {
  flex: 1;
  border: 2px solid #6366f1;
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  outline: none;
}

/* Dates Display */
.dates-display {
  margin-top: 0.35rem;
  cursor: pointer;
  padding: 0.2rem 0;
}

.dates-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-tag {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.date-tag.deadline {
  background: #fef3c7;
  color: #92400e;
}

.add-dates-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.dates-display:hover .add-dates-hint {
  opacity: 1;
  color: #6366f1;
}

/* Dates Edit Inline */
.dates-edit-inline {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}

.date-field {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.date-field label {
  font-size: 0.75rem;
}

.date-input-sm {
  padding: 0.25rem 0.35rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.75rem;
  width: 110px;
}

.date-input-sm:focus {
  outline: none;
  border-color: #6366f1;
}

.date-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-save-sm, .btn-cancel-sm {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-save-sm {
  background: #10b981;
  color: white;
}

.btn-cancel-sm {
  background: #e2e8f0;
  color: #475569;
}

.date-error {
  width: 100%;
  color: #ef4444;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

/* Task Actions */
.task-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-icon {
  position: relative;
  border: none;
  background: none;
  padding: 0.4rem;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.9rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
  color: #475569;
}

.btn-icon.expand {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-icon.expand.active {
  color: #6366f1;
}

.chevron {
  font-size: 0.7rem;
  transition: transform 0.2s;
}

.btn-icon.expand.active .chevron {
  transform: rotate(180deg);
}

.count {
  background: #e2e8f0;
  color: #475569;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-weight: 600;
}

.btn-icon.comments.has-unread {
  color: #6366f1;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  padding: 1px 4px;
  border-radius: 10px;
  font-weight: 700;
}

.btn-icon.delete:hover {
  color: #ef4444;
}

/* Subtasks Panel */
.subtasks-panel {
  background: #f8fafc;
  border-top: 1px dashed #e2e8f0;
  padding: 0.75rem 1.25rem 1rem 3.5rem;
}

.subtasks-list {
  margin-bottom: 0;
}
</style>
