<script setup>
import { ref, onMounted, computed } from 'vue';
import MainLayout from '../layouts/MainLayout.vue';
import axios from '../axios';

// --- ESTADO ---
const currentDate = ref(new Date());
const projects = ref([]);
const tasks = ref([]);
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

const loadData = async () => {
  isLoading.value = true;
  try {
    const [projRes, taskRes] = await Promise.all([
      axios.get('/api/proyectos'),
      axios.get('/api/tareas') // Asumiendo que existe un endpoint global o filtrado
    ]);
    projects.value = projRes.data;
    tasks.value = taskRes.data;
  } catch (error) {
    console.error("Error cargando calendario", error);
  } finally {
    isLoading.value = false;
  }
};

// --- HELPERS VISUALES ---
const getEventsForDay = (day) => {
  const dayStr = day.date.toISOString().split('T')[0];
  const events = [];

  // Proyectos: Barra si el día está en rango
  projects.value.forEach(p => {
    if (p.fecha_inicio && p.fecha_limite) {
      const start = p.fecha_inicio.split('T')[0];
      const end = p.fecha_limite.split('T')[0];
      if (dayStr >= start && dayStr <= end) {
        events.push({ 
            type: 'project', 
            title: p.titulo, 
            id: p.id,
            isStart: dayStr === start,
            isEnd: dayStr === end
        });
      }
    }
  });

  // Tareas: Punto si es la fecha límite
  tasks.value.forEach(t => {
      if (t.fecha_limite) {
          const limit = t.fecha_limite.split('T')[0];
          if (dayStr === limit) {
              events.push({ type: 'task', title: t.titulo, id: t.id, status: t.estado });
          }
      }
  });

  return events;
};

onMounted(loadData);
</script>

<template>
  <MainLayout>
    <div class="calendar-layout">
        <header class="calendar-header">
            <h2 class="page-title">Calendario</h2>
            <div class="month-nav">
                <button @click="prevMonth" class="nav-btn">‹</button>
                <span class="month-label">{{ monthName }}</span>
                <button @click="nextMonth" class="nav-btn">›</button>
            </div>
        </header>

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
               :class="{ 'other-month': !day.isCurrentMonth, 'today': day.date.toDateString() === new Date().toDateString() }"
             >
                <div class="day-number">{{ day.date.getDate() }}</div>
                
                <div class="events-stack">
                    <div v-for="event in getEventsForDay(day)" :key="event.id + event.type" class="event-item" :class="event.type">
                        <template v-if="event.type === 'project'">
                            <div class="project-bar" :title="event.title">
                                {{ event.isStart ? event.title : '' }}
                            </div>
                        </template>
                        <template v-else>
                            <div class="task-dot" :title="`Tarea: ${event.title}`" :class="event.status"></div>
                        </template>
                    </div>
                </div>

             </div>
        </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.calendar-layout { padding: 1rem 2rem; }

.calendar-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
}
.page-title { margin: 0; font-size: 1.5rem; color: #1e293b; }

.month-nav { display: flex; align-items: center; gap: 1rem; background: white; padding: 0.5rem 1rem; border-radius: 99px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.month-label { width: 150px; text-align: center; font-weight: 600; text-transform: capitalize; color: #334155; }
.nav-btn { background: none; border: none; font-size: 1.5rem; color: #64748b; cursor: pointer; transition: color 0.2s; padding: 0 0.5rem; }
.nav-btn:hover { color: #3b82f6; }

.calendar-grid {
    display: grid; grid-template-columns: repeat(7, 1fr);
    background: white; border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.weekday-header {
    background: #f8fafc; padding: 1rem; text-align: center; font-weight: 600; color: #64748b; font-size: 0.9rem; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;
}
.weekday-header:last-child { border-right: none; }

.day-cell {
    min-height: 120px; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 0.5rem; position: relative;
}
.day-cell:nth-child(7n) { border-right: none; }
.day-cell.other-month { background: #fcfcfc; color: #cbd5e1; }
.day-cell.today { background: #eff6ff; }
.day-number { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: #475569; }

.events-stack { display: flex; flex-direction: column; gap: 2px; }

/* Styles for Project Bars */
.project-bar {
    height: 6px; background: #3b82f6; border-radius: 2px; font-size: 0.7rem; color: white; overflow: hidden; white-space: nowrap; padding-left: 2px; line-height: 6px;
}
.event-item.project:hover .project-bar { height:auto; padding: 2px 4px; z-index: 10; position: relative; }

/* Styles for Task Dots */
.event-item.task { display: flex; justify-content: center; }
.task-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; margin-top: 2px;
}
.task-dot.completado { background: #10b981; }

</style>
