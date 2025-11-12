// src/app/shared/components/loading-skeleton/loading-skeleton.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Product Card Skeleton -->
    <div *ngIf="type === 'product-card'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="h-48 bg-gray-200"></div>
      <div class="p-6">
        <div class="h-6 bg-gray-200 rounded mb-2"></div>
        <div class="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div class="flex justify-between items-center mb-4">
          <div class="h-8 bg-gray-200 rounded w-20"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div class="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Product List Skeleton -->
    <div *ngIf="type === 'product-list'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div *ngFor="let item of getArray(count)" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
        <div class="h-48 bg-gray-200"></div>
        <div class="p-6">
          <div class="h-6 bg-gray-200 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div class="flex justify-between items-center mb-4">
            <div class="h-8 bg-gray-200 rounded w-20"></div>
            <div class="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div class="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Table Skeleton -->
    <div *ngIf="type === 'table'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="p-6 border-b border-gray-200">
        <div class="h-6 bg-gray-200 rounded w-48"></div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th *ngFor="let col of getArray(columns)" class="px-6 py-3">
                <div class="h-4 bg-gray-200 rounded"></div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let row of getArray(rows)">
              <td *ngFor="let col of getArray(columns)" class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Card Skeleton -->
    <div *ngIf="type === 'card'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div class="flex items-center mb-4">
        <div class="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
        <div class="flex-1">
          <div class="h-6 bg-gray-200 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
      <div class="space-y-3">
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        <div class="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>

    <!-- Invoice Skeleton -->
    <div *ngIf="type === 'invoice'" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <div class="h-6 bg-gray-200 rounded mb-2 w-32"></div>
            <div class="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div class="text-right">
            <div class="h-8 bg-gray-200 rounded mb-2 w-20"></div>
            <div class="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
      <div class="px-6 py-4">
        <div class="h-5 bg-gray-200 rounded mb-3 w-40"></div>
        <div class="space-y-3">
          <div *ngFor="let item of getArray(3)" class="flex justify-between items-center py-2">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
              <div>
                <div class="h-4 bg-gray-200 rounded mb-1 w-24"></div>
                <div class="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div class="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- List Item Skeleton -->
    <div *ngIf="type === 'list-item'" class="flex items-center p-4 bg-white border-b border-gray-200 animate-pulse">
      <div class="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
      <div class="flex-1">
        <div class="h-5 bg-gray-200 rounded mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div class="text-right">
        <div class="h-4 bg-gray-200 rounded w-16 mb-1"></div>
        <div class="h-3 bg-gray-200 rounded w-12"></div>
      </div>
    </div>

    <!-- Form Skeleton -->
    <div *ngIf="type === 'form'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div class="h-6 bg-gray-200 rounded mb-6 w-48"></div>
      <div class="space-y-6">
        <div *ngFor="let field of getArray(count)" class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-24"></div>
          <div class="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div class="flex justify-end space-x-4 mt-6">
        <div class="h-10 bg-gray-200 rounded w-20"></div>
        <div class="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    <!-- Dashboard Stats Skeleton -->
    <div *ngIf="type === 'stats'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div *ngFor="let stat of getArray(4)" class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
          <div class="flex-1">
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Lines Skeleton -->
    <div *ngIf="type === 'text'" class="space-y-3 animate-pulse">
      <div *ngFor="let line of getArray(count)" 
           class="h-4 bg-gray-200 rounded"
           [style.width.%]="getRandomWidth()">
      </div>
    </div>

    <!-- Custom Skeleton -->
    <div *ngIf="type === 'custom'" class="animate-pulse" [style.height.px]="height" [style.width.px]="width">
      <div class="h-full w-full bg-gray-200 rounded" [class]="customClass"></div>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'product-card' | 'product-list' | 'table' | 'card' | 'invoice' | 'list-item' | 'form' | 'stats' | 'text' | 'custom' = 'card';
  @Input() count: number = 3;
  @Input() rows: number = 5;
  @Input() columns: number = 5;
  @Input() height: number = 200;
  @Input() width: number = 300;
  @Input() customClass: string = '';

  getArray(length: number): any[] {
    return Array(length).fill(0);
  }

  getRandomWidth(): number {
    // Genera anchos aleatorios entre 60% y 100% para hacer más realista el skeleton
    return Math.floor(Math.random() * 40) + 60;
  }
}