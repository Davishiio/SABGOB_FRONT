import axios from '../axios';

/**
 * Composable para manejar acciones del proyecto
 * @param {Ref} project - Referencia reactiva al proyecto
 * @param {Function} emit - Función emit del componente
 * 
 * @author David Chab
 */
export function useProjectActions(project, emit) {
  /**
   * Actualiza el título del proyecto
   */
  const updateProjectTitle = async (newTitle) => {
    const original = project.value.titulo;
    project.value.titulo = newTitle;

    try {
      await axios.put(`/api/proyectos/${project.value.id}`, { titulo: newTitle });
      emit('project-updated', project.value);
    } catch (error) {
      project.value.titulo = original;
      console.error('Error al actualizar título:', error);
      alert('Error al actualizar');
    }
  };

  /**
   * Actualiza los detalles del proyecto (descripción y fechas)
   */
  const updateProjectDetails = async (details) => {
    const original = {
      descripcion: project.value.descripcion,
      fecha_inicio: project.value.fecha_inicio,
      fecha_limite: project.value.fecha_limite
    };

    // Actualizar localmente
    project.value.descripcion = details.descripcion;
    project.value.fecha_inicio = details.fecha_inicio;
    project.value.fecha_limite = details.fecha_limite;

    try {
      await axios.put(`/api/proyectos/${project.value.id}`, details);
      emit('project-updated', project.value);
    } catch (error) {
      // Revertir cambios
      project.value.descripcion = original.descripcion;
      project.value.fecha_inicio = original.fecha_inicio;
      project.value.fecha_limite = original.fecha_limite;
      console.error('Error al actualizar proyecto:', error);
      alert('Error al actualizar');
    }
  };

  /**
   * Cambia el estado del proyecto
   * Advierte si hay tareas pendientes al marcar como completado
   */
  const handleStatusChange = async (status) => {
    // Verificar si hay tareas pendientes al marcar como completado
    if (status === 'completado') {
      const pendingTasks = project.value.tasks?.filter(t => t.estado !== 'completado') || [];
      if (pendingTasks.length > 0) {
        const confirmed = confirm(
          `⚠️ Este proyecto tiene ${pendingTasks.length} tarea(s) sin completar.\n\n¿Estás seguro de marcarlo como completado?`
        );
        if (!confirmed) return;
      }
    }

    try {
      await axios.put(`/api/proyectos/${project.value.id}`, { estado: status });
      project.value.estado = status;
      emit('project-updated', project.value);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar estado');
    }
  };

  /**
   * Elimina el proyecto
   * @param {Ref<boolean>} isDeleting - Estado de eliminación
   */
  const handleDelete = async (isDeleting) => {
    if (!confirm('¿Eliminar este proyecto y todas sus tareas?')) return;
    isDeleting.value = true;

    try {
      await axios.delete(`/api/proyectos/${project.value.id}`);
      emit('project-deleted', project.value.id);
      emit('close');
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      alert('Error al eliminar');
    } finally {
      isDeleting.value = false;
    }
  };

  return {
    updateProjectTitle,
    updateProjectDetails,
    handleStatusChange,
    handleDelete
  };
}
