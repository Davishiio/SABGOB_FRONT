<script setup>
/**
 * TaskCard - Tarjeta de tarea con edición de fechas y comentarios
 * 
 * @author David Chab
 */
import { ref } from 'vue';

const props = defineProps({
  task: Object,
  currentUserId: Number
});

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
const newSubtaskTitle = ref('');

// Task editing
const isEditingTask = ref(false);
const editTaskTitle = ref('');
const isEditingTaskDates = ref(false);
const editTaskFechaInicio = ref('');
const editTaskFechaLimite = ref('');

// Subtask editing
const editingSubtaskId = ref(null);
const editSubtaskTitle = ref('');
const editingSubtaskDatesId = ref(null);
const editSubtaskFechaInicio = ref('');
const editSubtaskFechaLimite = ref('');

const toggle = () => isExpanded.value = !isExpanded.value;

// Format date helper
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short'
  });
};

// --- Task Title Edit ---
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

// --- Task Dates Edit ---
const startEditTaskDates = () => {
  editTaskFechaInicio.value = props.task.fecha_inicio?.split('T')[0] || '';
  editTaskFechaLimite.value = props.task.fecha_limite?.split('T')[0] || '';
  isEditingTaskDates.value = true;
};

const saveTaskDates = () => {
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

// --- Subtask Title Edit ---
const startEditSubtask = (sub) => {
  editingSubtaskId.value = sub.id;
  editSubtaskTitle.value = sub.titulo;
};

const saveSubtaskEdit = (sub) => {
  if (editSubtaskTitle.value.trim() && editSubtaskTitle.value !== sub.titulo) {
    emit('update-subtask', { subtask: sub, newTitle: editSubtaskTitle.value });
  }
  editingSubtaskId.value = null;
};

// --- Subtask Dates Edit ---
const startEditSubtaskDates = (sub) => {
  editSubtaskFechaInicio.value = sub.fecha_inicio?.split('T')[0] || '';
  editSubtaskFechaLimite.value = sub.fecha_limite?.split('T')[0] || '';
  editingSubtaskDatesId.value = sub.id;
};

const saveSubtaskDates = (sub) => {
  emit('update-subtask-details', {
    subtask: sub,
    data: {
      fecha_inicio: editSubtaskFechaInicio.value || null,
      fecha_limite: editSubtaskFechaLimite.value || null
    }
  });
  editingSubtaskDatesId.value = null;
};

const cancelSubtaskDates = () => {
  editingSubtaskDatesId.value = null;
};

// --- Add Subtask ---
const addSubtask = () => {
  if (!newSubtaskTitle.value.trim()) return;
  emit('add-subtask', { taskId: props.task.id, title: newSubtaskTitle.value });
  newSubtaskTitle.value = '';
};

const getUnreadCount = (comments) => {
  if (!comments || !props.currentUserId) return 0;
  return comments.filter(c => c.estado === 'enviado' && c.idUsuario !== props.currentUserId).length;
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
            <input type="date" v-model="editTaskFechaInicio" class="date-input-sm" />
          </div>
          <div class="date-field">
            <label>🎯 Límite</label>
            <input type="date" v-model="editTaskFechaLimite" class="date-input-sm" />
          </div>
          <div class="date-actions">
            <button class="btn-save-sm" @click="saveTaskDates">✓</button>
            <button class="btn-cancel-sm" @click="cancelTaskDates">✕</button>
          </div>
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
        <div v-for="sub in task.subtareas" :key="sub.id" class="subtask-item">
          <label class="checkbox-wrapper sm">
            <input
              type="checkbox"
              :checked="sub.estado === 'completado'"
              @change="$emit('toggle-subtask', sub)"
            />
            <span class="checkmark">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </span>
          </label>

          <div class="subtask-content">
            <!-- Editable Subtask Title -->
            <div v-if="editingSubtaskId === sub.id" class="edit-inline">
              <input
                v-model="editSubtaskTitle"
                @keyup.enter="saveSubtaskEdit(sub)"
                @keyup.escape="editingSubtaskId = null"
                @blur="saveSubtaskEdit(sub)"
                class="edit-input sm"
                autofocus
              />
            </div>
            <div v-else class="subtask-title-row">
              <span class="subtask-title" :class="{ done: sub.estado === 'completado' }">
                {{ sub.titulo }}
              </span>
              <button class="btn-edit sm" @click="startEditSubtask(sub)" title="Editar">✏️</button>
            </div>

            <!-- Subtask Dates -->
            <div v-if="editingSubtaskDatesId === sub.id" class="dates-edit-inline sm">
              <div class="date-field">
                <label>📅</label>
                <input type="date" v-model="editSubtaskFechaInicio" class="date-input-xs" />
              </div>
              <div class="date-field">
                <label>🎯</label>
                <input type="date" v-model="editSubtaskFechaLimite" class="date-input-xs" />
              </div>
              <div class="date-actions">
                <button class="btn-save-xs" @click="saveSubtaskDates(sub)">✓</button>
                <button class="btn-cancel-xs" @click="cancelSubtaskDates">✕</button>
              </div>
            </div>
            <div v-else class="dates-display sm" @click="startEditSubtaskDates(sub)">
              <span v-if="sub.fecha_inicio || sub.fecha_limite" class="dates-info">
                <span v-if="sub.fecha_inicio" class="date-tag sm">📅 {{ formatDate(sub.fecha_inicio) }}</span>
                <span v-if="sub.fecha_limite" class="date-tag deadline sm">🎯 {{ formatDate(sub.fecha_limite) }}</span>
              </span>
              <span v-else class="add-dates-hint sm">+ fechas</span>
            </div>
          </div>

          <!-- Subtask Actions -->
          <div class="subtask-actions">
            <button
              class="btn-comment-sub"
              :class="{ 'has-unread': getUnreadCount(sub.comments) > 0 }"
              @click="$emit('view-subtask-comments', sub)"
              title="Comentarios"
            >
              💬
              <span v-if="getUnreadCount(sub.comments)" class="badge-sm">{{ getUnreadCount(sub.comments) }}</span>
            </button>
            <button class="btn-delete-sub" @click="$emit('delete-subtask', { task, subtaskId: sub.id })" title="Eliminar">×</button>
          </div>
        </div>
      </div>

      <!-- Add Subtask -->
      <div class="add-subtask">
        <input
          v-model="newSubtaskTitle"
          @keyup.enter="addSubtask"
          placeholder="+ Agregar subtarea"
        />
        <button v-if="newSubtaskTitle.trim()" class="btn-add" @click="addSubtask">OK</button>
      </div>
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

.checkbox-wrapper.sm {
  width: 18px;
  height: 18px;
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

.btn-edit.sm {
  font-size: 0.7rem;
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

.edit-input.sm {
  font-size: 0.85rem;
  padding: 0.25rem 0.4rem;
}

/* Dates Display */
.dates-display {
  margin-top: 0.35rem;
  cursor: pointer;
  padding: 0.2rem 0;
}

.dates-display.sm {
  margin-top: 0.2rem;
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

.date-tag.sm {
  font-size: 0.65rem;
  padding: 0.1rem 0.3rem;
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

.add-dates-hint.sm {
  font-size: 0.65rem;
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

.dates-edit-inline.sm {
  margin-top: 0.2rem;
  gap: 0.35rem;
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

.date-input-xs {
  padding: 0.15rem 0.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.7rem;
  width: 100px;
}

.date-input-sm:focus,
.date-input-xs:focus {
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

.btn-save-xs, .btn-cancel-xs {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.7rem;
}

.btn-save-sm, .btn-save-xs {
  background: #10b981;
  color: white;
}

.btn-cancel-sm, .btn-cancel-xs {
  background: #e2e8f0;
  color: #475569;
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

.subtask-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.subtask-item:last-child {
  border-bottom: none;
}

.subtask-content {
  flex: 1;
  min-width: 0;
}

.subtask-title-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.subtask-title {
  font-size: 0.875rem;
  color: #475569;
}

.subtask-title.done {
  text-decoration: line-through;
  color: #94a3b8;
}

.subtask-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-comment-sub {
  position: relative;
  border: none;
  background: none;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0.2rem;
}

.btn-comment-sub:hover {
  opacity: 1;
}

.btn-comment-sub.has-unread {
  opacity: 1;
  color: #6366f1;
}

.badge-sm {
  position: absolute;
  top: -3px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 0.5rem;
  padding: 1px 3px;
  border-radius: 8px;
  font-weight: 700;
}

.btn-delete-sub {
  border: none;
  background: none;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 0.25rem;
}

.btn-delete-sub:hover {
  color: #ef4444;
}

.add-subtask {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.add-subtask input {
  flex: 1;
  border: none;
  background: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid #e2e8f0;
}

.add-subtask input:focus {
  outline: none;
  border-color: #6366f1;
}

.btn-add {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
