
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  EvaluacionesService,
  ClienteEvaluacion,
  OportunidadEvaluacion,
  InformacionFinanciera,
  CapacidadPago,
  EvaluacionCrediticia,
  ObservacionCrediticia
} from '../../services/evaluaciones';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './evaluaciones.html'
})
export class Evaluaciones implements OnInit {

  private evaluacionesService = inject(EvaluacionesService);
  private cdr = inject(ChangeDetectorRef);

  // =======================================
  // LISTADOS
  // =======================================

  clientes: ClienteEvaluacion[] = [];
  oportunidades: OportunidadEvaluacion[] = [];
  evaluaciones: EvaluacionCrediticia[] = [];
  observaciones: ObservacionCrediticia[] = [];

  // =======================================
  // INFORMACIÓN FINANCIERA
  // =======================================

  clienteSeleccionado: number | null = null;

  finanzas: InformacionFinanciera = {
    ingresos_mensuales: 0,
    gastos_mensuales: 0,
    deudas_mensuales: 0
  };

  capacidad: CapacidadPago | null = null;

  // =======================================
  // EVALUACIONES
  // =======================================

  oportunidadSeleccionada: number | null = null;
  evaluacionSeleccionada: number | null = null;

  estadoEvaluacion = 'pendiente';
  resultadoEvaluacion = '';

  nuevaObservacion = '';

  // =======================================
  // CONTROLES
  // =======================================

  guardando = false;
  cargandoFinanzas = false;
  mensaje = '';
  filtroEstado = 'todas';

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarOportunidades();
    this.cargarEvaluaciones();
  }

  // =======================================
  // CARGAR CLIENTES
  // =======================================

  cargarClientes(): void {

    this.evaluacionesService.obtenerClientes()
      .subscribe({

        next: (respuesta) => {

          this.clientes = respuesta.data || [];
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(error);
          this.mensaje = 'Error al cargar clientes';
          this.cdr.detectChanges();

        }

      });
  }

  // =======================================
  // CARGAR OPORTUNIDADES
  // =======================================

  cargarOportunidades(): void {

    this.evaluacionesService.obtenerOportunidades()
      .subscribe({

        next: (respuesta) => {

          this.oportunidades = respuesta.data || [];
          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(error);
          this.mensaje = 'Error al cargar oportunidades';
          this.cdr.detectChanges();

        }

      });
  }

  // =======================================
  // US-27: SELECCIONAR CLIENTE
  // =======================================

  seleccionarCliente(): void {

    this.capacidad = null;

    this.finanzas = {
      ingresos_mensuales: 0,
      gastos_mensuales: 0,
      deudas_mensuales: 0
    };

    if (this.clienteSeleccionado === null) {
      this.cargandoFinanzas = false;
      return;
    }

    const cliente = this.clienteSeleccionado;

    this.cargandoFinanzas = true;

    this.evaluacionesService.obtenerFinanzas(cliente)
      .subscribe({

        next: (respuesta) => {

          // Evitamos mostrar datos de otro cliente
          if (this.clienteSeleccionado !== cliente) return;

          if (respuesta.data) {

            this.finanzas = {
              ingresos_mensuales:
                Number(respuesta.data.ingresos_mensuales),

              gastos_mensuales:
                Number(respuesta.data.gastos_mensuales),

              deudas_mensuales:
                Number(respuesta.data.deudas_mensuales)
            };
          }

          this.cargandoFinanzas = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          if (this.clienteSeleccionado !== cliente) return;

          console.error(error);

          this.cargandoFinanzas = false;
          this.mensaje =
            'Error al consultar información financiera';

          this.cdr.detectChanges();

        }
      });
  }

  // =======================================
  // US-27: GUARDAR FINANZAS
  // =======================================

  guardarFinanzas(): void {

    if (this.guardando) return;

    if (this.clienteSeleccionado === null) {
      this.mensaje = 'Seleccione un cliente';
      return;
    }

    const valores = [
      this.finanzas.ingresos_mensuales,
      this.finanzas.gastos_mensuales,
      this.finanzas.deudas_mensuales
    ];

    if (
      valores.some(
        v => v === null ||
             v === undefined ||
             !Number.isFinite(Number(v)) ||
             Number(v) < 0
      )
    ) {
      this.mensaje = 'Ingrese montos financieros válidos';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    const cliente = this.clienteSeleccionado;

    this.evaluacionesService.guardarFinanzas(
      cliente,
      this.finanzas
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;
        this.mensaje = respuesta.message;

        if (this.clienteSeleccionado === cliente) {
          this.consultarCapacidad();
        }

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(error);

        this.guardando = false;

        this.mensaje =
          error.error?.message ||
          'Error al guardar información financiera';

        this.cdr.detectChanges();

      }
    });
  }

  // =======================================
  // US-28: CALCULAR CAPACIDAD
  // =======================================

  consultarCapacidad(): void {

    if (this.clienteSeleccionado === null) {
      this.mensaje = 'Seleccione un cliente';
      return;
    }

    const cliente = this.clienteSeleccionado;

    this.capacidad = null;

    this.evaluacionesService.obtenerCapacidad(cliente)
      .subscribe({

        next: (respuesta) => {

          if (this.clienteSeleccionado !== cliente) return;

          this.capacidad = respuesta.data;

          this.cdr.detectChanges();

        },

        error: (error) => {

          if (this.clienteSeleccionado !== cliente) return;

          console.error(error);

          this.mensaje =
            error.error?.message ||
            'Error al calcular capacidad de pago';

          this.cdr.detectChanges();

        }
      });
  }

  // =======================================
  // US-30: CONSULTAR EVALUACIONES
  // =======================================

  cargarEvaluaciones(): void {

    this.evaluacionesService.obtenerEvaluaciones()
      .subscribe({

        next: (respuesta) => {

          this.evaluaciones = respuesta.data || [];

          if (this.evaluacionSeleccionada !== null) {

            const actual = this.evaluaciones.find(
              e => e.evaluacion === this.evaluacionSeleccionada
            );

            if (actual) {
              this.estadoEvaluacion = actual.estado;
              this.resultadoEvaluacion = actual.resultado || '';
            } else {
              this.evaluacionSeleccionada = null;
              this.observaciones = [];
            }
          }

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(error);

          this.mensaje =
            error.error?.message ||
            'Error al consultar evaluaciones';

          this.cdr.detectChanges();

        }
      });
  }

  // =======================================
  // OPORTUNIDADES DISPONIBLES
  // =======================================

  get oportunidadesDisponibles(): OportunidadEvaluacion[] {

    return this.oportunidades.filter(o => {

      const activa =
        o.estado_oportu === 'abierta' ||
        o.estado_oportu === 'en_proceso';

      const tieneEvaluacion = this.evaluaciones.some(
        e => e.oportunidad === o.oportunidad
      );

      return activa && !tieneEvaluacion;
    });
  }

  // =======================================
  // US-29: CREAR EVALUACIÓN
  // =======================================

  crearEvaluacion(): void {

    if (this.guardando) return;

    if (this.oportunidadSeleccionada === null) {
      this.mensaje = 'Seleccione una oportunidad';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    this.evaluacionesService.crearEvaluacion(
      this.oportunidadSeleccionada
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;

        this.mensaje = respuesta.message;
        this.oportunidadSeleccionada = null;

        this.cargarEvaluaciones();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(error);

        this.guardando = false;

        this.mensaje =
          error.error?.message ||
          'Error al crear evaluación';

        this.cdr.detectChanges();

      }
    });
  }

  // =======================================
  // FILTRAR EVALUACIONES
  // =======================================

  get evaluacionesFiltradas(): EvaluacionCrediticia[] {

    if (this.filtroEstado === 'todas') {
      return this.evaluaciones;
    }

    return this.evaluaciones.filter(
      e => e.estado === this.filtroEstado
    );
  }

  // =======================================
  // SELECCIONAR EVALUACIÓN
  // =======================================

  seleccionarEvaluacion(
    evaluacion: EvaluacionCrediticia
  ): void {

    this.evaluacionSeleccionada = evaluacion.evaluacion;

    this.estadoEvaluacion = evaluacion.estado;
    this.resultadoEvaluacion = evaluacion.resultado || '';

    this.nuevaObservacion = '';
    this.observaciones = [];

    this.cargarObservaciones();

    this.cdr.detectChanges();
  }

  get evaluacionActual(): EvaluacionCrediticia | undefined {

    return this.evaluaciones.find(
      e => e.evaluacion === this.evaluacionSeleccionada
    );
  }

  // =======================================
  // US-31: ACTUALIZAR EVALUACIÓN
  // =======================================

  actualizarEvaluacion(): void {

    if (this.guardando) return;

    if (this.evaluacionSeleccionada === null) {
      this.mensaje = 'Seleccione una evaluación';
      return;
    }

    if (
      ['aprobada', 'rechazada'].includes(this.estadoEvaluacion) &&
      !this.resultadoEvaluacion.trim()
    ) {
      this.mensaje =
        'Registre el resultado de la evaluación';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    this.evaluacionesService.actualizarEstado(
      this.evaluacionSeleccionada,
      this.estadoEvaluacion,
      this.resultadoEvaluacion
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;

        this.mensaje = respuesta.message;

        this.cargarEvaluaciones();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(error);

        this.guardando = false;

        this.mensaje =
          error.error?.message ||
          'Error al actualizar evaluación';

        this.cdr.detectChanges();

      }
    });
  }

  // =======================================
  // US-32: CONSULTAR OBSERVACIONES
  // =======================================

  cargarObservaciones(): void {

    if (this.evaluacionSeleccionada === null) return;

    const evaluacion = this.evaluacionSeleccionada;

    this.evaluacionesService.obtenerObservaciones(
      evaluacion
    ).subscribe({

      next: (respuesta) => {

        if (this.evaluacionSeleccionada !== evaluacion) return;

        this.observaciones = respuesta.data || [];
        this.cdr.detectChanges();

      },

      error: (error) => {

        if (this.evaluacionSeleccionada !== evaluacion) return;

        console.error(error);

        this.mensaje =
          'Error al consultar observaciones';

        this.cdr.detectChanges();

      }
    });
  }

  // =======================================
  // US-32: REGISTRAR OBSERVACIÓN
  // =======================================

  registrarObservacion(): void {

    if (this.guardando) return;

    if (this.evaluacionSeleccionada === null) {
      this.mensaje = 'Seleccione una evaluación';
      return;
    }

    if (!this.nuevaObservacion.trim()) {
      this.mensaje = 'Escriba una observación';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    this.evaluacionesService.registrarObservacion(
      this.evaluacionSeleccionada,
      this.nuevaObservacion
    ).subscribe({

      next: (respuesta) => {

        this.guardando = false;

        this.mensaje = respuesta.message;
        this.nuevaObservacion = '';

        this.cargarObservaciones();

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(error);

        this.guardando = false;

        this.mensaje =
          error.error?.message ||
          'Error al registrar observación';

        this.cdr.detectChanges();

      }
    });
  }
}
