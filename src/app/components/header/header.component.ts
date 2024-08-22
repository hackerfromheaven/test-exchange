import { Component, Input  } from '@angular/core';
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
@Input() exchangeRateUSD: number | undefined
@Input()exchangeRateEUR: number | undefined
}
