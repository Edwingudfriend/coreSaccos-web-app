/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * Copyright since 2026 reimagineafrica
 */
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SACCOS_API_CONFIG, SaccosApiConfig } from './saccos-api.config';

export interface MemberSummary {
  id: number;
  clientId: number;
  memberNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  dateOfBirth: string | null;
  phoneNumber: string | null;
  email: string | null;
  district: string | null;
  region: string | null;
  occupation: string | null;
  employer: string | null;
  monthlyIncome: number | null;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  joinedAt: string;
  activatedAt: string | null;
  nextOfKins: NextOfKin[];
}

export interface NextOfKin {
  id: number;
  fullName: string;
  relationship: 'SPOUSE' | 'PARENT' | 'SIBLING' | 'CHILD' | 'GUARDIAN' | 'OTHER';
  phoneNumber: string | null;
  primary: boolean;
  sharePercent: number;
}

export interface MemberPageResponse {
  members: MemberSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface RegisterMemberRequest {
  fineractClientId: number;       // existing m_client.id of the staff-created Fineract client
  occupation: string;
  employer?: string;
  monthlyIncome?: number;
  district?: string;
  region?: string;
  nextOfKins?: NextOfKinRequest[];
}

export interface NextOfKinRequest {
  fullName: string;
  relationship: string;
  phoneNumber?: string;
  nationalId?: string;
  primary?: boolean;
  sharePercent?: number;
}

@Injectable({ providedIn: 'root' })
export class SaccosMemberService {
  constructor(
    private http: HttpClient,
    @Inject(SACCOS_API_CONFIG) private config: SaccosApiConfig
  ) {}

  getMembers(): Observable<MemberPageResponse> {
    return this.http.get<MemberPageResponse>(this.config.members);
  }

  getMember(id: number | string): Observable<MemberSummary> {
    return this.http.get<MemberSummary>(`${this.config.members}/${id}`);
  }

  registerMember(request: RegisterMemberRequest): Observable<MemberSummary> {
    return this.http.post<MemberSummary>(this.config.members, request);
  }

  activateMember(id: number | string): Observable<MemberSummary> {
    return this.http.post<MemberSummary>(`${this.config.members}/${id}/activate`, {});
  }

  suspendMember(id: number | string, reason?: string): Observable<MemberSummary> {
    return this.http.post<MemberSummary>(`${this.config.members}/${id}/suspend`, { reason });
  }

  updateMember(id: number | string, data: Partial<MemberSummary>): Observable<MemberSummary> {
    return this.http.patch<MemberSummary>(`${this.config.members}/${id}`, data);
  }
}
