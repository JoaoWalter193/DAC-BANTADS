import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-extrato',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './extrato.component.html',
  styleUrl: './extrato.component.css'
})

export class ExtratoComponent {
  constructor() {}
}
