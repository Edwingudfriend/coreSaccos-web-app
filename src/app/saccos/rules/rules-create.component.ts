import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SaccosRulesService } from '../core/saccos-shares.service';

@Component({
  selector: 'mifosx-rules-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule,
            MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  template: `
    <div style="padding:24px;max-width:800px;margin:0 auto">
      <a routerLink="/saccos/rules" style="color:#1a237e;text-decoration:none;font-size:14px;display:block;margin-bottom:16px">
        ← Back to Rules
      </a>
      <h2 style="font-weight:700;color:#1a237e;margin:0 0 8px">New Rules Version</h2>
      <div *ngIf="copyingFrom" style="background:#fff3e0;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#e65100;display:flex;align-items:center;gap:8px">
        <mat-icon style="font-size:16px;width:16px;height:16px">content_copy</mat-icon>
        Pre-filled from version ID {{ copyingFrom }}. Update the Version Label, Effective From date, and correct any mistakes before saving.
      </div>
      <p style="color:#666;font-size:14px;margin:0 0 24px">
        Creating a new version will supersede the current active version. This action cannot be undone.
      </p>

      <mat-card style="border-radius:16px">
        <mat-card-content style="padding:24px">

          <!-- Version Info -->
          <h4 style="color:#1a237e;margin:0 0 16px;font-weight:600;border-bottom:1px solid #f0f0f0;padding-bottom:8px">
            Version Information
          </h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
            <mat-form-field appearance="outline">
              <mat-label>Version Label</mat-label>
              <input matInput [(ngModel)]="form.versionLabel" placeholder="e.g. 2026-AGM-V3">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Effective From</mat-label>
              <input matInput type="date" [(ngModel)]="form.effectiveFrom">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Approved By</mat-label>
              <input matInput [(ngModel)]="form.approvedBy" placeholder="e.g. Board Chairman">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Approval Reference</mat-label>
              <input matInput [(ngModel)]="form.approvalReference" placeholder="e.g. AGM-2026-MIN-008">
            </mat-form-field>
          </div>

          <!-- Loan Parameters -->
          <h4 style="color:#1a237e;margin:0 0 16px;font-weight:600;border-bottom:1px solid #f0f0f0;padding-bottom:8px">
            Loan Parameters
          </h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px">
            <mat-form-field appearance="outline">
              <mat-label>Loan Multiplier</mat-label>
              <input matInput type="number" [(ngModel)]="form.loanMultiplier" placeholder="e.g. 3.5">
              <mat-hint>Paid-up shares × multiplier = max loan</mat-hint>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Annual Interest Rate (%)</mat-label>
              <input matInput type="number" [(ngModel)]="form.loanInterestRateAnnual" placeholder="e.g. 11">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Max Loan Tenure (Months)</mat-label>
              <input matInput type="number" [(ngModel)]="form.maxLoanTenureMonths" placeholder="e.g. 48">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Calculation Method</mat-label>
              <mat-select [(ngModel)]="form.calculationMethod">
                <mat-option value="REDUCING_BALANCE">Reducing Balance</mat-option>
                <mat-option value="FLAT">Flat Rate</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Min Guarantors</mat-label>
              <input matInput type="number" [(ngModel)]="form.minGuarantors" placeholder="e.g. 2">
            </mat-form-field>
          </div>

          <!-- Membership & Shares -->
          <h4 style="color:#1a237e;margin:0 0 16px;font-weight:600;border-bottom:1px solid #f0f0f0;padding-bottom:8px">
            Membership & Shares
          </h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px">
            <mat-form-field appearance="outline">
              <mat-label>Membership Fee (TZS)</mat-label>
              <input matInput type="number" [(ngModel)]="form.membershipFee" placeholder="e.g. 15000">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Share Par Value (TZS)</mat-label>
              <input matInput type="number" [(ngModel)]="form.shareParValue" placeholder="e.g. 1000">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Min Shares Subscription</mat-label>
              <input matInput type="number" [(ngModel)]="form.minSharesSubscription" placeholder="e.g. 50">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Max Shares Subscription</mat-label>
              <input matInput type="number" [(ngModel)]="form.maxSharesSubscription" placeholder="e.g. 2000">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Min Monthly Contribution (TZS)</mat-label>
              <input matInput type="number" [(ngModel)]="form.minMonthlyContribution" placeholder="e.g. 50000">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Dormancy Threshold (Months)</mat-label>
              <input matInput type="number" [(ngModel)]="form.dormancyThresholdMonths" placeholder="e.g. 3">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Min Paid-Up Shares for Dividend</mat-label>
              <input matInput type="number" [(ngModel)]="form.minPaidUpForDividend" placeholder="e.g. 25">
            </mat-form-field>
          </div>

          <!-- Notes -->
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:24px">
            <mat-label>Notes (optional)</mat-label>
            <textarea matInput [(ngModel)]="form.notes" rows="3"
              placeholder="e.g. AGM July 2026 — increased loan multiplier"></textarea>
          </mat-form-field>

          <div style="display:flex;gap:12px;justify-content:flex-end">
            <button mat-stroked-button routerLink="/saccos/rules">Cancel</button>
            <button mat-raised-button color="primary"
              [disabled]="submitting || !isValid()"
              (click)="submit()">
              <mat-icon>save</mat-icon>
              {{ submitting ? 'Saving...' : 'Create Rules Version' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RulesCreateComponent implements OnInit {
  private rulesService = inject(SaccosRulesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  submitting = false;
  copyingFrom: number | null = null;
  form = {
    versionLabel: '', effectiveFrom: '',
    membershipFee: null as number | null,
    shareParValue: null as number | null,
    minSharesSubscription: null as number | null,
    maxSharesSubscription: null as number | null,
    loanMultiplier: null as number | null,
    loanInterestRateAnnual: null as number | null,
    calculationMethod: 'REDUCING_BALANCE',
    maxLoanTenureMonths: null as number | null,
    minGuarantors: null as number | null,
    minMonthlyContribution: null as number | null,
    dormancyThresholdMonths: null as number | null,
    minPaidUpForDividend: null as number | null,
    approvedBy: '', approvalReference: '', notes: ''
  };

  ngOnInit(): void {
    const copyFrom = this.route.snapshot.queryParamMap.get('copyFrom');
    if (copyFrom) {
      this.copyingFrom = +copyFrom;
      this.rulesService.getHistory().subscribe({
        next: (history) => {
          const src = history.find(r => r.id === this.copyingFrom);
          if (src) {
            this.form = {
              versionLabel: '', effectiveFrom: '',
              membershipFee: src.membershipFee,
              shareParValue: src.shareParValue,
              minSharesSubscription: src.minSharesSubscription,
              maxSharesSubscription: src.maxSharesSubscription,
              loanMultiplier: src.loanMultiplier,
              loanInterestRateAnnual: src.loanInterestRateAnnual,
              calculationMethod: src.calculationMethod,
              maxLoanTenureMonths: src.maxLoanTenureMonths,
              minGuarantors: src.minGuarantors,
              minMonthlyContribution: src.minMonthlyContribution,
              dormancyThresholdMonths: src.dormancyThresholdMonths,
              minPaidUpForDividend: src.minPaidUpForDividend,
              approvedBy: src.approvedBy || '',
              approvalReference: '',
              notes: ''
            };
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  isValid(): boolean {
    return !!(this.form.versionLabel && this.form.effectiveFrom &&
      this.form.loanMultiplier && this.form.loanInterestRateAnnual &&
      this.form.maxLoanTenureMonths && this.form.membershipFee &&
      this.form.shareParValue && this.form.minSharesSubscription &&
      this.form.maxSharesSubscription && this.form.minMonthlyContribution &&
      this.form.dormancyThresholdMonths && this.form.minPaidUpForDividend &&
      this.form.minGuarantors !== null);
  }

  submit(): void {
    if (!this.isValid()) return;
    this.submitting = true;
    this.rulesService.create(this.form as any).subscribe({
      next: () => {
        this.snack.open('New rules version created successfully', 'OK', { duration: 3000 });
        this.router.navigate(['/saccos/rules']);
      },
      error: (e: any) => {
        this.submitting = false;
        alert(e?.error?.error || e?.error?.defaultUserMessage || 'Failed to create rules version');
        this.cdr.detectChanges();
      }
    });
  }
}
