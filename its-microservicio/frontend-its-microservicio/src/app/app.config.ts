// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, ErrorHandler } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Global Error Handler
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('Global error caught by ErrorHandler:', error);
    
    if (error?.rejection) {
      console.error('Unhandled promise rejection:', error.rejection);
    }
  }
}

// Loading Interceptor for global loading states
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.activeRequests++;
    this.updateLoadingState();
    
    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;
        this.updateLoadingState();
      })
    );
  }
  
  private updateLoadingState(): void {
    const isLoading = this.activeRequests > 0;
    window.dispatchEvent(new CustomEvent('globalLoading', { detail: { isLoading } }));
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Router configuration
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),
    
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    
    // HTTP Interceptors - ORDEN IMPORTA (Auth primero, luego Error)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    },
    
    // Global Error Handler
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    
    // Browser features
    importProvidersFrom(BrowserAnimationsModule),
    provideClientHydration(),
    
    // Environment-specific providers
    ...(getEnvironmentProviders())
  ]
};

// Environment-specific configuration
function getEnvironmentProviders() {
  const isProduction = window.location.hostname !== 'localhost';
  
  if (isProduction) {
    return [];
  } else {
    return [];
  }
}

// Application Constants
export const APP_CONFIG = {
  APP_NAME: 'E-Commerce Platform',
  VERSION: '2.0.0',
  API_BASE_URL: 'http://localhost:3000',
  WS_BASE_URL: 'ws://localhost:3001',
  
  FEATURES: {
    WEBSOCKETS: false,
    OFFLINE_SUPPORT: true,
    PUSH_NOTIFICATIONS: false,
    DARK_MODE: true,
    ANALYTICS: false
  },
  
  UI: {
    ITEMS_PER_PAGE: 12,
    NOTIFICATION_DURATION: 5000,
    LOADING_DELAY: 300,
    DEBOUNCE_TIME: 300,
    ANIMATION_DURATION: 200
  },
  
  CACHE: {
    PRODUCTS_TTL: 5 * 60 * 1000,
    USER_DATA_TTL: 10 * 60 * 1000,
    STATIC_DATA_TTL: 30 * 60 * 1000
  },
  
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    MAX_CART_ITEMS: 50,
    MAX_FILE_SIZE: 5 * 1024 * 1024
  },
  
  EXTERNAL: {
    GOOGLE_ANALYTICS_ID: 'GA_MEASUREMENT_ID',
    SENTRY_DSN: 'SENTRY_DSN_URL',
    STRIPE_PUBLIC_KEY: 'STRIPE_PUBLIC_KEY'
  }
};

export interface AppFeatures {
  WEBSOCKETS: boolean;
  OFFLINE_SUPPORT: boolean;
  PUSH_NOTIFICATIONS: boolean;
  DARK_MODE: boolean;
  ANALYTICS: boolean;
}

export interface UIConfig {
  ITEMS_PER_PAGE: number;
  NOTIFICATION_DURATION: number;
  LOADING_DELAY: number;
  DEBOUNCE_TIME: number;
  ANIMATION_DURATION: number;
}

export function getConfig<T = any>(path: string): T {
  return path.split('.').reduce((obj, key) => obj?.[key], APP_CONFIG as any);
}

export function isFeatureEnabled(feature: keyof AppFeatures): boolean {
  return APP_CONFIG.FEATURES[feature];
}