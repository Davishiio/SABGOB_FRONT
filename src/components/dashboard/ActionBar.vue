<script setup>
defineProps({
  projectCount: Number
});

defineEmits(['create']);
</script>

<template>
  <div class="action-bar">
    <div class="stats-pill">
      <span class="label">Proyectos:</span>
      <span class="value">{{ projectCount }}</span>
    </div>
    <button class="btn-primary" @click="$emit('create')">
      <span>+</span> Nuevo Proyecto
    </button>
  </div>
</template>

<style scoped>
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.stats-pill {
  background: white;
  padding: 0.5rem 1.25rem;
  border-radius: 99px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.value {
  font-size: 1.1rem;
  color: #0f172a;
  font-weight: 700;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
}
</style>
