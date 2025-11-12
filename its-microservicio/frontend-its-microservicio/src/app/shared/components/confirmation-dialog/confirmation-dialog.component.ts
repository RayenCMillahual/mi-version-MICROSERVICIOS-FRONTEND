// src/app/shared/components/confirmation-dialog/confirmation-dialog.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  icon?: string;
  showCancel?: boolean;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'scale(0.8)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div 
      *ngIf="isVisible" 
      @fadeIn
      class="fixed inset-0 z-50 overflow-y-auto"
      [attr.aria-labelledby]="'dialog-title'"
      [attr.aria-describedby]="'dialog-description'"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        (click)="handleBackdropClick()"
      ></div>

      <!-- Dialog Container -->
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          @slideIn
          class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          (click)="$event.stopPropagation()"
        >
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <!-- Icon -->
              <div 
                class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                [class]="getIconContainerClass()"
              >
                <!-- Danger Icon -->
                <svg 
                  *ngIf="config.type === 'danger'" 
                  class="h-6 w-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L2.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>

                <!-- Warning Icon -->
                <svg 
                  *ngIf="config.type === 'warning'" 
                  class="h-6 w-6 text-yellow-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                <!-- Info Icon -->
                <svg 
                  *ngIf="config.type === 'info'" 
                  class="h-6 w-6 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                <!-- Success Icon -->
                <svg 
                  *ngIf="config.type === 'success'" 
                  class="h-6 w-6 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>

                <!-- Custom Icon -->
                <div *ngIf="config.icon" [innerHTML]="config.icon"></div>
              </div>

              <!-- Content -->
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 
                  id="dialog-title"
                  class="text-base font-semibold leading-6 text-gray-900"
                >
                  {{ config.title }}
                </h3>
                <div class="mt-2">
                  <p 
                    id="dialog-description"
                    class="text-sm text-gray-500"
                    [innerHTML]="config.message"
                  ></p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <!-- Confirm Button -->
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors sm:ml-3 sm:w-auto"
              [class]="getConfirmButtonClass()"
              (click)="confirm()"
              [attr.aria-label]="config.confirmText || 'Confirmar'"
            >
              {{ config.confirmText || 'Confirmar' }}
            </button>

            <!-- Cancel Button -->
            <button
              *ngIf="config.showCancel !== false"
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors sm:mt-0 sm:w-auto"
              (click)="cancel()"
              [attr.aria-label]="config.cancelText || 'Cancelar'"
            >
              {{ config.cancelText || 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  @Input() config: ConfirmationConfig = {
    title: 'Confirmar acción',
    message: '¿Estás seguro de que quieres continuar?',
    type: 'info'
  };
  
  @Input() isVisible: boolean = false;
  @Input() closeOnBackdrop: boolean = true;
  
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  confirm(): void {
    this.confirmed.emit();
    this.close();
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  handleBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.cancel();
    }
  }

  getIconContainerClass(): string {
    switch (this.config.type) {
      case 'danger':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      case 'success':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.config.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-500 focus:ring-green-500';
      default:
        return 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-500';
    }
  }
}

// Servicio para manejar diálogos de confirmación
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DialogState {
  isVisible: boolean;
  config: ConfirmationConfig;
  resolve?: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private dialogStateSubject = new BehaviorSubject<DialogState>({
    isVisible: false,
    config: {
      title: '',
      message: ''
    }
  });

  public dialogState$ = this.dialogStateSubject.asObservable();

  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialogStateSubject.next({
        isVisible: true,
        config: {
          type: 'info',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
          showCancel: true,
          ...config
        },
        resolve
      });
    });
  }

  // Métodos de conveniencia
  confirmDelete(itemName: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar <strong>${itemName}</strong>?<br><br>Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
  }

  confirmLogout(): Promise<boolean> {
    return this.confirm({
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar tu sesión?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      type: 'warning'
    });
  }

  confirmClearCart(): Promise<boolean> {
    return this.confirm({
      title: 'Vaciar carrito',
      message: '¿Estás seguro de que quieres eliminar todos los productos de tu carrito?',
      confirmText: 'Vaciar carrito',
      cancelText: 'Cancelar',
      type: 'warning'
    });
  }

  confirmCheckout(total: number): Promise<boolean> {
    return this.confirm({
      title: 'Confirmar compra',
      message: `¿Confirmas tu compra por un total de <strong>$${total.toFixed(2)}</strong>?`,
      confirmText: 'Confirmar compra',
      cancelText: 'Revisar carrito',
      type: 'success'
    });
  }

  handleConfirm(): void {
    const currentState = this.dialogStateSubject.value;
    if (currentState.resolve) {
      currentState.resolve(true);
    }
    this.closeDialog();
  }

  handleCancel(): void {
    const currentState = this.dialogStateSubject.value;
    if (currentState.resolve) {
      currentState.resolve(false);
    }
    this.closeDialog();
  }

  closeDialog(): void {
    this.dialogStateSubject.next({
      isVisible: false,
      config: { title: '', message: '' }
    });
  }
}