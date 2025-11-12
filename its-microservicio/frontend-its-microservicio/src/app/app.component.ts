// src/app/app.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificationComponent } from './shared/components/notification/notification.component';
import { ConfirmationDialogComponent, ConfirmationDialogService } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { WebSocketService } from './core/services/websocket.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    NotificationComponent, 
    ConfirmationDialogComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-container">
      <!-- Main Application Content -->
      <router-outlet></router-outlet>
      
      <!-- Global Notification System -->
      <app-notification></app-notification>
      
      <!-- Global Confirmation Dialog -->
      <app-confirmation-dialog
        [isVisible]="dialogState.isVisible"
        [config]="dialogState.config"
        (confirmed)="confirmationService.handleConfirm()"
        (cancelled)="confirmationService.handleCancel()"
        (closed)="confirmationService.closeDialog()"
      ></app-confirmation-dialog>
      
      <!-- Loading Overlay for Global Operations -->
      <div 
        *ngIf="isGlobalLoading" 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        role="status"
        aria-label="Cargando"
      >
        <div class="bg-white rounded-lg p-6 flex items-center space-x-4">
          <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-700 font-medium">{{ loadingMessage }}</span>
        </div>
      </div>
      
      <!-- Offline Status Banner -->
      <div 
        *ngIf="isOffline" 
        class="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-40"
        role="alert"
      >
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Sin conexión a internet. Algunas funciones pueden no estar disponibles.</span>
        </div>
      </div>
      
      <!-- WebSocket Connection Status -->
      <div 
        *ngIf="showConnectionStatus && !wsConnected" 
        class="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg z-30"
        role="status"
      >
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span class="text-sm">Reconectando...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }
    
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Focus styles for accessibility */
    *:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .animate-spin,
      .animate-pulse,
      .animate-bounce {
        animation: none;
      }
      
      * {
        transition: none !important;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'E-Commerce Platform';
  
  // State management
  isGlobalLoading = false;
  loadingMessage = 'Cargando...';
  isOffline = false;
  wsConnected = false;
  showConnectionStatus = false;
  dialogState: any = { isVisible: false, config: {} };

  private destroy$ = new Subject<void>();
  private onlineCheckInterval?: any;

  constructor(
    public confirmationService: ConfirmationDialogService,
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.setupSubscriptions();
    this.setupGlobalErrorHandlers();
    this.setupNetworkMonitoring();
    this.setupKeyboardShortcuts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.onlineCheckInterval) {
      clearInterval(this.onlineCheckInterval);
    }
  }

  private initializeApp(): void {
    // Set initial state
    this.isOffline = !navigator.onLine;
    
    // Setup service worker registration (if available)
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      this.registerServiceWorker();
    }
    
    // Setup viewport meta tag for mobile
    this.setupViewportMeta();
    
    // Setup theme from localStorage
    this.setupTheme();
  }

  private setupSubscriptions(): void {
    // Confirmation dialog state
    this.confirmationService.dialogState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.dialogState = state;
    });

    // WebSocket connection status
    this.webSocketService.connectionStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(connected => {
      this.wsConnected = connected;
      
      // Show connection status only when user is authenticated
      this.authService.currentUser$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(user => {
        this.showConnectionStatus = !!user;
      });
    });
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleGlobalError(event.error);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleGlobalError(event.reason);
    });
  }

  private setupNetworkMonitoring(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOffline = false;
      console.log('Connection restored');
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      console.log('Connection lost');
    });

    // Periodic connectivity check
    this.onlineCheckInterval = setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Escape key to close modals
      if (event.key === 'Escape') {
        if (this.dialogState.isVisible) {
          this.confirmationService.handleCancel();
        }
      }

      // Ctrl/Cmd + K for global search (future feature)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Future: Open global search
        console.log('Global search shortcut triggered');
      }

      // Alt + C for cart
      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        window.location.href = '/cart';
      }

      // Alt + P for products
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        window.location.href = '/products';
      }
    });
  }

  private async checkConnectivity(): Promise<void> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      this.isOffline = !response.ok;
    } catch (error) {
      this.isOffline = true;
    }
  }

  private handleGlobalError(error: any): void {
    // Log error for debugging
    console.error('Global error handled:', error);
    
    // Don't show notification for network errors (handled by interceptor)
    if (error?.name === 'HttpErrorResponse') {
      return;
    }
    
    // Show user-friendly error message
    // Note: In a real app, you'd inject NotificationService here
    console.log('Would show user notification for error:', error.message);
  }

  private registerServiceWorker(): void {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available
                this.showUpdateAvailableNotification();
              }
            });
          }
        });
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }

  private showUpdateAvailableNotification(): void {
    // Show notification that new version is available
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <span>Nueva versión disponible</span>
        <button onclick="window.location.reload()" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
          Actualizar
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 10000);
  }

  private setupViewportMeta(): void {
    // Ensure proper viewport meta tag for mobile
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=no');
  }

  private setupTheme(): void {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // Public methods for global state management
  showGlobalLoading(message: string = 'Cargando...'): void {
    this.isGlobalLoading = true;
    this.loadingMessage = message;
  }

  hideGlobalLoading(): void {
    this.isGlobalLoading = false;
  }

  toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }
}