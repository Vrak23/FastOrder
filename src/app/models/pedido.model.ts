import { ItemCarrito } from './producto.model';

export type EstadoPedido = 'recibido' | 'cocinando' | 'listo' | 'entregado';

export interface HistorialEstado {
  estado: EstadoPedido;
  timestamp: string;
  descripcion: string;
}

export interface Pedido {
  id: string;
  cliente: string;
  mesa: string;
  tipoEntrega: 'salon' | 'llevar';
  metodoPago: string;
  notasGenerales?: string;
  items: ItemCarrito[];
  subtotal: number;
  igv: number;
  total: number;
  estado: EstadoPedido;
  historial: HistorialEstado[];
  fecha: string;
  tiempoEstimado: string;
  esOffline: boolean;
}
