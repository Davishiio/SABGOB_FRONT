# 📋 GestorPro - Sistema de Gestión de Proyectos

Sistema de gestión de proyectos desarrollado con Vue 3 y Composition API.

![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-3.0-yellow)

## Características

- **Gestión de Proyectos**: Crear, editar, eliminar proyectos con fechas de inicio/límite
- **Tareas y Subtareas**: Organización jerárquica con estados y fechas
- **Sistema de Comentarios**: Comentarios polimórficos en proyectos, tareas y subtareas
- **Calendario Visual**: Vista de calendario con indicadores por tipo
- **Autenticación**: Login con roles (Usuario/Supervisor)
- **Validaciones Inteligentes**: Avisos al completar items con pendientes

##  Instalación

```bash
# Clonar repositorio
git clone https://github.com/Davishiio/SABGOB_FRONT

# Instalar dependencias
npm install

#en  src/axios.js asegurarse de que la ruta de la api sea correcta
#http://localhost:8000/api"

# Iniciar desarrollo
npm run dev
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── dashboard/           # Componentes del dashboard
│   │   ├── ActionBar.vue      # Barra de acciones
│   │   ├── ProjectRow.vue     # Fila de proyecto en tabla
│   │   └── TaskQuickCard.vue  # Tarjeta rápida de tarea
│   │
│   ├── calendar/            # Componentes del calendario
│   │   ├── CalendarEventItem.vue  # Evento individual
│   │   └── CalendarLegend.vue     # Leyenda visual
│   │
│   ├── project/             # Componentes del modal de proyecto
│   │   ├── ProjectHeader.vue   # Header con edición
│   │   ├── TaskCard.vue        # Tarjeta de tarea
│   │   └── CommentsPanel.vue   # Panel de comentarios
│   │
│   ├── ProjectModal.vue     # Modal principal de proyecto
│   └── CreateProjectModal.vue  # Modal crear proyecto
│
├── composables/             # Lógica reutilizable
│   ├── useProjectActions.js   # Acciones de proyecto
│   ├── useTaskActions.js      # Acciones de tareas
│   ├── useSubtaskActions.js   # Acciones de subtareas
│   └── useCommentActions.js   # Acciones de comentarios
│
├── views/                   # Vistas principales
│   ├── LoginView.vue          # Inicio de sesión
│   ├── DashboardView.vue      # Panel principal
│   └── CalendarView.vue       # Vista calendario
│
├── layouts/
│   └── MainLayout.vue       # Layout con sidebar
│
├── stores/
│   └── auth.js              # Store de autenticación (Pinia)
│
└── router/
    └── index.js             # Configuración de rutas
```

## Componentes Principales

### ProjectModal
Modal central para gestión de proyectos. Utiliza composables para separar la lógica:
- Edición de título, descripción y fechas
- Lista de tareas con subtareas
- Panel de comentarios

### CalendarView
Vista de calendario mensual con:
- Proyectos (barras de rango)
- Tareas (fecha límite)
- Subtareas (fecha límite)


## API Backend

El frontend se conecta a una API Laravel. Endpoints principales:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Autenticación |
| GET | `/api/proyectos` | Listar proyectos |
| GET | `/api/proyectos/{id}/completo` | Proyecto con tareas y comentarios |
| POST/PUT/DELETE | `/api/tareas` | CRUD de tareas |
| POST/PUT/DELETE | `/api/subtareas` | CRUD de subtareas |
| POST/PUT/DELETE | `/api/comentarios` | CRUD de comentarios |

## Dependencias

- **Vue 3** - Framework reactivo
- **Vue Router** - Enrutamiento SPA
- **Pinia** - Gestión de estado
- **Axios** - Cliente HTTP
- **Vite** - Build tool

##  Autor

**David Chab**

Este proyecto se desarrolló como parte de una prueba tècnica.
