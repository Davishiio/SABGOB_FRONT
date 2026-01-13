<script setup>
defineProps({
  task: Object,
  isExpanded: Boolean
});

defineEmits(['toggle-status', 'toggle-expand']);

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};
</script>

<template>
  <div class="task-card" :class="{ completed: task.estado === 'completado' }">
    <div class="task-header">
      <div class="left">
        <label class="checkbox">
          <input 
            type="checkbox" 
            :checked="task.estado === 'completado'" 
            @change="$emit('toggle-status', task)"
          />
          <span class="mark"></span>
        </label>
        <span class="title">{{ task.titulo }}</span>
        <span v-if="task.fecha_limite" class="date">
          📅 {{ formatDate(task.fecha_limite) }}
        </span>
      </div>
      <button class="toggle-btn" @click="$emit('toggle-expand', task.id)">
        {{ isExpanded ? 'Ocultar' : 'Subtareas' }}
      </button>
    </div>
    
    <div v-if="isExpanded" class="subtasks-slot">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.task-card.completed {
  opacity: 0.6;
}

.task-header {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox {
  position: relative;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox input {
  opacity: 0;
  width: 0;
  height: 0;
}

.mark {
  position: absolute;
  inset: 0;
  background: white;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  transition: all 0.2s;
}

.checkbox input:checked ~ .mark {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox input:checked ~ .mark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.title {
  font-weight: 500;
  color: #1e293b;
}

.task-card.completed .title {
  text-decoration: line-through;
  color: #94a3b8;
}

.date {
  font-size: 0.75rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.toggle-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
}

.subtasks-slot {
  background: #f8fafc;
  border-top: 1px dashed #e2e8f0;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
}
</style>
