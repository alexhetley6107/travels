import { Component, inject } from '@angular/core';
import { WishlistService } from '../../entities/place/services/wishlist.service';
import { PlaceCardComponent } from '../../entities/place/components/place-card/place-card.component';

@Component({
  selector: 'app-wishlist-page',
  imports: [PlaceCardComponent],
  templateUrl: './wishlist-page.component.html',
})
export class WishlistPageComponent {
  private wishlist = inject(WishlistService);

  places = this.wishlist.places();
}
