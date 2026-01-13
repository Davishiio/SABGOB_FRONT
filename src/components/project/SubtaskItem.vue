<script setup>
/**
 * SubtaskItem - Componente para subtarea individual
 * Maneja checkbox, edición de título, fechas y acciones
 * 
 * @author David Chab
 */
import { ref, computed } from 'vue';

const props = defineProps({
  subtask: { type: Object, required: true },
  currentUserId: { type: Number, default: null },
  taskFechaInicio: { type: String, default: null },
  taskFechaLimite: { type: String, default: null }
});

// Computed para límites de fechas de subtarea
const subtaskDateMin = computed(() => props.taskFechaInicio?.split('T')[0] || null);
const subtaskDateMax = computed(() => props.taskFechaLimite?.split('T')[0] || null);
const dateError = ref('');

const emit = defineEmits([
  'toggle-status',
  'update-title',
  'update-dates',
  'delete',
  'view-comments'
]);

// Title editing
const isEditingTitle = ref(false);
const editTitle = ref('');

// Dates editing
const isEditingDates = ref(false);
const editFechaInicio = ref('');
const editFechaLimite = ref('');

// Helpers
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short'
  });
};

const getUnreadCount = () => {
  if (!props.subtask.comments || !props.currentUserId) return 0;
  return props.subtask.comments.filter(
    c => c.estado === 'enviado' && c.idUsuario !== props.currentUserId
  ).length;
};

// Title edit handlers
const startEditTitle = () => {
  editTitle.value = props.subtask.titulo;
  isEditingTitle.value = true;
};

const saveTitle = () => {
  if (editTitle.value.trim() && editTitle.value !== props.subtask.titulo) {
    emit('update-title', editTitle.value);
  }
  isEditingTitle.value = false;
};

// Dates edit handlers
const startEditDates = () => {
  editFechaInicio.value = props.subtask.fecha_inicio?.split('T')[0] || '';
  editFechaLimite.value = props.subtask.fecha_limite?.split('T')[0] || '';
  isEditingDates.value = true;
};

const saveDates = () => {
  dateError.value = '';
  
  // Validar contra fechas de la tarea
  if (subtaskDateMin.value && editFechaInicio.value && editFechaInicio.value < subtaskDateMin.value) {
    dateError.value = 'Fecha inicio no puede ser anterior a la tarea';
    return;
  }
  if (subtaskDateMax.value && editFechaLimite.value && editFechaLimite.value > subtaskDateMax.value) {
    dateError.value = 'Fecha límite no puede ser posterior a la tarea';
    return;
  }
  
  emit('update-dates', {
    fecha_inicio: editFechaInicio.value || null,
    fecha_limite: editFechaLimite.value || null
  });
  isEditingDates.value = false;
};

const cancelDates = () => {
  isEditingDates.value = false;
};
</script>

<template>
  <div class="subtask-item">
    <!-- Checkbox -->
    <label class="checkbox-wrapper">
      <input
        type="checkbox"
        :checked="subtask.estado === 'completado'"
        @change="$emit('toggle-status')"
      />
      <span class="checkmark">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </span>
    </label>

    <!-- Content -->
    <div class="subtask-content">
      <!-- Title -->
      <div v-if="isEditingTitle" class="edit-inline">
        <input
          v-model="editTitle"
          @keyup.enter="saveTitle"
          @keyup.escape="isEditingTitle = false"
          @blur="saveTitle"
          class="edit-input"
          autofocus
        />
      </div>
      <div v-else class="title-row">
        <span 
          class="status-badge" 
          :class="subtask.estado === 'completado' ? 'completed' : 'pending'"
        >
          {{ subtask.estado === 'completado' ? 'Completado' : 'Pendiente' }}
        </span>
        <span class="subtask-title" :class="{ done: subtask.estado === 'completado' }">
          {{ subtask.titulo }}
        </span>
        <button class="btn-edit" @click="startEditTitle" title="Editar">✏️</button>
      </div>

      <!-- Dates -->
      <div v-if="isEditingDates" class="dates-edit">
        <div class="date-field">
          <label>📅</label>
          <input 
            type="date" 
            v-model="editFechaInicio" 
            :min="subtaskDateMin" 
            :max="subtaskDateMax"
            class="date-input" 
          />
        </div>
        <div class="date-field">
          <label>🎯</label>
          <input 
            type="date" 
            v-model="editFechaLimite" 
            :min="subtaskDateMin" 
            :max="subtaskDateMax"
            class="date-input" 
          />
        </div>
        <div class="date-actions">
          <button class="btn-save" @click="saveDates">✓</button>
          <button class="btn-cancel" @click="cancelDates">✕</button>
        </div>
        <span v-if="dateError" class="date-error">{{ dateError }}</span>
      </div>
      <div v-else class="dates-display" @click="startEditDates">
        <span v-if="subtask.fecha_inicio || subtask.fecha_limite" class="dates-info">
          <span v-if="subtask.fecha_inicio" class="date-tag">📅 {{ formatDate(subtask.fecha_inicio) }}</span>
          <span v-if="subtask.fecha_limite" class="date-tag deadline">🎯 {{ formatDate(subtask.fecha_limite) }}</span>
        </span>
        <span v-else class="add-dates-hint">+ fechas</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="subtask-actions">
      <button
        class="btn-comment"
        :class="{ 'has-unread': getUnreadCount() > 0 }"
        @click="$emit('view-comments')"
        title="Comentarios"
      >
        💬
        <span v-if="getUnreadCount()" class="badge">{{ getUnreadCount() }}</span>
      </button>
      <button class="btn-delete" @click="$emit('delete')" title="Eliminar">×</button>
    </div>
  </div>
</template>

<style scoped>
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

/* Checkbox */
.checkbox-wrapper {
  position: relative;
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
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
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkmark svg {
  width: 12px;
  height: 12px;
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

/* Content */
.subtask-content {
  flex: 1;
  min-width: 0;
}

.title-row {
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

.btn-edit {
  border: none;
  background: none;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
  padding: 0.2rem;
}

.btn-edit:hover {
  opacity: 1;
}

/* Edit inline */
.edit-inline {
  display: flex;
  flex: 1;
}

.edit-input {
  flex: 1;
  border: 2px solid #6366f1;
  border-radius: 4px;
  padding: 0.25rem 0.4rem;
  font-size: 0.85rem;
  outline: none;
}

/* Dates */
.dates-display {
  margin-top: 0.2rem;
  cursor: pointer;
  padding: 0.1rem 0;
}

.dates-info {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.date-tag {
  font-size: 0.65rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
}

.date-tag.deadline {
  background: #fef3c7;
  color: #92400e;
}

.add-dates-hint {
  font-size: 0.65rem;
  color: #94a3b8;
  opacity: 0.7;
  transition: all 0.2s;
}

.dates-display:hover .add-dates-hint {
  opacity: 1;
  color: #6366f1;
}

.dates-edit {
  display: flex;
  gap: 0.35rem;
  align-items: center;
  margin-top: 0.2rem;
  flex-wrap: wrap;
}

.date-field {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.date-field label {
  font-size: 0.7rem;
}

.date-input {
  padding: 0.15rem 0.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.7rem;
  width: 100px;
}

.date-input:focus {
  outline: none;
  border-color: #6366f1;
}

.date-actions {
  display: flex;
  gap: 0.2rem;
}

.btn-save,
.btn-cancel {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 0.7rem;
}

.btn-save {
  background: #10b981;
  color: white;
}

.btn-cancel {
  background: #e2e8f0;
  color: #475569;
}

.date-error {
  width: 100%;
  color: #ef4444;
  font-size: 0.6rem;
  margin-top: 0.2rem;
}

/* Actions */
.subtask-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-comment {
  position: relative;
  border: none;
  background: none;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0.2rem;
}

.btn-comment:hover {
  opacity: 1;
}

.btn-comment.has-unread {
  opacity: 1;
  color: #6366f1;
}

.badge {
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

.btn-delete {
  border: none;
  background: none;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 0.25rem;
}

.btn-delete:hover {
  color: #ef4444;
}

.status-badge {
  font-size: 0.6rem;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.status-badge.completed {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background-color: #f1f5f9;
  color: #64748b;
}
</style>
