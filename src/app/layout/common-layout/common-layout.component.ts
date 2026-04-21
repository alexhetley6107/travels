import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-common-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './common-layout.component.html',
  styleUrl: './common-layout.component.scss',
})
export class CommonLayoutComponent {}
