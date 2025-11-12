// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  
  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

login(username: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
    .pipe(
      tap(response => {
        console.log('Respuesta del backend:', response); // Debug
        if (response.access_token) {
          localStorage.setItem(this.tokenKey, response.access_token);
          // Decodificar el token para obtener info del usuario
          const payload = this.decodeToken(response.access_token);
          if (payload) {
            const user = { username: payload.username, userId: payload.sub };
            localStorage.setItem(this.userKey, JSON.stringify(user));
            this.currentUserSubject.next(user);
          } else {
            console.error('No se pudo decodificar el token');
          }
        } else {
          console.error('No se recibió access_token en la respuesta');
        }
      })
    );
}

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token != null && !this.isTokenExpired(token);
  }

private decodeToken(token: string): any {
  try {
    console.log('Token recibido:', token); // Debug
    const payload = token.split('.')[1];
    console.log('Payload extraído:', payload); // Debug
    const decoded = atob(payload);
    console.log('Payload decodificado:', decoded); // Debug
    const parsed = JSON.parse(decoded);
    console.log('Payload parseado:', parsed); // Debug
    return parsed;
  } catch (error) {
    console.error('Error decodificando token:', error); // Debug
    return null;
  }
}

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}