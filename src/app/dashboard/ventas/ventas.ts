
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';

import {
  VentasService,
  Interes,
  Seguimiento,
  Oportunidad,
  NuevoInteres,
  NuevoSeguimiento,
  NuevaOportunidad,
  SeguimientoOportunidad,
  OportunidadPendiente,
  OpcionPago,
  PlanPago,
  NuevoPlanPago
} from '../../services/ventas';

import {
  ClientesService,
  Cliente
} from '../../services/clientes';

import {
  PropiedadesService,
  Propiedad
} from '../../services/propiedades';

import {
  CitasService,
  Cita
} from '../../services/citas';

@Component({
  selector: 'app-ventas',
  imports: [FormsModule, RouterLink],
  templateUrl: './ventas.html'
})
export class Ventas implements OnInit {

  private ventasService = inject(VentasService);
  private clientesService = inject(ClientesService);
  private propiedadesService = inject(PropiedadesService);
  private citasService = inject(CitasService);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  propiedades: Propiedad[] = [];
  intereses: Interes[] = [];
  seguimientos: Seguimiento[] = [];
  oportunidades: Oportunidad[] = [];
  citas: Cita[] = [];

  pestana = 'intereses';
  mensaje = '';
  guardando = false;
  filtroCliente: number | null = null;
  filtroOportunidad = 'todas';

  oportunidadSeleccionada: number | null = null;

  observacionOportunidad = '';
  proximaAccion = '';

  historialOportunidad: SeguimientoOportunidad[] = [];
  oportunidadesPendientes: OportunidadPendiente[] = [];

  propiedadSeleccionada: number | null = null;
  historialPropiedad: Interes[] = [];

  // Opciones de pago
  opcionesPago: OpcionPago[] = [];

  // Oportunidad seleccionada para el plan
  oportunidadPagoSeleccionada: number | null = null;

  // Plan de pago registrado
  planRegistrado: PlanPago | null = null;

  // Formulario para el nuevo plan
  nuevoPlanPago: NuevoPlanPago = {
    opcion_pago: null,
    enganche: null,
    plazo_meses: null,
    tasa_anual: null,
    entidad_financiera: '',
    condiciones: ''
  };

  // Estados del formulario
  guardandoPago = false;
  cargandoPlanPago = false;
  mensajePago = '';

  nuevoInteres: NuevoInteres = {
    cliente: null,
    propiedad: null,
    observacion: ''
  };

  nuevoSeguimiento: NuevoSeguimiento = {
    cliente: null,
    tipo_seg: 'llamada',
    observacion: '',
    proximo_contacto: ''
  };

  nuevaOportunidad: NuevaOportunidad = {
    interes: null,
    observacion_opor: ''
  };

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarPendientes();
    this.cargarOpcionesPago();
  }

  cargarDatos(): void {

    forkJoin({
      clientes: this.clientesService.obtenerClientes(),
      propiedades: this.propiedadesService.obtenerPropiedades(),
      intereses: this.ventasService.obtenerIntereses(),
      seguimientos: this.ventasService.obtenerSeguimientos(),
      oportunidades: this.ventasService.obtenerOportunidades(),
      citas: this.citasService.obtenerCitas()
    }).subscribe({

      next: (respuesta) => {
        this.clientes = respuesta.clientes.data;
        this.propiedades = respuesta.propiedades.data;
        this.intereses = respuesta.intereses.data;
        this.seguimientos = respuesta.seguimientos.data;
        this.oportunidades = respuesta.oportunidades.data;
        this.citas = respuesta.citas.data;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.mensaje = 'No se pudieron cargar los datos';
        this.cdr.detectChanges();
      }
    });
  }

  get propiedadesDisponibles(): Propiedad[] {
    return this.propiedades.filter(
      p => p.estado === 'disponible'
    );
  }

  get interesesDisponibles(): Interes[] {
    return this.intereses.filter(i =>
      !this.oportunidades.some(o => o.interes === i.interes)
    );
  }

  get clienteSeleccionado(): Cliente | undefined {
    return this.clientes.find(
      c => c.cliente === this.filtroCliente
    );
  }

  get seguimientosFiltrados(): Seguimiento[] {
    return this.seguimientos.filter(s =>
      this.filtroCliente === null ||
      s.cliente === this.filtroCliente
    );
  }

  get citasFiltradas(): Cita[] {
    return this.citas.filter(c =>
      this.filtroCliente === null ||
      c.cliente === this.filtroCliente
    );
  }

  // Filtrar oportunidades
  get oportunidadesFiltradas(): Oportunidad[] {

    if (this.filtroOportunidad === 'todas') {
      return this.oportunidades;
    }

    if (this.filtroOportunidad === 'activas') {
      return this.oportunidades.filter(o =>
        o.estado_oportu === 'abierta' ||
        o.estado_oportu === 'en_proceso'
      );
    }

    return this.oportunidades.filter(
      o => o.estado_oportu === this.filtroOportunidad
    );
  }

  // Actualizar estado
  cambiarEstadoOportunidad(
    oportunidad: number,
    estado: string
  ): void {

    if (this.guardando) return;

    this.guardar(
      this.ventasService.actualizarEstadoOportunidad(
        oportunidad, estado
      ),
      'Estado actualizado correctamente',
      () => this.cargarPendientes()
    );
  }

  // Seleccionar oportunidad
  seleccionarOportunidad(id: number): void {

    if (this.guardando) return;

    this.oportunidadSeleccionada = id;
    this.observacionOportunidad = '';
    this.proximaAccion = '';

    this.cargarHistorialOportunidad();
  }

  // Consultar historial
  cargarHistorialOportunidad(): void {

    if (this.oportunidadSeleccionada === null) return;

    const id = this.oportunidadSeleccionada;

    this.historialOportunidad = [];

    this.ventasService.obtenerSeguimientosOportunidad(id)
      .subscribe({
        next: (respuesta) => {
          if (this.oportunidadSeleccionada !== id) return;

          this.historialOportunidad = respuesta.data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.mensaje = 'Error al cargar historial';
          this.cdr.detectChanges();
        }
      });
  }

  // Registrar observación
  guardarSeguimientoOportunidad(): void {

    if (this.oportunidadSeleccionada === null ||
        !this.observacionOportunidad.trim() ||
        this.guardando) return;

    this.guardar(
      this.ventasService.registrarSeguimientoOportunidad(
        this.oportunidadSeleccionada,
        this.observacionOportunidad,
        this.proximaAccion
      ),
      'Seguimiento registrado correctamente',
      () => {
        this.observacionOportunidad = '';
        this.proximaAccion = '';

        this.cargarHistorialOportunidad();
        this.cargarPendientes();
      }
    );
  }

  // Consultar oportunidades pendientes
  cargarPendientes(): void {

    this.ventasService.obtenerOportunidadesPendientes()
      .subscribe({
        next: (respuesta) => {
          this.oportunidadesPendientes = respuesta.data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.mensaje = 'Error al consultar pendientes';
          this.cdr.detectChanges();
        }
      });
  }

  // Consultar historial de propiedad
  consultarHistorialPropiedad(): void {

    this.historialPropiedad = [];

    if (this.propiedadSeleccionada === null) return;

    const id = this.propiedadSeleccionada;

    this.ventasService.obtenerHistorialPropiedad(id)
      .subscribe({
        next: (respuesta) => {
          if (this.propiedadSeleccionada !== id) return;

          this.historialPropiedad = respuesta.data;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.mensaje = 'Error al consultar historial';
          this.cdr.detectChanges();
        }
      });
  }

  registrarInteres(): void {
    if (this.guardando) return;

    this.guardar(
      this.ventasService.registrarInteres(this.nuevoInteres),
      'Interés registrado correctamente',
      () => {
        this.nuevoInteres = {
          cliente: null,
          propiedad: null,
          observacion: ''
        };
      }
    );
  }

  registrarSeguimiento(): void {
    if (this.guardando) return;

    this.guardar(
      this.ventasService.registrarSeguimiento(
        this.nuevoSeguimiento
      ),
      'Seguimiento registrado correctamente',
      () => {
        this.nuevoSeguimiento = {
          cliente: null,
          tipo_seg: 'llamada',
          observacion: '',
          proximo_contacto: ''
        };
      }
    );
  }

  registrarOportunidad(): void {
    if (this.guardando) return;

    this.guardar(
      this.ventasService.registrarOportunidad(
        this.nuevaOportunidad
      ),
      'Oportunidad creada correctamente',
      () => {
        this.nuevaOportunidad = {
          interes: null,
          observacion_opor: ''
        };
      }
    );
  }

  private guardar(
    peticion: Observable<unknown>,
    mensaje: string,
    limpiar: () => void
  ): void {

    this.guardando = true;
    this.mensaje = '';

    peticion.subscribe({

      next: () => {
        this.mensaje = mensaje;
        limpiar();
        this.guardando = false;
        this.cargarDatos();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al guardar:', error);
        this.mensaje = error.error?.message ||
          'No se pudo guardar la información';

        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }


  // ============================================
  // CONSULTAR OPCIONES DE PAGO
  // ============================================

  cargarOpcionesPago(): void {

    this.ventasService.obtenerOpcionesPago()
      .subscribe({
        next: (respuesta) => {

          this.opcionesPago = respuesta.data;
          this.cdr.detectChanges();

        },
        error: (error) => {

          console.error(error);
          this.mensajePago = 'Error al cargar opciones de pago';
          this.cdr.detectChanges();

        }
      });
  }


  // ============================================
  // IDENTIFICAR TIPO DE PAGO SELECCIONADO
  // ============================================

  get tipoPagoSeleccionado(): string {

    const opcion = this.opcionesPago.find(
      o => o.opcion_pago === this.nuevoPlanPago.opcion_pago
    );

    return opcion?.codigo || '';
  }


  // ============================================
  // SELECCIONAR OPORTUNIDAD
  // ============================================

  seleccionarOportunidadPago(): void {

    if (this.guardandoPago) return;

    const id = this.oportunidadPagoSeleccionada;

    this.planRegistrado = null;
    this.mensajePago = '';

    this.nuevoPlanPago = {
      opcion_pago: null,
      enganche: null,
      plazo_meses: null,
      tasa_anual: null,
      entidad_financiera: '',
      condiciones: ''
    };

    if (id === null) {
      this.cargandoPlanPago = false;
      return;
    }

    this.cargandoPlanPago = true;

    this.ventasService.obtenerPlanPago(id)
      .subscribe({

        next: (respuesta) => {

          if (this.oportunidadPagoSeleccionada !== id) return;

          this.planRegistrado = respuesta.data;

          if (respuesta.data) {

            this.nuevoPlanPago = {
              opcion_pago: respuesta.data.opcion_pago,
              enganche: Number(respuesta.data.enganche),
              plazo_meses: respuesta.data.plazo_meses,
              tasa_anual: respuesta.data.tasa_anual === null
                ? null
                : Number(respuesta.data.tasa_anual),
              entidad_financiera:
                respuesta.data.entidad_financiera || '',
              condiciones: respuesta.data.condiciones || ''
            };

          }

          this.cargandoPlanPago = false;
          this.cdr.detectChanges();

        },

        error: (error) => {

          if (this.oportunidadPagoSeleccionada !== id) return;

          console.error(error);

          this.mensajePago = 'Error al consultar plan de pago';
          this.cargandoPlanPago = false;
          this.cdr.detectChanges();

        }

      });
  }


  // ============================================
  // GUARDAR PLAN DE PAGO
  // ============================================

  registrarPlanPago(): void {

    const id = this.oportunidadPagoSeleccionada;

    if (id === null || this.guardandoPago || this.cargandoPlanPago) {
      return;
    }


    // Verificar si el plan ya existe y no tiene cambios
    if (this.planRegistrado) {

      const actual = this.nuevoPlanPago;
      const anterior = this.planRegistrado;

      const sinCambios =
        actual.opcion_pago === anterior.opcion_pago &&
        Number(actual.enganche) === Number(anterior.enganche) &&
        (actual.plazo_meses ?? null) === (anterior.plazo_meses ?? null) &&
        (actual.tasa_anual === null || actual.tasa_anual === undefined
          ? null
          : Number(actual.tasa_anual)) ===
        (anterior.tasa_anual === null
          ? null
          : Number(anterior.tasa_anual)) &&
        actual.entidad_financiera.trim() ===
          (anterior.entidad_financiera || '').trim() &&
        actual.condiciones.trim() ===
          (anterior.condiciones || '').trim();

      if (sinCambios) {

        this.mensajePago =
          'Este plan ya está registrado y no presenta cambios.';

        this.cdr.detectChanges();
        return;
      }
    }


    if (
      this.nuevoPlanPago.opcion_pago === null ||
      this.nuevoPlanPago.enganche === null ||
      !Number.isFinite(this.nuevoPlanPago.enganche) ||
      this.nuevoPlanPago.enganche < 0
    ) {
      this.mensajePago = 'Seleccione una opción e ingrese un enganche válido';
      return;
    }

    if (
      this.tipoPagoSeleccionado === 'financiamiento' &&
      (
        this.nuevoPlanPago.plazo_meses === null ||
        !Number.isInteger(this.nuevoPlanPago.plazo_meses) ||
        this.nuevoPlanPago.plazo_meses <= 0
      )
    ) {
      this.mensajePago = 'Ingrese un plazo de financiamiento válido';
      return;
    }

    this.guardandoPago = true;
    this.mensajePago = '';

    this.ventasService.guardarPlanPago(id, this.nuevoPlanPago)
      .subscribe({

        next: () => {

          this.mensajePago = 'Plan de pago guardado correctamente';
          this.guardandoPago = false;

          this.seleccionarOportunidadPago();
          this.mensajePago = 'Plan de pago guardado correctamente';

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(error);

          this.mensajePago =
            error.error?.message || 'Error al guardar el plan de pago';

          this.guardandoPago = false;
          this.cdr.detectChanges();

        }

      });
  }

}
