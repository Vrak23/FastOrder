# 🍔 FastOrder S.A. - Progressive Web App (PWA)

Aplicación Web Progresiva de alto rendimiento desarrollada para la **Gestión Ágil de Pedidos en Restaurante**, cumpliendo los requerimientos y estándares de evaluación de **SENATI** (Escuela de Tecnologías de la Información).

---

## 🚀 Características y Funcionalidades del Avance

1. **Arquitectura Offline-First (Sin Conexión):**
   - **Service Worker (`sw.js`):** Implementa estrategias de caché (`Cache-First` para App Shell y assets estáticos, `Stale-While-Revalidate` y `Network-First` para datos).
   - **Persistencia con IndexedDB / LocalStorage:** Si el usuario o mozo pierde conexión, los pedidos se guardan en la cola local (`offline_orders_queue`) con estado *Pendiente de Sincronización*.
   - **Sincronización Automática:** Al restablecerse la red Wi-Fi/móvil, la cola se despacha al servidor en segundo plano (`sync` event / listeners reactivos).

2. **Web App Manifest (`manifest.webmanifest`):**
   - Soporte para instalación como aplicación nativa (**A2HS - Add to Home Screen**).
   - Modo de visualización `standalone` sin barra de navegación del explorador.
   - Iconografía adaptativa con máscara (*maskable icons*) en 192x192 y 512x512.
   - Accesos directos rápidos (*shortcuts*) para Menú, Carrito y Cocina.

3. **Catálogo Interactivo y Personalización:**
   - Menú segmentado por categorías (Combos, Hamburguesas, Broasters, Guarniciones, Bebidas, Postres).
   - Búsqueda en tiempo real.
   - Modal de personalización de pedidos (selección de salsas, ingredientes extras y notas especiales para la cocina).

4. **Monitor de Cocina KDS (Kitchen Display System):**
   - Vista especializada para el personal de cocina en tiempo real.
   - Flujo de estados: **Recibido ➔ En Cocción ➔ Listo para Servir ➔ Entregado**.

5. **Sistema de Notificaciones Push:**
   - Notificaciones nativas y toasts visuales que alertan al cliente sobre el cambio de estado de su pedido.

---

## 🛠️ Tecnologías Empleadas

- **Frontend & PWA:** HTML5 Semántico, CSS3 Moderno (Custom Properties, Flexbox, CSS Grid, Glassmorphism), JavaScript ES6+ Modular.
- **PWA APIs:** Service Worker API, Cache Storage API, IndexedDB API, Push & Notification API, Web App Manifest.
- **Herramientas:** Node.js, NPM, XAMPP (Apache) / Serve.

---

## 💻 Instrucciones de Ejecución

### Opción 1: Servidor Node Local
```bash
# Dentro de la carpeta FastOrder-PWA
npx serve -s . -l 4200
```
Luego abrir en el navegador: `http://localhost:4200`

### Opción 2: XAMPP Apache
Al encontrarse dentro del directorio `htdocs`, acceder a través de:
`http://localhost/portal_gen/Senati/cursos%20cuarto%20ciclo/Cursos/Aplicaciones%20web%20progresivas/trabajo%20final/FastOrder-PWA/`

---

## 🧪 Cómo Probar el Modo Offline (Demostración de Avance)

1. En la barra superior de la aplicación, haz clic en el botón **"Simular Offline"** (o desactiva la red en las *DevTools* pestaña *Network -> Offline*).
2. Verás que la barra de estado superior cambia a color rojo: **"Modo Fuera de Línea (Offline)"**.
3. Navega por el menú y agrega un combo al carrito.
4. Completa el checkout y haz clic en **"Enviar Pedido a Cocina"**.
5. El pedido se registrará con la etiqueta **"Guardado Local (Offline)"** y se añadirá al contador de cola.
6. Haz clic nuevamente en **"Modo Vuelo (Simulado)"** para volver a Online.
7. Observa cómo la aplicación sincroniza automáticamente el pedido con el estado **"Sincronizado"** y notifica al cliente.
