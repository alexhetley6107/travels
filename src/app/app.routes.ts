import { Routes } from '@angular/router';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: CommonLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/search-page/search-page.component').then((m) => m.SearchPageComponent),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./pages/wishlist-page/wishlist-page.component').then(
            (m) => m.WishlistPageComponent
          ),
      },
      {
        path: 'place/:id',
        loadComponent: () =>
          import('./pages/place-page/place-page.component').then((m) => m.PlacePageComponent),
      },
    ],
  },
];
