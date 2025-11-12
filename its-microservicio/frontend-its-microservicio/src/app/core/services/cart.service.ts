// src/app/core/services/cart.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { tap, takeUntil, map, catchError, switchMap } from 'rxjs/operators';
import { NotificationService } from './notification.service';
import { WebSocketService } from './websocket.service';

export interface CartItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  totalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private apiUrl = 'http://localhost:3000/cart';
  private cartSubject = new BehaviorSubject<Cart>({ items: [], total: 0, totalItems: 0 });
  private cartItemsCountSubject = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();

  public cart$ = this.cartSubject.asObservable();
  public cartItems$ = this.cartItemsCountSubject.asObservable();

  // Cache para optimistic updates
  private pendingOperations = new Set<string>();

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private webSocketService: WebSocketService
  ) {
    this.initializeService();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeService(): void {
    // Cargar carrito inicial
    this.loadCartCount();

    // Escuchar actualizaciones de stock en tiempo real
    this.webSocketService.onStockUpdates().pipe(
      takeUntil(this.destroy$)
    ).subscribe(message => {
      this.handleStockUpdate(message.data);
    });

    // Recargar carrito cuando se reconecte WebSocket
    this.webSocketService.connectionStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(connected => {
      if (connected) {
        this.loadCartCount();
      }
    });
  }

  getCart(): Observable<Cart> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(cartData => this.mapCartData(cartData)),
      tap(cart => {
        this.cartSubject.next(cart);
        this.cartItemsCountSubject.next(cart.totalItems);
      }),
      catchError(error => {
        this.notificationService.error(
          'Error al cargar carrito',
          'No se pudo cargar tu carrito de compras'
        );
        throw error;
      })
    );
  }

  addToCart(productId: string, quantity: number = 1, productName?: string): Observable<any> {
    const operationId = `add_${productId}_${Date.now()}`;
    this.pendingOperations.add(operationId);

    // Optimistic update
    this.optimisticAddToCart(productId, quantity);

    return this.http.post<any>(`${this.apiUrl}/add`, { productId, quantity }).pipe(
      tap(response => {
        // Update real data
        this.loadCartCount();
        
        if (productName) {
          this.notificationService.productAddedToCart(productName);
        } else {
          this.notificationService.success(
            'Producto agregado',
            'El producto se agregó a tu carrito exitosamente'
          );
        }

        // Notificar actividad a través de WebSocket
        this.webSocketService.notifyUserActivity('ADD_TO_CART', {
          productId,
          quantity
        });
      }),
      catchError(error => {
        // Revertir optimistic update
        this.revertOptimisticUpdate();
        
        if (error.status === 409) {
          this.notificationService.error(
            'Stock insuficiente',
            'No hay suficiente stock para agregar este producto'
          );
        } else {
          this.notificationService.error(
            'Error al agregar producto',
            'No se pudo agregar el producto al carrito'
          );
        }
        throw error;
      }),
      tap(() => {
        this.pendingOperations.delete(operationId);
      })
    );
  }

  removeFromCart(productId: string): Observable<any> {
    const operationId = `remove_${productId}_${Date.now()}`;
    this.pendingOperations.add(operationId);

    // Optimistic update
    this.optimisticRemoveFromCart(productId);

    return this.http.delete<any>(`${this.apiUrl}/item`, { 
      body: { productId } 
    }).pipe(
      tap(() => {
        this.loadCartCount();
        this.notificationService.success(
          'Producto eliminado',
          'El producto se eliminó de tu carrito'
        );
      }),
      catchError(error => {
        this.revertOptimisticUpdate();
        this.notificationService.error(
          'Error al eliminar producto',
          'No se pudo eliminar el producto del carrito'
        );
        throw error;
      }),
      tap(() => {
        this.pendingOperations.delete(operationId);
      })
    );
  }

  updateCartItem(productId: string, quantity: number): Observable<any> {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    const operationId = `update_${productId}_${Date.now()}`;
    this.pendingOperations.add(operationId);

    // Optimistic update
    this.optimisticUpdateQuantity(productId, quantity);

    return this.http.patch<any>(`${this.apiUrl}/item`, { productId, quantity }).pipe(
      tap(() => {
        this.loadCartCount();
      }),
      catchError(error => {
        this.revertOptimisticUpdate();
        
        if (error.status === 409) {
          this.notificationService.error(
            'Stock insuficiente',
            'No hay suficiente stock para esta cantidad'
          );
        } else {
          this.notificationService.error(
            'Error al actualizar cantidad',
            'No se pudo actualizar la cantidad del producto'
          );
        }
        throw error;
      }),
      tap(() => {
        this.pendingOperations.delete(operationId);
      })
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/clear`).pipe(
      tap(() => {
        this.cartSubject.next({ items: [], total: 0, totalItems: 0 });
        this.cartItemsCountSubject.next(0);
        this.notificationService.success(
          'Carrito vaciado',
          'Se eliminaron todos los productos de tu carrito'
        );
      }),
      catchError(error => {
        this.notificationService.error(
          'Error al vaciar carrito',
          'No se pudo vaciar el carrito'
        );
        throw error;
      })
    );
  }

  checkout(): Observable<any> {
    // Validar carrito antes del checkout
    return this.validateCartBeforeCheckout().pipe(
      switchMap(isValid => {
        if (!isValid) {
          throw new Error('Cart validation failed');
        }
        
        return this.http.post<any>(`${this.apiUrl}/checkout`, {});
      }),
      tap(response => {
        this.cartSubject.next({ items: [], total: 0, totalItems: 0 });
        this.cartItemsCountSubject.next(0);
        
        this.notificationService.success(
          'Compra exitosa',
          `Tu factura #${response.invoiceId?.substring(0, 8)} ha sido generada`,
          {
            duration: 8000,
            action: {
              label: 'Ver factura',
              handler: () => window.location.href = '/invoices'
            }
          }
        );

        // Notificar compra a través de WebSocket
        this.webSocketService.notifyUserActivity('NEW_PURCHASE', {
          invoiceId: response.invoiceId,
          total: response.total
        });
      }),
      catchError(error => {
        if (error.status === 409) {
          this.notificationService.error(
            'Stock insuficiente',
            'Algunos productos ya no tienen stock suficiente. Revisa tu carrito.',
            {
              action: {
                label: 'Revisar carrito',
                handler: () => window.location.href = '/cart'
              }
            }
          );
        } else {
          this.notificationService.error(
            'Error en la compra',
            'No se pudo procesar tu compra. Intenta nuevamente.'
          );
        }
        throw error;
      })
    );
  }

  private validateCartBeforeCheckout(): Observable<boolean> {
    return this.getCart().pipe(
      map(cart => {
        if (cart.items.length === 0) {
          this.notificationService.warning(
            'Carrito vacío',
            'No puedes realizar una compra con el carrito vacío'
          );
          return false;
        }

        // Verificar que todos los productos tengan stock
        const outOfStockItems = cart.items.filter(item => item.quantity > item.maxStock);
        if (outOfStockItems.length > 0) {
          const productNames = outOfStockItems.map(item => item.productName).join(', ');
          this.notificationService.error(
            'Productos sin stock',
            `Los siguientes productos no tienen stock suficiente: ${productNames}`
          );
          return false;
        }

        return true;
      })
    );
  }

  private handleStockUpdate(data: { productId: string; newStock: number; productName: string }): void {
    const currentCart = this.cartSubject.value;
    const affectedItem = currentCart.items.find(item => item.productId === data.productId);

    if (!affectedItem) return;

    // Si el producto está en el carrito y se quedó sin stock
    if (data.newStock === 0) {
      this.notificationService.error(
        'Producto sin stock',
        `${data.productName} ya no está disponible y será removido de tu carrito`,
        {
          persistent: true,
          action: {
            label: 'Quitar del carrito',
            handler: () => {
              this.removeFromCart(data.productId).subscribe();
            }
          }
        }
      );
    } 
    // Si la cantidad en el carrito es mayor al stock disponible
    else if (affectedItem.quantity > data.newStock) {
      this.notificationService.warning(
        'Stock limitado',
        `${data.productName} solo tiene ${data.newStock} unidades disponibles. Se ajustará tu carrito.`,
        {
          action: {
            label: 'Ajustar cantidad',
            handler: () => {
              this.updateCartItem(data.productId, data.newStock).subscribe();
            }
          }
        }
      );
    }

    // Actualizar el carrito con la nueva información de stock
    this.loadCartCount();
  }

  private optimisticAddToCart(productId: string, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.productPrice;
    }

    const newTotal = currentCart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const newTotalItems = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.cartSubject.next({
      ...currentCart,
      total: newTotal,
      totalItems: newTotalItems
    });
    this.cartItemsCountSubject.next(newTotalItems);
  }

  private optimisticRemoveFromCart(productId: string): void {
    const currentCart = this.cartSubject.value;
    const filteredItems = currentCart.items.filter(item => item.productId !== productId);
    
    const newTotal = filteredItems.reduce((sum, item) => sum + item.subtotal, 0);
    const newTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);

    this.cartSubject.next({
      items: filteredItems,
      total: newTotal,
      totalItems: newTotalItems
    });
    this.cartItemsCountSubject.next(newTotalItems);
  }

  private optimisticUpdateQuantity(productId: string, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const item = currentCart.items.find(item => item.productId === productId);

    if (item) {
      item.quantity = quantity;
      item.subtotal = quantity * item.productPrice;
    }

    const newTotal = currentCart.items.reduce((sum, item) => sum + item.subtotal, 0);
    const newTotalItems = currentCart.items.reduce((sum, item) => sum + item.quantity, 0);

    this.cartSubject.next({
      ...currentCart,
      total: newTotal,
      totalItems: newTotalItems
    });
    this.cartItemsCountSubject.next(newTotalItems);
  }

  private revertOptimisticUpdate(): void {
    // Recargar datos del servidor para revertir cambios optimistas
    this.getCart().subscribe();
  }

  private loadCartCount(): void {
    this.getCart().subscribe({
      error: (error) => {
        console.error('Error loading cart:', error);
      }
    });
  }

  private mapCartData(cartData: any): Cart {
    return {
      items: cartData.items || [],
      total: cartData.total || 0,
      totalItems: cartData.totalItems || 0
    };
  }

  // Método para verificar si hay operaciones pendientes
  hasPendingOperations(): boolean {
    return this.pendingOperations.size > 0;
  }

  // Método para obtener el estado del carrito sin hacer request
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }
}