/**
 * Notification Service - FastOrder S.A.
 * Manejo de Permisos, Notificaciones Push y Alertas Toast
 */

class NotificationService {
  constructor() {
    this.hasPermission = 'Notification' in window && Notification.permission === 'granted';
  }

  // Solicitar permiso al usuario
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta Notificaciones de Escritorio/Móvil.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (e) {
      console.error('Error al solicitar permiso de notificaciones:', e);
      return false;
    }
  }

  // Emitir notificación nativa
  showNativeNotification(title, options = {}) {
    if (this.hasPermission && 'Notification' in window) {
      try {
        const defaultOptions = {
          icon: './icons/icon-192.svg',
          badge: './icons/icon-192.svg',
          vibrate: [200, 100, 200],
          ...options
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, defaultOptions);
          });
        } else {
          new Notification(title, defaultOptions);
        }
      } catch (e) {
        console.warn('Error al mostrar notificación nativa:', e);
      }
    }
    
    // Siempre mostramos el toast visual en la interfaz para retroalimentación instantánea
    this.showToast(title, options.body || '', options.type || 'info');
  }

  // Toast flotante moderno
  showToast(title, message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} animate-slide-in`;

    const iconMap = {
      success: 'fa-circle-check',
      info: 'fa-bell',
      warning: 'fa-triangle-exclamation',
      error: 'fa-circle-xmark'
    };

    const iconClass = iconMap[type] || 'fa-bell';

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${iconClass}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => toast.remove(), 300);
    });

    container.appendChild(toast);

    // Auto eliminar a los 4.5 segundos
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }
}

export const notificationService = new NotificationService();
