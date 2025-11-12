// src/app/features/products/product-list/product-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, startWith } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSkeletonComponent, DecimalPipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <button (click)="goBack()" class="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
              <span class="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {{ filteredProducts().length }} disponibles
              </span>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="flex items-center" *ngIf="isConnected()">
                <div class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span class="text-sm text-gray-600">En vivo</span>
              </div>
              
              <button 
                (click)="goToCart()"
                class="relative p-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H2.6M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v2a1 1 0 001 1h1M17 21v-2a1 1 0 00-1-1h-4a1 1 0 00-1 1v2a1 1 0 001 1h4a1 1 0 001-1z"></path>
                </svg>
                <span 
                  *ngIf="cartItems() > 0" 
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center animate-bounce"
                >
                  {{ cartItems() }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Filters -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-2">
              <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
                Buscar productos
              </label>
              <div class="relative">
                <input
                  id="search"
                  type="text"
                  [formControl]="searchControl"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Buscar por nombre o descripción..."
                />
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                id="category"
                [formControl]="categoryControl"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las categorías</option>
                <option *ngFor="let category of categories()" [value]="category">
                  {{ category }}
                </option>
              </select>
            </div>

            <div>
              <label for="sort" class="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                id="sort"
                [formControl]="sortControl"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="price-asc">Precio (Menor)</option>
                <option value="price-desc">Precio (Mayor)</option>
                <option value="stock-desc">Stock (Mayor)</option>
                <option value="stock-asc">Stock (Menor)</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <label class="flex items-center">
              <input
                type="checkbox"
                [formControl]="showOutOfStockControl"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Mostrar productos sin stock</span>
            </label>

            <button
              (click)="resetFilters()"
              class="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <app-loading-skeleton 
          *ngIf="loading()" 
          type="product-list" 
          [count]="8">
        </app-loading-skeleton>

        <!-- Empty State -->
        <div *ngIf="!loading() && filteredProducts().length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
          <p class="text-gray-600 text-lg mb-2">No hay productos disponibles</p>
          <p class="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>

        <!-- Products Grid -->
        <div 
          *ngIf="!loading() && filteredProducts().length > 0" 
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div 
            *ngFor="let product of paginatedProducts(); trackBy: trackByProductId"
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            [class.opacity-60]="product.isOutOfStock"
          >
            <div class="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>

              <div class="absolute top-2 right-2">
                <span 
                  *ngIf="product.isOutOfStock" 
                  class="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-medium"
                >
                  Sin stock
                </span>
                <span 
                  *ngIf="product.isLowStock && !product.isOutOfStock" 
                  class="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full font-medium"
                >
                  Poco stock
                </span>
              </div>
            </div>
            
            <div class="p-6">
              <div class="mb-2">
                <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">{{ product.name }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ product.category }}</p>
              </div>
              
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ product.description || 'Sin descripción disponible' }}
              </p>
              
              <div class="flex items-center justify-between mb-4">
                <span class="text-2xl font-bold text-gray-900">
                  {{ product.price | currency:'USD':'symbol':'1.2-2' }}
                </span>
                <div class="text-right">
                  <span class="text-sm text-gray-500">Stock:</span>
                  <span 
                    class="text-sm font-medium ml-1"
                    [class]="getStockClass(product.stock)"
                  >
                    {{ product.stock }}
                  </span>
                </div>
              </div>
              
              <button 
                (click)="addToCart(product)"
                [disabled]="product.isOutOfStock || isAddingToCart(product.id)"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <svg 
                  *ngIf="!isAddingToCart(product.id)" 
                  class="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H2.6M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005 16v2a1 1 0 001 1h1M17 21v-2a1 1 0 00-1-1h-4a1 1 0 00-1 1v2a1 1 0 001 1h4a1 1 0 001-1z"></path>
                </svg>
                <div 
                  *ngIf="isAddingToCart(product.id)" 
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
                ></div>
                
                <span *ngIf="product.isOutOfStock">Sin stock</span>
                <span *ngIf="!product.isOutOfStock && !isAddingToCart(product.id)">Agregar al carrito</span>
                <span *ngIf="isAddingToCart(product.id)">Agregando...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div 
          *ngIf="!loading() && filteredProducts().length > itemsPerPage" 
          class="flex justify-center items-center space-x-2 mt-8"
        >
          <button
            (click)="goToPage(currentPage() - 1)"
            [disabled]="currentPage() === 1"
            class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          
          <span 
            *ngFor="let page of getPageNumbers()" 
            class="px-3 py-2 cursor-pointer rounded-lg transition-colors"
            [class.bg-blue-600]="page === currentPage()"
            [class.text-white]="page === currentPage()"
            [class.hover:bg-gray-50]="page !== currentPage()"
            (click)="goToPage(page)"
          >
            {{ page }}
          </span>
          
          <button
            (click)="goToPage(currentPage() + 1)"
            [disabled]="currentPage() === totalPages()"
            class="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Signals para datos
  products = signal<Product[]>([]);
  loading = signal(true);
  cartItems = signal(0);
  isConnected = signal(false);
  currentPage = signal(1);
  addingToCartIds = signal<Set<string>>(new Set());
  
  // Signals para filtros (convertidos desde FormControls)
  searchTerm = signal('');
  selectedCategory = signal('');
  sortValue = signal('name-asc');
  showOutOfStock = signal(false);

  // Form controls
  searchControl = new FormControl<string>('');
  categoryControl = new FormControl<string>('');
  sortControl = new FormControl<string>('name-asc');
  showOutOfStockControl = new FormControl<boolean>(false);

  itemsPerPage = 12;
  private destroy$ = new Subject<void>();

  // Computed properties
  categories = computed(() => {
    const cats = [...new Set(this.products().map(p => p.category).filter(Boolean))];
    return cats.sort();
  });

  filteredProducts = computed(() => {
    let filtered = this.products();
    
    // Search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(p => 
        (p.name || '').toLowerCase().includes(search) ||
        (p.description || '').toLowerCase().includes(search) ||
        (p.category || '').toLowerCase().includes(search)
      );
    }

    // Category filter
    const category = this.selectedCategory();
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    // Stock filter
    if (!this.showOutOfStock()) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sort
    const [sortBy, direction] = this.sortValue().split('-');
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
      }
      
      return direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.itemsPerPage);
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts().slice(start, end);
  });

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupFormListeners();
    this.setupWebSocketListeners();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFormListeners(): void {
    // Conectar FormControls con signals
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.searchTerm.set(value || '');
      this.currentPage.set(1);
    });

    this.categoryControl.valueChanges.pipe(
      startWith(''),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.selectedCategory.set(value || '');
      this.currentPage.set(1);
    });

    this.sortControl.valueChanges.pipe(
      startWith('name-asc'),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.sortValue.set(value || 'name-asc');
      this.currentPage.set(1);
    });

    this.showOutOfStockControl.valueChanges.pipe(
      startWith(false),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.showOutOfStock.set(value || false);
      this.currentPage.set(1);
    });
  }

  private setupWebSocketListeners(): void {
    this.webSocketService.connectionStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(connected => {
      this.isConnected.set(connected);
    });

    this.webSocketService.onStockUpdates().pipe(
      takeUntil(this.destroy$)
    ).subscribe(message => {
      this.handleStockUpdate(message.data);
    });

    this.cartService.cartItems$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(count => {
      this.cartItems.set(count);
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (products) => {
        console.log('Productos cargados:', products); // Debug
        const enhanced = products.map(p => ({
          ...p,
          isLowStock: p.stock > 0 && p.stock <= 5,
          isOutOfStock: p.stock === 0
        }));
        this.products.set(enhanced);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error(
          'Error al cargar productos',
          'No se pudieron cargar los productos'
        );
        this.loading.set(false);
      }
    });
  }

  private handleStockUpdate(data: { productId: string; newStock: number; productName: string }): void {
    const currentProducts = this.products();
    const index = currentProducts.findIndex(p => p.id === data.productId);
    
    if (index !== -1) {
      const updated = [...currentProducts];
      updated[index] = {
        ...updated[index],
        stock: data.newStock,
        isLowStock: data.newStock > 0 && data.newStock <= 5,
        isOutOfStock: data.newStock === 0
      };
      this.products.set(updated);
    }
  }

  addToCart(product: Product): void {
    if (product.isOutOfStock || this.isAddingToCart(product.id)) return;

    const currentAdding = new Set(this.addingToCartIds());
    currentAdding.add(product.id);
    this.addingToCartIds.set(currentAdding);

    this.cartService.addToCart(product.id, 1, product.name).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        const updatedAdding = new Set(this.addingToCartIds());
        updatedAdding.delete(product.id);
        this.addingToCartIds.set(updatedAdding);
      },
      error: () => {
        const updatedAdding = new Set(this.addingToCartIds());
        updatedAdding.delete(product.id);
        this.addingToCartIds.set(updatedAdding);
      }
    });
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.sortControl.setValue('name-asc');
    this.showOutOfStockControl.setValue(false);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  isAddingToCart(productId: string): boolean {
    return this.addingToCartIds().has(productId);
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-red-600 font-semibold';
    if (stock <= 5) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  }

  trackByProductId = (index: number, product: Product): string => product.id;

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
