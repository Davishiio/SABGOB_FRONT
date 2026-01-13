<script setup>
/**
 * CommentsPanel - Panel de comentarios estilo chat
 */
import { ref } from 'vue';

const props = defineProps({
  comments: Array,
  title: String,
  currentUserId: Number,
  isSending: Boolean
});

const emit = defineEmits(['send', 'edit', 'delete', 'close']);

const newText = ref('');
const editingId = ref(null);
const editText = ref('');

const send = () => {
  if (!newText.value.trim()) return;
  emit('send', newText.value);
  newText.value = '';
};

const startEdit = (comment) => {
  editingId.value = comment.id;
  editText.value = comment.cuerpo;
};

const saveEdit = (comment) => {
  if (!editText.value.trim()) return;
  emit('edit', { comment, newText: editText.value });
  editingId.value = null;
};

const formatTime = (date) => {
  if (!date) return 'Ahora';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
};
</script>

<template>
  <div class="comments-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-info">
        <span class="icon">💬</span>
        <h4>{{ title || 'Comentarios' }}</h4>
      </div>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    
    <!-- Messages Area -->
    <div class="messages-area">
      <div v-if="!comments?.length" class="empty-state">
        <div class="empty-icon">💭</div>
        <p>No hay comentarios aún</p>
        <span>Sé el primero en comentar</span>
      </div>
      
      <template v-else>
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="message"
          :class="{ own: comment.idUsuario == currentUserId }"
        >
          <!-- Context Badge -->
          <div v-if="comment._context" class="context-badge">
            {{ comment._context }}
          </div>
          
          <!-- Edit Mode -->
          <div v-if="editingId === comment.id" class="edit-mode">
            <textarea 
              v-model="editText" 
              rows="2"
              @keydown.ctrl.enter="saveEdit(comment)"
            ></textarea>
            <div class="edit-actions">
              <button class="btn-cancel" @click="editingId = null">Cancelar</button>
              <button class="btn-save" @click="saveEdit(comment)">Guardar</button>
            </div>
          </div>
          
          <!-- Message Content -->
          <div v-else class="message-body">
            <div class="message-actions" v-if="comment.idUsuario == currentUserId">
              <button @click="startEdit(comment)" title="Editar">✏️</button>
              <button @click="$emit('delete', comment.id)" title="Eliminar">❌</button>
            </div>
            <p class="text">{{ comment.cuerpo }}</p>
            <div class="meta">
              <span class="time">{{ formatTime(comment.created_at) }}</span>
              <span class="date">{{ formatDate(comment.created_at) }}</span>
              <span v-if="comment.estado === 'enviado'" class="status">✓</span>
              <span v-else-if="comment.estado === 'leido'" class="status read">✓✓</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <!-- Input Area -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea 
          v-model="newText" 
          placeholder="Escribe un mensaje..."
          @keydown.ctrl.enter="send"
          rows="2"
        ></textarea>
        <button class="send-btn" @click="send" :disabled="!newText.trim() || isSending">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      <span class="hint">Ctrl + Enter para enviar</span>
    </div>
  </div>
</template>

<style scoped>
.comments-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-info .icon {
  font-size: 1.25rem;
}

.header-info h4 {
  margin: 0;
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}

.close-btn {
  border: none;
  background: #f1f5f9;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #94a3b8;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0;
  font-weight: 600;
  color: #64748b;
}

.empty-state span {
  font-size: 0.85rem;
}

.message {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 12px 12px 12px 4px;
  background: white;
  border: 1px solid #e2e8f0;
  position: relative;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.message.own {
  align-self: flex-end;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px 12px 4px 12px;
}

.context-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.4rem;
  display: inline-block;
}

.message:not(.own) .context-badge {
  background: #e2e8f0;
  color: #475569;
}

.message.own .context-badge {
  background: rgba(255,255,255,0.2);
}

.message-body {
  position: relative;
}

.message-actions {
  position: absolute;
  top: -0.25rem;
  right: 0;
  display: flex;
  gap: 0.25rem;
  opacity: 1; /* Siempre visible */
  transition: opacity 0.2s;
}

/* Eliminado .message:hover .message-actions */

.message-actions button {
  border: none;
  background: rgba(255,255,255,0.3);
  font-size: 0.7rem;
  padding: 0.2rem;
  border-radius: 4px;
  cursor: pointer;
}

.text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
  font-size: 0.7rem;
}

.message:not(.own) .meta {
  color: #94a3b8;
}

.message.own .meta {
  color: rgba(255,255,255,0.7);
  justify-content: flex-end;
}

.status.read {
  color: #10b981;
}

.message.own .status.read {
  color: rgba(255,255,255,0.9);
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.edit-mode textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.85rem;
  resize: none;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel, .btn-save {
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-save {
  background: #6366f1;
  border: none;
  color: white;
}

.input-area {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.5rem;
}

.input-wrapper textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  padding: 0.25rem;
}

.send-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
}

.hint {
  display: block;
  text-align: center;
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}
</style>
