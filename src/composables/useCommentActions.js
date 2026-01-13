import { ref, computed } from 'vue';
import axios from '../axios';

/**
 * Composable para manejar comentarios
 * @param {Ref} project - Referencia reactiva al proyecto
 */
export function useCommentActions(project) {
  const activeTarget = ref(null);
  const isSending = ref(false);

  /**
   * Computed: Comentarios a mostrar en el panel
   * Agrega contexto cuando se visualizan todos los comentarios del proyecto
   */
  const displayedComments = computed(() => {
    if (!activeTarget.value) return [];

    // Si es vista de proyecto, agregar todos los comentarios con contexto
    if (activeTarget.value.type === 'Proyecto' && project.value) {
      const all = [...(project.value.comments || [])];

      project.value.tasks?.forEach(task => {
        task.comments?.forEach(comment => {
          all.push({ ...comment, _context: `📋 ${task.titulo}` });
        });
        task.subtareas?.forEach(subtask => {
          subtask.comments?.forEach(comment => {
            all.push({ ...comment, _context: `📌 ${subtask.titulo}` });
          });
        });
      });

      return all.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    }

    return activeTarget.value.comments || [];
  });

  /**
   * Inicializa la vista de comentarios del proyecto
   */
  const initProjectComments = () => {
    if (!project.value) return;
    activeTarget.value = {
      type: 'Proyecto',
      id: project.value.id,
      title: 'Todos los Comentarios',
      comments: project.value.comments || []
    };
  };

  /**
   * Muestra comentarios del proyecto
   */
  const viewProjectComments = () => {
    activeTarget.value = {
      type: 'Proyecto',
      id: project.value.id,
      title: 'Todos los Comentarios',
      comments: project.value.comments || []
    };
  };

  /**
   * Muestra comentarios de una tarea
   */
  const viewTaskComments = (task) => {
    activeTarget.value = {
      type: 'Tarea',
      id: task.id,
      title: `💬 ${task.titulo}`,
      comments: task.comments || []
    };
  };

  /**
   * Muestra comentarios de una subtarea
   */
  const viewSubtaskComments = (subtask) => {
    activeTarget.value = {
      type: 'Subtarea',
      id: subtask.id,
      title: `📌 ${subtask.titulo}`,
      comments: subtask.comments || []
    };
  };

  /**
   * Envía un nuevo comentario
   */
  const sendComment = async (text) => {
    if (!activeTarget.value) return;
    isSending.value = true;

    try {
      const { data } = await axios.post('/api/comentarios', {
        tipo: activeTarget.value.type,
        id_referencia: activeTarget.value.id,
        cuerpo: text
      });

      if (!data.estado) data.estado = 'enviado';
      activeTarget.value.comments.push(data);

      // Sincronizar con la estructura principal si es comentario de tarea
      if (activeTarget.value.type === 'Tarea') {
        const task = project.value.tasks.find(t => t.id === activeTarget.value.id);
        if (task && task.comments !== activeTarget.value.comments) {
          task.comments.push(data);
        }
      }
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      alert('Error al enviar');
    } finally {
      isSending.value = false;
    }
  };

  /**
   * Edita un comentario existente
   */
  const editComment = async (comment, newText) => {
    const original = comment.cuerpo;
    comment.cuerpo = newText;

    try {
      await axios.put(`/api/comentarios/${comment.id}`, { cuerpo: newText });
    } catch {
      comment.cuerpo = original;
      alert('Error al editar');
    }
  };

  /**
   * Elimina un comentario
   */
  const deleteComment = async (commentId) => {
    if (!confirm('¿Eliminar comentario?')) return;

    const idx = activeTarget.value.comments.findIndex(c => c.id === commentId);
    if (idx !== -1) activeTarget.value.comments.splice(idx, 1);

    try {
      await axios.delete(`/api/comentarios/${commentId}`);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    }
  };

  /**
   * Resetea el estado de comentarios
   */
  const reset = () => {
    activeTarget.value = null;
  };

  return {
    activeTarget,
    isSending,
    displayedComments,
    initProjectComments,
    viewProjectComments,
    viewTaskComments,
    viewSubtaskComments,
    sendComment,
    editComment,
    deleteComment,
    reset
  };
}
