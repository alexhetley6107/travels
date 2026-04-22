import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../entities/place/place.service';
import { PlaceDetails } from '../../entities/place/model';

@Component({
  selector: 'app-place-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './place-page.component.html',
  styleUrl: './place-page.component.scss',
})
export class PlacePageComponent implements OnInit {
  private readonly placesService = inject(PlacesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  place = signal<PlaceDetails | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const xid = this.route.snapshot.paramMap.get('id');
    if (!xid) {
      this.router.navigate(['/']);
      return;
    }

    this.placesService.getPlace(xid).subscribe({
      next: (place) => {
        this.place.set(place);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  address(): string {
    const p = this.place();
    return p ? this.placesService.formatAddress(p) : '';
  }

  category(): string {
    const p = this.place();
    return p?.kinds ? this.placesService.formatKinds(p.kinds) : '';
  }
}
