// src/app/features/invoices/invoice-list/invoice-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
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
              <h1 class="text-2xl font-bold text-gray-900">Mis Facturas</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">{{ invoices.length }} factura(s)</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Invoices Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Cargando facturas...</p>
        </div>

        <div *ngIf="!loading && invoices.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-gray-600 mb-4">No tienes facturas aún</p>
          <button 
            (click)="goToProducts()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Explorar Productos
          </button>
        </div>

        <!-- Invoices List -->
        <div *ngIf="!loading && invoices.length > 0" class="space-y-6">
          <div *ngFor="let invoice of invoices" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <!-- Invoice Header -->
            <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    Factura #{{ invoice.id.substring(0, 8) }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ invoice.createdAt | date:'medium' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-gray-900">
                    \${{ invoice.total | number:'1.2-2' }}
                  </p>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completada
                  </span>
                </div>
              </div>
            </div>

            <!-- Invoice Items -->
            <div class="px-6 py-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">
                Artículos comprados ({{ invoice.items.length }})
              </h4>
              <div class="space-y-3">
                <div *ngFor="let item of invoice.items" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">Producto {{ item.productId.substring(0, 8) }}</p>
                      <p class="text-sm text-gray-600">Cantidad: {{ item.quantity }} | Precio: \${{ item.price | number:'1.2-2' }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-900">
                      \${{ (item.quantity * item.price) | number:'1.2-2' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Invoice Actions -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <div class="text-sm text-gray-600">
                  Total de {{ getInvoiceItemsCount(invoice) }} artículo(s)
                </div>
                <div class="flex space-x-3">
                  <button 
                    (click)="viewInvoiceDetails(invoice)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver Detalles
                  </button>
                  <button 
                    (click)="downloadInvoice(invoice)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium">
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div *ngIf="!loading && invoices.length > 0" class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Resumen de Compras</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <p class="text-3xl font-bold text-blue-600">{{ invoices.length }}</p>
              <p class="text-sm text-gray-600">Total Facturas</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-green-600">
                {{ getTotalItemsCount() }}
              </p>
              <p class="text-sm text-gray-600">Productos Comprados</p>
            </div>
            <div class="text-center">
              <p class="text-3xl font-bold text-purple-600">
                \${{ getTotalAmount() | number:'1.2-2' }}
              </p>
              <p class="text-sm text-gray-600">Total Gastado</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  loading = true;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.loading = true;
    this.invoiceService.getMyInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading = false;
      }
    });
  }

  viewInvoiceDetails(invoice: any) {
    // Aquí podrías navegar a una vista detallada de la factura
    console.log('Ver detalles de factura:', invoice);
    alert(`Factura #${invoice.id.substring(0, 8)}\nTotal: ${invoice.total}\nFecha: ${new Date(invoice.createdAt).toLocaleDateString()}`);
  }

  downloadInvoice(invoice: any) {
    // Aquí implementarías la lógica para descargar el PDF
    console.log('Descargar factura:', invoice);
    alert('Función de descarga en desarrollo');
  }

  getTotalItemsCount(): number {
    return this.invoices.reduce((total, invoice) => 
      total + this.getInvoiceItemsCount(invoice), 0
    );
  }

  getInvoiceItemsCount(invoice: any): number {
    return invoice.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  }

  getTotalAmount(): number {
    return this.invoices.reduce((total, invoice) => total + invoice.total, 0);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }
}