import { computed, Injectable, signal } from '@angular/core';
import { PlaceDetails } from '../place/model';

const KEY = 'wishlist';

type WishlistState = Record<string, PlaceDetails>;

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private state = signal<WishlistState>({});

  places = computed(() => Object.values(this.state()));

  initPlaces() {
    const json = localStorage.getItem(KEY);
    const saved: WishlistState = json ? JSON.parse(json) : {};

    console.log(saved);

    this.state.set(saved);
  }

  private save(state: WishlistState) {
    localStorage.setItem(KEY, JSON.stringify(state));
    this.state.set(state);
  }

  add(place: PlaceDetails) {
    const current = this.state();

    const updated: WishlistState = {
      ...current,
      [place.xid]: place,
    };

    this.save(updated);
  }

  remove(xid: string) {
    const current = this.state();

    const { [xid]: _, ...rest } = current;

    this.save(rest);
  }

  get(xid: string): PlaceDetails {
    return this.state()[xid];
  }

  has(xid: string): boolean {
    return !!this.state()[xid];
  }

  toggle(place: PlaceDetails) {
    if (this.has(place.xid)) {
      this.remove(place.xid);
    } else {
      this.add(place);
    }
  }
}
