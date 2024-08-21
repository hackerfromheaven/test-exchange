import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExchangeRateResponse } from '../../app.component';
@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly apiBaseUrl = 'https://v6.exchangerate-api.com/v6/510be5d2b5ba64b034034c53/latest';

  http = inject(HttpClient);

  constructor() { }

  getExchangeRateUSD(): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(`${this.apiBaseUrl}/USD`);
  }

  getExchangeRateEUR(): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(`${this.apiBaseUrl}/EUR`);
  }
}