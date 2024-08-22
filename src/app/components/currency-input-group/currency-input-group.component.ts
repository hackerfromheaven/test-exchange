import { Component, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule} from '@angular/forms';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-currency-input-group',
  standalone: true,
  imports: [NgForOf, FormsModule],
  templateUrl: './currency-input-group.component.html',
  styleUrls: ['./currency-input-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputGroupComponent),
      multi: true
    }
  ]
})
export class CurrencyInputGroupComponent implements ControlValueAccessor {
  @Input() amount: number | null = null;
  @Input() currency: string = 'uah';
  @Input() currencies: string[] = ['uah', 'usd', 'eur'];

  @Output() amountChange = new EventEmitter<number | null>();
  @Output() currencyChange = new EventEmitter<string>();

  private onChange: (value: { amount: number | null; currency: string }) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: { amount: number | null; currency: string }): void {
    this.amount = value?.amount ?? null;
    this.currency = value?.currency ?? 'uah';
  }

  registerOnChange(fn: (value: { amount: number | null; currency: string }) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onAmountChange(value: string): void {
    this.amount = value === '' ? null : parseFloat(value);
    this.onChange({ amount: this.amount, currency: this.currency });
    this.amountChange.emit(this.amount);
  }

  onCurrencyChange(): void {
    this.onChange({ amount: this.amount, currency: this.currency });
    this.currencyChange.emit(this.currency);
  }
}