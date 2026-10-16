import { Injectable } from '@angular/core';

export interface AlertaToast {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'success' | 'info' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private tienePermisoPush = false;
  public toasts: AlertaToast[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.tienePermisoPush = Notification.permission === 'granted';
    }
  }

  async solicitarPermiso(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      this.mostrarToast('Aviso', 'Tu navegador no soporta Notificaciones Push.', 'warning');
      return false;
    }

    try {
      const permiso = await Notification.requestPermission();
      this.tienePermisoPush = permiso === 'granted';
      if (this.tienePermisoPush) {
        this.mostrarNotificacion('🔔 Notificaciones Activadas', {
          body: 'Recibirás actualizaciones en tiempo real sobre el estado de tus pedidos en cocina.'
        });
        this.mostrarToast('Notificaciones Habilitadas', 'Recibirás avisos en tiempo real de tu pedido.', 'success');
      }
      return this.tienePermisoPush;
    } catch (e) {
      console.warn('Error al solicitar permiso de notificación:', e);
      return false;
    }
  }

  get permisoConcedido(): boolean {
    return this.tienePermisoPush;
  }

  mostrarNotificacion(titulo: string, opciones: NotificationOptions = {}) {
    if (this.tienePermisoPush && 'Notification' in window) {
      try {
        const defaultOpts: NotificationOptions = {
          icon: 'icons/icon-192.svg',
          badge: 'icons/icon-192.svg',
          ...opciones
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(titulo, defaultOpts);
          });
        } else {
          new Notification(titulo, defaultOpts);
        }
      } catch (err) {
        console.warn('Error al lanzar notificación nativa:', err);
      }
    }

    // Mostrar siempre Toast visual integrado
    this.mostrarToast(titulo, (opciones.body as string) || '', 'info');
  }

  mostrarToast(titulo: string, mensaje: string, tipo: 'success' | 'info' | 'warning' | 'error' = 'info') {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: AlertaToast = { id, titulo, mensaje, tipo };
    this.toasts.push(toast);

    setTimeout(() => {
      this.removerToast(id);
    }, 4500);
  }

  removerToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
