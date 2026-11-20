
import { Routes } from '@angular/router';
import { Content } from './components/utils/content/content';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  // Página inicial: login
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // Inicio de sesión
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login')
        .then(m => m.Login),
    title: 'Login | Sistema Inmobiliario'
  },

  // Panel según el rol
  {
    path: 'panel',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/panel/panel')
        .then(m => m.Panel),
    title: 'Panel | Sistema Inmobiliario'
  },

  // Página principal anterior
  {
    path: 'inicio',
    component: Content,
    canActivate: [authGuard],
    title: 'Inicio | Sistema de Gestión Inmobiliaria'
  },

  // Clientes
  {
    path: 'clientes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/clientes/clientes')
        .then(m => m.Clientes),
    title: 'Clientes | Sistema de Gestión Inmobiliaria'
  },

  // Propiedades
  {
    path: 'propiedades',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/propiedades/propiedades')
        .then(m => m.Propiedades),
    title: 'Propiedades | Sistema de Gestión Inmobiliaria'
  },

  // Citas
  {
    path: 'citas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/citas/citas')
        .then(m => m.Citas),
    title: 'Citas | Sistema de Gestión Inmobiliaria'
  },

  // Ventas
  {
    path: 'ventas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/ventas/ventas')
        .then(m => m.Ventas),
    title: 'Ventas | Sistema de Gestión Inmobiliaria'
  },

  // Reservas
  {
    path: 'reservas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/reservas/reservas')
        .then(m => m.Reservas),
    title: 'Reservas | Sistema de Gestión Inmobiliaria'
  },

  // Evaluaciones crediticias
  {
    path: 'evaluaciones',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/evaluaciones/evaluaciones')
        .then(m => m.Evaluaciones),
    title: 'Evaluaciones | Sistema de Gestión Inmobiliaria'
  },

  // Solicitudes de crédito
  {
    path: 'solicitudes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/solicitudes/solicitudes')
        .then(m => m.Solicitudes),
    title: 'Solicitudes | Sistema de Gestión Inmobiliaria'
  },

  // Documentación
  {
    path: 'documentos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/documentos/documentos')
        .then(m => m.Documentos),
    title: 'Documentos | Sistema de Gestión Inmobiliaria'
  },

  // Firma y entrega
  {
    path: 'cierres',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/cierres/cierres')
        .then(m => m.Cierres),
    title: 'Cierres | Sistema de Gestión Inmobiliaria'
  },

  // Finalización y reportes
  {
    path: 'finalizacion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/finalizacion/finalizacion')
        .then(m => m.Finalizacion),
    title: 'Finalización de venta | Sistema de Gestión Inmobiliaria'
  },

  // Ruta no encontrada
  {
    path: '**',
    redirectTo: 'login'
  }

];
