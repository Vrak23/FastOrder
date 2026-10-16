/**
 * Cart View Component - FastOrder S.A.
 * Gestión del Carrito, Asignación de Mesa / Tipo de Entrega, Resumen y Checkout Offline-First.
 */

import { storageService } from '../services/storage-service.js';
import { orderService } from '../services/order-service.js';
import { notificationService } from '../services/notification-service.js';

export function renderCartView(container, onNavigate) {
  const render = () => {
    const cart = storageService.getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0);
    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-view">
          <div class="empty-illustration">
            <i class="fa-solid fa-cart-shopping"></i>
          </div>
          <h2>Tu bandeja de pedidos está vacía</h2>
          <p>Explora nuestro delicioso menú y agrega tus hamburguesas y combos favoritos.</p>
          <button id="btn-go-to-menu" class="btn-primary">
            <i class="fa-solid fa-utensils"></i> Explorar el Menú
          </button>
        </div>
      `;

      container.querySelector('#btn-go-to-menu')?.addEventListener('click', () => {
        if (onNavigate) onNavigate('menu');
      });
      return;
    }

    container.innerHTML = `
      <section class="cart-section">
        <div class="cart-header">
          <h2><i class="fa-solid fa-receipt"></i> Resumen de tu Pedido</h2>
          <span class="cart-badge-count">${cart.length} item(s)</span>
        </div>

        <div class="cart-layout">
          <!-- Columna Izquierda: Lista de Items -->
          <div class="cart-items-list">
            ${cart.map((item, index) => `
              <div class="cart-item-card">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                  <div class="cart-item-title-row">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <button class="btn-remove-item" data-index="${index}" title="Eliminar plato">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>

                  ${item.extras?.length ? `
                    <div class="cart-item-meta">
                      <strong>Extras:</strong> ${item.extras.map(e => e.name).join(', ')}
                    </div>
                  ` : ''}

                  ${item.salsas?.length ? `
                    <div class="cart-item-meta">
                      <strong>Salsas:</strong> ${item.salsas.join(', ')}
                    </div>
                  ` : ''}

                  ${item.notes ? `
                    <div class="cart-item-meta notes">
                      <strong>Nota:</strong> <em>"${item.notes}"</em>
                    </div>
                  ` : ''}

                  <div class="cart-item-footer">
                    <div class="item-price">S/ ${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="item-qty-selector">
                      <button class="btn-item-qty" data-action="dec" data-index="${index}">-</button>
                      <span class="item-qty-num">${item.quantity}</span>
                      <button class="btn-item-qty" data-action="inc" data-index="${index}">+</button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Columna Derecha: Configuración de Mesa y Checkout -->
          <div class="cart-checkout-box">
            <h3 class="box-title"><i class="fa-solid fa-clipboard-user"></i> Datos del Servicio</h3>
            
            <form id="checkout-form" class="checkout-form">
              <div class="form-group">
                <label for="customer-name"><i class="fa-solid fa-user"></i> Nombre del Cliente / Titular:</label>
                <input type="text" id="customer-name" placeholder="Ej. Rodrigo Llanos" required value="Rodrigo Llanos" />
              </div>

              <div class="form-group">
                <label><i class="fa-solid fa-location-dot"></i> Modalidad de Atención:</label>
                <div class="radio-toggle-group">
                  <label class="radio-pill active">
                    <input type="radio" name="orderType" value="mesa" checked />
                    <span><i class="fa-solid fa-chair"></i> Consumo en Salón</span>
                  </label>
                  <label class="radio-pill">
                    <input type="radio" name="orderType" value="llevar" />
                    <span><i class="fa-solid fa-bag-shopping"></i> Para Llevar</span>
                  </label>
                </div>
              </div>

              <div class="form-group" id="group-table-number">
                <label for="table-select"><i class="fa-solid fa-hashtag"></i> Selecciona tu Mesa:</label>
                <select id="table-select" class="form-select">
                  <option value="Mesa 1">Mesa 1 (Ventana)</option>
                  <option value="Mesa 2">Mesa 2 (Terraza)</option>
                  <option value="Mesa 3">Mesa 3 (Planta Baja)</option>
                  <option value="Mesa 4">Mesa 4 (VIP)</option>
                  <option value="Mesa 5" selected>Mesa 5 (Central)</option>
                  <option value="Mesa 6">Mesa 6 (Terraza Alta)</option>
                  <option value="Mesa 7">Mesa 7 (Barra)</option>
                </select>
              </div>

              <div class="form-group">
                <label><i class="fa-solid fa-credit-card"></i> Forma de Pago:</label>
                <div class="payment-options">
                  <label class="pay-option active">
                    <input type="radio" name="paymentMethod" value="yape" checked />
                    <span><i class="fa-solid fa-mobile-screen"></i> Yape / Plin</span>
                  </label>
                  <label class="pay-option">
                    <input type="radio" name="paymentMethod" value="tarjeta" />
                    <span><i class="fa-solid fa-credit-card"></i> Tarjeta POS</span>
                  </label>
                  <label class="pay-option">
                    <input type="radio" name="paymentMethod" value="efectivo" />
                    <span><i class="fa-solid fa-money-bill-wave"></i> Efectivo</span>
                  </label>
                </div>
              </div>

              <div class="bill-summary">
                <div class="bill-row">
                  <span>Subtotal:</span>
                  <span>S/ ${subtotal.toFixed(2)}</span>
                </div>
                <div class="bill-row">
                  <span>IGV (18%):</span>
                  <span>S/ ${igv.toFixed(2)}</span>
                </div>
                <div class="bill-row bill-total">
                  <span>Total a Pagar:</span>
                  <span class="total-amount">S/ ${total.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" id="btn-submit-order" class="btn-submit-order">
                <i class="fa-solid fa-fire"></i> Enviar Pedido a Cocina
              </button>

              <div class="pwa-offline-hint">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Garantía PWA: Si pierdes la señal Wi-Fi, tu orden se sincronizará sin pérdida de datos.</span>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;

    // Eventos de botones de cantidad
    container.querySelectorAll('.btn-item-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const index = parseInt(btn.getAttribute('data-index'), 10);
        const cartItems = storageService.getCart();

        if (action === 'inc') {
          cartItems[index].quantity++;
          cartItems[index].totalPrice = cartItems[index].price * cartItems[index].quantity;
        } else if (action === 'dec') {
          if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
            cartItems[index].totalPrice = cartItems[index].price * cartItems[index].quantity;
          } else {
            cartItems.splice(index, 1);
          }
        }
        storageService.saveCart(cartItems);
        render();
      });
    });

    // Eventos de eliminar item
    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'), 10);
        const cartItems = storageService.getCart();
        cartItems.splice(index, 1);
        storageService.saveCart(cartItems);
        notificationService.showToast('Item Eliminado', 'Se quitó el plato de tu pedido.', 'info');
        render();
      });
    });

    // Alternar selector de mesa según modalidad
    const form = container.querySelector('#checkout-form');
    const radioOrderTypes = form.querySelectorAll('input[name="orderType"]');
    const tableGroup = container.querySelector('#group-table-number');

    radioOrderTypes.forEach(radio => {
      radio.parentElement.addEventListener('click', () => {
        radioOrderTypes.forEach(r => r.parentElement.classList.remove('active'));
        radio.parentElement.classList.add('active');
        radio.checked = true;
        if (radio.value === 'mesa') {
          tableGroup.style.display = 'block';
        } else {
          tableGroup.style.display = 'none';
        }
      });
    });

    // Selección de método de pago
    const payOptions = form.querySelectorAll('input[name="paymentMethod"]');
    payOptions.forEach(p => {
      p.parentElement.addEventListener('click', () => {
        payOptions.forEach(opt => opt.parentElement.classList.remove('active'));
        p.parentElement.classList.add('active');
        p.checked = true;
      });
    });

    // Submit de la orden
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const customerName = form.querySelector('#customer-name').value;
      const orderType = form.querySelector('input[name="orderType"]:checked')?.value || 'mesa';
      const tableNumber = orderType === 'mesa' ? form.querySelector('#table-select').value : 'Para Llevar';
      const paymentMethod = form.querySelector('input[name="paymentMethod"]:checked')?.value || 'efectivo';
      const currentCart = storageService.getCart();

      const createdOrder = await orderService.createOrder({
        customerName,
        tableNumber,
        orderType,
        items: currentCart,
        paymentMethod
      });

      storageService.clearCart();
      if (onNavigate) onNavigate('orders');
    });
  };

  render();
}
