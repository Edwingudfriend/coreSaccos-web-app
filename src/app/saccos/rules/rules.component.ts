import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { SaccosRulesService, RulesResponse } from '../core/saccos-shares.service';

@Component({
  selector: 'mifosx-saccos-rules',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule,
            MatIconModule, MatTableModule, MatProgressSpinnerModule, MatChipsModule],
  template: `
    <div style="padding:24px">
      <a routerLink="/saccos" style="color:#1a237e;text-decoration:none;font-size:14px;display:block;margin-bottom:16px">← Back to SACCOS</a>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="margin:0;font-weight:700;color:#1a237e">SACCOS Rules</h2>
        <button mat-raised-button color="primary" routerLink="/saccos/rules/create">
          <mat-icon>add</mat-icon> New Rules Version
        </button>
      </div>

      <!-- Current Rules Card -->
      <div *ngIf="loadingCurrent" style="display:flex;justify-content:center;padding:32px">
        <mat-spinner diameter="36"></mat-spinner>
      </div>

      <mat-card *ngIf="current" style="border-radius:16px;margin-bottom:32px;border-left:5px solid #1a237e">
        <mat-card-content style="padding:24px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
            <div>
              <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:1px">Current Active Version</div>
              <div style="font-size:22px;font-weight:700;color:#1a237e;margin-top:4px">{{ current.versionLabel }}</div>
              <div style="font-size:13px;color:#666;margin-top:4px">
                Effective {{ current.effectiveFrom }} — {{ current.effectiveTo || 'Present' }}
              </div>
              <div style="font-size:12px;color:#888;margin-top:4px">
                Approved by: <strong>{{ current.approvedBy }}</strong>
                <span *ngIf="current.approvalReference"> · Ref: {{ current.approvalReference }}</span>
              </div>
            </div>
            <span style="background:#e8f5e9;color:#2e7d32;padding:6px 16px;border-radius:16px;font-weight:600;font-size:13px">
              ACTIVE
            </span>
          </div>

          <!-- Rules Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
            <div *ngFor="let item of ruleItems()" style="background:#f8f9fa;border-radius:12px;padding:16px">
              <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:0.5px;margin-bottom:6px">{{ item.label }}</div>
              <div style="font-size:18px;font-weight:700;color:#1a237e">{{ item.value }}</div>
            </div>
          </div>

          <div *ngIf="current.notes" style="margin-top:16px;padding:12px 16px;background:#fff3e0;border-radius:8px;font-size:13px;color:#e65100">
            <mat-icon style="font-size:16px;vertical-align:middle;margin-right:6px">info</mat-icon>{{ current.notes }}
          </div>
        </mat-card-content>
      </mat-card>

      <!-- History Table -->
      <h3 style="font-weight:600;color:#333;margin-bottom:16px">Version History</h3>
      <div *ngIf="loadingHistory" style="display:flex;justify-content:center;padding:24px">
        <mat-spinner diameter="36"></mat-spinner>
      </div>

      <mat-card *ngIf="history.length > 0" style="border-radius:12px">
        <mat-card-content style="padding:0">
          <table mat-table [dataSource]="history" style="width:100%">
            <ng-container matColumnDef="version">
              <th mat-header-cell *matHeaderCellDef style="padding:12px 16px;font-weight:600">Version</th>
              <td mat-cell *matCellDef="let r" style="padding:12px 16px;font-weight:600;color:#1a237e">{{ r.versionLabel }}</td>
            </ng-container>
            <ng-container matColumnDef="effective">
              <th mat-header-cell *matHeaderCellDef>Effective Period</th>
              <td mat-cell *matCellDef="let r" style="font-size:13px">
                {{ r.effectiveFrom }} — {{ r.effectiveTo || 'Present' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="multiplier">
              <th mat-header-cell *matHeaderCellDef style="text-align:right">Loan Multiplier</th>
              <td mat-cell *matCellDef="let r" style="text-align:right;font-weight:600">{{ r.loanMultiplier }}×</td>
            </ng-container>
            <ng-container matColumnDef="rate">
              <th mat-header-cell *matHeaderCellDef style="text-align:right">Interest Rate</th>
              <td mat-cell *matCellDef="let r" style="text-align:right">{{ r.loanInterestRateAnnual }}% p.a.</td>
            </ng-container>
            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Calc Method</th>
              <td mat-cell *matCellDef="let r">
                <span [style.background]="r.calculationMethod==='REDUCING_BALANCE' ? '#e3f2fd' : '#fff3e0'"
                      [style.color]="r.calculationMethod==='REDUCING_BALANCE' ? '#1565c0' : '#e65100'"
                      style="padding:3px 10px;border-radius:8px;font-size:12px;font-weight:500">
                  {{ r.calculationMethod === 'REDUCING_BALANCE' ? 'Reducing Balance' : 'Flat Rate' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="tenure">
              <th mat-header-cell *matHeaderCellDef style="text-align:right">Max Tenure</th>
              <td mat-cell *matCellDef="let r" style="text-align:right">{{ r.maxLoanTenureMonths }} mo</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r">
                <span [style.background]="r.isCurrent ? '#e8f5e9' : '#f5f5f5'"
                      [style.color]="r.isCurrent ? '#2e7d32' : '#9e9e9e'"
                      style="padding:3px 10px;border-radius:8px;font-size:12px;font-weight:500">
                  {{ r.isCurrent ? 'ACTIVE' : 'SUPERSEDED' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="correct">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let r" style="text-align:right;padding-right:16px">
                <button mat-stroked-button style="font-size:12px;height:32px;line-height:32px"
                  (click)="correctVersion(r.id)">
                  <mat-icon style="font-size:14px;width:14px;height:14px;margin-right:4px">edit</mat-icon>
                  Correct
                </button>
              </td>
            </ng-container>

            <ng-container matColumnDef="approvedBy">
              <th mat-header-cell *matHeaderCellDef>Approved By</th>
              <td mat-cell *matCellDef="let r" style="font-size:13px;color:#666">{{ r.approvedBy || '—' }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="histCols" style="background:#f5f5f5"></tr>
            <tr mat-row *matRowDef="let row; columns: histCols;" style="border-bottom:1px solid #f0f0f0"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RulesComponent implements OnInit {
  private rulesService = inject(SaccosRulesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loadingCurrent = true;
  loadingHistory = true;
  current: RulesResponse | null = null;
  history: RulesResponse[] = [];
  histCols = ['version', 'effective', 'multiplier', 'rate', 'method', 'tenure', 'status', 'approvedBy', 'correct'];

  correctVersion(id: number): void {
    this.router.navigate(['/saccos/rules/create'], { queryParams: { copyFrom: id } });
  }

  ngOnInit(): void {
    this.rulesService.getCurrent().subscribe({
      next: (r) => { this.current = r; this.loadingCurrent = false; this.cdr.detectChanges(); },
      error: () => { this.loadingCurrent = false; }
    });
    this.rulesService.getHistory().subscribe({
      next: (r) => { this.history = r; this.loadingHistory = false; this.cdr.detectChanges(); },
      error: () => { this.loadingHistory = false; }
    });
  }

  ruleItems(): {label: string, value: string}[] {
    if (!this.current) return [];
    const c = this.current;
    return [
      { label: 'Loan Multiplier', value: `${c.loanMultiplier}×` },
      { label: 'Annual Interest Rate', value: `${c.loanInterestRateAnnual}%` },
      { label: 'Max Loan Tenure', value: `${c.maxLoanTenureMonths} months` },
      { label: 'Calculation Method', value: c.calculationMethod === 'REDUCING_BALANCE' ? 'Reducing Balance' : 'Flat Rate' },
      { label: 'Min Guarantors', value: `${c.minGuarantors}` },
      { label: 'Membership Fee', value: `TZS ${c.membershipFee.toLocaleString()}` },
      { label: 'Share Par Value', value: `TZS ${c.shareParValue.toLocaleString()}` },
      { label: 'Min Shares', value: `${c.minSharesSubscription}` },
      { label: 'Max Shares', value: `${c.maxSharesSubscription}` },
      { label: 'Min Monthly Contribution', value: `TZS ${c.minMonthlyContribution.toLocaleString()}` },
      { label: 'Dormancy Threshold', value: `${c.dormancyThresholdMonths} months` },
      { label: 'Min Paid-Up for Dividend', value: `${c.minPaidUpForDividend} shares` },
    ];
  }
}
