/**
 * Order Service - FastOrder S.A.
 * Lógica de Negocio: Creación, Cálculo de Impuestos, Flujo de Cocina y Sincronización Offline.
 */

import { storageService } from './storage-service.js';
import { notificationService } from './notification-service.js';

class OrderService {
  constructor() {
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyChange() {
    this.listeners.forEach(fn => fn());
  }

  // Generar ID único amigable para tickets
  generateOrderId() {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(100 + Math.random() * 900);
    return `FO-${timestamp}-${random}`;
  }

  // Crear un nuevo pedido
  async createOrder({ customerName, tableNumber, orderType, items, notes, paymentMethod }) {
    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    const newOrder = {
      id: this.generateOrderId(),
      customerName: customerName.trim() || 'Cliente en Mesa',
      tableNumber: orderType === 'mesa' ? tableNumber : 'Llevar / Delivery',
      orderType: orderType || 'mesa',
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice || (item.price * item.quantity),
        salsas: item.salsas || [],
        extras: item.extras || [],
        notes: item.notes || ''
      })),
      notes: notes || '',
      paymentMethod: paymentMethod || 'efectivo',
      subtotal: parseFloat(subtotal.toFixed(2)),
      igv: parseFloat(igv.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      status: 'recibido', // 'recibido' | 'cocinando' | 'listo' | 'entregado' | 'cancelado'
      statusHistory: [
        { status: 'recibido', timestamp: new Date().toISOString(), label: 'Pedido Recibido en Cocina' }
      ],
      createdAt: new Date().toISOString(),
      isOnline: navigator.onLine,
      isOfflinePending: !navigator.onLine
    };

    if (!navigator.onLine) {
      // Guardar en cola offline
      await storageService.enqueueOfflineOrder(newOrder);
      notificationService.showToast(
        'Modo Offline Activo',
        `Tu pedido #${newOrder.id} se guardó localmente. Se enviará a cocina automáticamente al reconectar.`,
        'warning'
      );
    } else {
      // Guardar pedido online normal
      await storageService.saveOrder(newOrder);
      notificationService.showNativeNotification(
        '¡Pedido Confirmado! 🎉',
        {
          body: `Pedido #${newOrder.id} enviado a Cocina. Tiempo estimado: 10-15 min.`,
          type: 'success'
        }
      );
    }

    this.notifyChange();
    return newOrder;
  }

  // Actualizar estado del pedido (usado por el monitor KDS de Cocina)
  async updateOrderStatus(orderId, newStatus) {
    const orders = await storageService.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const statusLabels = {
      recibido: 'Pedido Recibido en Cocina',
      cocinando: 'En Preparación en Cocina 👨‍🍳',
      listo: '¡Listo para Servir / Recoger! 🔔',
      entregado: 'Entregado al Cliente ✅',
      cancelado: 'Pedido Cancelado ❌'
    };

    order.status = newStatus;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      label: statusLabels[newStatus] || newStatus
    });

    await storageService.saveOrder(order);

    // Notificar al cliente según el nuevo estado
    if (newStatus === 'cocinando') {
      notificationService.showNativeNotification(
        '👨‍🍳 Cocinando tu Pedido',
        {
          body: `El pedido #${order.id} está siendo preparado por nuestros chefs.`,
          type: 'info'
        }
      );
    } else if (newStatus === 'listo') {
      notificationService.showNativeNotification(
        '🔔 ¡Tu Pedido está Listo!',
        {
          body: `El pedido #${order.id} ya salió de cocina y está listo para ${order.tableNumber.includes('Mesa') ? 'tu ' + order.tableNumber : 'recoger'}.`,
          type: 'success'
        }
      );
    }

    this.notifyChange();
    return order;
  }

  // Sincronizar pedidos pendientes cuando se recupera la conexión
  async syncOfflineOrders() {
    if (!navigator.onLine) return;

    const pendingOrders = await storageService.getOfflineQueue();
    if (pendingOrders.length === 0) return;

    console.log(`[OrderService] Sincronizando ${pendingOrders.length} pedidos offline pendientes...`);

    for (const order of pendingOrders) {
      // Simular latencia de red y confirmación del backend
      order.isOfflinePending = false;
      order.isOnline = true;
      order.syncedAt = new Date().toISOString();

      await storageService.saveOrder(order);
      await storageService.removeOfflineOrder(order.id);
    }

    notificationService.showNativeNotification(
      '🟢 Sincronización Completada',
      {
        body: `Se sincronizaron con éxito ${pendingOrders.length} pedido(s) pendientes con el servidor del restaurante.`,
        type: 'success'
      }
    );

    this.notifyChange();
  }
}

export const orderService = new OrderService();
