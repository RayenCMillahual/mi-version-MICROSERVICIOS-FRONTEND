// src/app/features/user/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
              <h1 class="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            </div>
          </div>
        </div>
      </header>

      <!-- Profile Content -->
      <main class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Profile Info Card -->
          <div class="md:col-span-1">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="text-center">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span class="text-2xl font-bold text-white">
                    {{ getUserInitials() }}
                  </span>
                </div>
                <h2 class="text-xl font-bold text-gray-900">{{ currentUser?.username }}</h2>
                <p class="text-gray-600">{{ userProfile?.email }}</p>
                <p class="text-sm text-gray-500 mt-2">
                  Miembro desde {{ userProfile?.createdAt | date:'MMM yyyy' }}
                </p>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Total de Compras</span>
                  <span class="font-semibold text-gray-900">{{ userStats.totalPurchases }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Total Gastado</span>
                  <span class="font-semibold text-gray-900">\${{ userStats.totalSpent | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Productos Comprados</span>
                  <span class="font-semibold text-gray-900">{{ userStats.totalItems }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Profile Form -->
          <div class="md:col-span-2">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Información Personal</h3>
              </div>
              <div class="p-6">
                <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                        Usuario
                      </label>
                      <input
                        id="username"
                        type="text"
                        formControlName="username"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de usuario"
                      />
                      <div *ngIf="profileForm.get('username')?.invalid && profileForm.get('username')?.touched" 
                           class="text-red-600 text-sm mt-1">
                        El usuario debe tener al menos 3 caracteres
                      </div>
                    </div>

                    <div>
                      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        formControlName="email"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tu@email.com"
                      />
                      <div *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched" 
                           class="text-red-600 text-sm mt-1">
                        Ingresa un email válido
                      </div>
                    </div>
                  </div>

                  <div>
                    <label for="fullName" class="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      formControlName="fullName"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <!-- Change Password Section -->
                  <div class="border-t border-gray-200 pt-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Cambiar Contraseña</h4>
                    <div class="space-y-4">
                      <div>
                        <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña Actual
                        </label>
                        <input
                          id="currentPassword"
                          type="password"
                          formControlName="currentPassword"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Contraseña actual"
                        />
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                          </label>
                          <input
                            id="newPassword"
                            type="password"
                            formControlName="newPassword"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nueva contraseña"
                          />
                          <div *ngIf="profileForm.get('newPassword')?.invalid && profileForm.get('newPassword')?.touched" 
                               class="text-red-600 text-sm mt-1">
                            La contraseña debe tener al menos 6 caracteres
                          </div>
                        </div>

                        <div>
                          <label for="confirmNewPassword" class="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña
                          </label>
                          <input
                            id="confirmNewPassword"
                            type="password"
                            formControlName="confirmNewPassword"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Confirmar nueva contraseña"
                          />
                          <div *ngIf="profileForm.get('confirmNewPassword')?.invalid && profileForm.get('confirmNewPassword')?.touched" 
                               class="text-red-600 text-sm mt-1">
                            <span *ngIf="profileForm.get('confirmNewPassword')?.errors?.['required']">
                              Confirma tu contraseña
                            </span>
                            <span *ngIf="profileForm.get('confirmNewPassword')?.errors?.['passwordMismatch']">
                              Las contraseñas no coinciden
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      (click)="resetForm()"
                      class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      [disabled]="profileForm.invalid || loading"
                      class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                    >
                      <span *ngIf="!loading">Guardar Cambios</span>
                      <span *ngIf="loading">Guardando...</span>
                    </button>
                  </div>
                </form>

                <!-- Success/Error Messages -->
                <div *ngIf="successMessage" class="mt-4 p-3 bg-green-100 border border-green-400 rounded-lg text-green-700 text-sm">
                  {{ successMessage }}
                </div>
                <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
                  {{ errorMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: any = null;
  userProfile: any = null;
  userStats = {
    totalPurchases: 0,
    totalSpent: 0,
    totalItems: 0
  };
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmNewPassword: ['']
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserProfile();
    this.loadUserStats();
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmNewPassword = form.get('confirmNewPassword');
    
    if (newPassword && confirmNewPassword && 
        newPassword.value && confirmNewPassword.value &&
        newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  loadUserProfile() {
    if (this.currentUser) {
      this.userService.getProfile(this.currentUser.userId).subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.profileForm.patchValue({
            username: profile.username,
            email: profile.email,
            fullName: profile.fullName || ''
          });
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.errorMessage = 'Error al cargar el perfil';
        }
      });
    }
  }

  loadUserStats() {
    // Cargar estadísticas del usuario desde las facturas
    this.userService.getUserStats(this.currentUser.userId).subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const formData = this.profileForm.value;
      
      // Preparar datos para actualizar
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName
      };

      // Si se está cambiando la contraseña
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.password = formData.newPassword;
      }

      this.userService.updateProfile(this.currentUser.userId, updateData).subscribe({
        next: (response) => {
          this.successMessage = 'Perfil actualizado exitosamente';
          this.loading = false;
          
          // Limpiar campos de contraseña
          this.profileForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });

          // Actualizar información del usuario en localStorage si cambió el username
          if (updateData.username !== this.currentUser.username) {
            const updatedUser = { ...this.currentUser, username: updateData.username };
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          if (error.status === 401) {
            this.errorMessage = 'Contraseña actual incorrecta';
          } else if (error.status === 409) {
            this.errorMessage = 'El usuario o email ya existe';
          } else {
            this.errorMessage = 'Error al actualizar el perfil';
          }
          this.loading = false;
        }
      });
    }
  }

  resetForm() {
    this.loadUserProfile();
    this.successMessage = '';
    this.errorMessage = '';
  }

  getUserInitials(): string {
    if (this.currentUser?.username) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    return 'US';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}