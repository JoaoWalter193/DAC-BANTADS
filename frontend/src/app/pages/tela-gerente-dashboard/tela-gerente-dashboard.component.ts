import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tela-gerente-dashboard',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './tela-gerente-dashboard.component.html',
  styleUrl: './tela-gerente-dashboard.component.css'
})
export class TelaGerenteDashboardComponent {

}
