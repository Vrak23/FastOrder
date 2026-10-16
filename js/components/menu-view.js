/**
 * Menu View Component - FastOrder S.A.
 * Renderizado de Categorías, Búsqueda, Tarjetas de Productos y Modal de Personalización.
 */

import { CATEGORIES, MENU_PRODUCTS } from '../data/menu-data.js';
import { storageService } from '../services/storage-service.js';
import { notificationService } from '../services/notification-service.js';

let selectedCategory = 'all';
let searchQuery = '';
let currentProductForModal = null;

export function renderMenuView(container, onCartUpdated) {
  const filterProducts = () => {
    return MENU_PRODUCTS.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  };

  const render = () => {
    const products = filterProducts();

    container.innerHTML = `
      <section class="menu-section">
        <!-- Hero Header -->
        <div class="hero-card-layout">
          <div class="hero-left">
            <span class="hero-kicker"><i class="fa-solid fa-sparkles"></i> SABOR HECHO AL MOMENTO</span>
            <h1 class="hero-heading">¿Qué se te antoja hoy?</h1>
            <p class="hero-subheading">Elige tu favorito y personalízalo a tu gusto.</p>
          </div>
          <div class="hero-right">
            <div class="delivery-time-card">
              <i class="fa-regular fa-clock clock-icon"></i>
              <div>
                <strong>15–20 min</strong>
                <span>Tiempo promedio</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="menu-search-box">
          <div class="search-field-pill">
            <i class="fa-solid fa-magnifying-glass search-ico"></i>
            <input 
              type="text" 
              id="menu-search-input" 
              placeholder="Buscar hamburguesas, combos, bebidas..." 
              value="${searchQuery}"
              autocomplete="off"
            />
            ${searchQuery ? `<button id="btn-clear-search" class="btn-clear-search"><i class="fa-solid fa-xmark"></i></button>` : ''}
          </div>
        </div>

        <!-- Category Pills -->
        <div class="category-pills-bar">
          ${CATEGORIES.map(cat => `
            <button class="cat-chip ${cat.id === selectedCategory ? 'active' : ''}" data-cat-id="${cat.id}">
              ${cat.name}
            </button>
          `).join('')}
        </div>

        <!-- Section Title -->
        <div class="catalog-header-row">
          <h2 class="catalog-title">${selectedCategory === 'all' ? 'Nuestros favoritos' : CATEGORIES.find(c => c.id === selectedCategory)?.name}</h2>
          <span class="catalog-count">${products.length} opciones</span>
        </div>

        ${products.length === 0 ? `
          <div class="empty-state">
            <i class="fa-solid fa-circle-question empty-icon"></i>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otro término de búsqueda.</p>
          </div>
        ` : `
          <div class="products-grid-modern">
            ${products.map(product => `
              <div class="product-card-modern" data-prod-id="${product.id}">
                <div class="card-top-visual">
                  ${product.badge ? `<span class="orange-badge">${product.badge}</span>` : ''}
                  <img src="${product.image}" alt="${product.name}" class="card-food-img" onerror="this.src='img/p1.png'">
                  <span class="card-time-tag"><i class="fa-regular fa-clock"></i> ${product.prepTime}</span>
                </div>

                <div class="card-content-area">
                  <h3 class="product-title">${product.name}</h3>
                  <p class="product-desc">${product.description}</p>
                  
                  <div class="card-bottom-row">
                    <div class="price-display">
                      <span class="curr">S/</span>
                      <span class="val">${product.price.toFixed(2)}</span>
                    </div>
                    <button class="btn-card-add" data-prod-id="${product.id}">
                      <i class="fa-solid fa-plus"></i> Pedir
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </section>

      <!-- Modal de Personalización de Producto -->
      <div id="product-modal" class="modal-backdrop" style="display: none;">
        <div class="modal-dialog-modern">
          <div class="modal-header-modern">
            <div>
              <span class="modal-kicker">PERSONALIZA TU PEDIDO</span>
              <h3 id="modal-prod-title">Combo FastOrder Supremo</h3>
            </div>
            <button id="btn-close-modal" class="btn-close-x"><i class="fa-solid fa-xmark"></i></button>
          </div>
          
          <div class="modal-body-scroll" id="modal-prod-body">
            <!-- Dinámico -->
          </div>

          <div class="modal-footer-modern">
            <div class="qty-pill">
              <button id="btn-qty-minus" class="btn-qty-symbol">-</button>
              <span id="modal-qty-val" class="qty-number">1</span>
              <button id="btn-qty-plus" class="btn-qty-symbol">+</button>
            </div>
            <button id="btn-confirm-add" class="btn-add-to-cart-orange">
              <span>Agregar al Pedido</span>
              <span id="modal-total-btn">S/ 0.00</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Eventos
    const searchInput = container.querySelector('#menu-search-input');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    const btnClearSearch = container.querySelector('#btn-clear-search');
    if (btnClearSearch) {
      btnClearSearch.addEventListener('click', () => {
        searchQuery = '';
        render();
      });
    }

    container.querySelectorAll('.cat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.getAttribute('data-cat-id');
        render();
      });
    });

    container.querySelectorAll('.product-card-modern, .btn-card-add').forEach(elem => {
      elem.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = elem.closest('.product-card-modern');
        const prodId = card?.getAttribute('data-prod-id') || elem.getAttribute('data-prod-id');
        const prod = MENU_PRODUCTS.find(p => p.id === prodId);
        if (prod) {
          openProductModal(prod);
        }
      });
    });

    // Control del Modal
    const modal = container.querySelector('#product-modal');
    const btnClose = container.querySelector('#btn-close-modal');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
  };

  let modalState = {
    quantity: 1,
    selectedSalsas: [],
    selectedExtras: [],
    customNotes: ''
  };

  const openProductModal = (product) => {
    currentProductForModal = product;
    modalState = {
      quantity: 1,
      selectedSalsas: product.options?.salsas?.slice(0, 2) || [],
      selectedExtras: [],
      customNotes: ''
    };

    const modal = container.querySelector('#product-modal');
    const modalTitle = container.querySelector('#modal-prod-title');
    const modalBody = container.querySelector('#modal-prod-body');

    modalTitle.textContent = product.name;

    const renderModalBody = () => {
      const extrasCost = modalState.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
      const unitCost = product.price + extrasCost;
      const totalCost = unitCost * modalState.quantity;

      const totalBtn = container.querySelector('#modal-total-btn');
      if (totalBtn) totalBtn.textContent = `S/ ${totalCost.toFixed(2)}`;

      const qtyVal = container.querySelector('#modal-qty-val');
      if (qtyVal) qtyVal.textContent = modalState.quantity;

      modalBody.innerHTML = `
        <div class="modal-prod-summary-box">
          <div class="modal-thumb-box">
            <img src="${product.image}" alt="${product.name}" class="modal-thumb-img" onerror="this.src='img/p1.png'">
          </div>
          <div class="modal-summary-info">
            <p class="modal-summary-desc">${product.description}</p>
            <div class="modal-summary-price">S/ ${product.price.toFixed(2)}</div>
          </div>
        </div>

        ${product.options?.terminos?.length ? `
          <div class="modal-option-block">
            <h4 class="option-block-title">Término de la carne</h4>
            <div class="pill-options-row">
              ${product.options.terminos.map((term, idx) => `
                <button type="button" class="btn-term-pill ${idx === 0 ? 'selected' : ''}" data-term="${term}">
                  ${idx === 0 ? '<i class="fa-solid fa-check"></i> ' : ''}${term}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${product.options?.salsas?.length ? `
          <div class="modal-option-block">
            <h4 class="option-block-title">Elige tus salsas</h4>
            <div class="salsa-chips">
              ${product.options.salsas.map(salsa => {
                const isSelected = modalState.selectedSalsas.includes(salsa);
                return `
                  <button type="button" class="salsa-chip ${isSelected ? 'active' : ''}" data-salsa="${salsa}">
                    <i class="fa-solid ${isSelected ? 'fa-check' : 'fa-plus'}"></i> ${salsa}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${product.options?.extras?.length ? `
          <div class="modal-option-block">
            <h4 class="option-block-title">Ingredientes extras</h4>
            <div class="extras-list">
              ${product.options.extras.map(extra => {
                const isSelected = modalState.selectedExtras.some(e => e.name === extra.name);
                return `
                  <label class="extra-item ${isSelected ? 'checked' : ''}">
                    <input type="checkbox" class="extra-checkbox" data-extra-name="${extra.name}" ${isSelected ? 'checked' : ''}/>
                    <span class="extra-name">${extra.name}</span>
                    <span class="extra-price">+ S/ ${extra.price.toFixed(2)}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <div class="modal-option-block">
          <h4 class="option-block-title">Indicaciones especiales</h4>
          <textarea id="modal-custom-notes" class="modal-textarea" placeholder="Instrucciones para la cocina...">${modalState.customNotes}</textarea>
        </div>
      `;

      // Eventos salsas
      modalBody.querySelectorAll('.salsa-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const salsa = chip.getAttribute('data-salsa');
          if (modalState.selectedSalsas.includes(salsa)) {
            modalState.selectedSalsas = modalState.selectedSalsas.filter(s => s !== salsa);
          } else {
            modalState.selectedSalsas.push(salsa);
          }
          renderModalBody();
        });
      });

      // Eventos extras
      modalBody.querySelectorAll('.extra-checkbox').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const extraName = chk.getAttribute('data-extra-name');
          const extraObj = product.options.extras.find(ex => ex.name === extraName);
          if (e.target.checked) {
            if (!modalState.selectedExtras.some(ex => ex.name === extraName)) {
              modalState.selectedExtras.push(extraObj);
            }
          } else {
            modalState.selectedExtras = modalState.selectedExtras.filter(ex => ex.name !== extraName);
          }
          renderModalBody();
        });
      });

      // Evento notas
      const notesEl = modalBody.querySelector('#modal-custom-notes');
      if (notesEl) {
        notesEl.addEventListener('input', (e) => {
          modalState.customNotes = e.target.value;
        });
      }
    };

    renderModalBody();
    modal.style.display = 'flex';

    // Manejo de Cantidad
    const btnMinus = container.querySelector('#btn-qty-minus');
    const btnPlus = container.querySelector('#btn-qty-plus');
    const btnConfirm = container.querySelector('#btn-confirm-add');

    btnMinus.onclick = () => {
      if (modalState.quantity > 1) {
        modalState.quantity--;
        renderModalBody();
      }
    };

    btnPlus.onclick = () => {
      modalState.quantity++;
      renderModalBody();
    };

    btnConfirm.onclick = () => {
      const extrasCost = modalState.selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
      const unitCost = product.price + extrasCost;
      const totalItemPrice = unitCost * modalState.quantity;

      const cartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: unitCost,
        basePrice: product.price,
        quantity: modalState.quantity,
        totalPrice: totalItemPrice,
        image: product.image,
        salsas: [...modalState.selectedSalsas],
        extras: [...modalState.selectedExtras],
        notes: modalState.customNotes
      };

      const currentCart = storageService.getCart();
      currentCart.push(cartItem);
      storageService.saveCart(currentCart);

      notificationService.showToast(
        'Producto Añadido',
        `${modalState.quantity}x ${product.name} añadido a tu orden.`,
        'success'
      );

      modal.style.display = 'none';
      if (onCartUpdated) onCartUpdated(currentCart);
    };
  };

  render();
}
