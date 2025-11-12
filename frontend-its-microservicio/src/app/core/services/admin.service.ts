// src/app/core/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ====== GESTIÓN DE USUARIOS ======
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/users/${id}`);
  }

  // ====== GESTIÓN DE FACTURAS (ADMIN) ======
  getAllInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/invoices`);
  }

  updateInvoice(id: string, invoiceData: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/invoices/${id}`, invoiceData);
  }

  deleteInvoice(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/invoices/${id}`);
  }

  // ====== GESTIÓN DE PRODUCTOS (ADMIN) ======
  createProduct(product: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/products/${id}`);
  }

  // ====== REPORTES Y ESTADÍSTICAS ======
  getDashboardStats(): Observable<any> {
    // Esta función podría llamar a múltiples endpoints para obtener estadísticas
    return this.http.get<any>(`${this.baseUrl}/admin/stats`);
  }

  getSalesReport(dateFrom: string, dateTo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/reports/sales`, {
      params: { from: dateFrom, to: dateTo }
    });
  }

  getTopProducts(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/top-products`, {
      params: { limit: limit.toString() }
    });
  }

  getTopCustomers(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/reports/top-customers`, {
      params: { limit: limit.toString() }
    });
  }

  // ====== GESTIÓN DE STOCK ======
  getLowStockProducts(threshold: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/products/low-stock`, {
      params: { threshold: threshold.toString() }
    });
  }

  updateStock(productId: string, newStock: number): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/admin/products/${productId}/stock`, {
      stock: newStock
    });
  }
}