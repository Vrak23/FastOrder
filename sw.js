/**
 * Service Worker - FastOrder S.A. PWA
 * Estrategias de Caching: Cache-First (App Shell), Stale-While-Revalidate (Assets), Network-First (API/Datos)
 * Soporte Offline-First & Notificaciones Push
 */

const CACHE_NAME = 'fastorder-pwa-v2.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/data/menu-data.js',
  './js/services/storage-service.js',
  './js/services/order-service.js',
  './js/services/notification-service.js',
  './js/components/menu-view.js',
  './js/components/cart-view.js',
  './js/components/orders-view.js',
  './js/components/kitchen-view.js',
  './js/components/offline-banner.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// 1. Evento Install: Pre-caching del App Shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando SW y cacheando App Shell...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cache abierto exitosamente.');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Evento Activate: Limpieza de versiones obsoletas de caché
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando SW y purgando cachés viejos...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Evento Fetch: Estrategia Stale-While-Revalidate y Fallback Offline
self.addEventListener('fetch', (event) => {
  // Ignorar esquemas no soportados como extensiones de navegador
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retornar recurso cacheado de inmediato e intentar actualizar en segundo plano
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Estamos offline, usamos el caché
        });
        return cachedResponse;
      }

      // Si no está en caché, ir a la red y guardar copia
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Si falla la red y es una solicitud de página HTML, retornar el index cacheado
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
        });
    })
  );
});

// 4. Evento Push: Manejo de Notificaciones Push del servidor
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido:', event);
  let data = {
    title: '🍔 FastOrder S.A.',
    body: '¡Tu pedido tiene una nueva actualización en cocina!',
    icon: './icons/icon-192.svg',
    badge: './icons/icon-192.svg'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || './icons/icon-192.svg',
    badge: data.badge || './icons/icon-192.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view_order', title: '👀 Ver Estado' },
      { action: 'close', title: '❌ Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Evento NotificationClick: Apertura de la aplicación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html#orders');
      }
    })
  );
});

// 6. Background Sync: Sincronización en segundo plano de pedidos
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('[Service Worker] Sincronizando pedidos pendientes con el servidor...');
    event.waitUntil(
      // Notificar a los clientes abiertos que sincronicen la cola
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_PENDING_ORDERS' });
        });
      })
    );
  }
});
