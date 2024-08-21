import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ExchangeRateService } from '../../data/services/exchange-rate.service';

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements OnInit {
  amount1: number | null = null;
  amount2: number | null = null;
  currency1: string = 'uah'; 
  currency2: string = 'usd'; 
  exchangeRates$: Observable<{ [key: string]: number }> = of({});
  private isUpdating: boolean = false;

  constructor(private exchangeRateService: ExchangeRateService) {}

  ngOnInit() {
    this.exchangeRates$ = combineLatest([
      this.exchangeRateService.getExchangeRateUSD(),
      this.exchangeRateService.getExchangeRateEUR()
    ]).pipe(
      map(([usd, eur]) => {
        const rates = {
          ...usd.conversion_rates,
          ...eur.conversion_rates,
          'USDToUAH': usd.conversion_rates['UAH'],
          'EURToUAH': eur.conversion_rates['UAH'],
          'UAHToUSD': 1 / usd.conversion_rates['UAH'],
          'UAHToEUR': 1 / eur.conversion_rates['UAH'],
          'USDToEUR': (1 / usd.conversion_rates['UAH']) * eur.conversion_rates['UAH'],
          'EURToUSD': (1 / eur.conversion_rates['UAH']) * usd.conversion_rates['UAH']
        };
        console.log('Exchange rates:', rates);
        return rates;
      }),
      catchError(() => {
        console.error('Error fetching exchange rates');
        return of({});
      })
    );
  }

  onAmount1Change() {
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.calculateAmount('amount1');
      this.isUpdating = false;
    }
  }

  onAmount2Change() {
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.calculateAmount('amount2');
      this.isUpdating = false;
    }
  }

  onCurrencyChange() {
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.calculateAmount();
      this.isUpdating = false;
    }
  }

  private calculateAmount(changedField?: 'amount1' | 'amount2') {
    this.exchangeRates$.subscribe(rates => {
      if (this.currency1 === this.currency2) {
        this.amount2 = this.amount1;
        return;
      }

      const fromCurrency = this.currency1.toUpperCase();
      const toCurrency = this.currency2.toUpperCase();
      const rateKey = `${fromCurrency}To${toCurrency}`;
      const reverseRateKey = `${toCurrency}To${fromCurrency}`;
      const rate = rates[rateKey];
      const reverseRate = rates[reverseRateKey];

      if (rate) {
        if (changedField === 'amount1') {
          this.amount2 = this.amount1 !== null ? this.amount1 * rate : null;
        } else if (changedField === 'amount2') {
          this.amount1 = this.amount2 !== null ? this.amount2 * reverseRate : null;
        } else {
          if (this.amount1 !== null) {
            this.amount2 = this.amount1 * rate;
          } else if (this.amount2 !== null) {
            this.amount1 = this.amount2 * reverseRate;
          }
        }
      } else {
        this.amount2 = null;
      }
    });
  }
}