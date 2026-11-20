
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  AuthService,
  UsuarioSesion,
  RolUsuario
} from '../../services/auth';

interface OpcionPanel {
  nombre: string;
  descripcion: string;
  ruta: string;
}

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel.html'
})
export class Panel implements OnInit {

  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usuario: UsuarioSesion | null = null;

  cargando = true;
  mensaje = '';

  ngOnInit(): void {

    this.auth.consultarSesion().subscribe({

      next: respuesta => {
        this.usuario = respuesta.data;
        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: () => {
        this.auth.cerrarSesion();
        this.router.navigateByUrl('/login');
      }
    });
  }

  get tituloPanel(): string {

    switch (this.usuario?.rol) {

      case 'vendedor':
        return 'Panel del vendedor';

      case 'supervisor':
        return 'Panel del supervisor';

      case 'administrador':
        return 'Panel del administrador';

      default:
        return 'Panel principal';
    }
  }

  get descripcionPanel(): string {

    switch (this.usuario?.rol) {

      case 'vendedor':
        return 'Gestión comercial y seguimiento de clientes.';

      case 'supervisor':
        return 'Seguimiento general de operaciones y ventas.';

      case 'administrador':
        return 'Vista general del sistema inmobiliario.';

      default:
        return '';
    }
  }

  get opciones(): OpcionPanel[] {

    const comunes: OpcionPanel[] = [
      {
        nombre: 'Clientes',
        descripcion: 'Registro y consulta de clientes',
        ruta: '/clientes'
      },
      {
        nombre: 'Citas',
        descripcion: 'Seguimiento de citas comerciales',
        ruta: '/citas'
      },
      {
        nombre: 'Propiedades',
        descripcion: 'Consultar el catálogo inmobiliario',
        ruta: '/propiedades'
      },
      {
        nombre: 'Ventas y Oportunidades',
        descripcion: 'Seguimiento del proceso de venta',
        ruta: '/ventas'
      },
      {
        nombre: 'Reservas',
        descripcion: 'Control de reservas de viviendas',
        ruta: '/reservas'
      },
      {
        nombre: 'Solicitudes de crédito',
        descripcion: 'Seguimiento de trámites bancarios',
        ruta: '/solicitudes'
      },
      {
        nombre: 'Documentación',
        descripcion: 'Control de documentos',
        ruta: '/documentos'
      },
      {
        nombre: 'Evaluaciones crediticias',
        descripcion: 'Consultar evaluaciones de los clientes',
        ruta: '/evaluaciones'
      },
      {
        nombre: 'Firma y entrega',
        descripcion: 'Formalización y entregas',
        ruta: '/cierres'
      },
      {
        nombre: 'Ventas y reportes',
        descripcion: 'Cierre de operaciones',
        ruta: '/finalizacion'
      }
    ];

    if (this.usuario?.rol === 'vendedor') {
      return comunes.filter(opcion =>
        [
          '/clientes',
          '/citas',
          '/propiedades',
          '/ventas',
          '/reservas',
          '/evaluaciones',
          '/solicitudes',
          '/documentos',
          '/finalizacion',
          '/cierres'
        ].includes(opcion.ruta)
      );
    }

    if (this.usuario?.rol === 'supervisor') {
      return comunes.filter(opcion =>
        [
          '/clientes',
          '/citas',
          '/propiedades',
          '/ventas',
          '/reservas',
          '/evaluaciones',
          '/solicitudes',
          '/documentos',
          '/finalizacion',
          '/cierres'
        ].includes(opcion.ruta)
      );
    }

    return comunes;
  }

  get rolTexto(): string {

    const roles: Record<RolUsuario, string> = {
      vendedor: 'Vendedor',
      supervisor: 'Supervisor',
      administrador: 'Administrador'
    };

    return this.usuario
      ? roles[this.usuario.rol]
      : '';
  }

  salir(): void {
    this.auth.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}
