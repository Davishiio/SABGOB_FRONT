<script setup>
import { computed } from 'vue';

const props = defineProps({
  project: Object,
  progress: Number,
  showUser: Boolean
});

defineEmits(['click']);

const colorClass = computed(() => {
  const code = props.project.titulo?.charCodeAt(0) || 0;
  return `color-${code % 5}`;
});

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString();
};
</script>

<template>
  <tr class="project-row" @click="$emit('click', project.id)">
    <td v-if="showUser" class="text-muted">
      {{ project.user?.name || 'Desconocido' }}
    </td>
    <td>
      <div class="project-identity">
        <div class="avatar" :class="colorClass">
          {{ project.titulo?.charAt(0).toUpperCase() }}
        </div>
        <div class="info">
          <span class="title">{{ project.titulo }}</span>
          <span class="desc">{{ project.descripcion || 'Sin descripción' }}</span>
        </div>
      </div>
    </td>
    <td class="text-muted">{{ formatDate(project.fecha_limite) }}</td>
    <td>
      <span class="status-badge" :class="project.estado?.toLowerCase()">
        {{ project.estado }}
      </span>
    </td>
    <td>
      <div class="progress-container">
        <div class="progress-track">
          <div 
            class="progress-fill" 
            :class="{ complete: progress === 100 }"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <span class="progress-label">{{ progress }}%</span>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.project-row {
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f1f5f9;
}

.project-row:hover {
  background: #f8fafc;
}

.project-row td {
  padding: 1.25rem 1.5rem;
  vertical-align: middle;
}

.project-identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1.2rem;
}

.color-0 { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.color-1 { background: linear-gradient(135deg, #ec4899, #db2777); }
.color-2 { background: linear-gradient(135deg, #10b981, #059669); }
.color-3 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.color-4 { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.info {
  display: flex;
  flex-direction: column;
}

.title {
  font-weight: 600;
  color: #1e293b;
}

.desc {
  font-size: 0.8rem;
  color: #94a3b8;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-muted {
  color: #64748b;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.pendiente {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #ffedd5;
}

.status-badge.completado {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #d1fae5;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-track {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  width: 100px;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.5s;
}

.progress-fill.complete {
  background: #10b981;
}

.progress-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}
</style>
