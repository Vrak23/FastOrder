/**
 * Orders View Component - FastOrder S.A.
 * Visualización y Seguimiento en Tiempo Real de Pedidos del Cliente.
 */

import { storageService } from '../services/storage-service.js';
import { orderService } from '../services/order-service.js';

export function renderOrdersView(container, onNavigate) {
  const render = async () => {
    const orders = await storageService.getAllOrders();

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-view">
          <div class="empty-illustration">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h2>Aún no has realizado pedidos</h2>
          <p>Tus pedidos activos e históricos aparecerán aquí con su seguimiento en tiempo real.</p>
          <button id="btn-go-to-menu-from-orders" class="btn-primary">
            <i class="fa-solid fa-utensils"></i> Realizar un Pedido
          </button>
        </div>
      `;

      container.querySelector('#btn-go-to-menu-from-orders')?.addEventListener('click', () => {
        if (onNavigate) onNavigate('menu');
      });
      return;
    }

    const getStatusStepClass = (orderStatus, step) => {
      const orderStages = ['recibido', 'cocinando', 'listo', 'entregado'];
      const currentIdx = orderStages.indexOf(orderStatus);
      const stepIdx = orderStages.indexOf(step);

      if (currentIdx > stepIdx) return 'completed';
      if (currentIdx === stepIdx) return 'active';
      return 'pending';
    };

    container.innerHTML = `
      <section class="orders-section">
        <div class="orders-header">
          <div>
            <h2><i class="fa-solid fa-receipt"></i> Mis Pedidos en FastOrder</h2>
            <p class="section-subtitle">Sigue el estado de preparación y despacho en tiempo real.</p>
          </div>
          <button id="btn-refresh-orders" class="btn-secondary">
            <i class="fa-solid fa-rotate-right"></i> Actualizar
          </button>
        </div>

        <div class="orders-list">
          ${orders.map(order => `
            <div class="order-card status-${order.status} ${order.isOfflinePending ? 'is-offline' : ''}">
              <div class="order-card-header">
                <div>
                  <span class="order-ticket-id">#${order.id}</span>
                  <span class="order-time">${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div class="order-badges">
                  ${order.isOfflinePending ? `
                    <span class="badge-offline-pill" title="Pendiente de sincronizar al servidor">
                      <i class="fa-solid fa-cloud-arrow-up"></i> Guardado Local (Offline)
                    </span>
                  ` : `
                    <span class="badge-online-pill">
                      <i class="fa-solid fa-circle-check"></i> Sincronizado
                    </span>
                  `}
                  <span class="badge-status-pill status-${order.status}">
                    ${order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <!-- Stepper de Estado de Preparación -->
              <div class="order-stepper">
                <div class="step-node ${getStatusStepClass(order.status, 'recibido')}">
                  <div class="step-icon"><i class="fa-solid fa-file-invoice"></i></div>
                  <span class="step-label">Recibido</span>
                </div>
                <div class="step-line ${getStatusStepClass(order.status, 'cocinando')}"></div>
                <div class="step-node ${getStatusStepClass(order.status, 'cocinando')}">
                  <div class="step-icon"><i class="fa-solid fa-fire-burner"></i></div>
                  <span class="step-label">En Cocina</span>
                </div>
                <div class="step-line ${getStatusStepClass(order.status, 'listo')}"></div>
                <div class="step-node ${getStatusStepClass(order.status, 'listo')}">
                  <div class="step-icon"><i class="fa-solid fa-bell-concierge"></i></div>
                  <span class="step-label">¡Listo!</span>
                </div>
                <div class="step-line ${getStatusStepClass(order.status, 'entregado')}"></div>
                <div class="step-node ${getStatusStepClass(order.status, 'entregado')}">
                  <div class="step-icon"><i class="fa-solid fa-circle-check"></i></div>
                  <span class="step-label">Servido</span>
                </div>
              </div>

              <!-- Detalle de Productos -->
              <div class="order-card-body">
                <div class="order-info-line">
                  <span><strong>Cliente:</strong> ${order.customerName}</span>
                  <span><strong>Ubicación:</strong> ${order.tableNumber}</span>
                </div>
                <div class="order-items-summary">
                  ${order.items.map(it => `
                    <div class="order-item-row">
                      <span class="it-qty">${it.quantity}x</span>
                      <span class="it-name">${it.name}</span>
                      <span class="it-price">S/ ${(it.price * it.quantity).toFixed(2)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Footer con Total y Métodos -->
              <div class="order-card-footer">
                <div class="order-payment-info">
                  <span>Pago: <strong>${order.paymentMethod?.toUpperCase()}</strong></span>
                </div>
                <div class="order-total-sum">
                  <span>Total:</span>
                  <strong>S/ ${order.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    container.querySelector('#btn-refresh-orders')?.addEventListener('click', () => {
      render();
    });
  };

  orderService.subscribe(() => {
    render();
  });

  render();
}
