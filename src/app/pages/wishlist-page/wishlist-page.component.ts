import { Component, inject } from '@angular/core';
import { WishlistService } from '../../entities/wishlist/wishlist.service';

@Component({
  selector: 'app-wishlist-page',
  imports: [],
  templateUrl: './wishlist-page.component.html',
  styleUrl: './wishlist-page.component.scss',
})
export class WishlistPageComponent {
  private wishlist = inject(WishlistService);

  places = this.wishlist.places();
}
