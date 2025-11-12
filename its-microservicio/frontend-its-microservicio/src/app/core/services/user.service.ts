// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ====== GESTIÓN DE PERFIL ======
  getProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${userId}`);
  }

  updateProfile(userId: string, userData: any): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/users/${userId}`, userData);
  }

  // ====== ESTADÍSTICAS DEL USUARIO ======
  getUserStats(userId: string): Observable<any> {
    // Como no hay un endpoint específico para stats, calculamos desde las facturas
    return this.http.get<any[]>(`${this.baseUrl}/invoices/my`).pipe(
      map(invoices => {
        const totalPurchases = invoices.length;
        const totalSpent = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
        const totalItems = invoices.reduce((sum, invoice) => 
          sum + invoice.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
        );

        return {
          totalPurchases,
          totalSpent,
          totalItems
        };
      })
    );
  }

  // ====== GESTIÓN DE FAVORITOS (Futuro) ======
  getFavorites(userId: string): Observable<any[]> {
    // Placeholder para funcionalidad futura
    return this.http.get<any[]>(`${this.baseUrl}/users/${userId}/favorites`);
  }

  addToFavorites(userId: string, productId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/${userId}/favorites`, { productId });
  }

  removeFromFavorites(userId: string, productId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/users/${userId}/favorites/${productId}`);
  }

  // ====== NOTIFICACIONES (Futuro) ======
  getNotifications(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users/${userId}/notifications`);
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/notifications/${notificationId}`, { read: true });
  }
}