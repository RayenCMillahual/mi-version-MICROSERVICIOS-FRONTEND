// src/app/features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p class="text-gray-300">Regístrate en el sistema</p>
        </div>

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Elige un nombre de usuario"
            />
            <div *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched" 
                 class="text-red-400 text-sm mt-1">
              El usuario debe tener al menos 3 caracteres
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="tu@email.com"
            />
            <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                 class="text-red-400 text-sm mt-1">
              Ingresa un email válido
            </div>
          </div>

          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-300 mb-2">
              Nombre Completo (Opcional)
            </label>
            <input
              id="fullName"
              type="text"
              formControlName="fullName"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Mínimo 6 caracteres"
            />
            <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                 class="text-red-400 text-sm mt-1">
              La contraseña debe tener al menos 6 caracteres
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Repite tu contraseña"
            />
            <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" 
                 class="text-red-400 text-sm mt-1">
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                Confirma tu contraseña
              </span>
              <span *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                Las contraseñas no coinciden
              </span>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || loading"
            class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            <span *ngIf="!loading">CREAR CUENTA</span>
            <span *ngIf="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando cuenta...
            </span>
          </button>
        </form>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm">
          {{ successMessage }}
        </div>

        <!-- Login Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-400">
            ¿Ya tienes cuenta? 
            <a (click)="goToLogin()" class="text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.registerForm.value;
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...userData } = formData;

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registro exitoso', response);
          this.successMessage = 'Cuenta creada exitosamente. Redirigiendo al login...';
          
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Error en registro', error);
          if (error.status === 409) {
            this.errorMessage = 'El usuario o email ya existe. Intenta con otros datos.';
          } else {
            this.errorMessage = 'Error al crear la cuenta. Intenta nuevamente.';
          }
          this.loading = false;
        }
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}