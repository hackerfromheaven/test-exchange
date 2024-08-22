import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ExchangeComponent } from './components/exchange/exchange.component';
import { ExchangeRateService } from './data/services/exchange-rate.service';
import { Subscription } from 'rxjs';
export interface ExchangeRateResponse {
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ExchangeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  exchangeRate = inject(ExchangeRateService);
  exchangeRateUSD: number | undefined;
  exchangeRateEUR: number | undefined;
  private subscriptions = new Subscription();

  constructor() {
    this.subscriptions.add(
      this.exchangeRate
        .getExchangeRateUSD()
        .subscribe((val: ExchangeRateResponse) => {
          this.exchangeRateUSD = val.conversion_rates['UAH'];
        })
    );

    this.subscriptions.add(
      this.exchangeRate
        .getExchangeRateEUR()
        .subscribe((val: ExchangeRateResponse) => {
          this.exchangeRateEUR = val.conversion_rates['UAH'];
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
