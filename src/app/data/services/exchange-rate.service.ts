import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExchangeRateResponse } from '../../app.component';
@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly apiBaseUrl = 'https://v6.exchangerate-api.com/v6/de5c7fcf8be8ea8f8e2798df/latest';

  http = inject(HttpClient);

  constructor() { }

  getExchangeRateUSD(): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(`${this.apiBaseUrl}/USD`);
  }

  getExchangeRateEUR(): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(`${this.apiBaseUrl}/EUR`);
  }
}