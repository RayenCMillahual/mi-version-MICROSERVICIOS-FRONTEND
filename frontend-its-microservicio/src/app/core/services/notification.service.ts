// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
  persistent?: boolean;
}

export interface ToastPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private position: ToastPosition = { vertical: 'top', horizontal: 'right' };

  constructor() {}

  private addNotification(notification: Omit<Notification, 'id'>) {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      duration: notification.duration || this.getDefaultDuration(notification.type)
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-remove after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration! > 0) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }

  success(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({ 
      type: 'success', 
      title, 
      message, 
      ...options 
    });
  }

  error(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({ 
      type: 'error', 
      title, 
      message, 
      duration: 8000,
      ...options 
    });
  }

  warning(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({ 
      type: 'warning', 
      title, 
      message, 
      ...options 
    });
  }

  info(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({ 
      type: 'info', 
      title, 
      message, 
      ...options 
    });
  }

  // Métodos de conveniencia para acciones comunes
  successfulLogin(username: string): string {
    return this.success(
      'Bienvenido',
      `Hola ${username}, has iniciado sesión correctamente`
    );
  }

  productAddedToCart(productName: string): string {
    return this.success(
      'Producto agregado',
      `${productName} se agregó a tu carrito`,
      { duration: 3000 }
    );
  }

  lowStock(productName: string, stock: number): string {
    return this.warning(
      'Stock bajo',
      `Solo quedan ${stock} unidades de ${productName}`,
      { 
        duration: 6000,
        action: {
          label: 'Ver carrito',
          handler: () => window.location.href = '/cart'
        }
      }
    );
  }

  outOfStock(productName: string): string {
    return this.error(
      'Sin stock',
      `${productName} ya no está disponible`,
      { 
        persistent: true,
        action: {
          label: 'Quitar del carrito',
          handler: () => {
            // La implementación específica se manejará en el componente
          }
        }
      }
    );
  }

  networkError(): string {
    return this.error(
      'Error de conexión',
      'No se pudo conectar con el servidor. Revisa tu conexión.',
      { 
        persistent: true,
        action: {
          label: 'Reintentar',
          handler: () => window.location.reload()
        }
      }
    );
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(notification => notification.id !== id)
    );
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }

  setPosition(position: ToastPosition): void {
    this.position = position;
  }

  getPosition(): ToastPosition {
    return this.position;
  }

  private getDefaultDuration(type: string): number {
    switch (type) {
      case 'error': return 7000;
      case 'warning': return 6000;
      case 'success': return 4000;
      case 'info': return 5000;
      default: return 5000;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}