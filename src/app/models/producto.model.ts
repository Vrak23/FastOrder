export interface OpcionExtra {
  nombre: string;
  precio: number;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  imagen: string;
  badge?: string;
  tiempoPrep?: string;
  calorias?: string;
  salsasDisponibles?: string[];
  extrasDisponibles?: OpcionExtra[];
}

export interface ItemCarrito {
  id: string;
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  salsasSeleccionadas: string[];
  extrasSeleccionados: OpcionExtra[];
  indicacionesCocina?: string;
}
