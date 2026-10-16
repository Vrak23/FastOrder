import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemCarrito, OpcionExtra, Producto } from '../models/producto.model';
import { EstadoPedido, Pedido } from '../models/pedido.model';
import { NotificacionService } from './notificacion.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private notificacionService = inject(NotificacionService);

  private itemsSubject = new BehaviorSubject<ItemCarrito[]>(this.cargarCarritoStorage());
  public items$ = this.itemsSubject.asObservable();

  private pedidosSubject = new BehaviorSubject<Pedido[]>(this.cargarPedidosStorage());
  public pedidos$ = this.pedidosSubject.asObservable();

  private cargarCarritoStorage(): ItemCarrito[] {
    try {
      const data = localStorage.getItem('fastorder_carrito');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private cargarPedidosStorage(): Pedido[] {
    try {
      const data = localStorage.getItem('fastorder_pedidos');
      if (data) {
        return JSON.parse(data);
      }
    } catch {}

    // Datos iniciales de demostración si está vacío
    return [
      {
        id: 'FO-5420',
        cliente: 'Rodrigo Llanos',
        mesa: 'Mesa 5',
        tipoEntrega: 'salon',
        metodoPago: 'Yape / Plin',
        items: [
          {
            id: 'item-demo-1',
            producto: {
              id: 'p1',
              nombre: 'Combo FastOrder Supremo',
              categoria: 'Combos',
              precio: 32.50,
              descripcion: '',
              imagen: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80'
            },
            cantidad: 1,
            precioUnitario: 36.00,
            precioTotal: 36.00,
            salsasSeleccionadas: ['Ají FastOrder Especial', 'Golf Ahumada'],
            extrasSeleccionados: [{ nombre: 'Queso Cheddar Extra', precio: 3.50 }],
            indicacionesCocina: 'Término 3/4 bien caliente'
          },
          {
            id: 'item-demo-2',
            producto: {
              id: 'p8',
              nombre: 'Chicha Morada Especial (1L)',
              categoria: 'Bebidas',
              precio: 9.50,
              descripcion: '',
              imagen: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
            },
            cantidad: 1,
            precioUnitario: 9.50,
            precioTotal: 9.50,
            salsasSeleccionadas: [],
            extrasSeleccionados: [],
            indicacionesCocina: 'Con hielo'
          }
        ],
        subtotal: 38.56,
        igv: 6.94,
        total: 45.50,
        estado: 'cocinando',
        tiempoEstimado: '10-15 min',
        fecha: '14:15',
        esOffline: false,
        historial: [
          { estado: 'recibido', timestamp: '14:15', descripcion: 'Comanda recibida en el sistema' },
          { estado: 'cocinando', timestamp: '14:18', descripcion: 'En preparación en la cocina' }
        ]
      },
      {
        id: 'FO-9812',
        cliente: 'Carlos Mendoza',
        mesa: 'Mesa 2',
        tipoEntrega: 'salon',
        metodoPago: 'Tarjeta POS',
        items: [
          {
            id: 'item-demo-3',
            producto: {
              id: 'p2',
              nombre: 'Burger Monster Bacon Deluxe',
              categoria: 'Hamburguesas',
              precio: 24.90,
              descripcion: '',
              imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
            },
            cantidad: 2,
            precioUnitario: 24.90,
            precioTotal: 49.80,
            salsasSeleccionadas: ['BBQ Ahumada'],
            extrasSeleccionados: []
          }
        ],
        subtotal: 42.20,
        igv: 7.60,
        total: 49.80,
        estado: 'recibido',
        tiempoEstimado: '8-10 min',
        fecha: '14:28',
        esOffline: false,
        historial: [
          { estado: 'recibido', timestamp: '14:28', descripcion: 'Comanda recibida en el sistema' }
        ]
      }
    ];
  }

  private guardarStorage() {
    try {
      localStorage.setItem('fastorder_carrito', JSON.stringify(this.itemsSubject.value));
      localStorage.setItem('fastorder_pedidos', JSON.stringify(this.pedidosSubject.value));
    } catch {}
  }

  agregarProductoPersonalizado(
    producto: Producto,
    cantidad: number,
    salsas: string[],
    extras: OpcionExtra[],
    indicaciones: string
  ) {
    const extrasTotal = extras.reduce((sum, e) => sum + e.precio, 0);
    const unitPrice = producto.precio + extrasTotal;
    const itemTotal = unitPrice * cantidad;

    const nuevoItem: ItemCarrito = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      producto,
      cantidad,
      precioUnitario: unitPrice,
      precioTotal: itemTotal,
      salsasSeleccionadas: [...salsas],
      extrasSeleccionados: [...extras],
      indicacionesCocina: indicaciones
    };

    const items = [...this.itemsSubject.value, nuevoItem];
    this.itemsSubject.next(items);
    this.guardarStorage();

    this.notificacionService.mostrarToast(
      'Plato Añadido',
      `${cantidad}x ${producto.nombre} agregado a tu comanda.`,
      'success'
    );
  }

  cambiarCantidad(index: number, delta: number) {
    const items = [...this.itemsSubject.value];
    if (items[index]) {
      items[index].cantidad += delta;
      if (items[index].cantidad <= 0) {
        items.splice(index, 1);
      } else {
        items[index].precioTotal = items[index].precioUnitario * items[index].cantidad;
      }
      this.itemsSubject.next(items);
      this.guardarStorage();
    }
  }

  eliminarItem(index: number) {
    const items = [...this.itemsSubject.value];
    items.splice(index, 1);
    this.itemsSubject.next(items);
    this.guardarStorage();
    this.notificacionService.mostrarToast('Item Eliminado', 'Se quitó el producto de tu bandeja.', 'info');
  }

  vaciarCarrito() {
    this.itemsSubject.next([]);
    this.guardarStorage();
  }

  obtenerSubtotal(): number {
    const total = this.itemsSubject.value.reduce((sum, it) => sum + it.precioTotal, 0);
    return total / 1.18; // Desglose sin IGV
  }

  obtenerIGV(): number {
    return this.obtenerTotal() - this.obtenerSubtotal();
  }

  obtenerTotal(): number {
    return this.itemsSubject.value.reduce((sum, it) => sum + it.precioTotal, 0);
  }

  registrarPedido(
    cliente: string,
    mesa: string,
    tipoEntrega: 'salon' | 'llevar',
    metodoPago: string,
    notasGenerales: string = ''
  ): Pedido {
    const total = this.obtenerTotal();
    const subtotal = this.obtenerSubtotal();
    const igv = this.obtenerIGV();
    const esOffline = !navigator.onLine;

    const nuevoPedido: Pedido = {
      id: `FO-${Math.floor(1000 + Math.random() * 9000)}`,
      cliente: cliente.trim() || 'Cliente en Salón',
      mesa: tipoEntrega === 'salon' ? mesa : 'Para Llevar / Despacho',
      tipoEntrega,
      metodoPago: metodoPago || 'Efectivo',
      notasGenerales,
      items: [...this.itemsSubject.value],
      subtotal: parseFloat(subtotal.toFixed(2)),
      igv: parseFloat(igv.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      estado: 'recibido',
      tiempoEstimado: '10-15 min',
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      esOffline,
      historial: [
        {
          estado: 'recibido',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          descripcion: esOffline ? 'Comanda registrada en modo offline (Caché local)' : 'Comanda enviada a cocina en tiempo real'
        }
      ]
    };

    const pedidos = [nuevoPedido, ...this.pedidosSubject.value];
    this.pedidosSubject.next(pedidos);
    this.vaciarCarrito();
    this.guardarStorage();

    if (esOffline) {
      this.notificacionService.mostrarToast(
        'Modo Offline Activo',
        `Pedido #${nuevoPedido.id} guardado localmente. Se sincronizará al restablecer conexión.`,
        'warning'
      );
    } else {
      this.notificacionService.mostrarNotificacion(
        '¡Pedido Confirmado! 🎉',
        {
          body: `Pedido #${nuevoPedido.id} enviado a Cocina (${nuevoPedido.mesa}). Tiempo estimado: 10-15 min.`
        }
      );
    }

    return nuevoPedido;
  }

  // Actualizar estado desde el monitor KDS de cocina
  actualizarEstadoPedido(pedidoId: string, nuevoEstado: EstadoPedido) {
    const pedidos = [...this.pedidosSubject.value];
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    pedido.estado = nuevoEstado;
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const descripciones: Record<EstadoPedido, string> = {
      recibido: 'Comanda en espera en cocina',
      cocinando: 'Chefs preparando los alimentos al fuego',
      listo: '¡Pedido listo para servir en mesa / despacho!',
      entregado: 'Servido y completado con éxito'
    };

    pedido.historial.push({
      estado: nuevoEstado,
      timestamp: hora,
      descripcion: descripciones[nuevoEstado]
    });

    this.pedidosSubject.next(pedidos);
    this.guardarStorage();

    // Notificaciones Push al cliente
    if (nuevoEstado === 'cocinando') {
      this.notificacionService.mostrarNotificacion('👨‍🍳 Pedido en Cocción', {
        body: `Tu comanda #${pedido.id} está siendo preparada por los chefs en cocina.`
      });
    } else if (nuevoEstado === 'listo') {
      this.notificacionService.mostrarNotificacion('🔔 ¡Tu Pedido está Listo!', {
        body: `Comanda #${pedido.id} lista para ${pedido.mesa}. ¡Buen provecho!`
      });
    } else if (nuevoEstado === 'entregado') {
      this.notificacionService.mostrarToast('Pedido Entregado', `Comanda #${pedido.id} despachada correctamente.`, 'success');
    }
  }
}
