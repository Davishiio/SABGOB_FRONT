import axios from '../axios';

/**
 * Composable para manejar acciones de tareas
 * @param {Ref} project - Referencia reactiva al proyecto
 * @param {Function} emit - Función emit del componente
 * 
 * @author David Chab
 */
export function useTaskActions(project, emit) {
  /**
   * Crea una nueva tarea
   * @param {string} titulo - Título de la tarea
   */
  const addTask = async (titulo) => {
    if (!titulo.trim()) return null;

    try {
      const { data } = await axios.post('/api/tareas', {
        idProyecto: project.value.id,
        titulo: titulo.trim(),
        descripcion: '',
        estado: 'pendiente'
      });

      data.subtareas = [];
      data.comments = [];
      project.value.tasks.push(data);
      emit('project-updated', project.value);
      return data;
    } catch (error) {
      console.error('Error al crear tarea:', error);
      alert('Error al crear tarea');
      return null;
    }
  };

  /**
   * Actualiza el título de una tarea
   */
  const updateTaskTitle = async (task, newTitle) => {
    const original = task.titulo;
    task.titulo = newTitle;

    try {
      await axios.put(`/api/tareas/${task.id}`, { titulo: newTitle });
    } catch (error) {
      task.titulo = original;
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar');
    }
  };

  /**
   * Actualiza fechas/detalles de una tarea
   */
  const updateTaskDetails = async (task, data) => {
    const original = {
      fecha_inicio: task.fecha_inicio,
      fecha_limite: task.fecha_limite
    };

    // Actualizar localmente
    task.fecha_inicio = data.fecha_inicio;
    task.fecha_limite = data.fecha_limite;

    try {
      await axios.put(`/api/tareas/${task.id}`, data);
    } catch (error) {
      task.fecha_inicio = original.fecha_inicio;
      task.fecha_limite = original.fecha_limite;
      console.error('Error al actualizar tarea:', error);
      alert('Error al actualizar');
    }
  };

  /**
   * Alterna el estado de una tarea
   * Advierte si hay subtareas pendientes al marcar como completado
   */
  const toggleTaskStatus = async (task) => {
    const newStatus = task.estado === 'pendiente' ? 'completado' : 'pendiente';
    
    // Verificar si hay subtareas pendientes al marcar como completado
    if (newStatus === 'completado') {
      const pendingSubtasks = task.subtareas?.filter(s => s.estado !== 'completado') || [];
      if (pendingSubtasks.length > 0) {
        const confirmed = confirm(
          `⚠️ Esta tarea tiene ${pendingSubtasks.length} subtarea(s) sin completar.\n\n¿Estás seguro de marcarla como completada?`
        );
        if (!confirmed) return;
      }
    }

    const original = task.estado;
    task.estado = newStatus;

    try {
      await axios.put(`/api/tareas/${task.id}`, { estado: newStatus });
      emit('project-updated', project.value);
    } catch {
      task.estado = original;
    }
  };

  /**
   * Elimina una tarea
   */
  const deleteTask = async (task) => {
    if (!confirm('¿Eliminar esta tarea?')) return;

    try {
      await axios.delete(`/api/tareas/${task.id}`);
      project.value.tasks = project.value.tasks.filter(t => t.id !== task.id);
      emit('project-updated', project.value);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      alert('Error al eliminar');
    }
  };

  return {
    addTask,
    updateTaskTitle,
    updateTaskDetails,
    toggleTaskStatus,
    deleteTask
  };
}
