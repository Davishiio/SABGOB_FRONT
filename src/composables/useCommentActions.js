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
   * Helper: Busca y ejecuta acción en el comentario dentro del árbol del proyecto
   */
  const findAndAction = (commentId, action) => {
    // 1. Buscar en Proyecto
    if (project.value.comments) {
      const idx = project.value.comments.findIndex(c => c.id === commentId);
      if (idx !== -1) {
        action(project.value.comments, idx);
        return true;
      }
    }

    // 2. Buscar en Tareas y sus Subtareas
    if (project.value.tasks) {
      for (const task of project.value.tasks) {
        // En Tarea
        if (task.comments) {
          const idx = task.comments.findIndex(c => c.id === commentId);
          if (idx !== -1) {
            action(task.comments, idx);
            return true;
          }
        }
        // En Subtareas
        if (task.subtareas) {
          for (const sub of task.subtareas) {
            if (sub.comments) {
              const idx = sub.comments.findIndex(c => c.id === commentId);
              if (idx !== -1) {
                action(sub.comments, idx);
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  };

  /**
   * Edita un comentario existente
   */
  const editComment = async (comment, newText) => {
    const originalText = comment.cuerpo;
    
    // Actualizar optimísticamente en el árbol local
    findAndAction(comment.id, (list, idx) => {
      list[idx].cuerpo = newText;
    });

    try {
      await axios.put(`/api/comentarios/${comment.id}`, { cuerpo: newText });
    } catch {
      // Revertir si falla
      findAndAction(comment.id, (list, idx) => {
        list[idx].cuerpo = originalText;
      });
      alert('Error al editar');
    }
  };

  /**
   * Elimina un comentario
   */
  const deleteComment = async (commentId) => {
    if (!confirm('¿Eliminar comentario?')) return;

    // Eliminar optimísticamente del árbol local
    findAndAction(commentId, (list, idx) => {
      list.splice(idx, 1);
    });

    // Si estamos en la vista 'Todos', forzar reactividad si fuera necesario
    // (activeTarget.value es reactivo, displayedComments se recalculará)

    try {
      await axios.delete(`/api/comentarios/${commentId}`);
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('Error al eliminar');
      // Recargar proyecto idealmente, o manejar rollback complejo
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
