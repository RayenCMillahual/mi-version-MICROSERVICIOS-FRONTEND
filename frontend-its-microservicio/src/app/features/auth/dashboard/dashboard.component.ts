// src/app/features/auth/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsService, DashboardAnalytics } from '../../../core/services/analytics.service';

// Registrar componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ViewChild para acceder a los canvas
  @ViewChild('salesChart', { static: false }) salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsChart', { static: false }) topProductsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart', { static: false }) categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userGrowthChart', { static: false }) userGrowthChartRef!: ElementRef<HTMLCanvasElement>;

  // Signals
  currentUser = signal<any>(null);
  isAdmin = signal(false);
  loading = signal(true);
  analytics = signal<DashboardAnalytics | null>(null);

  // Chart instances
  private charts: Chart[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    this.isAdmin.set(user?.username === 'admin');
    
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  loadDashboardData() {
    this.loading.set(true);
    
    this.analyticsService.getDashboardAnalytics(6).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        console.log('Analytics data loaded:', data);
        this.analytics.set(data);
        this.loading.set(false);
        
        // Esperar a que el DOM se actualice antes de crear los gráficos
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading.set(false);
      }
    });
  }

  refreshData() {
    this.destroyCharts();
    this.loadDashboardData();
  }

  private createCharts() {
    const data = this.analytics();
    if (!data) return;

    this.createSalesChart(data.salesByMonth);
    this.createTopProductsChart(data.topProducts);
    this.createCategoryChart(data.categoryDistribution);
    this.createUserGrowthChart(data.userGrowth);
  }

  private createSalesChart(salesData: any[]) {
    if (!this.salesChartRef) return;

    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: salesData.map(d => d.month),
        datasets: [{
          label: 'Ventas ($)',
          data: salesData.map(d => d.total),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                const count = salesData[context.dataIndex].count;
                return [
                  `Ventas: $${value.toFixed(2)}`,
                  `Órdenes: ${count}`
                ];
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private createTopProductsChart(topProducts: any[]) {
    if (!this.topProductsChartRef) return;

    const ctx = this.topProductsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.name),
        datasets: [{
          label: 'Unidades vendidas',
          data: topProducts.map(p => p.totalSold),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(139, 92, 246)',
            'rgb(251, 146, 60)',
            'rgb(236, 72, 153)'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => {
                const product = topProducts[context.dataIndex];
                return [
                  `Vendidos: ${product.totalSold} unidades`,
                  `Ingresos: $${product.revenue.toFixed(2)}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private createCategoryChart(categoryData: any[]) {
    if (!this.categoryChartRef) return;

    const ctx = this.categoryChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: categoryData.map(c => c.category),
        datasets: [{
          data: categoryData.map(c => c.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 12 },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i] as number;
                    const percentage = categoryData[i].percentage.toFixed(1);
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor![i] as string,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => {
                const cat = categoryData[context.dataIndex];
                return [
                  `${cat.category}`,
                  `Productos: ${cat.count}`,
                  `Porcentaje: ${cat.percentage.toFixed(1)}%`
                ];
              }
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private createUserGrowthChart(userData: any[]) {
    if (!this.userGrowthChartRef) return;

    const ctx = this.userGrowthChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: userData.map(d => d.month),
        datasets: [
          {
            label: 'Total Usuarios',
            data: userData.map(d => d.totalUsers),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(139, 92, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Nuevos Usuarios',
            data: userData.map(d => d.newUsers),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: 'rgb(16, 185, 129)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private destroyCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  getGrowthClass(growthRate: number): string {
    if (growthRate > 0) return 'text-green-600';
    if (growthRate < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}