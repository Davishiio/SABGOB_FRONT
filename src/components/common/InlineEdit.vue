<script setup>
/**
 * InlineEdit - Editor inline reutilizable
 * Soporta input de texto y textarea
 * 
 * @author David Chab
 */
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'input' }, // 'input' | 'textarea'
  rows: { type: Number, default: 2 },
  autoFocus: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'save', 'cancel']);

const inputRef = ref(null);
const localValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  localValue.value = val;
});

const handleSave = () => {
  emit('update:modelValue', localValue.value);
  emit('save', localValue.value);
};

const handleCancel = () => {
  localValue.value = props.modelValue;
  emit('cancel');
};

// Autofocus on mount
watch(inputRef, (el) => {
  if (el && props.autoFocus) {
    nextTick(() => el.focus());
  }
});
</script>

<template>
  <div class="inline-edit">
    <textarea
      v-if="type === 'textarea'"
      ref="inputRef"
      v-model="localValue"
      :placeholder="placeholder"
      :rows="rows"
      class="edit-textarea"
      @keyup.escape="handleCancel"
    ></textarea>
    <input
      v-else
      ref="inputRef"
      v-model="localValue"
      :placeholder="placeholder"
      class="edit-input"
      @keyup.enter="handleSave"
      @keyup.escape="handleCancel"
    />
    <div class="edit-actions">
      <button class="btn-save" @click="handleSave" title="Guardar">✓</button>
      <button class="btn-cancel" @click="handleCancel" title="Cancelar">✕</button>
    </div>
  </div>
</template>

<style scoped>
.inline-edit {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  width: 100%;
}

.edit-input,
.edit-textarea {
  flex: 1;
  border: 2px solid var(--primary, #6366f1);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: inherit;
  font-family: inherit;
  outline: none;
  background: rgba(255, 255, 255, 0.95);
}

.edit-textarea {
  resize: vertical;
  min-height: 60px;
}

.edit-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-save,
.btn-cancel {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}

.btn-save:hover,
.btn-cancel:hover {
  transform: scale(1.1);
}

.btn-save {
  background: #10b981;
  color: white;
}

.btn-cancel {
  background: #e2e8f0;
  color: #475569;
}
</style>
