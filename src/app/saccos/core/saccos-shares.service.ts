/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'https://api.reimagineafrica.co.tz/api/saccos';

function headers(): HttpHeaders {
  return new HttpHeaders({ 'Content-Type': 'application/json' });
}

// ── Interfaces ─────────────────────────────────────────────
export interface ShareAccountResponse {
  id: number; memberId: number;
  sharesSubscribed: number; sharesPaidUp: number; sharesOutstanding: number;
  shareParValue: number; amountSubscribed: number; amountPaidUp: number;
  amountOutstanding: number; status: string; openedDate: string; createdAt: string;
}

export interface ContributionResponse {
  id: number; memberId: number; amount: number; contributionDate: string;
  type: string; status: string; paymentChannel: string; reference: string;
  periodYear: number; periodMonth: number; recordedBy: string; createdAt: string;
}

export interface LoanResponse {
  id: number; loanNo: string; memberId: number;
  loanTypeId: number; loanTypeCode: string; loanTypeName: string;
  amountRequested: number; amountApproved: number;
  interestRateAnnual: number; tenureMonths: number;
  purpose: string; status: string;
  appliedDate: string; approvedDate: string; disbursedDate: string;
  paidUpSharesAtApplication: number; maxEligibleAmount: number;
  approvedBy: string; rejectionReason: string; createdAt: string;
}

export interface LoanTypeResponse {
  id: number; code: string; name: string; description: string;
  interestRateAnnual: number; loanMultiplier: number;
  maxTenureMonths: number; active: boolean;
}

export interface LoanApprovalVoteResponse {
  id: number; loanId: number; voterId: number; decision: 'APPROVE' | 'REJECT';
  comment: string; votedAt: string;
  approveCount: number; rejectCount: number; boardSize: number; loanStatus: string;
}


export interface ScheduleResponse {
  id: number; loanId: number; installmentNo: number;
  dueDate: string;
  principalDue: number; interestDue: number; totalDue: number;
  principalPaid: number; interestPaid: number; totalPaid: number;
  balance: number; status: string; paidDate: string;
}

export interface RepaymentResponse {
  id: number; loanId: number; scheduleId: number;
  amountPaid: number; paymentDate: string;
  paymentMethod: string; referenceNo: string;
  recordedBy: string; notes: string;
  fineractSynced: boolean; createdAt: string;
}

export interface LoanSummaryResponse {
  loanId: number; loanNo: string; status: string;
  amountDisbursed: number; totalRepaid: number; outstandingBalance: number;
  totalInterestPaid: number; totalInstallments: number;
  paidInstallments: number; overdueInstallments: number;
}

export interface MakeRepaymentRequest {
  amountPaid: number; paymentDate: string;
  paymentMethod: string; referenceNo: string; notes: string;
}

// ── Services ───────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class SaccosSharesService {
  private http = inject(HttpClient);
  openShareAccount(req: { memberId: number; sharesSubscribed: number; shareParValue: number; openedDate: string }): Observable<any> {
    return this.http.post<any>(`${API}/shares`, req, { headers: headers() });
  }
  recordSharePayment(shareId: number, req: { unitsPaid: number; paymentChannel: string; reference: string; paymentDate: string }): Observable<any> {
    return this.http.post<any>(`${API}/shares/${shareId}/payments`, req, { headers: headers() });
  }
  getMemberShares(memberId: number): Observable<ShareAccountResponse[]> {
    return this.http.get<ShareAccountResponse[]>(`${API}/shares/member/${memberId}`);
  }
  transitionMember(memberId: number, to: string, reason?: string): Observable<any> {
    const params = reason ? `?to=${to}&reason=${encodeURIComponent(reason)}` : `?to=${to}`;
    return this.http.post<any>(`${API}/members/${memberId}/transition${params}`, {}, { headers: headers() });
  }
}

@Injectable({ providedIn: 'root' })
export class SaccosContributionsService {
  private http = inject(HttpClient);
  recordContribution(req: any): Observable<any> {
    return this.http.post<any>(`${API}/contributions`, req, { headers: headers() });
  }
  getMemberContributions(memberId: number): Observable<ContributionResponse[]> {
    return this.http.get<ContributionResponse[]>(`${API}/contributions/member/${memberId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class SaccosLoansService {
  private http = inject(HttpClient);

  getAllLoans(): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>(`${API}/loans`);
  }

  getMemberLoans(memberId: number): Observable<LoanResponse[]> {
    return this.http.get<LoanResponse[]>(`${API}/loans/member/${memberId}`);
  }

  getLoan(id: number): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${API}/loans/${id}`);
  }

  getSchedule(loanId: number): Observable<ScheduleResponse[]> {
    return this.http.get<ScheduleResponse[]>(`${API}/loans/${loanId}/schedule`);
  }

  generateSchedule(loanId: number): Observable<any> {
    return this.http.post(`${API}/loans/${loanId}/schedule/generate`, {});
  }

  getRepayments(loanId: number): Observable<RepaymentResponse[]> {
    return this.http.get<RepaymentResponse[]>(`${API}/loans/${loanId}/repayments`);
  }

  getSummary(loanId: number): Observable<LoanSummaryResponse> {
    return this.http.get<LoanSummaryResponse>(`${API}/loans/${loanId}/summary`);
  }

  makeRepayment(loanId: number, req: MakeRepaymentRequest): Observable<RepaymentResponse> {
    return this.http.post<RepaymentResponse>(`${API}/loans/${loanId}/repay`, req,
      { headers: headers(), withCredentials: true });
  }

  getLoanTypes(): Observable<LoanTypeResponse[]> {
    return this.http.get<LoanTypeResponse[]>(`${API}/loan-types`);
  }

  applyLoan(req: { memberId: number; loanTypeId: number; amountRequested: number; tenureMonths: number; purpose: string }): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(`${API}/loans`, req, { headers: headers() });
  }

  rejectLoan(loanId: number, reason: string): Observable<LoanResponse> {
    const params = new HttpParams().set('reason', reason || '');
    return this.http.post<LoanResponse>(`${API}/loans/${loanId}/reject`, null,
      { headers: headers(), params });
  }
  approveLoan(loanId: number, approvedAmount: number): Observable<LoanResponse> {
    // Backend expects "amount" as a query parameter, not a JSON body field.
    const params = new HttpParams().set('amount', approvedAmount.toString());
    return this.http.post<LoanResponse>(`${API}/loans/${loanId}/approve`, null,
      { headers: headers(), params });
  }

  disburseLoan(loanId: number): Observable<LoanResponse> {
    return this.http.post<LoanResponse>(`${API}/loans/${loanId}/disburse`, {},
      {});
  }

  getVotes(loanId: number): Observable<LoanApprovalVoteResponse[]> {
    return this.http.get<LoanApprovalVoteResponse[]>(`${API}/loans/${loanId}/votes`);
  }

  castVote(loanId: number, req: { voterId: number; decision: 'APPROVE' | 'REJECT'; comment: string }): Observable<LoanApprovalVoteResponse> {
    return this.http.post<LoanApprovalVoteResponse>(`${API}/loans/${loanId}/votes`, req, { headers: headers() });
  }

  getLoanGuarantors(loanId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API}/loans/${loanId}/guarantors`);
  }

  addGuarantor(loanId: number, guarantorMemberId: number, guaranteedAmount: any): Observable<any> {
    return this.http.post<any>(`${API}/loans/${loanId}/guarantors`,
      { guarantorMemberId, guaranteedAmount }, { headers: headers() });
  }

  respondGuarantor(id: number, action: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${API}/guarantors/${id}/respond`,
      { action, reason: reason || null }, { headers: headers() });
  }

}

export interface RulesResponse {
  id: number; versionLabel: string;
  effectiveFrom: string; effectiveTo: string | null;
  isCurrent: boolean;
  membershipFee: number; shareParValue: number;
  minSharesSubscription: number; maxSharesSubscription: number;
  loanMultiplier: number; loanInterestRateAnnual: number;
  calculationMethod: string;
  maxLoanTenureMonths: number; minGuarantors: number;
  minMonthlyContribution: number; dormancyThresholdMonths: number;
  minPaidUpForDividend: number;
  approvedBy: string; approvalReference: string; notes: string;
  createdAt: string;
}

export interface CreateRulesRequest {
  versionLabel: string; effectiveFrom: string;
  membershipFee: number; shareParValue: number;
  minSharesSubscription: number; maxSharesSubscription: number;
  loanMultiplier: number; loanInterestRateAnnual: number;
  calculationMethod: string;
  maxLoanTenureMonths: number; minGuarantors: number;
  minMonthlyContribution: number; dormancyThresholdMonths: number;
  minPaidUpForDividend: number;
  approvedBy: string; approvalReference: string; notes: string;
}

@Injectable({ providedIn: 'root' })
export class SaccosRulesService {
  private http = inject(HttpClient);

  getCurrent(): Observable<RulesResponse> {
    return this.http.get<RulesResponse>(`${API}/rules/current`, { headers: headers() });
  }
  getHistory(): Observable<RulesResponse[]> {
    return this.http.get<RulesResponse[]>(`${API}/rules/history`, { headers: headers() });
  }
  create(req: CreateRulesRequest): Observable<RulesResponse> {
    return this.http.post<RulesResponse>(`${API}/rules`, req, { headers: headers() });
  }
}

@Injectable({ providedIn: 'root' })
export class SaccosReportsService {
  private http = inject(HttpClient);
  getMemberStatement(memberId: number): Observable<any> {
    return this.http.get<any>(`${API}/reports/member-statement/${memberId}`);
  }
  getLoanPortfolio(): Observable<any> {
    return this.http.get<any>(`${API}/reports/loan-portfolio`);
  }
  getOverdueReport(): Observable<any> {
    return this.http.get<any>(`${API}/reports/overdue`);
  }
  getShareRegister(): Observable<any> {
    return this.http.get<any>(`${API}/reports/share-register`);
  }
}
