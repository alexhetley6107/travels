import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap, from, map, tap, concatMap, toArray, catchError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PlaceDetails, PlacePreview, SearchParams } from './model';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 min

const API_KEY = '5ae2e3f221c38a28845f05b602f851ea276066b0d5904690c7999e74';
const BASE_URL = 'https://api.opentripmap.com/0.1/en/places';
const TOURIST_KINDS = 'interesting_places,cultural,historic,architecture,museums,natural,religion';

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, CacheEntry>();

  cacheGet<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private cacheSet(key: string, data: unknown): void {
    this.cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
  }

  geocode(query: string): Observable<{ lat: number; lon: number; name: string }> {
    const key = `geo:${query.toLowerCase()}`;
    const cached = this.cacheGet<{ lat: number; lon: number; name: string }>(key);
    if (cached) return of(cached);

    const params = new HttpParams().set('name', query).set('apikey', API_KEY);

    return this.http
      .get<{ lat: number; lon: number; name: string }>(`${BASE_URL}/geoname`, { params })
      .pipe(tap((r) => this.cacheSet(key, r)));
  }

  searchPlaces(params: SearchParams): Observable<PlacePreview[]> {
    if (params.query) {
      return this.geocode(params.query).pipe(
        switchMap((geo) => this.searchByCoords(geo.lat, geo.lon, params))
      );
    }
    if (params.lat !== undefined && params.lon !== undefined) {
      return this.searchByCoords(params.lat, params.lon, params);
    }
    return of([]);
  }

  searchNearby(
    lat: number,
    lon: number,
    options: Omit<SearchParams, 'lat' | 'lon' | 'query'> = {}
  ): Observable<PlacePreview[]> {
    return this.searchByCoords(lat, lon, options);
  }

  private searchByCoords(
    lat: number,
    lon: number,
    options: SearchParams
  ): Observable<PlacePreview[]> {
    const radius = options.radius ?? 5000;
    const limit = options.limit ?? 10;
    const kinds = options.kinds ?? TOURIST_KINDS;
    const key = `search:${lat}:${lon}:${radius}:${limit}:${kinds}`;

    const cached = this.cacheGet<PlacePreview[]>(key);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('radius', String(radius))
      .set('lon', String(lon))
      .set('lat', String(lat))
      .set('kinds', kinds)
      .set('limit', String(limit))
      .set('rate', '2')
      .set('format', 'json')
      .set('apikey', API_KEY);

    return this.http
      .get<PlacePreview[]>(`${BASE_URL}/radius`, { params })
      .pipe(tap((r) => this.cacheSet(key, r)));
  }

  getPlace(xid: string): Observable<PlaceDetails> {
    const key = `place:${xid}`;
    const cached = this.cacheGet<PlaceDetails>(key);
    if (cached) return of(cached);

    const params = new HttpParams().set('apikey', API_KEY);

    return this.http
      .get<PlaceDetails>(`${BASE_URL}/xid/${xid}`, { params })
      .pipe(tap((p) => this.cacheSet(key, p)));
  }

  /**
   * Load details for a list of previews sequentially with 300ms delay
   * to avoid 429 rate limit errors.
   */
  getPlacesBatch(previews: PlacePreview[]): Observable<PlaceDetails[]> {
    if (!previews.length) return of([]);

    return from(previews).pipe(
      concatMap((p, i) =>
        this.getPlace(p.xid).pipe(
          delay(i < 7 ? 0 : 300),
          catchError(() => of(null))
        )
      ),
      toArray(),
      map((results) => results.filter((d): d is PlaceDetails => !!d && !!d.name))
    );
  }

  formatAddress(place: PlaceDetails): string {
    const a = place.address;
    if (!a) return '';
    return [a.road, a.house_number, a.city, a.country].filter(Boolean).join(', ');
  }

  formatKinds(kinds: string): string {
    return kinds
      .split(',')[0]
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  }
}
