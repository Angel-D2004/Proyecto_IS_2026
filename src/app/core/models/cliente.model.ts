export type TipoCliente = 'comprador' | 'vendedor' | 'inquilino' | 'propietario';

export interface ClienteInput {
  nombre: string;
  email: string;
  telefono?: string | null;
  tipo: TipoCliente;
  direccion?: string | null;
  notas?: string | null;
}

export interface Cliente extends ClienteInput {
  id: number;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}
