// src/app/features/auth/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div class="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p class="text-gray-300">Ingresa a tu cuenta</p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ingresa tu usuario"
            />
            <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" 
                 class="text-red-400 text-sm mt-1">
              El usuario es requerido
            </div>
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
              placeholder="Ingresa tu contraseña"
            />
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                 class="text-red-400 text-sm mt-1">
              La contraseña es requerida
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || loading"
            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            <span *ngIf="!loading">INGRESAR</span>
            <span *ngIf="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </span>
          </button>
        </form>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Register Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-400">
            ¿No tienes cuenta? 
            <a href="#" class="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Regístrate aquí
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
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          console.log('Login exitoso', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Error en login', error);
          this.errorMessage = 'Credenciales inválidas. Intenta nuevamente.';
          this.loading = false;
        }
      });
    }
  }
}