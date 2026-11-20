import { Routes } from '@angular/router';
import { Content } from './components/utils/content/content';

export const routes: Routes = [
  {
    path: '',
    component: Content,
    title: 'Inicio | Sistema de Gestión Inmobiliaria'
  },
  {
    path: 'clientes',
    loadComponent: () => import('./dashboard/clientes/clientes').then((m) => m.Clientes),
    title: 'Clientes | Sistema de Gestión Inmobiliaria'
  },
  {
    path: 'propiedades',
    loadComponent: () => import('./dashboard/propiedades/propiedades').then((m) => m.Propiedades),
    title: 'Propiedades | Sistema de Gestión Inmobiliaria'
  },
  {
    path: 'citas',
    loadComponent: () => import('./dashboard/citas/citas').then((m) => m.Citas),
    title: 'Citas | Sistema de Gestión Inmobiliaria'
  },
  {
    path: 'ventas',
    loadComponent: () => import('./dashboard/ventas/ventas').then((m) => m.Ventas),
    title: 'Ventas | Sistema de Gestión Inmobiliaria'
  },
  {
    path: 'reservas',
    loadComponent: () => import('./dashboard/reservas/reservas').then(m => m.Reservas),
    title: 'Reservas | Sistema de Gestión Inmobiliaria'

  },
  {
    path: 'evaluaciones',
    loadComponent: () => import('./dashboard/evaluaciones/evaluaciones').then(m => m.Evaluaciones),
    title: 'Evaluaciones | Sistema de Gestión Inmobiliaria'

  },
  {
    path: 'solicitudes', 
    loadComponent: () => import('./dashboard/solicitudes/solicitudes').then(m => m.Solicitudes),
    title: 'Solicitudes | Sistema de Gestión Inmobiliaria'

  },
  {
    path: 'documentos', 
    loadComponent: () => import('./dashboard/documentos/documentos').then(m => m.Documentos),
    title: 'Documentos | Sistema de Gestión Inmobiliaria'

  },
  {
    path: 'cierres', 
    loadComponent: () => import('./dashboard/cierres/cierres').then(m => m.Cierres),
    title: 'Cierres | Sistema de Gestión Inmobiliaria'

  },
  {
    path: '**',
    redirectTo: ''
  }
];
