import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WishlistService } from './entities/place/services/wishlist.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private wishlist = inject(WishlistService);

  ngOnInit() {
    this.wishlist.initPlaces();
  }
}
