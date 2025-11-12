// src/app/features/admin/user-management/user-management.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../../core/services/admin.service';

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-management',
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
              <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <span class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                ADMIN
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Success/Error Messages -->
        <div *ngIf="successMessage()" class="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-700">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
          {{ errorMessage() }}
        </div>

        <!-- Users List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900">Lista de Usuarios</h2>
              <div class="text-sm text-gray-600">
                {{ users().length }} usuario(s) registrado(s)
              </div>
            </div>
          </div>
          
          <div *ngIf="loading()" class="p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>

          <div *ngIf="!loading() && users().length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <p class="text-gray-600">No hay usuarios registrados</p>
          </div>

          <div *ngIf="!loading() && users().length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
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
                <tr *ngFor="let user of users(); trackBy: trackByUserId" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-bold text-white">
                          {{ getUserInitials(user.username) }}
                        </span>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                        <div class="text-sm text-gray-500">{{ user.fullName || 'Sin nombre completo' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.email }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getRoleClass(user.username)" 
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ getRoleText(user.username) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ user.createdAt | date:'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Activo
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <button
                        (click)="viewUserDetails(user)"
                        class="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Ver detalles"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                      <button
                        (click)="editUser(user)"
                        class="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        *ngIf="user.username !== 'admin'"
                        (click)="deleteUser(user)"
                        [disabled]="deleting()"
                        class="text-red-600 hover:text-red-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

        <!-- User Stats Cards -->
        <div *ngIf="!loading() && users().length > 0" class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p class="text-2xl font-bold text-gray-900">{{ users().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p class="text-2xl font-bold text-gray-900">{{ users().length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Administradores</p>
                <p class="text-2xl font-bold text-gray-900">{{ adminCount() }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class UserManagementComponent implements OnInit, OnDestroy {
  // Signals
  users = signal<User[]>([]);
  loading = signal(true);
  deleting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  // Computed
  adminCount = computed(() => {
    return this.users().filter(user => user.username === 'admin').length;
  });

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('Iniciando User Management...'); // Debug
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    console.log('Cargando usuarios...'); // Debug
    this.loading.set(true);
    this.clearMessages();
    
    this.adminService.getAllUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (users) => {
        console.log('Usuarios cargados:', users); // Debug
        this.users.set(users);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage.set('Error al cargar los usuarios');
        this.loading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  viewUserDetails(user: User) {
    const details = `
Detalles del usuario:

Username: ${user.username}
Email: ${user.email}
Nombre: ${user.fullName || 'No especificado'}
Registro: ${new Date(user.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
ID: ${user.id}
    `.trim();
    
    alert(details);
  }

  editUser(user: User) {
    // Placeholder para funcionalidad de edición
    this.errorMessage.set('Función de edición en desarrollo');
    setTimeout(() => this.clearMessages(), 3000);
  }

  deleteUser(user: User) {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.username}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    console.log('Eliminando usuario:', user.username); // Debug
    this.deleting.set(true);
    this.clearMessages();

    this.adminService.deleteUser(user.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Usuario eliminado exitosamente:', response); // Debug
        this.successMessage.set(`Usuario "${user.username}" eliminado exitosamente`);
        this.deleting.set(false);
        
        // Recargar la lista de usuarios
        this.loadUsers();
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => this.clearMessages(), 5000);
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.errorMessage.set('Error al eliminar el usuario. Intenta nuevamente.');
        this.deleting.set(false);
        this.cdr.markForCheck();
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => this.clearMessages(), 5000);
      }
    });
  }

  private clearMessages() {
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  getUserInitials(username: string): string {
    if (!username) return 'XX';
    return username.substring(0, 2).toUpperCase();
  }

  getRoleClass(username: string): string {
    return username === 'admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  }

  getRoleText(username: string): string {
    return username === 'admin' ? 'Administrador' : 'Usuario';
  }

  trackByUserId = (index: number, user: User): string => user.id;

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
