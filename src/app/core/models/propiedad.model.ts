export type TipoPropiedad = 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina';
export type OperacionPropiedad = 'venta' | 'alquiler';
export type EstadoPropiedad = 'disponible' | 'reservada' | 'vendida' | 'alquilada';

export interface PropiedadInput {
  titulo: string;
  direccion: string;
  tipo: TipoPropiedad;
  operacion: OperacionPropiedad;
  precio: number;
  estado: EstadoPropiedad;
  descripcion?: string | null;
}

export interface Propiedad extends PropiedadInput {
  id: number;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}
