<script setup>
/**
 * CalendarLegend - Leyenda visual del calendario
 * Explica los colores e iconos usados para cada tipo de evento
 */
</script>

<template>
  <div class="calendar-legend">
    <h4 class="legend-title">Leyenda</h4>
    <div class="legend-items">
      <div class="legend-item">
        <div class="legend-icon project-bar"></div>
        <span class="legend-label">📁 Proyecto (rango de fechas)</span>
      </div>
      <div class="legend-item">
        <div class="legend-icon task-dot"></div>
        <span class="legend-label">📋 Tarea (fecha límite)</span>
      </div>
      <div class="legend-item">
        <div class="legend-icon subtask-dot"></div>
        <span class="legend-label">📌 Subtarea (fecha límite)</span>
      </div>
      <div class="legend-divider"></div>
      <div class="legend-item">
        <div class="legend-icon completed-dot"></div>
        <span class="legend-label">✓ Completado</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-legend {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.legend-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-icon {
  width: 24px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-icon.project-bar {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  width: 32px;
}

.legend-icon.task-dot {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  width: 20px;
  height: 12px;
  border-radius: 4px;
}

.legend-icon.subtask-dot {
  background: linear-gradient(135deg, #10b981, #34d399);
  width: 16px;
  height: 10px;
  border-radius: 3px;
}

.legend-icon.completed-dot {
  background: linear-gradient(135deg, #9ca3af, #d1d5db);
  width: 20px;
  opacity: 0.7;
}

.legend-label {
  font-size: 0.8rem;
  color: #64748b;
}

.legend-divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  margin: 0 0.5rem;
}
</style>
