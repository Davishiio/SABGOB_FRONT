<script setup>
/**
 * ProjectHeader - Cabecera del proyecto con edición inline
 * Permite editar: título, descripción, fecha inicio y fecha límite
 * 
 * @author David Chab
 */
import { ref, computed } from 'vue';
import ProgressBar from '../common/ProgressBar.vue';

const props = defineProps({
  project: Object,
  isDeleting: Boolean
});

const emit = defineEmits(['update-title', 'update-project', 'status-change', 'delete', 'view-comments']);

// Edit modes
const isEditingTitle = ref(false);
const isEditingDetails = ref(false);

// Edit values
const editTitle = ref('');
const editDesc = ref('');
const editFechaInicio = ref('');
const editFechaLimite = ref('');

// --- Title Edit ---
const startEditTitle = () => {
  editTitle.value = props.project.titulo;
  isEditingTitle.value = true;
};

const saveTitle = () => {
  if (editTitle.value.trim() && editTitle.value !== props.project.titulo) {
    emit('update-title', editTitle.value);
  }
  isEditingTitle.value = false;
};

const cancelTitle = () => {
  isEditingTitle.value = false;
};

// --- Details Edit (Description + Dates) ---
const startEditDetails = () => {
  editDesc.value = props.project.descripcion || '';
  editFechaInicio.value = props.project.fecha_inicio?.split('T')[0] || '';
  editFechaLimite.value = props.project.fecha_limite?.split('T')[0] || '';
  isEditingDetails.value = true;
};

const saveDetails = () => {
  emit('update-project', {
    descripcion: editDesc.value,
    fecha_inicio: editFechaInicio.value || null,
    fecha_limite: editFechaLimite.value || null
  });
  isEditingDetails.value = false;
};

const cancelDetails = () => {
  isEditingDetails.value = false;
};

// --- Helpers ---
const formatDate = (dateStr) => {
  if (!dateStr) return 'No definida';
  return new Date(dateStr).toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const progress = computed(() => {
  if (!props.project?.tasks?.length) return 0;
  const done = props.project.tasks.filter(t => t.estado === 'completado').length;
  return Math.round((done / props.project.tasks.length) * 100);
});

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'completado', label: 'Completado' }
];
</script>

<template>
  <div class="project-header">
    <div class="header-top">
      <div class="title-section">
        <!-- Editable Title -->
        <div v-if="isEditingTitle" class="edit-title-box">
          <input
            v-model="editTitle"
            @keyup.enter="saveTitle"
            @keyup.escape="cancelTitle"
            class="title-input"
            autofocus
          />
          <button class="btn-save" @click="saveTitle">✓</button>
          <button class="btn-cancel" @click="cancelTitle">✕</button>
        </div>
        <div v-else class="title-display">
          <h2 @click="startEditTitle" class="project-title">
            {{ project.titulo }}
            <span class="edit-hint">✏️</span>
          </h2>
        </div>

        <!-- Description & Dates Display -->
        <div v-if="!isEditingDetails" class="details-display" @click="startEditDetails">
          <p class="project-desc">
            {{ project.descripcion || 'Sin descripción' }}
            <span class="edit-hint-small">✏️</span>
          </p>
          <div class="dates-row">
            <span class="date-item">
              <span class="date-icon">📅</span>
              <span class="date-label">Inicio:</span>
              <span class="date-value">{{ formatDate(project.fecha_inicio) }}</span>
            </span>
            <span class="date-item">
              <span class="date-icon">🎯</span>
              <span class="date-label">Límite:</span>
              <span class="date-value">{{ formatDate(project.fecha_limite) }}</span>
            </span>
          </div>
        </div>

        <!-- Details Edit Form -->
        <div v-else class="details-edit-form">
          <div class="form-group">
            <label>Descripción</label>
            <textarea
              v-model="editDesc"
              class="desc-input"
              rows="2"
              placeholder="Descripción del proyecto..."
            ></textarea>
          </div>
          <div class="dates-edit-row">
            <div class="form-group">
              <label>📅 Fecha Inicio</label>
              <input type="date" v-model="editFechaInicio" class="date-input" />
            </div>
            <div class="form-group">
              <label>🎯 Fecha Límite</label>
              <input type="date" v-model="editFechaLimite" class="date-input" />
            </div>
          </div>
          <div class="edit-actions">
            <button class="btn-save-details" @click="saveDetails">Guardar</button>
            <button class="btn-cancel-details" @click="cancelDetails">Cancelar</button>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <select
          :value="project.estado"
          @change="$emit('status-change', $event.target.value)"
          class="status-select"
          :class="project.estado"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <button class="btn-action comments" @click="$emit('view-comments')" title="Comentarios">
          <span class="icon">💬</span>
          <span class="label">Comentarios</span>
        </button>

        <button class="btn-action delete" @click="$emit('delete')" :disabled="isDeleting" title="Eliminar">
          <span class="icon">🗑️</span>
        </button>
      </div>
    </div>

    <!-- Progress Bar Component -->
    <ProgressBar :progress="progress" label="Progreso del proyecto" />
  </div>
</template>

<style scoped>
.project-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  color: white;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.title-section {
  flex: 1;
}

.title-display {
  cursor: pointer;
}

.project-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-hint {
  opacity: 0;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.project-title:hover .edit-hint {
  opacity: 0.7;
}

.details-display {
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.details-display:hover {
  background: rgba(255,255,255,0.1);
}

.project-desc {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-hint-small {
  opacity: 0;
  font-size: 0.75rem;
  transition: opacity 0.2s;
}

.details-display:hover .edit-hint-small {
  opacity: 0.7;
}

.dates-row {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  opacity: 0.85;
}

.date-icon {
  font-size: 0.9rem;
}

.date-label {
  font-weight: 500;
}

.date-value {
  opacity: 0.9;
}

/* Edit Forms */
.edit-title-box {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.title-input {
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 6px;
  background: rgba(255,255,255,0.15);
  color: white;
  outline: none;
  min-width: 300px;
}

.title-input::placeholder {
  color: rgba(255,255,255,0.5);
}

.btn-save, .btn-cancel {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-save {
  background: #10b981;
  color: white;
}

.btn-cancel {
  background: rgba(255,255,255,0.2);
  color: white;
}

/* Details Edit Form */
.details-edit-form {
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 1rem;
  margin-top: 0.5rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.desc-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 0.9rem;
  resize: vertical;
  outline: none;
}

.desc-input:focus {
  border-color: rgba(255,255,255,0.6);
}

.desc-input::placeholder {
  color: rgba(255,255,255,0.5);
}

.dates-edit-row {
  display: flex;
  gap: 1rem;
}

.dates-edit-row .form-group {
  flex: 1;
  margin-bottom: 0.75rem;
}

.date-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 0.85rem;
  outline: none;
}

.date-input:focus {
  border-color: rgba(255,255,255,0.6);
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-save-details, .btn-cancel-details {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-details {
  background: #10b981;
  color: white;
}

.btn-save-details:hover {
  background: #059669;
}

.btn-cancel-details {
  background: rgba(255,255,255,0.2);
  color: white;
}

.btn-cancel-details:hover {
  background: rgba(255,255,255,0.3);
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.status-select {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.15);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  appearance: none;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5rem;
}

.status-select option {
  color: #1e293b;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-action:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.btn-action.delete:hover {
  background: #ef4444;
  border-color: #ef4444;
}

.btn-action .icon {
  font-size: 1rem;
}
</style>
