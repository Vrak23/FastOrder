/**
 * Main Application Orchestrator - FastOrder S.A. PWA
 */

import { storageService } from './services/storage-service.js';
import { orderService } from './services/order-service.js';
import { notificationService } from './services/notification-service.js';
import { renderOfflineBanner } from './components/offline-banner.js';
import { renderMenuView } from './components/menu-view.js';
import { renderCartView } from './components/cart-view.js';
import { renderOrdersView } from './components/orders-view.js';
import { renderKitchenView } from './components/kitchen-view.js';

let deferredPrompt = null;
let currentTab = 'menu';

document.addEventListener('DOMContentLoaded', async () => {
  initServiceWorker();
  initInstallPwaBanner();
  initNotificationPermissionRequest();
  seedDemoOrdersIfEmpty();

  // Contenedores principales
  const bannerContainer = document.getElementById('connectivity-banner-root');
  const mainContent = document.getElementById('main-content-root');
  const cartCountBadge = document.getElementById('header-cart-count');
  const bottomNavCartBadge = document.getElementById('bottom-cart-count');

  // Renderizar banner offline
  renderOfflineBanner(bannerContainer);

  // Actualizar contador del carrito
  const updateCartBadge = () => {
    const cart = storageService.getCart();
    const count = cart.reduce((sum, it) => sum + it.quantity, 0);
    if (cartCountBadge) {
      cartCountBadge.textContent = count;
      cartCountBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (bottomNavCartBadge) {
      bottomNavCartBadge.textContent = count;
      bottomNavCartBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  };

  // Enrutador de pestañas
  const navigateTo = (tabName) => {
    currentTab = tabName;
    window.location.hash = `#${tabName}`;

    // Actualizar botones activos en header y bottom bar
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(el => {
      const target = el.getAttribute('data-tab');
      if (target === tabName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    mainContent.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (tabName) {
      case 'menu':
        renderMenuView(mainContent, () => updateCartBadge());
        break;
      case 'cart':
        renderCartView(mainContent, (nextTab) => {
          updateCartBadge();
          navigateTo(nextTab);
        });
        break;
      case 'orders':
        renderOrdersView(mainContent, (nextTab) => navigateTo(nextTab));
        break;
      case 'kitchen':
        renderKitchenView(mainContent);
        break;
      default:
        renderMenuView(mainContent, () => updateCartBadge());
    }
  };

  // Escuchar clicks de navegación
  document.querySelectorAll('[data-tab]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = elem.getAttribute('data-tab');
      navigateTo(tab);
    });
  });

  // Manejo de Hash inicial
  const hash = window.location.hash.replace('#', '') || 'menu';
  navigateTo(hash);
  updateCartBadge();

  // Escuchar cambios de hash por historial de navegador
  window.addEventListener('hashchange', () => {
    const target = window.location.hash.replace('#', '') || 'menu';
    if (target !== currentTab) {
      navigateTo(target);
    }
  });

  // Toggle de simulador de red Offline/Online para demostraciones académicas
  const btnToggleNetwork = document.getElementById('btn-toggle-offline-simulation');
  if (btnToggleNetwork) {
    let simulatedOffline = false;
    btnToggleNetwork.addEventListener('click', () => {
      simulatedOffline = !simulatedOffline;
      if (simulatedOffline) {
        btnToggleNetwork.classList.add('active-sim-offline');
        btnToggleNetwork.innerHTML = '<i class="fa-solid fa-plane"></i> Modo Vuelo (Simulado)';
        notificationService.showToast('Simulación Offline Activada', 'Ahora puedes probar emitir pedidos sin conexión.', 'warning');
        // Despachar evento custom o forzar banner
        window.dispatchEvent(new Event('offline'));
      } else {
        btnToggleNetwork.classList.remove('active-sim-offline');
        btnToggleNetwork.innerHTML = '<i class="fa-solid fa-tower-broadcast"></i> Simular Offline';
        notificationService.showToast('Simulación Desactivada', 'Conexión restaurada con el servidor.', 'success');
        window.dispatchEvent(new Event('online'));
      }
    });
  }
});

// 1. Registro del Service Worker
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[FastOrder PWA] Service Worker registrado exitosamente en ámbito:', reg.scope);
          
          // Escuchar actualizaciones
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                notificationService.showToast(
                  'Nueva Versión Disponible',
                  'Hay una nueva versión de FastOrder. Se actualizará automáticamente.',
                  'info'
                );
              }
            };
          };
        })
        .catch((err) => {
          console.warn('[FastOrder PWA] Error al registrar Service Worker:', err);
        });
    });

    // Escuchar mensajes del SW (ej. background sync)
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_PENDING_ORDERS') {
        orderService.syncOfflineOrders();
      }
    });
  }
}

// 2. Banner de Instalación PWA (A2HS - Add to Home Screen)
function initInstallPwaBanner() {
  const installContainer = document.getElementById('pwa-install-banner');
  const btnInstall = document.getElementById('btn-install-pwa');
  const btnDismiss = document.getElementById('btn-dismiss-install');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installContainer) {
      installContainer.style.display = 'flex';
    }
  });

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('[FastOrder PWA] Usuario aceptó la instalación.');
        }
        deferredPrompt = null;
        if (installContainer) installContainer.style.display = 'none';
      }
    });
  }

  if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
      if (installContainer) installContainer.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[FastOrder PWA] Aplicación instalada en el dispositivo.');
    if (installContainer) installContainer.style.display = 'none';
    notificationService.showToast('¡App Instalada!', 'FastOrder ya está en tu pantalla de inicio.', 'success');
  });
}

// 3. Solicitud de Notificaciones Push
function initNotificationPermissionRequest() {
  const btnEnablePush = document.getElementById('btn-enable-notifications');
  if (btnEnablePush) {
    btnEnablePush.addEventListener('click', async () => {
      const granted = await notificationService.requestPermission();
      if (granted) {
        notificationService.showNativeNotification('🔔 Notificaciones Activadas', {
          body: 'Recibirás avisos instantáneos cuando tu comida esté en cocina o lista para servir.'
        });
        btnEnablePush.style.display = 'none';
      } else {
        notificationService.showToast('Aviso', 'Puedes habilitar las notificaciones en los ajustes de tu navegador.', 'info');
      }
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      btnEnablePush.style.display = 'none';
    }
  }
}

// 4. Semilla de datos demostrativos iniciales
async function seedDemoOrdersIfEmpty() {
  const existingOrders = await storageService.getAllOrders();
  if (existingOrders.length === 0) {
    const demoOrder1 = {
      id: 'FO-5420-101',
      customerName: 'Rodrigo Llanos (Muestra)',
      tableNumber: 'Mesa 5',
      orderType: 'mesa',
      items: [
        { id: 'prod-01', name: 'Combo FastOrder Supremo', price: 32.50, quantity: 1, totalPrice: 32.50, salsas: ['Ají FastOrder Especial', 'Golf Ahumada'], extras: [{ name: 'Queso Cheddar Extra', price: 3.50 }] },
        { id: 'prod-08', name: 'Chicha Morada Clásica (1 Litro)', price: 9.50, quantity: 1, totalPrice: 9.50, salsas: [], extras: [] }
      ],
      paymentMethod: 'yape',
      subtotal: 45.50,
      igv: 8.19,
      total: 53.69,
      status: 'cocinando',
      createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      isOnline: true,
      isOfflinePending: false
    };

    const demoOrder2 = {
      id: 'FO-9811-204',
      customerName: 'Carlos Mendoza',
      tableNumber: 'Mesa 2',
      orderType: 'mesa',
      items: [
        { id: 'prod-02', name: 'Burger Monster Bacon Deluxe', price: 24.90, quantity: 2, totalPrice: 49.80, salsas: ['BBQ Ahumada'], extras: [] },
        { id: 'prod-06', name: 'Papas Rústicas FastOrder', price: 14.00, quantity: 1, totalPrice: 14.00, salsas: ['Cheddar Tibio'], extras: [] }
      ],
      paymentMethod: 'tarjeta',
      subtotal: 63.80,
      igv: 11.48,
      total: 75.28,
      status: 'recibido',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      isOnline: true,
      isOfflinePending: false
    };

    await storageService.saveOrder(demoOrder1);
    await storageService.saveOrder(demoOrder2);
  }
}
