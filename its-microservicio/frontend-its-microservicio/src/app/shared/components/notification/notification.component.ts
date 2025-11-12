// src/app/shared/components/notification/notification.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { NotificationService, Notification, ToastPosition } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('listAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ transform: 'translateX(100%)', opacity: 0 }),
          stagger('100ms', [
            animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div [class]="getContainerClass()" class="fixed z-50 space-y-3 max-w-sm">
      <div 
        *ngFor="let notification of notifications(); trackBy: trackByFn"
        [@slideIn]
        [class]="getNotificationClass(notification.type)"
        class="w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out overflow-hidden"
        [attr.role]="notification.type === 'error' ? 'alert' : 'status'"
        [attr.aria-live]="notification.type === 'error' ? 'assertive' : 'polite'"
      >
        <!-- Progress bar for timed notifications -->
        <div 
          *ngIf="!notification.persistent && notification.duration! > 0"
          class="h-1 w-full bg-gray-200 relative overflow-hidden"
        >
          <div 
            class="h-full transition-all ease-linear"
            [class]="getProgressBarClass(notification.type)"
            [style.animation]="'progress ' + notification.duration + 'ms linear'"
          ></div>
        </div>

        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-3">
              <!-- Success Icon -->
              <div *ngIf="notification.type === 'success'" 
                   class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <!-- Error Icon -->
              <div *ngIf="notification.type === 'error'" 
                   class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <!-- Warning Icon -->
              <div *ngIf="notification.type === 'warning'" 
                   class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L2.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <!-- Info Icon -->
              <div *ngIf="notification.type === 'info'" 
                   class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold" [class]="getTitleClass(notification.type)">
                {{ notification.title }}
              </p>
              <p class="mt-1 text-sm" [class]="getMessageClass(notification.type)">
                {{ notification.message }}
              </p>
              
              <!-- Action button -->
              <div *ngIf="notification.action" class="mt-3">
                <button
                  (click)="handleAction(notification)"
                  class="text-sm font-medium underline hover:no-underline transition-all"
                  [class]="getActionClass(notification.type)"
                >
                  {{ notification.action.label }}
                </button>
              </div>
            </div>
            
            <div class="flex-shrink-0 ml-3">
              <button
                (click)="removeNotification(notification.id)"
                class="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                [attr.aria-label]="'Cerrar notificación: ' + notification.title"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global styles for animations -->
    <style>
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    </style>
  `
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications = signal<Notification[]>([]);
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications.set(notifications);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }

  handleAction(notification: Notification) {
    if (notification.action) {
      notification.action.handler();
      if (!notification.persistent) {
        this.removeNotification(notification.id);
      }
    }
  }

  trackByFn(index: number, notification: Notification): string {
    return notification.id;
  }

  getContainerClass(): string {
    const position = this.notificationService.getPosition();
    let classes = '';
    
    // Vertical positioning
    if (position.vertical === 'top') {
      classes += 'top-4 ';
    } else {
      classes += 'bottom-4 ';
    }
    
    // Horizontal positioning
    switch (position.horizontal) {
      case 'left':
        classes += 'left-4';
        break;
      case 'center':
        classes += 'left-1/2 transform -translate-x-1/2';
        break;
      case 'right':
      default:
        classes += 'right-4';
        break;
    }
    
    return classes;
  }

  getNotificationClass(type: string): string {
    const baseClass = 'bg-white border-l-4';
    switch (type) {
      case 'success':
        return `${baseClass} border-green-400`;
      case 'error':
        return `${baseClass} border-red-400`;
      case 'warning':
        return `${baseClass} border-yellow-400`;
      case 'info':
        return `${baseClass} border-blue-400`;
      default:
        return `${baseClass} border-gray-400`;
    }
  }

  getTitleClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      case 'info':
        return 'text-blue-900';
      default:
        return 'text-gray-900';
    }
  }

  getMessageClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  }

  getActionClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-700 hover:text-green-800';
      case 'error':
        return 'text-red-700 hover:text-red-800';
      case 'warning':
        return 'text-yellow-700 hover:text-yellow-800';
      case 'info':
        return 'text-blue-700 hover:text-blue-800';
      default:
        return 'text-gray-700 hover:text-gray-800';
    }
  }

  getProgressBarClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  }
}