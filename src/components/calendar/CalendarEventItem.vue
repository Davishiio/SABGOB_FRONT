<script setup>
/**
 * CalendarEventItem - Componente para renderizar eventos del calendario
 * Muestra proyectos, tareas y subtareas con estilos distintivos
 */
defineProps({
  event: {
    type: Object,
    required: true
    // { type: 'project'|'task'|'subtask', title, id, status, projectTitle?, isStart?, isEnd? }
  }
});

const getTypeIcon = (type) => {
  switch (type) {
    case 'project': return '📁';
    case 'task': return '📋';
    case 'subtask': return '📌';
    default: return '📄';
  }
};

const getStatusLabel = (status) => {
  return status === 'completado' ? 'Completado' : 'Pendiente';
};
</script>

<template>
  <div class="event-item" :class="[event.type, event.status]">
    <!-- Project Bar -->
    <template v-if="event.type === 'project'">
      <div 
        class="project-bar" 
        :class="{ 'is-start': event.isStart, 'is-end': event.isEnd }"
        :title="`📁 ${event.title}`"
      >
        <span v-if="event.isStart" class="bar-label">{{ event.title }}</span>
      </div>
    </template>

    <!-- Task/Subtask Pill -->
    <template v-else>
      <div 
        class="event-pill" 
        :class="event.type"
        :title="`${getTypeIcon(event.type)} ${event.title}${event.projectTitle ? '\n📁 ' + event.projectTitle : ''}\nEstado: ${getStatusLabel(event.status)}`"
      >
        <span class="event-icon">{{ getTypeIcon(event.type) }}</span>
        <span class="event-title">{{ event.title }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.event-item {
  margin-bottom: 2px;
}

/* Project Bars */
.project-bar {
  height: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  font-size: 0;
  transition: all 0.2s ease;
  position: relative;
}

.project-bar.is-start {
  border-radius: 4px 0 0 4px;
  margin-left: 2px;
}

.project-bar.is-end {
  border-radius: 0 4px 4px 0;
  margin-right: 2px;
}

.project-bar.is-start.is-end {
  border-radius: 4px;
}

.project-bar:hover {
  height: 20px;
  font-size: 0.65rem;
  z-index: 10;
}

.bar-label {
  display: none;
  color: white;
  font-weight: 600;
  padding: 0 6px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-bar:hover .bar-label {
  display: block;
}

/* Event Pills (Tasks & Subtasks) */
.event-pill {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
  transition: all 0.15s ease;
}

.event-pill.task {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #78350f;
}

.event-pill.subtask {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #064e3b;
  font-size: 0.6rem;
  padding: 1px 5px;
}

.event-pill:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

/* Completed status */
.event-item.completado .event-pill {
  opacity: 0.65;
}

.event-item.completado .event-pill.task {
  background: linear-gradient(135deg, #9ca3af, #d1d5db);
  color: #374151;
}

.event-item.completado .event-pill.subtask {
  background: linear-gradient(135deg, #6ee7b7, #a7f3d0);
  color: #065f46;
}

.event-icon {
  flex-shrink: 0;
  font-size: 0.7rem;
}

.event-title {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
