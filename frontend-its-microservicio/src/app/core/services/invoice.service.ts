// src/app/core/services/invoice.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:3000/invoices';

  constructor(private http: HttpClient) {}

  getMyInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }

  getInvoice(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, invoice);
  }
}