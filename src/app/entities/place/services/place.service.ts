import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap, from, map, tap, concatMap, toArray, catchError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PlaceDetails, PlacePreview, SearchParams } from '../model';
import { env } from '../../../../environments/environments';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const CACHE_TIME = 10 * 60 * 1000;
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
    this.cache.set(key, { data, expiresAt: Date.now() + CACHE_TIME });
  }

  geocode(query: string): Observable<{ lat: number; lon: number; name: string }> {
    const key = `geo:${query.toLowerCase()}`;
    const cached = this.cacheGet<{ lat: number; lon: number; name: string }>(key);
    if (cached) return of(cached);

    const params = new HttpParams().set('name', query).set('apikey', env.API_KEY);

    return this.http
      .get<{ lat: number; lon: number; name: string }>(`${env.BASE_URL}/geoname`, { params })
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
      .set('apikey', env.API_KEY);

    return this.http
      .get<PlacePreview[]>(`${env.BASE_URL}/radius`, { params })
      .pipe(tap((r) => this.cacheSet(key, r)));
  }

  getPlace(xid: string): Observable<PlaceDetails> {
    const key = `place:${xid}`;
    const cached = this.cacheGet<PlaceDetails>(key);
    if (cached) return of(cached);

    const params = new HttpParams().set('apikey', env.API_KEY);

    return this.http
      .get<PlaceDetails>(`${env.BASE_URL}/xid/${xid}`, { params })
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
}
