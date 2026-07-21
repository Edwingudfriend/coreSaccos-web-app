/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { SaccosLoansService, SaccosSharesService, LoanTypeResponse } from '../core/saccos-shares.service';
import { SACCOS_API_CONFIG } from '../core/saccos-api.config';

@Component({
  selector: 'app-loan-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSnackBarModule],
  template: `
  <div style="padding:24px;max-width:600px;margin:0 auto">
    <div style="margin-bottom:16px">
      <a routerLink="/saccos/loans" style="color:#1a237e;text-decoration:none;font-size:14px">
        ← Back to Loans
      </a>
    </div>
    <h2 style="font-weight:700;color:#1a237e;margin:0 0 24px">New Loan Application</h2>

    <mat-card style="border-radius:16px">
      <mat-card-content style="padding:24px">

        <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
          <mat-label>Member Number</mat-label>
          <input matInput type="text" [(ngModel)]="form.memberNo" placeholder="e.g. RA-2026-0008"
            (blur)="lookupMember()">
        </mat-form-field>
        <div *ngIf="memberName" style="margin:-4px 0 16px;padding:8px 12px;border-radius:8px;font-size:13px;display:flex;align-items:center;gap:6px"
          [style.background]="memberName === 'Member not found' ? '#fff3e0' : '#e8f5e9'"
          [style.color]="memberName === 'Member not found' ? '#e65100' : '#2e7d32'">
          <mat-icon style="font-size:16px;width:16px;height:16px">
            {{ memberName === 'Member not found' ? 'error_outline' : 'check_circle' }}
          </mat-icon>
          {{ memberName }}
        </div>

        <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
          <mat-label>Loan Type</mat-label>
          <mat-select [(ngModel)]="form.loanTypeId" (selectionChange)="onLoanTypeChange()">
            <mat-option *ngFor="let lt of loanTypes" [value]="lt.id">
              {{ lt.name }} ({{ lt.interestRateAnnual }}% / up to {{ lt.maxTenureMonths }} mo)
            </mat-option>
          </mat-select>
        </mat-form-field>
        <div *ngIf="selectedLoanType" style="margin:-4px 0 16px;padding:8px 12px;border-radius:8px;font-size:13px;background:#e3f2fd;color:#1565c0">
          {{ selectedLoanType.description }}
        </div>

        <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
          <mat-label>Amount Requested (TZS)</mat-label>
          <input matInput type="number" [(ngModel)]="form.amountRequested" placeholder="e.g. 500000">
        </mat-form-field>

        <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
          <mat-label>Tenure (Months)</mat-label>
          <mat-select [(ngModel)]="form.tenureMonths">
            <mat-option *ngFor="let m of tenureOptions" [value]="m">{{ m }} months</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px">
          <mat-label>Purpose</mat-label>
          <input matInput [(ngModel)]="form.purpose" placeholder="e.g. Business expansion">
        </mat-form-field>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <button mat-stroked-button routerLink="/saccos/loans">Cancel</button>
          <button mat-raised-button color="primary"
            [disabled]="submitting || !resolvedMemberId || !form.loanTypeId || !form.amountRequested || !form.tenureMonths"
            (click)="submit()">
            <mat-icon>send</mat-icon>
            {{ submitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>

      </mat-card-content>
    </mat-card>
  </div>
  `
})
export class LoanApplyComponent implements OnInit {
  private loansService = inject(SaccosLoansService);
  private http = inject(HttpClient);
  private apiConfig = inject(SACCOS_API_CONFIG);
  private apiBase = this.apiConfig.baseUrl;
  private sharesService = inject(SaccosSharesService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  form = {
    memberNo: '' as string,
    loanTypeId: null as number | null,
    amountRequested: null as number | null,
    tenureMonths: 6,
    purpose: ''
  };
  resolvedMemberId: number | null = null;
  memberName = '';
  submitting = false;
  loanTypes: LoanTypeResponse[] = [];
  selectedLoanType: LoanTypeResponse | null = null;
  tenureOptions = [3, 6, 9, 12, 18, 24, 36];

  ngOnInit(): void {
    this.loansService.getLoanTypes().subscribe({
      next: (types) => {
        this.loanTypes = types;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snack.open('Failed to load loan types', 'OK', { duration: 3000 });
      }
    });
  }

  onLoanTypeChange(): void {
    this.selectedLoanType = this.loanTypes.find(lt => lt.id === this.form.loanTypeId) || null;
    if (this.selectedLoanType) {
      this.tenureOptions = [3, 6, 9, 12, 18, 24, 36].filter(m => m <= this.selectedLoanType!.maxTenureMonths);
      if (this.form.tenureMonths > this.selectedLoanType.maxTenureMonths) {
        this.form.tenureMonths = this.selectedLoanType.maxTenureMonths;
      }
    }
  }

  lookupMember(): void {
    if (!this.form.memberNo) { this.resolvedMemberId = null; return; }
    this.http.get<any>(`${this.apiBase}/members/by-number/${this.form.memberNo}`).subscribe({
      next: (m: any) => {
        this.resolvedMemberId = m?.id ?? null;
        this.memberName = m?.fullName || m?.name || (m?.id ? `Member #${m.id}` : 'Member not found');
        this.cdr.detectChanges();
      },
      error: () => { this.resolvedMemberId = null; this.memberName = 'Member not found'; this.cdr.detectChanges(); }
    });
  }

  submit(): void {
    if (!this.resolvedMemberId || !this.form.loanTypeId || !this.form.amountRequested || !this.form.tenureMonths) return;
    this.submitting = true;
    this.loansService.applyLoan({
      memberId: this.resolvedMemberId,
      loanTypeId: this.form.loanTypeId,
      amountRequested: this.form.amountRequested,
      tenureMonths: this.form.tenureMonths,
      purpose: this.form.purpose
    }).subscribe({
      next: (loan: any) => {
        this.snack.open('Loan application submitted!', 'OK', { duration: 3000 });
        this.router.navigate(['/saccos/loans', loan.id]);
      },
      error: (e: any) => {
        this.submitting = false;
        alert(e?.error?.error || 'Submission failed');
        this.cdr.detectChanges();
      }
    });
  }
}
