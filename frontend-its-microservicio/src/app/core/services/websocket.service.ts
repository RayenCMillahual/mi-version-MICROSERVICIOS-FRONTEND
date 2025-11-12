// src/app/core/services/websocket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private messagesSubject = new Subject<WebSocketMessage>();
  private destroy$ = new Subject<void>();
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: any;

  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public messages$ = this.messagesSubject.asObservable();

  // CAMBIO IMPORTANTE: Deshabilitar WebSocket por defecto
  private readonly WS_ENABLED = false; // Cambiar a true cuando tengas servidor WS
  private readonly WS_URL = 'ws://localhost:3001';

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    // Solo conectar si está habilitado
    if (this.WS_ENABLED) {
      this.authService.currentUser$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(user => {
        if (user) {
          this.connect();
        } else {
          this.disconnect();
        }
      });
    } else {
      // Simular conexión exitosa para no mostrar errores
      this.connectionStatusSubject.next(true);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }

  connect(): void {
    if (!this.WS_ENABLED) {
      console.log('WebSocket deshabilitado. Usa WS_ENABLED = true para habilitar.');
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const token = this.authService.getToken();
      const url = `${this.WS_URL}?token=${token}`;
      
      this.socket = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connectionStatusSubject.next(false);
    this.reconnectAttempts = 0;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.joinRooms();
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
        this.messagesSubject.next(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectionStatusSubject.next(false);
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.stopHeartbeat();
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'STOCK_UPDATE':
        // Manejar actualización de stock
        break;
      case 'USER_ACTIVITY':
        // Manejar actividad de usuarios
        break;
      case 'PONG':
        // Heartbeat response
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private joinRooms(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.send({
      type: 'JOIN_ROOM',
      data: { room: `user_${user.userId}` }
    });

    if (user.username === 'admin') {
      this.send({
        type: 'JOIN_ROOM',
        data: { room: 'admin' }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'PING', data: {} });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (!this.WS_ENABLED) return;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(message: Partial<WebSocketMessage>): void {
    if (!this.WS_ENABLED) {
      console.log('WebSocket disabled, message not sent:', message);
      return;
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        timestamp: Date.now(),
        ...message
      } as WebSocketMessage;
      
      this.socket.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Métodos de conveniencia
  onStockUpdates() {
    return this.messages$.pipe(
      filter(message => message.type === 'STOCK_UPDATE')
    );
  }

  onUserActivity() {
    return this.messages$.pipe(
      filter(message => message.type === 'USER_ACTIVITY')
    );
  }

  notifyStockUpdate(productId: string, newStock: number, productName: string): void {
    this.send({
      type: 'STOCK_UPDATE',
      data: { productId, newStock, productName }
    });
  }

  notifyUserActivity(action: string, details: any): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.send({
        type: 'USER_ACTIVITY',
        data: {
          userId: user.userId,
          action,
          details
        }
      });
    }
  }
}