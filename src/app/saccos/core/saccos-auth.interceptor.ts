/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SACCOS_API_CONFIG, SaccosApiConfig } from './saccos-api.config';

@Injectable()
export class SaccosAuthInterceptor implements HttpInterceptor {
  constructor(@Inject(SACCOS_API_CONFIG) private config: SaccosApiConfig) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(this.config.origin)) {
      return next.handle(request);
    }

    // Read mifosXCredentials - stored in sessionStorage or localStorage
    let b64: string | null = null;
    try {
      const raw = sessionStorage.getItem('mifosXCredentials')
               || localStorage.getItem('mifosXCredentials');
      if (raw) {
        const creds = JSON.parse(raw);
        b64 = creds?.base64EncodedAuthenticationKey || null;
      }
    } catch {}

    const headers: Record<string, string> = {};
    if (b64) {
      headers['Authorization'] = 'Basic ' + b64;
    }

    request = request.clone({
      setHeaders: headers,
      withCredentials: true
    });

    return next.handle(request);
  }
}
