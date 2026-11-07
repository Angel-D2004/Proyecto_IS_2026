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
    path: '**',
    redirectTo: ''
  }
];
