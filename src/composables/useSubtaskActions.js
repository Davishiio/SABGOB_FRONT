import axios from '../axios';

/**
 * Composable para manejar acciones de subtareas
 * @param {Ref} project - Referencia reactiva al proyecto
 * 
 * @author David Chab
 */
export function useSubtaskActions(project) {
  /**
   * Crea una nueva subtarea
   * @param {number} taskId - ID de la tarea padre
   * @param {string} title - Título de la subtarea
   */
  const addSubtask = async (taskId, title) => {
    const task = project.value.tasks.find(t => t.id === taskId);
    if (!task) return null;

    try {
      const { data } = await axios.post('/api/subtareas', {
        idTarea: taskId,
        titulo: title,
        descripcion: '',
        estado: 'pendiente'
      });

      data.comments = [];
      if (!task.subtareas) task.subtareas = [];
      task.subtareas.push(data);
      return data;
    } catch (error) {
      console.error('Error al crear subtarea:', error);
      alert('Error al crear subtarea');
      return null;
    }
  };

  /**
   * Actualiza el título de una subtarea
   */
  const updateSubtaskTitle = async (subtask, newTitle) => {
    const original = subtask.titulo;
    subtask.titulo = newTitle;

    try {
      await axios.put(`/api/subtareas/${subtask.id}`, { titulo: newTitle });
    } catch (error) {
      subtask.titulo = original;
      console.error('Error al actualizar subtarea:', error);
      alert('Error al actualizar');
    }
  };

  /**
   * Actualiza fechas/detalles de una subtarea
   */
  const updateSubtaskDetails = async (subtask, data) => {
    const original = {
      fecha_inicio: subtask.fecha_inicio,
      fecha_limite: subtask.fecha_limite
    };

    // Actualizar localmente
    subtask.fecha_inicio = data.fecha_inicio;
    subtask.fecha_limite = data.fecha_limite;

    try {
      await axios.put(`/api/subtareas/${subtask.id}`, data);
    } catch (error) {
      subtask.fecha_inicio = original.fecha_inicio;
      subtask.fecha_limite = original.fecha_limite;
      console.error('Error al actualizar subtarea:', error);
      alert('Error al actualizar');
    }
  };

  /**
   * Alterna el estado de una subtarea
   */
  const toggleSubtaskStatus = async (subtask) => {
    const newStatus = subtask.estado === 'pendiente' ? 'completado' : 'pendiente';
    const original = subtask.estado;
    subtask.estado = newStatus;

    try {
      await axios.put(`/api/subtareas/${subtask.id}`, { estado: newStatus });
    } catch {
      subtask.estado = original;
    }
  };

  /**
   * Elimina una subtarea
   */
  const deleteSubtask = async (task, subtaskId) => {
    try {
      await axios.delete(`/api/subtareas/${subtaskId}`);
      task.subtareas = task.subtareas.filter(s => s.id !== subtaskId);
    } catch (error) {
      console.error('Error al eliminar subtarea:', error);
    }
  };

  return {
    addSubtask,
    updateSubtaskTitle,
    updateSubtaskDetails,
    toggleSubtaskStatus,
    deleteSubtask
  };
}
