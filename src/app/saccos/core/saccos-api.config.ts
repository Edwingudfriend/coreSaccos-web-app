/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { InjectionToken } from '@angular/core';

export interface SaccosApiConfig {
  origin: string;
  baseUrl: string;
  auth: string;
  members: string;
  contributions: string;
  shares: string;
  guarantors: string;
  loans: string;
  notifications: string;
  dividends: string;
  rules: string;
}

const ORIGIN = 'https://api.reimagineafrica.co.tz';
const BASE = `${ORIGIN}/api/saccos`;

export const DEFAULT_SACCOS_API_CONFIG: SaccosApiConfig = {
  origin: ORIGIN,
  baseUrl: BASE,
  auth: `${BASE}/auth`,
  members: `${BASE}/members`,
  contributions: `${BASE}/contributions`,
  shares: `${BASE}/shares`,
  guarantors: `${BASE}/guarantors`,
  loans: `${BASE}/loans`,
  notifications: `${BASE}/notifications`,
  dividends: `${BASE}/dividends`,
  rules: `${BASE}/rules`
};

export const SACCOS_API_CONFIG = new InjectionToken<SaccosApiConfig>('SACCOS_API_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_SACCOS_API_CONFIG
});
