// src/app/features/cart/cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <button (click)="goBack()" class="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-2xl font-bold text-gray-900">Mi Carrito</h1>
            </div>
          </div>
        </div>
      </header>

      <!-- Cart Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Cargando carrito...</p>
        </div>

        <div *ngIf="!loading && (!cart?.items || cart.items.length === 0)" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H2.6M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v2a1 1 0 001 1h1M17 21v-2a1 1 0 00-1-1h-4a1 1 0 00-1 1v2a1 1 0 001 1h4a1 1 0 001-1z"></path>
          </svg>
          <p class="text-gray-600 mb-4">Tu carrito está vacío</p>
          <button 
            (click)="goToProducts()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Explorar Productos
          </button>
        </div>

        <div *ngIf="!loading && cart?.items && cart.items.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Artículos ({{ cart.totalItems }})</h2>
              </div>
              <div class="divide-y divide-gray-200">
                <div *ngFor="let item of cart.items" class="p-6">
                  <div class="flex items-center space-x-4">
                    <!-- Product Image Placeholder -->
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                    
                    <!-- Product Details -->
                    <div class="flex-1">
                      <h3 class="text-lg font-medium text-gray-900">{{ item.productName }}</h3>
                      <p class="text-gray-600">\${{ item.productPrice | number:'1.2-2' }} c/u</p>
                    </div>
                    
                    <!-- Quantity Controls -->
                    <div class="flex items-center space-x-2">
                      <button 
                        (click)="updateQuantity(item, item.quantity - 1)"
                        class="p-1 hover:bg-gray-100 rounded">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                        </svg>
                      </button>
                      <span class="px-3 py-1 bg-gray-100 rounded text-center min-w-[40px]">{{ item.quantity }}</span>
                      <button 
                        (click)="updateQuantity(item, item.quantity + 1)"
                        class="p-1 hover:bg-gray-100 rounded">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                      </button>
                    </div>
                    
                    <!-- Subtotal -->
                    <div class="text-right">
                      <p class="text-lg font-semibold text-gray-900">\${{ item.subtotal | number:'1.2-2' }}</p>
                    </div>
                    
                    <!-- Remove Button -->
                    <button 
                      (click)="removeItem(item)"
                      class="p-1 text-red-600 hover:text-red-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
              
              <div class="space-y-3 mb-6">
                <div class="flex justify-between">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-semibold">\${{ cart.total | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Envío</span>
                  <span class="font-semibold">Gratis</span>
                </div>
                <div class="border-t pt-3">
                  <div class="flex justify-between">
                    <span class="text-lg font-semibold">Total</span>
                    <span class="text-lg font-bold text-gray-900">\${{ cart.total | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
              
              <button 
                (click)="checkout()"
                [disabled]="processingCheckout"
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-semibold transition-colors mb-3">
                <span *ngIf="!processingCheckout">Finalizar Compra</span>
                <span *ngIf="processingCheckout">Procesando...</span>
              </button>
              
              <button 
                (click)="clearCart()"
                class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Vaciar Carrito
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class CartComponent implements OnInit {
  cart: any = null;
  loading = true;
  processingCheckout = false;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
      }
    });
  }

  updateQuantity(item: any, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateCartItem(item.productId, newQuantity).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
      }
    });
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item.productId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error removing item:', error);
      }
    });
  }

  clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      this.cartService.clearCart().subscribe({
        next: () => {
          this.loadCart();
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
        }
      });
    }
  }

  checkout() {
    this.processingCheckout = true;
    this.cartService.checkout().subscribe({
      next: (response) => {
        console.log('Checkout successful:', response);
        alert('¡Compra realizada exitosamente!');
        this.router.navigate(['/invoices']);
      },
      error: (error) => {
        console.error('Error during checkout:', error);
        alert('Error al procesar la compra. Intenta nuevamente.');
        this.processingCheckout = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }
}