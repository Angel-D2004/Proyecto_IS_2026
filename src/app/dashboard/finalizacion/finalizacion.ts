
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  FinalizacionService,
  EntregaPendiente,
  VentaCerrada,
  ResumenFinal,
  VentaProceso,
  PropiedadReporte,
  ClienteOportunidad,
  CreditoPendiente,
  ReservaActiva,
  VentaMensual
} from '../../services/finalizacion';

@Component({
  selector: 'app-finalizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './finalizacion.html'
})
export class Finalizacion implements OnInit {

  private servicio = inject(FinalizacionService);
  private cdr = inject(ChangeDetectorRef);

  pestana: 'cierres' | 'reportes' = 'cierres';

  entregasDisponibles: EntregaPendiente[] = [];
  ventas: VentaCerrada[] = [];

  resumen: ResumenFinal | null = null;
  ventasProceso: VentaProceso[] = [];
  propiedades: PropiedadReporte[] = [];
  clientesOportunidades: ClienteOportunidad[] = [];
  creditosPendientes: CreditoPendiente[] = [];
  reservasActivas: ReservaActiva[] = [];
  ventasMensuales: VentaMensual[] = [];

  entregaSeleccionada: number | null = null;
  filtroPropiedad = 'todas';

  guardando = false;
  cargando = false;
  mensaje = '';
  tipoMensaje: 'exito' | 'error' = 'exito';

  ngOnInit(): void {
    this.actualizarTodo();
  }

  mostrarMensaje(
    texto: string,
    tipo: 'exito' | 'error'
  ): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    this.cdr.detectChanges();
  }

  actualizarTodo(): void {
    this.cargando = true;

    forkJoin({
      entregas: this.servicio.entregasDisponibles(),
      ventas: this.servicio.historialVentas(),
      resumen: this.servicio.resumen(),
      proceso: this.servicio.ventasProceso(),
      propiedades: this.servicio.propiedades(),
      clientes: this.servicio.clientesOportunidades(),
      creditos: this.servicio.creditosPendientes(),
      reservas: this.servicio.reservasActivas(),
      mensuales: this.servicio.ventasMensuales()
    }).subscribe({

      next: respuesta => {
        this.entregasDisponibles = respuesta.entregas.data;
        this.ventas = respuesta.ventas.data;
        this.resumen = respuesta.resumen.data;
        this.ventasProceso = respuesta.proceso.data;
        this.propiedades = respuesta.propiedades.data;
        this.clientesOportunidades = respuesta.clientes.data;
        this.creditosPendientes = respuesta.creditos.data;
        this.reservasActivas = respuesta.reservas.data;
        this.ventasMensuales = respuesta.mensuales.data;

        if (
          this.entregaSeleccionada !== null &&
          !this.entregasDisponibles.some(
            e => e.entrega === this.entregaSeleccionada
          )
        ) {
          this.entregaSeleccionada = null;
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: error => {
        console.error(error);
        this.cargando = false;

        this.mostrarMensaje(
          error.error?.message ||
          'No fue posible actualizar los reportes',
          'error'
        );
      }
    });
  }

  get entregaActual(): EntregaPendiente | undefined {
    return this.entregasDisponibles.find(
      e => e.entrega === this.entregaSeleccionada
    );
  }

  get propiedadesFiltradas(): PropiedadReporte[] {
    if (this.filtroPropiedad === 'todas') {
      return this.propiedades;
    }

    return this.propiedades.filter(
      p => p.estado_venta === this.filtroPropiedad
    );
  }

  cerrarVenta(): void {

    if (this.guardando || this.entregaSeleccionada === null) {
      return;
    }

    if (!this.entregaActual) {
      this.mostrarMensaje(
        'Seleccione una entrega disponible',
        'error'
      );
      return;
    }

    const entrega = this.entregaSeleccionada;

    this.guardando = true;
    this.mensaje = '';

    this.servicio.cerrarVenta(entrega).subscribe({

      next: respuesta => {
        this.guardando = false;
        this.entregaSeleccionada = null;

        this.mostrarMensaje(respuesta.message, 'exito');
        this.actualizarTodo();
      },

      error: error => {
        this.guardando = false;
        console.error(error);

        this.mostrarMensaje(
          error.error?.message ||
          'Error al completar la venta',
          'error'
        );

        this.actualizarTodo();
      }
    });
  }

  // Genera un CSV de ventas utilizando los
  // datos que ya consultamos desde el backend.
  exportarCSV(): void {

    const encabezado = [
      'Venta',
      'Cliente',
      'Propiedad',
      'Precio de cierre',
      'Fecha'
    ];

    const limpiar = (valor: unknown): string => {
      const texto = String(valor ?? '');

      // Evita fórmulas al abrir el CSV
      // en programas de hojas de cálculo.
      const seguro = /^[=+\-@\t\r]/.test(texto)
        ? "'" + texto
        : texto;

      return '"' + seguro.replace(/"/g, '""') + '"';
    };

    const filas = this.ventas.map(v => [
      v.venta,
      v.nombre_cliente,
      v.nombre_propiedad,
      v.precio_cierre,
      String(v.fecha_cierre).slice(0, 10)
    ].map(limpiar).join(','));

    const csv = [
      encabezado.map(limpiar).join(','),
      ...filas
    ].join('\r\n');

    const blob = new Blob(
      ['\uFEFF', csv],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = 'reporte_ventas.csv';
    enlace.click();

    URL.revokeObjectURL(url);
  }
}
