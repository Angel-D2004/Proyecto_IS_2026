export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'realizada';

export interface CitaInput {
  cliente_id: number;
  propiedad_id: number;
  fecha: string;
  hora: string;
  estado: EstadoCita;
  notas?: string | null;
}

export interface Cita extends CitaInput {
  id: number;
  notas: string | null;
  cliente_nombre: string;
  propiedad_titulo: string;
  created_at: string;
  updated_at: string;
}
