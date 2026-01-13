<script setup>
/**
 * ProjectHeader - Cabecera del proyecto con edición inline
 */
import { ref, computed } from 'vue';

const props = defineProps({
  project: Object,
  isDeleting: Boolean
});

const emit = defineEmits(['update-title', 'status-change', 'delete', 'view-comments']);

const isEditing = ref(false);
const editTitle = ref('');

const startEdit = () => {
  editTitle.value = props.project.titulo;
  isEditing.value = true;
};

const saveEdit = () => {
  if (editTitle.value.trim() && editTitle.value !== props.project.titulo) {
    emit('update-title', editTitle.value);
  }
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
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
        <div v-if="isEditing" class="edit-title-box">
          <input
            v-model="editTitle"
            @keyup.enter="saveEdit"
            @keyup.escape="cancelEdit"
            class="title-input"
            autofocus
          />
          <button class="btn-save" @click="saveEdit">✓</button>
          <button class="btn-cancel" @click="cancelEdit">✕</button>
        </div>
        <div v-else class="title-display">
          <h2 @click="startEdit" class="project-title">
            {{ project.titulo }}
            <span class="edit-hint">✏️</span>
          </h2>
        </div>

        <p class="project-desc">{{ project.descripcion || 'Sin descripción' }}</p>
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
          <span class="label">Todos los comentarios</span>
        </button>

        <button class="btn-action delete" @click="$emit('delete')" :disabled="isDeleting" title="Eliminar">
          <span class="icon">🗑️</span>
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-section">
      <div class="progress-info">
        <span class="progress-label">Progreso del proyecto</span>
        <span class="progress-value">{{ progress }}%</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :class="{ complete: progress === 100 }"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>
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
}

.title-section {
  flex: 1;
}

.title-display {
  cursor: pointer;
}

.project-title {
  margin: 0 0 0.25rem 0;
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

.project-desc {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.85;
}

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

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

.progress-section {
  background: rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

.progress-value {
  font-weight: 700;
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-fill.complete {
  background: #10b981;
}
</style>
