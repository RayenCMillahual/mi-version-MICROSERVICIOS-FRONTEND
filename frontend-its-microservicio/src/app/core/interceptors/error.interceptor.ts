// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, retryWhen, delayWhen, take, concat } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retryWhen(errors => this.getRetryStrategy(errors, req)),
      catchError((error: HttpErrorResponse) => this.handleError(error, req))
    );
  }

  private getRetryStrategy(errors: Observable<any>, req: HttpRequest<any>) {
    return errors.pipe(
      delayWhen((error, index) => {
        // Solo reintentar para ciertos tipos de errores y métodos
        if (this.shouldRetry(error, req, index)) {
          const delay = this.retryDelay * Math.pow(2, index); // Exponential backoff
          console.log(`Reintentando request en ${delay}ms (intento ${index + 1}/${this.maxRetries})`);
          return timer(delay);
        }
        return throwError(error);
      }),
      take(this.maxRetries),
      concat(throwError('Max retries exceeded'))
    );
  }

  private shouldRetry(error: HttpErrorResponse, req: HttpRequest<any>, retryCount: number): boolean {
    // No reintentar si ya excedimos el máximo
    if (retryCount >= this.maxRetries) {
      return false;
    }

    // No reintentar para métodos que no son idempotentes (excepto GET)
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return false;
    }

    // Solo reintentar para errores de red o errores 5xx del servidor
    return (
      error.status === 0 || // Error de red
      error.status === 408 || // Request timeout
      error.status === 429 || // Too many requests
      (error.status >= 500 && error.status < 600) // Errores del servidor
    );
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>): Observable<never> {
    let errorMessage = 'Ha ocurrido un error inesperado';
    let errorTitle = 'Error';
    let showNotification = true;

    switch (error.status) {
      case 0:
        // Error de red
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
        this.notificationService.networkError();
        showNotification = false;
        break;

      case 400:
        errorTitle = 'Datos inválidos';
        errorMessage = this.extractErrorMessage(error) || 'Los datos enviados no son válidos';
        break;

      case 401:
        errorTitle = 'No autorizado';
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        this.handleUnauthorized();
        break;

      case 403:
        errorTitle = 'Acceso denegado';
        errorMessage = 'No tienes permisos para realizar esta acción';
        break;

      case 404:
        errorTitle = 'No encontrado';
        errorMessage = 'El recurso solicitado no fue encontrado';
        break;

      case 409:
        errorTitle = 'Conflicto';
        errorMessage = this.extractErrorMessage(error) || 'El recurso ya existe o hay un conflicto';
        break;

      case 422:
        errorTitle = 'Error de validación';
        errorMessage = this.extractValidationErrors(error);
        break;

      case 429:
        errorTitle = 'Demasiadas solicitudes';
        errorMessage = 'Has realizado demasiadas solicitudes. Espera un momento antes de intentar nuevamente.';
        break;

      case 500:
        errorTitle = 'Error del servidor';
        errorMessage = 'Error interno del servidor. El equipo técnico ha sido notificado.';
        break;

      case 502:
      case 503:
      case 504:
        errorTitle = 'Servicio no disponible';
        errorMessage = 'El servicio está temporalmente no disponible. Intenta nuevamente en unos minutos.';
        break;

      default:
        if (error.status >= 400) {
          errorMessage = this.extractErrorMessage(error) || `Error ${error.status}: ${error.statusText}`;
        }
    }

    // Mostrar notificación si corresponde
    if (showNotification) {
      this.notificationService.error(errorTitle, errorMessage, {
        duration: this.getErrorNotificationDuration(error.status)
      });
    }

    // Log detallado para debugging
    this.logError(error, req);

    return throwError(error);
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error) {
      // Estructura típica de errores de NestJS
      if (error.error.message) {
        if (Array.isArray(error.error.message)) {
          return error.error.message.join(', ');
        }
        return error.error.message;
      }
      
      // Otros formatos posibles
      if (typeof error.error === 'string') {
        return error.error;
      }
      
      if (error.error.error) {
        return error.error.error;
      }
    }
    
    return '';
  }

  private extractValidationErrors(error: HttpErrorResponse): string {
    const message = this.extractErrorMessage(error);
    
    if (error.error?.validationErrors) {
      const errors = Object.values(error.error.validationErrors).flat();
      return errors.join(', ');
    }
    
    return message || 'Error de validación en los datos enviados';
  }

  private handleUnauthorized(): void {
    // Limpiar la sesión y redirigir al login
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }

  private getErrorNotificationDuration(status: number): number {
    switch (status) {
      case 401:
      case 403:
        return 8000; // Errores de autenticación/autorización más tiempo
      case 500:
      case 502:
      case 503:
      case 504:
        return 10000; // Errores del servidor más tiempo
      default:
        return 6000;
    }
  }

  private logError(error: HttpErrorResponse, req: HttpRequest<any>): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      userAgent: navigator.userAgent,
      userId: this.authService.getCurrentUser()?.userId
    };

    console.group(`%c HTTP Error ${error.status}`, 'color: red; font-weight: bold');
    console.log('Request:', req);
    console.log('Error:', error);
    console.log('Error Details:', errorLog);
    console.groupEnd();

    // En producción, aquí enviarías el error a un servicio de logging
    // como Sentry, LogRocket, etc.
    if (error.status >= 500) {
      this.sendErrorToLoggingService(errorLog);
    }
  }

  private sendErrorToLoggingService(errorLog: any): void {
    // Implementar integración con servicio de logging externo
    // Ejemplo: Sentry, LogRocket, etc.
    console.log('Sending error to logging service:', errorLog);
  }
}