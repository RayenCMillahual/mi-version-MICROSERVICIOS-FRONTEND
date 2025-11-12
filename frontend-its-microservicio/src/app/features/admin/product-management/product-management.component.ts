// src/app/features/admin/product-management/product-management.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { AdminService } from '../../../core/services/admin.service';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
              <h1 class="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
              <span class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                ADMIN
              </span>
            </div>
            <button 
              (click)="showCreateForm.set(true)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nuevo Producto
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Create/Edit Product Form -->
        <div *ngIf="showCreateForm() || editingProduct()" class="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ editingProduct() ? 'Editar Producto' : 'Crear Nuevo Producto' }}
              </h2>
              <button 
                (click)="cancelEdit()" 
                class="text-gray-400 hover:text-gray-600 transition-colors"
                title="Cerrar">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6">
            <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del producto"
                  />
                  <div *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched" 
                       class="text-red-600 text-sm mt-1">
                    El nombre es requerido
                  </div>
                </div>

                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <input
                    id="category"
                    type="text"
                    formControlName="category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Categoría del producto"
                  />
                </div>
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  formControlName="description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del producto"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="price" class="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      formControlName="price"
                      class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched" 
                       class="text-red-600 text-sm mt-1">
                    El precio debe ser mayor a 0
                  </div>
                </div>

                <div>
                  <label for="stock" class="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    formControlName="stock"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <div *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched" 
                       class="text-red-600 text-sm mt-1">
                    El stock debe ser mayor o igual a 0
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  (click)="cancelEdit()"
                  class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="productForm.invalid || loading()"
                  class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <span *ngIf="!loading()">{{ editingProduct() ? 'Actualizar' : 'Crear' }} Producto</span>
                  <span *ngIf="loading()">{{ editingProduct() ? 'Actualizando...' : 'Creando...' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div *ngIf="successMessage()" class="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-700">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
          {{ errorMessage() }}
        </div>

        <!-- Products List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900">Lista de Productos</h2>
              <div class="text-sm text-gray-600">
                {{ products().length }} producto(s) registrado(s)
              </div>
            </div>
          </div>
          
          <div *ngIf="loadingProducts()" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando productos...</p>
          </div>

          <div *ngIf="!loadingProducts() && products().length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
            <p class="text-gray-600 mb-2">No hay productos registrados</p>
            <button 
              (click)="showCreateForm.set(true)"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Crear el primer producto
            </button>
          </div>

          <div *ngIf="!loadingProducts() && products().length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let product of products(); trackBy: trackByProductId" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                        <div class="text-sm text-gray-500 line-clamp-1">{{ product.description || 'Sin descripción' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ product.category || 'Sin categoría' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    \${{ product.price | number:'1.2-2' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span [class]="getStockClass(product.stock)">
                      {{ product.stock }} unidades
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStatusClass(product.stock)" 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getStatusText(product.stock) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        (click)="editProduct(product)"
                        [disabled]="loading()"
                        class="text-indigo-600 hover:text-indigo-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        (click)="deleteProduct(product)"
                        [disabled]="deleting()"
                        class="text-red-600 hover:text-red-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  // Signals
  products = signal<Product[]>([]);
  showCreateForm = signal(false);
  editingProduct = signal<Product | null>(null);
  loading = signal(false);
  loadingProducts = signal(true);
  deleting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  // Form
  productForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['']
    });
  }

  ngOnInit() {
    console.log('Iniciando Product Management...'); // Debug
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    console.log('Cargando productos...'); // Debug
    this.loadingProducts.set(true);
    
    this.productService.getProducts().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (products) => {
        console.log('Productos cargados:', products.length); // Debug
        this.products.set(products);
        this.loadingProducts.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage.set('Error al cargar los productos');
        this.loadingProducts.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      console.log('Enviando formulario...', this.productForm.value); // Debug
      this.loading.set(true);
      this.clearMessages();

      const productData: ProductFormData = this.productForm.value;
      const currentEditingProduct = this.editingProduct();

      if (currentEditingProduct) {
        // Update existing product
        console.log('Actualizando producto:', currentEditingProduct.id); // Debug
        this.adminService.updateProduct(currentEditingProduct.id, productData).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (response) => {
            console.log('Producto actualizado:', response); // Debug
            this.successMessage.set(`Producto "${productData.name}" actualizado exitosamente`);
            this.cancelEdit();
            this.loadProducts();
            this.loading.set(false);
            setTimeout(() => this.clearMessages(), 5000);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.errorMessage.set('Error al actualizar el producto');
            this.loading.set(false);
            this.cdr.markForCheck();
          }
        });
      } else {
        // Create new product
        console.log('Creando nuevo producto'); // Debug
        this.adminService.createProduct(productData).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (response) => {
            console.log('Producto creado:', response); // Debug
            this.successMessage.set(`Producto "${productData.name}" creado exitosamente`);
            this.cancelEdit();
            this.loadProducts();
            this.loading.set(false);
            setTimeout(() => this.clearMessages(), 5000);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.errorMessage.set('Error al crear el producto');
            this.loading.set(false);
            this.cdr.markForCheck();
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  editProduct(product: Product) {
    console.log('Editando producto:', product.name); // Debug
    this.editingProduct.set(product);
    this.showCreateForm.set(false);
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category: product.category || ''
    });
    this.clearMessages();
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteProduct(product: Product) {
    const confirmMessage = `¿Estás seguro de que quieres eliminar el producto "${product.name}"?\n\nPrecio: $${product.price.toFixed(2)}\nStock: ${product.stock} unidades\n\nEsta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    console.log('Eliminando producto:', product.name); // Debug
    this.deleting.set(true);
    this.clearMessages();

    this.adminService.deleteProduct(product.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Producto eliminado:', response); // Debug
        this.successMessage.set(`Producto "${product.name}" eliminado exitosamente`);
        this.deleting.set(false);
        this.loadProducts();
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.errorMessage.set('Error al eliminar el producto. Intenta nuevamente.');
        this.deleting.set(false);
        this.cdr.markForCheck();
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  cancelEdit() {
    this.showCreateForm.set(false);
    this.editingProduct.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: ''
    });
    this.clearMessages();
  }

  private clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-red-600 font-semibold';
    if (stock <= 5) return 'text-yellow-600 font-semibold';
    if (stock <= 10) return 'text-orange-600';
    return 'text-green-600';
  }

  getStatusClass(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= 5) return 'bg-yellow-100 text-yellow-800';
    if (stock <= 10) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  }

  getStatusText(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return 'Stock crítico';
    if (stock <= 10) return 'Stock bajo';
    return 'Disponible';
  }

  trackByProductId = (index: number, product: Product): string => product.id;

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
