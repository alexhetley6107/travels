import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacesService } from '../../entities/place/services/place.service';
import { PlaceDetails } from '../../entities/place/model';
import { PlaceCardComponent } from '../../entities/place/components/place-card/place-card.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule, PlaceCardComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  private readonly placesService = inject(PlacesService);

  query = '';
  places = signal<PlaceDetails[]>([]);
  loading = signal(false);
  locating = signal(false);
  error = signal<string | null>(null);

  search(): void {
    const q = this.query.trim();
    if (!q) return;

    this.loading.set(true);
    this.error.set(null);
    this.places.set([]);

    this.placesService.searchPlaces({ query: q, limit: 8 }).subscribe({
      next: (previews) => {
        if (!previews.length) {
          this.loading.set(false);
          return;
        }
        this.placesService.getPlacesBatch(previews).subscribe({
          next: (details) => {
            this.places.set(details);
            this.loading.set(false);
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.loading.set(false);
          },
        });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  searchNearby(): void {
    if (!navigator.geolocation) {
      this.error.set('Геолокація не підтримується');
      return;
    }

    this.locating.set(true);
    this.error.set(null);
    this.places.set([]);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.locating.set(false);
        this.loading.set(true);

        this.placesService.searchNearby(coords.latitude, coords.longitude, { limit: 8 }).subscribe({
          next: (previews) => {
            if (!previews.length) {
              this.loading.set(false);
              return;
            }
            this.placesService.getPlacesBatch(previews).subscribe({
              next: (details) => {
                this.places.set(details);
                this.loading.set(false);
              },
              error: (err: Error) => {
                this.error.set(err.message);
                this.loading.set(false);
              },
            });
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.loading.set(false);
          },
        });
      },
      () => {
        this.locating.set(false);
        this.error.set('Не вдалося отримати геолокацію');
      }
    );
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.search();
  }
}
