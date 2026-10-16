/**
 * Storage Service - FastOrder S.A.
 * Manejo de IndexedDB y LocalStorage para soporte Offline-First.
 */

const DB_NAME = 'FastOrderDB';
const DB_VERSION = 1;
const STORE_ORDERS = 'orders';
const STORE_OFFLINE_QUEUE = 'offline_orders_queue';

class StorageService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  // Inicialización de IndexedDB
  async initDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB no soportado en este navegador, usando fallback LocalStorage');
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_ORDERS)) {
          db.createObjectStore(STORE_ORDERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_OFFLINE_QUEUE)) {
          db.createObjectStore(STORE_OFFLINE_QUEUE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[StorageService] IndexedDB inicializada correctamente.');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[StorageService] Error inicializando IndexedDB:', event.target.error);
        resolve(null);
      };
    });
  }

  // Guardar un pedido en la base de datos principal
  async saveOrder(order) {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_ORDERS], 'readwrite');
        const store = transaction.objectStore(STORE_ORDERS);
        const req = store.put(order);
        req.onsuccess = () => resolve(order);
        req.onerror = () => reject(req.error);
      });
    } else {
      // Fallback a LocalStorage
      const orders = this.getLocalOrders();
      const existingIdx = orders.findIndex(o => o.id === order.id);
      if (existingIdx >= 0) {
        orders[existingIdx] = order;
      } else {
        orders.unshift(order);
      }
      localStorage.setItem('fastorder_orders', JSON.stringify(orders));
      return order;
    }
  }

  // Obtener todos los pedidos
  async getAllOrders() {
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db.transaction([STORE_ORDERS], 'readonly');
        const store = transaction.objectStore(STORE_ORDERS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this.getLocalOrders());
      });
    } else {
      return this.getLocalOrders();
    }
  }

  // Encolar un pedido creado sin conexión a internet (Offline Queue)
  async enqueueOfflineOrder(order) {
    order.isOfflinePending = true;
    order.offlineTimestamp = new Date().toISOString();

    if (this.db) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_OFFLINE_QUEUE, STORE_ORDERS], 'readwrite');
        transaction.objectStore(STORE_OFFLINE_QUEUE).put(order);
        transaction.objectStore(STORE_ORDERS).put(order);
        transaction.oncomplete = () => resolve(order);
        transaction.onerror = () => reject(transaction.error);
      });
    } else {
      const queue = this.getOfflineQueueLocal();
      queue.push(order);
      localStorage.setItem('fastorder_offline_queue', JSON.stringify(queue));
      await this.saveOrder(order);
    }
    return order;
  }

  // Obtener cola offline
  async getOfflineQueue() {
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db.transaction([STORE_OFFLINE_QUEUE], 'readonly');
        const store = transaction.objectStore(STORE_OFFLINE_QUEUE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(this.getOfflineQueueLocal());
      });
    } else {
      return this.getOfflineQueueLocal();
    }
  }

  // Limpiar un elemento de la cola offline tras sincronizarlo
  async removeOfflineOrder(orderId) {
    if (this.db) {
      return new Promise((resolve) => {
        const transaction = this.db.transaction([STORE_OFFLINE_QUEUE], 'readwrite');
        const store = transaction.objectStore(STORE_OFFLINE_QUEUE);
        store.delete(orderId);
        transaction.oncomplete = () => resolve(true);
      });
    } else {
      let queue = this.getOfflineQueueLocal();
      queue = queue.filter(o => o.id !== orderId);
      localStorage.setItem('fastorder_offline_queue', JSON.stringify(queue));
    }
  }

  // MÉTODOS LOCALSTORAGE DE APOYO
  getLocalOrders() {
    try {
      return JSON.parse(localStorage.getItem('fastorder_orders') || '[]');
    } catch {
      return [];
    }
  }

  getOfflineQueueLocal() {
    try {
      return JSON.parse(localStorage.getItem('fastorder_offline_queue') || '[]');
    } catch {
      return [];
    }
  }

  // Guardar estado del carrito
  saveCart(cartItems) {
    localStorage.setItem('fastorder_cart', JSON.stringify(cartItems));
  }

  getCart() {
    try {
      return JSON.parse(localStorage.getItem('fastorder_cart') || '[]');
    } catch {
      return [];
    }
  }

  clearCart() {
    localStorage.removeItem('fastorder_cart');
  }
}

export const storageService = new StorageService();
