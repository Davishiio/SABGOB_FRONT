<script setup>
/**
 * ProgressBar - Barra de progreso visual
 * 
 * @author David Chab
 */
defineProps({
  progress: { type: Number, default: 0 },
  label: { type: String, default: 'Progreso' },
  showPercentage: { type: Boolean, default: true }
});
</script>

<template>
  <div class="progress-section">
    <div class="progress-info">
      <span class="progress-label">{{ label }}</span>
      <span v-if="showPercentage" class="progress-value">{{ progress }}%</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :class="{ complete: progress === 100 }"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.progress-section {
  background: rgba(255, 255, 255, 0.15);
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
  background: rgba(255, 255, 255, 0.3);
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
