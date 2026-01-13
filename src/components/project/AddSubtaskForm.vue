<script setup>
/**
 * AddSubtaskForm - Formulario para agregar subtarea
 * 
 * @author David Chab
 */
import { ref } from 'vue';

const emit = defineEmits(['add-subtask']);

const title = ref('');

const submit = () => {
  if (!title.value.trim()) return;
  emit('add-subtask', title.value);
  title.value = '';
};
</script>

<template>
  <div class="add-subtask">
    <input
      v-model="title"
      @keyup.enter="submit"
      placeholder="+ Agregar subtarea"
    />
    <button v-if="title.trim()" class="btn-add" @click="submit">OK</button>
  </div>
</template>

<style scoped>
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
