<script setup>
/**
 * CalendarView - Vista de calendario con proyectos, tareas y subtareas
 * 
 * Muestra visualmente:
 * - Proyectos como barras horizontales en el rango de fechas
 * - Tareas con icono 📋 en su fecha límite
 * - Subtareas con icono 📌 en su fecha límite
 */
import { ref, onMounted, computed } from 'vue';
import MainLayout from '../layouts/MainLayout.vue';
import CalendarEventItem from '../components/calendar/CalendarEventItem.vue';
import CalendarLegend from '../components/calendar/CalendarLegend.vue';
import axios from '../axios';

// --- ESTADO ---
const currentDate = ref(new Date());
const projects = ref([]);
const isLoading = ref(true);

// --- CÁLCULOS DEL CALENDARIO ---
const monthName = computed(() => {
  return currentDate.value.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Días previos del mes anterior para llenar la semana
  const startPadding = firstDayOfMonth.getDay(); // 0 (Domingo) - 6 (Sábado)
  const days = [];

  // Rellenar días anteriores
  for (let i = startPadding; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, isCurrentMonth: false });
  }

  // Días del mes actual
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true });
  }

  // Rellenar días posteriores
  while (days.length % 7 !== 0) {
    const d = new Date(days[days.length - 1].date);
    d.setDate(d.getDate() + 1);
    days.push({ date: d, isCurrentMonth: false });
  }

  return days;
});

// --- ACCIONES ---
const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
};

const goToToday = () => {
  currentDate.value = new Date();
};

/**
 * Carga datos de proyectos con tareas y subtareas completas
 */
const loadData = async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get('/api/proyectos');
    
    // Para cada proyecto, cargar sus tareas completas
    const projectsWithTasks = await Promise.all(
      data.map(async (project) => {
        try {
          const { data: completeProject } = await axios.get(`/api/proyectos/${project.id}/completo`);
          return completeProject;
        } catch {
          return { ...project, tasks: [] };
        }
      })
    );
    
    projects.value = projectsWithTasks;
  } catch (error) {
    console.error("Error cargando calendario", error);
  } finally {
    isLoading.value = false;
  }
};

// --- HELPERS VISUALES ---

/**
 * Obtiene eventos para un día específico
 * Incluye proyectos (barras), tareas y subtareas (pills)
 */
const getEventsForDay = (day) => {
  const dayStr = day.date.toISOString().split('T')[0];
  const events = [];

  projects.value.forEach(project => {
    // Proyecto: Barra si el día está en rango
    if (project.fecha_inicio && project.fecha_limite) {
      const start = project.fecha_inicio.split('T')[0];
      const end = project.fecha_limite.split('T')[0];
      if (dayStr >= start && dayStr <= end) {
        events.push({ 
          type: 'project', 
          title: project.titulo, 
          id: `p-${project.id}`,
          status: project.estado,
          isStart: dayStr === start,
          isEnd: dayStr === end
        });
      }
    }

    // Tareas: Pill si es la fecha límite
    project.tasks?.forEach(task => {
      if (task.fecha_limite) {
        const limit = task.fecha_limite.split('T')[0];
        if (dayStr === limit) {
          events.push({ 
            type: 'task', 
            title: task.titulo, 
            id: `t-${task.id}`,
            status: task.estado,
            projectTitle: project.titulo
          });
        }
      }

      // Subtareas: Pill más pequeño si es la fecha límite
      task.subtareas?.forEach(subtask => {
        if (subtask.fecha_limite) {
          const limit = subtask.fecha_limite.split('T')[0];
          if (dayStr === limit) {
            events.push({ 
              type: 'subtask', 
              title: subtask.titulo, 
              id: `s-${subtask.id}`,
              status: subtask.estado,
              projectTitle: project.titulo,
              taskTitle: task.titulo
            });
          }
        }
      });
    });
  });

  return events;
};

/**
 * Cuenta eventos por tipo para mostrar resumen
 */
const eventCounts = computed(() => {
  let projectCount = 0;
  let taskCount = 0;
  let subtaskCount = 0;

  projects.value.forEach(p => {
    if (p.fecha_inicio && p.fecha_limite) projectCount++;
    p.tasks?.forEach(t => {
      if (t.fecha_limite) taskCount++;
      t.subtareas?.forEach(s => {
        if (s.fecha_limite) subtaskCount++;
      });
    });
  });

  return { projectCount, taskCount, subtaskCount };
});

onMounted(loadData);
</script>

<template>
  <MainLayout>
    <div class="calendar-layout">
      <!-- Header -->
      <header class="calendar-header">
        <div class="header-left">
          <h2 class="page-title">📅 Calendario</h2>
          <div class="event-summary">
            <span class="summary-item projects">📁 {{ eventCounts.projectCount }} proyectos</span>
            <span class="summary-item tasks">📋 {{ eventCounts.taskCount }} tareas</span>
            <span class="summary-item subtasks">📌 {{ eventCounts.subtaskCount }} subtareas</span>
          </div>
        </div>
        <div class="header-right">
          <button @click="goToToday" class="today-btn">Hoy</button>
          <div class="month-nav">
            <button @click="prevMonth" class="nav-btn">‹</button>
            <span class="month-label">{{ monthName }}</span>
            <button @click="nextMonth" class="nav-btn">›</button>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando calendario...</p>
      </div>

      <template v-else>
        <!-- Legend -->
        <CalendarLegend class="legend-section" />

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <!-- Días de la semana -->
          <div class="weekday-header">Dom</div>
          <div class="weekday-header">Lun</div>
          <div class="weekday-header">Mar</div>
          <div class="weekday-header">Mié</div>
          <div class="weekday-header">Jue</div>
          <div class="weekday-header">Vie</div>
          <div class="weekday-header">Sáb</div>

          <!-- Días del mes -->
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index" 
            class="day-cell" 
            :class="{ 
              'other-month': !day.isCurrentMonth, 
              'today': day.date.toDateString() === new Date().toDateString(),
              'has-events': getEventsForDay(day).length > 0
            }"
          >
            <div class="day-number">{{ day.date.getDate() }}</div>
            
            <div class="events-stack">
              <CalendarEventItem 
                v-for="event in getEventsForDay(day)" 
                :key="event.id" 
                :event="event"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
.calendar-layout { 
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.calendar-header {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title { 
  margin: 0; 
  font-size: 1.5rem; 
  color: #1e293b; 
}

.event-summary {
  display: flex;
  gap: 1rem;
}

.summary-item {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.today-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.today-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.month-nav { 
  display: flex; 
  align-items: center; 
  gap: 1rem; 
  background: white; 
  padding: 0.5rem 1rem; 
  border-radius: 99px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
}

.month-label { 
  width: 150px; 
  text-align: center; 
  font-weight: 600; 
  text-transform: capitalize; 
  color: #334155; 
}

.nav-btn { 
  background: none; 
  border: none; 
  font-size: 1.5rem; 
  color: #64748b; 
  cursor: pointer; 
  transition: color 0.2s; 
  padding: 0 0.5rem; 
}

.nav-btn:hover { 
  color: #6366f1; 
}

.legend-section {
  margin-bottom: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.calendar-grid {
  display: grid; 
  grid-template-columns: repeat(7, 1fr);
  background: white; 
  border: 1px solid #e2e8f0; 
  border-radius: 1rem; 
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.weekday-header {
  background: #f8fafc; 
  padding: 1rem; 
  text-align: center; 
  font-weight: 600; 
  color: #64748b; 
  font-size: 0.9rem; 
  border-bottom: 1px solid #e2e8f0; 
  border-right: 1px solid #e2e8f0;
}

.weekday-header:last-child { 
  border-right: none; 
}

.day-cell {
  min-height: 120px; 
  border-right: 1px solid #f1f5f9; 
  border-bottom: 1px solid #f1f5f9; 
  padding: 0.5rem; 
  position: relative;
  transition: background 0.15s;
}

.day-cell:nth-child(7n) { 
  border-right: none; 
}

.day-cell.other-month { 
  background: #fcfcfc; 
}

.day-cell.other-month .day-number {
  color: #cbd5e1; 
}

.day-cell.today { 
  background: linear-gradient(135deg, #eff6ff, #eef2ff); 
}

.day-cell.today .day-number {
  background: #6366f1;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell.has-events:hover {
  background: #f8fafc;
}

.day-number { 
  font-weight: 600; 
  font-size: 0.9rem; 
  margin-bottom: 0.5rem; 
  color: #475569; 
}

.events-stack { 
  display: flex; 
  flex-direction: column; 
  gap: 2px;
  max-height: 80px;
  overflow-y: auto;
}

/* Scrollbar styling for events */
.events-stack::-webkit-scrollbar {
  width: 3px;
}

.events-stack::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
</style>
