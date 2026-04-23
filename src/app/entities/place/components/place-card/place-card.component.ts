import { Component, inject, input } from '@angular/core';
import { PlaceDetails } from '../../model';
import { Router } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-place-card',
  imports: [NgClass],
  templateUrl: './place-card.component.html',
  styleUrl: './place-card.component.scss',
})
export class PlaceCardComponent {
  private readonly router = inject(Router);
  private readonly wishlist = inject(WishlistService);

  place = input.required<PlaceDetails>();

  openPlace(): void {
    this.router.navigate(['/place', this.place()?.xid]);
  }

  onToggle(): void {
    this.wishlist.toggle(this.place());
  }

  isWished(): boolean {
    return this.wishlist.has(this.place()?.xid);
  }
}
