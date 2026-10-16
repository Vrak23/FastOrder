/**
 * Offline Banner Component - FastOrder S.A.
 * Indicador de Conectividad en Tiempo Real y Control de Sincronización.
 */

import { storageService } from '../services/storage-service.js';
import { orderService } from '../services/order-service.js';

export function renderOfflineBanner(container) {
  const isOnline = navigator.onLine;

  const updateBanner = async () => {
    const queue = await storageService.getOfflineQueue();
    const pendingCount = queue.length;

    container.innerHTML = `
      <div class="connectivity-bar ${navigator.onLine ? 'online' : 'offline'}">
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span class="status-text">
            ${navigator.onLine 
              ? 'Conectado al Servidor Central de FastOrder (Online)' 
              : 'Modo Fuera de Línea (Offline) - Los pedidos se sincronizarán al reconectar'}
          </span>
        </div>
        ${pendingCount > 0 ? `
          <div class="offline-badge-pill">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <span>${pendingCount} en cola</span>
            ${navigator.onLine ? `<button id="btn-sync-now" class="btn-sync-mini">Sincronizar ahora</button>` : ''}
          </div>
        ` : ''}
      </div>
    `;

    const btnSync = container.querySelector('#btn-sync-now');
    if (btnSync) {
      btnSync.addEventListener('click', () => {
        orderService.syncOfflineOrders();
      });
    }
  };

  window.addEventListener('online', () => {
    updateBanner();
    orderService.syncOfflineOrders();
  });

  window.addEventListener('offline', () => {
    updateBanner();
  });

  orderService.subscribe(() => {
    updateBanner();
  });

  updateBanner();
}
