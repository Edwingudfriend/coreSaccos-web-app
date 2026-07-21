/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SaccosLoansService, LoanResponse } from '../core/saccos-shares.service';

@Component({
  selector: 'mifosx-loans',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <div style="padding:24px">
      <a routerLink="/saccos" style="color:#1a237e;text-decoration:none;font-size:14px;display:block;margin-bottom:16px">← Back to SACCOS</a>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="margin:0;font-weight:600">Loans</h2>
        <button mat-raised-button color="primary" routerLink="/saccos/loans/apply">
          <mat-icon>add</mat-icon> New Loan
        </button>
      </div>
      <div *ngIf="state==='loading'" style="display:flex;justify-content:center;padding:48px"><mat-spinner diameter="40"></mat-spinner></div>
      <div *ngIf="state==='error'" style="color:#c62828;padding:24px;text-align:center"><mat-icon>error_outline</mat-icon><p>{{ errorMessage }}</p></div>
      <div *ngIf="state==='empty'" style="text-align:center;padding:48px;color:#9e9e9e">
        <mat-icon style="font-size:48px;width:48px;height:48px">account_balance_wallet</mat-icon>
        <p style="margin-top:16px">No loans found.</p>
      </div>
      <div *ngFor="let loan of loans" style="margin-bottom:20px">
        <mat-card style="border-radius:12px;cursor:pointer" (click)="viewLoan(loan.id)">
          <mat-card-content style="padding:24px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <div style="font-size:18px;font-weight:700;color:#1a237e">{{ loan.loanNo }}</div>
                <div style="color:#666;font-size:14px;margin-top:4px">{{ loan.purpose }}</div>
              </div>
              <span [style.background]="statusBg(loan.status)" [style.color]="statusColor(loan.status)"
                    style="padding:4px 12px;border-radius:12px;font-size:13px;font-weight:500">{{ loan.status }}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px">
              <div style="text-align:center">
                <div style="font-size:20px;font-weight:700;color:#e65100">TZS {{ (loan.amountApproved || loan.amountRequested) | number }}</div>
                <div style="font-size:12px;color:#666;margin-top:4px">{{ loan.amountApproved ? "Approved" : "Requested" }}</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:20px;font-weight:700;color:#1565c0">{{ loan.interestRateAnnual }}%</div>
                <div style="font-size:12px;color:#666;margin-top:4px">Annual Rate</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:20px;font-weight:700;color:#2e7d32">{{ loan.tenureMonths }} mo</div>
                <div style="font-size:12px;color:#666;margin-top:4px">Tenure</div>
              </div>
            </div>
            <div style="margin-top:16px;font-size:13px;color:#888">Applied: {{ loan.appliedDate }}</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class LoansComponent implements OnInit {
  private loansService = inject(SaccosLoansService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  state: 'loading' | 'loaded' | 'empty' | 'error' = 'loading';
  errorMessage = '';
  loans: LoanResponse[] = [];
  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('memberId');
    this.loansService.getMemberLoans(id ? +id : 1).subscribe({
      next: (data) => { this.loans = data; this.state = data.length ? 'loaded' : 'empty'; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Could not load loans.'; this.state = 'error'; this.cdr.detectChanges(); }
    });
  }
  viewLoan(id: number): void { this.router.navigate(['/saccos/loans', id]); }
  statusBg(s: string): string {
    const m: Record<string,string> = { ACTIVE:'#e8f5e9', APPROVED:'#e3f2fd', PENDING_APPROVAL:'#fff3e0', CLOSED:'#f5f5f5', REJECTED:'#ffebee' };
    return m[s] || '#f5f5f5';
  }
  statusColor(s: string): string {
    const m: Record<string,string> = { ACTIVE:'#2e7d32', APPROVED:'#1565c0', PENDING_APPROVAL:'#e65100', CLOSED:'#616161', REJECTED:'#c62828' };
    return m[s] || '#333';
  }
}
