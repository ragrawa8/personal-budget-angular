import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'http://localhost:3000/budget';
  private dataCache: any[] | null = null;

  constructor(private http: HttpClient) {}

  fetchData(): Observable<any[]> {
    // If cache is populated, return cached data.
    if (this.dataCache) {
      return of(this.dataCache);
    }

    // Otherwise, fetch from the API.
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => {
        this.dataCache = data; // Store fetched data in cache.
      })
    );
  }
}
