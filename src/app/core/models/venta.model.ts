export type EstadoVenta = 'en_proceso' | 'cerrada' | 'cancelada';

export interface VentaInput {
  cliente_id: number;
  propiedad_id: number;
  fecha: string;
  monto: number;
  comision?: number;
  estado: EstadoVenta;
  notas?: string | null;
}

export interface Venta extends VentaInput {
  id: number;
  comision: number;
  notas: string | null;
  cliente_nombre: string;
  propiedad_titulo: string;
  created_at: string;
  updated_at: string;
}
