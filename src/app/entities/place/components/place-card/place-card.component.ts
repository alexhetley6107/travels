import { Component, inject, input } from '@angular/core';
import { PlaceDetails } from '../../model';
import { PlacesService } from '../../place.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-place-card',
  imports: [],
  templateUrl: './place-card.component.html',
  styleUrl: './place-card.component.scss',
})
export class PlaceCardComponent {
  private readonly placesService = inject(PlacesService);
  private readonly router = inject(Router);

  place = input<PlaceDetails>();

  openPlace(): void {
    this.router.navigate(['/place', this.place()?.xid]);
  }

  address(): string {
    return this.placesService.formatAddress(this.place());
  }

  category(): string {
    return this.place()?.kinds ? this.placesService.formatKinds(this.place()?.kinds) : '';
  }
}
