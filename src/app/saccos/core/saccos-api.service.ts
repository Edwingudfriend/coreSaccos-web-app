/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2026 reimagineafrica
 *
 * Thin, typed gateway to the SACCOS service mesh.
 * Feature services compose this instead of injecting HttpClient directly.
 */
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SACCOS_API_CONFIG, SaccosApiConfig } from './saccos-api.config';

export type SaccosDomain =
  | 'members'
  | 'contributions'
  | 'shares'
  | 'guarantors'
  | 'loans'
  | 'notifications'
  | 'dividends'
  | 'auth';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/** Standard Spring Data page envelope used by the SACCOS services. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class SaccosApiService {
  constructor(
    private http: HttpClient,
    @Inject(SACCOS_API_CONFIG) private config: SaccosApiConfig
  ) {}

  get<T>(domain: SaccosDomain, path = '', params?: QueryParams): Observable<T> {
    return this.http.get<T>(this.url(domain, path), { params: this.toParams(params) });
  }

  post<T>(domain: SaccosDomain, path = '', body?: unknown): Observable<T> {
    return this.http.post<T>(this.url(domain, path), body ?? {});
  }

  put<T>(domain: SaccosDomain, path = '', body?: unknown): Observable<T> {
    return this.http.put<T>(this.url(domain, path), body ?? {});
  }

  delete<T>(domain: SaccosDomain, path = ''): Observable<T> {
    return this.http.delete<T>(this.url(domain, path));
  }

  private url(domain: SaccosDomain, path: string): string {
    return `${this.config[domain]}${path}`;
  }

  private toParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }
    let httpParams = new HttpParams();
    Object.entries(params).forEach(
      ([
        key,
        value
      ]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      }
    );
    return httpParams;
  }
}
