/**
 * Kitchen Display System (KDS) - FastOrder S.A.
 * Monitor de Cocina en Tiempo Real para Recepción, Preparación y Despacho de Comandas.
 */

import { storageService } from '../services/storage-service.js';
import { orderService } from '../services/order-service.js';

export function renderKitchenView(container) {
  const render = async () => {
    const orders = await storageService.getAllOrders();

    const pendingOrders = orders.filter(o => o.status === 'recibido');
    const cookingOrders = orders.filter(o => o.status === 'cocinando');
    const readyOrders = orders.filter(o => o.status === 'listo');
    const completedOrders = orders.filter(o => o.status === 'entregado');

    container.innerHTML = `
      <section class="kitchen-section">
        <div class="kitchen-header">
          <div>
            <h2><i class="fa-solid fa-fire-burner"></i> Monitor de Cocina KDS (Kitchen Display)</h2>
            <p class="section-subtitle">Gestión interactiva de comandas en tiempo real para chefs y mozos.</p>
          </div>
          <div class="kds-stats">
            <span class="kds-stat-pill pill-orange">Pendientes: ${pendingOrders.length}</span>
            <span class="kds-stat-pill pill-blue">Cocinando: ${cookingOrders.length}</span>
            <span class="kds-stat-pill pill-green">Listos: ${readyOrders.length}</span>
          </div>
        </div>

        <div class="kds-columns-grid">
          <!-- Columna 1: Por Preparar (Nuevas Comandas) -->
          <div class="kds-column col-recibido">
            <div class="kds-column-header">
              <h3><i class="fa-solid fa-bell"></i> Nuevos (${pendingOrders.length})</h3>
            </div>
            <div class="kds-cards-container">
              ${pendingOrders.length === 0 ? `
                <div class="kds-empty">Sin pedidos pendientes</div>
              ` : pendingOrders.map(order => renderKdsCard(order, 'recibido')).join('')}
            </div>
          </div>

          <!-- Columna 2: En Cocción / Plancha -->
          <div class="kds-column col-cocinando">
            <div class="kds-column-header">
              <h3><i class="fa-solid fa-utensils"></i> En Cocción (${cookingOrders.length})</h3>
            </div>
            <div class="kds-cards-container">
              ${cookingOrders.length === 0 ? `
                <div class="kds-empty">Sin órdenes al fuego</div>
              ` : cookingOrders.map(order => renderKdsCard(order, 'cocinando')).join('')}
            </div>
          </div>

          <!-- Columna 3: Listos para Despachar -->
          <div class="kds-column col-listo">
            <div class="kds-column-header">
              <h3><i class="fa-solid fa-circle-check"></i> Listos (${readyOrders.length})</h3>
            </div>
            <div class="kds-cards-container">
              ${readyOrders.length === 0 ? `
                <div class="kds-empty">No hay pedidos listos</div>
              ` : readyOrders.map(order => renderKdsCard(order, 'listo')).join('')}
            </div>
          </div>
        </div>
      </section>
    `;

    // Eventos de botones de acción KDS
    container.querySelectorAll('.btn-kds-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const orderId = btn.getAttribute('data-order-id');
        const nextStatus = btn.getAttribute('data-next-status');
        await orderService.updateOrderStatus(orderId, nextStatus);
        render();
      });
    });
  };

  const renderKdsCard = (order, stage) => {
    return `
      <div class="kds-card stage-${stage}">
        <div class="kds-card-top">
          <span class="kds-order-id">#${order.id}</span>
          <span class="kds-table-badge"><i class="fa-solid fa-location-dot"></i> ${order.tableNumber}</span>
        </div>
        
        <div class="kds-client-name"><i class="fa-solid fa-user"></i> ${order.customerName}</div>

        <div class="kds-items-list">
          ${order.items.map(it => `
            <div class="kds-item">
              <span class="kds-it-qty">${it.quantity}x</span>
              <div class="kds-it-desc">
                <span class="kds-it-name">${it.name}</span>
                ${it.extras?.length ? `<div class="kds-meta">Extras: ${it.extras.map(e => e.name).join(', ')}</div>` : ''}
                ${it.salsas?.length ? `<div class="kds-meta">Salsas: ${it.salsas.join(', ')}</div>` : ''}
                ${it.notes ? `<div class="kds-notes">Nota: "${it.notes}"</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="kds-card-actions">
          ${stage === 'recibido' ? `
            <button class="btn-kds-action btn-kds-start" data-order-id="${order.id}" data-next-status="cocinando">
              <i class="fa-solid fa-fire"></i> Empezar a Cocinar
            </button>
          ` : stage === 'cocinando' ? `
            <button class="btn-kds-action btn-kds-ready" data-order-id="${order.id}" data-next-status="listo">
              <i class="fa-solid fa-bell-concierge"></i> Marcar Listo
            </button>
          ` : stage === 'listo' ? `
            <button class="btn-kds-action btn-kds-deliver" data-order-id="${order.id}" data-next-status="entregado">
              <i class="fa-solid fa-circle-check"></i> Entregado al Cliente
            </button>
          ` : ''}
        </div>
      </div>
    `;
  };

  orderService.subscribe(() => {
    render();
  });

  render();
}
