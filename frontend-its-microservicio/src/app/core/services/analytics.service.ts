// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AdminService } from './admin.service';
import { ProductService } from './product.service';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface SalesData {
  month: string;
  total: number;
  count: number;
}

export interface TopProduct {
  name: string;
  totalSold: number;
  revenue: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface UserGrowth {
  month: string;
  totalUsers: number;
  newUsers: number;
}

export interface DashboardAnalytics {
  salesByMonth: SalesData[];
  topProducts: TopProduct[];
  categoryDistribution: CategoryDistribution[];
  userGrowth: UserGrowth[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    averageOrderValue: number;
    growthRate: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(
    private adminService: AdminService,
    private productService: ProductService
  ) {}

  getDashboardAnalytics(monthsBack: number = 6): Observable<DashboardAnalytics> {
    return forkJoin({
      invoices: this.adminService.getAllInvoices().pipe(catchError(() => of([]))),
      products: this.productService.getProducts().pipe(catchError(() => of([]))),
      users: this.adminService.getAllUsers().pipe(catchError(() => of([])))
    }).pipe(
      map(({ invoices, products, users }) => {
        return {
          salesByMonth: this.calculateSalesByMonth(invoices, monthsBack),
          topProducts: this.calculateTopProducts(invoices, products),
          categoryDistribution: this.calculateCategoryDistribution(products),
          userGrowth: this.calculateUserGrowth(users, monthsBack),
          summary: this.calculateSummary(invoices, products, users)
        };
      })
    );
  }

  private calculateSalesByMonth(invoices: any[], monthsBack: number): SalesData[] {
    const now = new Date();
    const monthsData: SalesData[] = [];

    // Generar últimos N meses
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStr = format(date, 'MMM yyyy');
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      // Filtrar facturas del mes
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= monthStart && invDate <= monthEnd;
      });

      monthsData.push({
        month: monthStr,
        total: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
        count: monthInvoices.length
      });
    }

    return monthsData;
  }

  private calculateTopProducts(invoices: any[], products: any[]): TopProduct[] {
    // Crear mapa de productos vendidos
    const productSales = new Map<string, { quantity: number; revenue: number }>();

    invoices.forEach(invoice => {
      invoice.items.forEach((item: any) => {
        const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
        productSales.set(item.productId, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.quantity * item.price)
        });
      });
    });

    // Convertir a array y ordenar
    const topProducts: TopProduct[] = [];
    productSales.forEach((sales, productId) => {
      const product = products.find(p => p.id === productId);
      topProducts.push({
        name: product?.name || `Producto ${productId.substring(0, 8)}`,
        totalSold: sales.quantity,
        revenue: sales.revenue
      });
    });

    // Retornar top 5
    return topProducts
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
  }

  private calculateCategoryDistribution(products: any[]): CategoryDistribution[] {
    // Contar productos por categoría
    const categoryCount = new Map<string, number>();
    
    products.forEach(product => {
      const category = product.category || 'Sin categoría';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    const total = products.length;
    const distribution: CategoryDistribution[] = [];

    categoryCount.forEach((count, category) => {
      distribution.push({
        category,
        count,
        percentage: (count / total) * 100
      });
    });

    return distribution.sort((a, b) => b.count - a.count);
  }

  private calculateUserGrowth(users: any[], monthsBack: number): UserGrowth[] {
    const now = new Date();
    const monthsData: UserGrowth[] = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStr = format(date, 'MMM yyyy');
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      // Usuarios creados en este mes
      const newUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate >= monthStart && userDate <= monthEnd;
      }).length;

      // Total de usuarios hasta este mes
      const totalUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate <= monthEnd;
      }).length;

      monthsData.push({
        month: monthStr,
        totalUsers,
        newUsers
      });
    }

    return monthsData;
  }

  private calculateSummary(invoices: any[], products: any[], users: any[]) {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = invoices.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calcular tasa de crecimiento (comparar último mes con anterior)
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subMonths(now, 1));

    const currentMonthRevenue = invoices
      .filter(inv => new Date(inv.createdAt) >= currentMonth)
      .reduce((sum, inv) => sum + inv.total, 0);

    const lastMonthRevenue = invoices
      .filter(inv => {
        const date = new Date(inv.createdAt);
        return date >= lastMonth && date < currentMonth;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const growthRate = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalOrders,
      totalProducts: products.length,
      totalUsers: users.length,
      averageOrderValue,
      growthRate
    };
  }
}