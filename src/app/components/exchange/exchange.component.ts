import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, combineLatest, of, Subscription } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ExchangeRateService } from '../../data/services/exchange-rate.service';
import { CurrencyInputGroupComponent } from '../currency-input-group/currency-input-group.component';

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyInputGroupComponent],
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss'],
})
export class ExchangeComponent implements OnInit, OnDestroy {
  form: FormGroup;
  exchangeRates$: Observable<{ [key: string]: number }> = of({});
  private isUpdating = false;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private exchangeRateService: ExchangeRateService
  ) {
    this.form = this.fb.group({
      amount1: [null],
      currency1: ['uah'],
      amount2: [null],
      currency2: ['usd'],
    });
  }

  ngOnInit() {
    this.exchangeRates$ = combineLatest([
      this.exchangeRateService.getExchangeRateUSD(),
      this.exchangeRateService.getExchangeRateEUR(),
    ]).pipe(
      map(([usd, eur]) => ({
        ...usd.conversion_rates,
        ...eur.conversion_rates,
          'USDToUAH': usd.conversion_rates['UAH'],
          'EURToUAH': eur.conversion_rates['UAH'],
          'UAHToUSD': 1 / usd.conversion_rates['UAH'],
          'UAHToEUR': 1 / eur.conversion_rates['UAH'],
          'USDToEUR': (1 / eur.conversion_rates['UAH']) * usd.conversion_rates['UAH'],
          'EURToUSD': (1 / usd.conversion_rates['UAH']) * eur.conversion_rates['UAH']
      })),
      catchError(() => {
        console.error('Error fetching exchange rates');
        return of({});
      })
    );

    this.subscription.add(
      this.form.valueChanges.subscribe(() => {
        if (!this.isUpdating) {
          this.calculateAmount();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onAmount1Change(amount: number | null) {
    this.updateFormValue('amount1', amount);
  }

  onCurrency1Change(currency: string) {
    this.updateFormValue('currency1', currency);
  }

  onAmount2Change(amount: number | null) {
    this.updateFormValue('amount2', amount);
  }

  onCurrency2Change(currency: string) {
    this.updateFormValue('currency2', currency);
  }

  private updateFormValue(controlName: string, value: any) {
    if (!this.isUpdating) {
      this.isUpdating = true;
      this.form.get(controlName)?.setValue(value, { emitEvent: false });
      this.calculateAmount();
      this.isUpdating = false;
    }
  }

  private calculateAmount() {
    this.exchangeRates$
      .pipe(
        switchMap((rates) => {
          const { amount1, currency1, amount2, currency2 } = this.form.value;

          if (currency1 === currency2) {
            this.form.patchValue({ amount2: amount1 }, { emitEvent: false });
            return of(null);
          }

          const fromCurrency = currency1.toUpperCase();
          const toCurrency = currency2.toUpperCase();
          const rateKey = `${fromCurrency}To${toCurrency}`;
          const reverseRateKey = `${toCurrency}To${fromCurrency}`;
          const rate = rates[rateKey];
          const reverseRate = rates[reverseRateKey];

          if (rate) {
            if (amount1 !== null && amount1 !== undefined) {
              this.form.patchValue(
                { amount2: amount1 * rate },
                { emitEvent: false }
              );
            } else if (amount2 !== null && amount2 !== undefined) {
              this.form.patchValue(
                { amount1: amount2 * reverseRate },
                { emitEvent: false }
              );
            }
          } else {
            this.form.patchValue({ amount2: null }, { emitEvent: false });
          }
          return of(null);
        })
      )
      .subscribe();
  }
}
