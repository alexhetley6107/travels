import { Component, inject, input } from '@angular/core';
import { PlaceDetails } from '../../model';
import { PlacesService } from '../../place.service';
import { Router } from '@angular/router';
import { WishlistService } from '../../../wishlist/wishlist.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-place-card',
  imports: [NgClass],
  templateUrl: './place-card.component.html',
  styleUrl: './place-card.component.scss',
})
export class PlaceCardComponent {
  private readonly router = inject(Router);
  private readonly placesService = inject(PlacesService);
  private readonly wishlist = inject(WishlistService);

  place = input.required<PlaceDetails>();

  openPlace(): void {
    this.router.navigate(['/place', this.place()?.xid]);
  }

  address(): string {
    return this.placesService.formatAddress(this.place());
  }

  category(): string {
    return this.place()?.kinds ? this.placesService.formatKinds(this.place()?.kinds) : '';
  }

  onToggle(): void {
    this.wishlist.toggle(this.place());
  }
  isWished(): boolean {
    return this.wishlist.has(this.place()?.xid);
  }
}
