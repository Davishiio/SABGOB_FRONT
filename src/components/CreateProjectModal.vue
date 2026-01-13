<script setup>
import { ref } from 'vue';
import axios from '../axios';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'project-created']);

const isSubmitting = ref(false);
const newProjectForm = ref({ 
  titulo: '', 
  descripcion: '', 
  fecha_inicio: '', 
  fecha_limite: '' 
});

const createProject = async () => {
  if (!newProjectForm.value.titulo || !newProjectForm.value.fecha_inicio || !newProjectForm.value.fecha_limite) {
     alert("Por favor completa todos los campos requeridos (Título, Fechas).");
     return;
  }
  if (newProjectForm.value.fecha_inicio > newProjectForm.value.fecha_limite) {
      alert("La fecha de inicio no puede ser posterior a la fecha límite.");
      return;
  }

  isSubmitting.value = true;
  try {
    const response = await axios.post('/api/proyectos', newProjectForm.value);
    emit('project-created', response.data);
    
    // Reset form and close
    newProjectForm.value = { titulo: '', descripcion: '', fecha_inicio: '', fecha_limite: '' };
    emit('close');
  } catch (error) {
    console.error(error);
    alert("Error al crear proyecto");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-window">
      <div class="modal-head">
         <h3>Nuevo Proyecto</h3>
         <button class="btn-close" @click="emit('close')">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="createProject">
          <div class="mb-3">
            <label class="form-label">Título del Proyecto</label>
            <input v-model="newProjectForm.titulo" class="form-control" required placeholder="Ej. Rediseño Web" autoFocus />
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción</label>
            <textarea v-model="newProjectForm.descripcion" class="form-control" rows="3" placeholder="Detalles clave..."></textarea>
          </div>
          <div class="row">
             <div class="col">
                <label class="form-label">Fecha Inicio</label>
                <input v-model="newProjectForm.fecha_inicio" type="date" class="form-control" required />
             </div>
             <div class="col">
                <label class="form-label">Fecha Límite</label>
                <input v-model="newProjectForm.fecha_limite" type="date" class="form-control" required />
             </div>
          </div>
          <div class="modal-foot">
            <button type="button" @click="emit('close')" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Crear Proyecto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Styles (Extracted from Dashboard) */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-window {
  background: white; width: 100%; max-width: 500px; border-radius: 0.75rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlide 0.3s ease-out;
}
.modal-head { padding: 1.25rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.modal-head h3 { margin: 0; font-size: 1.1rem; color: #0f172a; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 1.5rem; }
.modal-foot { padding: 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; background: #f8fafc; border-radius: 0 0 0.75rem 0.75rem; }

.mb-3 { margin-bottom: 1rem; }
.row { display: flex; gap: 1rem; }
.col { flex: 1; }
.form-label { display: block; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.9rem; color: #334155; }
.form-control {
  border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.9rem; outline: none; transition: border 0.2s; width: 100%; box-sizing: border-box;
}
.form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }

.btn-primary { background: #3b82f6; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-secondary:hover { background: #f1f5f9; }

@keyframes modalSlide { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>
