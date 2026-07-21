/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SaccosReportsService } from '../core/saccos-shares.service';

@Component({
  selector: 'mifosx-saccos-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTabsModule, MatCardModule, MatTableModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
  <div style="padding:24px">
    <h2 style="margin:0 0 24px;font-weight:600">Reports</h2>

    <mat-tab-group (selectedTabChange)="onTabChange($event.index)">

      <!-- Loan Portfolio -->
      <mat-tab label="Loan Portfolio">
        <div style="padding-top:20px" *ngIf="portfolio as p">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:24px">
            <div style="background:#e3f2fd;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#1565c0">{{ p.totalLoans }}</div>
              <div style="font-size:12px;color:#666">Total Loans</div>
            </div>
            <div style="background:#e8f5e9;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#2e7d32">{{ p.activeLoans }}</div>
              <div style="font-size:12px;color:#666">Active</div>
            </div>
            <div style="background:#fff3e0;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#e65100">{{ p.overdueLoans }}</div>
              <div style="font-size:12px;color:#666">Overdue</div>
            </div>
            <div style="background:#f5f5f5;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#616161">{{ p.closedLoans }}</div>
              <div style="font-size:12px;color:#666">Closed</div>
            </div>
            <div style="background:#f3e5f5;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#6a1b9a">{{ p.pendingApprovalLoans }}</div>
              <div style="font-size:12px;color:#666">Pending</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px">
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:16px">
              <div style="font-size:12px;color:#666">Total Disbursed</div>
              <div style="font-size:20px;font-weight:700;color:#1565c0">TZS {{ p.totalDisbursed | number:'1.0-0' }}</div>
            </div>
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:16px">
              <div style="font-size:12px;color:#666">Total Repaid</div>
              <div style="font-size:20px;font-weight:700;color:#2e7d32">TZS {{ p.totalRepaid | number:'1.0-0' }}</div>
            </div>
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:16px">
              <div style="font-size:12px;color:#666">Outstanding</div>
              <div style="font-size:20px;font-weight:700;color:#e65100">TZS {{ p.totalOutstanding | number:'1.0-0' }}</div>
            </div>
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:16px">
              <div style="font-size:12px;color:#666">Overdue Amount</div>
              <div style="font-size:20px;font-weight:700;color:#c62828">TZS {{ p.totalOverdue | number:'1.0-0' }}</div>
            </div>
          </div>

          <table mat-table [dataSource]="p.loans" style="width:100%" *ngIf="p.loans?.length">
            <ng-container matColumnDef="loanNo">
              <th mat-header-cell *matHeaderCellDef>Loan No</th>
              <td mat-cell *matCellDef="let l" style="font-weight:600">{{ l.loanNo }}</td>
            </ng-container>
            <ng-container matColumnDef="member">
              <th mat-header-cell *matHeaderCellDef>Member</th>
              <td mat-cell *matCellDef="let l">{{ l.memberName }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let l">
                <span [style.background]="loanBg(l.status)" [style.color]="loanFg(l.status)"
                  style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600">{{ l.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="disbursed">
              <th mat-header-cell *matHeaderCellDef>Disbursed</th>
              <td mat-cell *matCellDef="let l">{{ l.amountDisbursed | number:'1.0-0' }}</td>
            </ng-container>
            <ng-container matColumnDef="outstanding">
              <th mat-header-cell *matHeaderCellDef>Outstanding</th>
              <td mat-cell *matCellDef="let l" style="color:#e65100;font-weight:600">{{ l.outstanding | number:'1.0-0' }}</td>
            </ng-container>
            <ng-container matColumnDef="overdue">
              <th mat-header-cell *matHeaderCellDef>Overdue</th>
              <td mat-cell *matCellDef="let l">
                <span *ngIf="l.overdueInstallments > 0" style="color:#c62828;font-weight:600">
                  {{ l.overdueInstallments }} ({{ l.overdueAmount | number:'1.0-0' }})
                </span>
                <span *ngIf="l.overdueInstallments === 0" style="color:#9e9e9e">—</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="portfolioCols"></tr>
            <tr mat-row *matRowDef="let row; columns: portfolioCols;"></tr>
          </table>
        </div>
        <div *ngIf="!portfolio && !loading" style="padding:48px;text-align:center;color:#9e9e9e">No data</div>
      </mat-tab>

      <!-- Overdue -->
      <mat-tab label="Overdue Loans">
        <div style="padding-top:20px" *ngIf="overdue as o">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:24px">
            <div style="background:#ffebee;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#c62828">{{ o.totalOverdueLoans }}</div>
              <div style="font-size:12px;color:#666">Overdue Loans</div>
            </div>
            <div style="background:#fff3e0;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#e65100">{{ o.totalOverdueInstallments }}</div>
              <div style="font-size:12px;color:#666">Overdue Installments</div>
            </div>
            <div style="background:#fce4ec;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:#ad1457">TZS {{ o.totalOverdueAmount | number:'1.0-0' }}</div>
              <div style="font-size:12px;color:#666">Overdue Amount</div>
            </div>
          </div>
          <table mat-table [dataSource]="o.items" style="width:100%" *ngIf="o.items?.length">
            <ng-container matColumnDef="loanNo">
              <th mat-header-cell *matHeaderCellDef>Loan No</th>
              <td mat-cell *matCellDef="let i" style="font-weight:600">{{ i.loanNo }}</td>
            </ng-container>
            <ng-container matColumnDef="member">
              <th mat-header-cell *matHeaderCellDef>Member</th>
              <td mat-cell *matCellDef="let i">{{ i.memberName }} ({{ i.memberNo }})</td>
            </ng-container>
            <ng-container matColumnDef="installments">
              <th mat-header-cell *matHeaderCellDef>Overdue #</th>
              <td mat-cell *matCellDef="let i" style="color:#c62828;font-weight:600">{{ i.overdueInstallments }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let i" style="color:#c62828;font-weight:600">{{ i.overdueAmount | number:'1.0-0' }}</td>
            </ng-container>
            <ng-container matColumnDef="oldest">
              <th mat-header-cell *matHeaderCellDef>Oldest Due Date</th>
              <td mat-cell *matCellDef="let i">{{ i.oldestDueDate }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="overdueCols"></tr>
            <tr mat-row *matRowDef="let row; columns: overdueCols;"></tr>
          </table>
          <div *ngIf="!o.items?.length" style="padding:48px;text-align:center;color:#2e7d32">
            <mat-icon style="font-size:48px;width:48px;height:48px">check_circle</mat-icon>
            <p>No overdue loans 🎉</p>
          </div>
        </div>
      </mat-tab>

      <!-- Share Register -->
      <mat-tab label="Share Register">
        <div style="padding-top:20px" *ngIf="shareRegister as s">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:24px">
            <div style="background:#e3f2fd;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#1565c0">{{ s.totalMembers }}</div>
              <div style="font-size:12px;color:#666">Members with Shares</div>
            </div>
            <div style="background:#e8f5e9;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#2e7d32">{{ s.totalSharesSubscribed }}</div>
              <div style="font-size:12px;color:#666">Total Subscribed</div>
            </div>
            <div style="background:#fff3e0;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:24px;font-weight:700;color:#e65100">{{ s.totalSharesPaidUp }}</div>
              <div style="font-size:12px;color:#666">Total Paid Up</div>
            </div>
            <div style="background:#f3e5f5;border-radius:12px;padding:16px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:#6a1b9a">TZS {{ s.totalValue | number:'1.0-0' }}</div>
              <div style="font-size:12px;color:#666">Total Value</div>
            </div>
          </div>
          <table mat-table [dataSource]="s.items" style="width:100%" *ngIf="s.items?.length">
            <ng-container matColumnDef="member">
              <th mat-header-cell *matHeaderCellDef>Member</th>
              <td mat-cell *matCellDef="let i" style="font-weight:600">{{ i.fullName }} ({{ i.memberNo }})</td>
            </ng-container>
            <ng-container matColumnDef="subscribed">
              <th mat-header-cell *matHeaderCellDef>Subscribed</th>
              <td mat-cell *matCellDef="let i">{{ i.sharesSubscribed }}</td>
            </ng-container>
            <ng-container matColumnDef="paidUp">
              <th mat-header-cell *matHeaderCellDef>Paid Up</th>
              <td mat-cell *matCellDef="let i" style="color:#2e7d32;font-weight:600">{{ i.sharesPaidUp }}</td>
            </ng-container>
            <ng-container matColumnDef="outstanding">
              <th mat-header-cell *matHeaderCellDef>Outstanding</th>
              <td mat-cell *matCellDef="let i" style="color:#e65100">{{ i.sharesOutstanding }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount Paid (TZS)</th>
              <td mat-cell *matCellDef="let i">{{ i.amountPaidUp | number:'1.0-0' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let i">
                <span [style.background]="i.status==='FULLY_PAID'?'#e8f5e9':'#fff3e0'"
                      [style.color]="i.status==='FULLY_PAID'?'#2e7d32':'#e65100'"
                  style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600">{{ i.status }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="shareCols"></tr>
            <tr mat-row *matRowDef="let row; columns: shareCols;"></tr>
          </table>
        </div>
      </mat-tab>

      <!-- Member Statement -->
      <mat-tab label="Member Statement">
        <div style="padding-top:20px">
          <div style="display:flex;gap:12px;align-items:flex-end;margin-bottom:24px">
            <mat-form-field appearance="outline">
              <mat-label>Member ID</mat-label>
              <input matInput type="number" [(ngModel)]="statementMemberId">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="loadStatement()">
              <mat-icon>description</mat-icon> Generate
            </button>
          </div>

          <div *ngIf="statement as st">
            <mat-card style="border-radius:16px;margin-bottom:20px">
              <mat-card-content style="padding:20px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                  <div>
                    <div style="font-weight:700;font-size:18px;color:#1a237e">{{ st.fullName }}</div>
                    <div style="color:#666;font-size:13px">{{ st.memberNo }} · Joined {{ st.joinedDate }}</div>
                  </div>
                  <span [style.background]="st.status==='ACTIVE'?'#e8f5e9':'#fff3e0'"
                        [style.color]="st.status==='ACTIVE'?'#2e7d32':'#e65100'"
                    style="padding:4px 14px;border-radius:14px;font-weight:600">{{ st.status }}</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
                  <div style="background:#e3f2fd;border-radius:10px;padding:14px;text-align:center">
                    <div style="font-weight:700;color:#1565c0">{{ st.sharesPaidUp }}/{{ st.sharesSubscribed }}</div>
                    <div style="font-size:11px;color:#666">Shares Paid/Subscribed</div>
                  </div>
                  <div style="background:#f3e5f5;border-radius:10px;padding:14px;text-align:center">
                    <div style="font-weight:700;color:#6a1b9a">TZS {{ st.totalContributions | number:'1.0-0' }}</div>
                    <div style="font-size:11px;color:#666">{{ st.contributionCount }} Contributions</div>
                  </div>
                  <div style="background:#e8f5e9;border-radius:10px;padding:14px;text-align:center">
                    <div style="font-weight:700;color:#2e7d32">TZS {{ st.totalRepaid | number:'1.0-0' }}</div>
                    <div style="font-size:11px;color:#666">Total Repaid</div>
                  </div>
                  <div style="background:#fff3e0;border-radius:10px;padding:14px;text-align:center">
                    <div style="font-weight:700;color:#e65100">TZS {{ st.totalOutstanding | number:'1.0-0' }}</div>
                    <div style="font-size:11px;color:#666">Outstanding</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <h4 style="margin:0 0 12px;color:#1a237e">Loan History</h4>
            <table mat-table [dataSource]="st.loans" style="width:100%" *ngIf="st.loans?.length">
              <ng-container matColumnDef="loanNo">
                <th mat-header-cell *matHeaderCellDef>Loan No</th>
                <td mat-cell *matCellDef="let l" style="font-weight:600">{{ l.loanNo }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let l">
                  <span [style.background]="loanBg(l.status)" [style.color]="loanFg(l.status)"
                    style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600">{{ l.status }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="disbursed">
                <th mat-header-cell *matHeaderCellDef>Disbursed</th>
                <td mat-cell *matCellDef="let l">{{ l.amountDisbursed | number:'1.0-0' }}</td>
              </ng-container>
              <ng-container matColumnDef="repaid">
                <th mat-header-cell *matHeaderCellDef>Repaid</th>
                <td mat-cell *matCellDef="let l" style="color:#2e7d32">{{ l.totalRepaid | number:'1.0-0' }}</td>
              </ng-container>
              <ng-container matColumnDef="outstanding">
                <th mat-header-cell *matHeaderCellDef>Outstanding</th>
                <td mat-cell *matCellDef="let l" style="color:#e65100">{{ l.outstanding | number:'1.0-0' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="statementLoanCols"></tr>
              <tr mat-row *matRowDef="let row; columns: statementLoanCols;"></tr>
            </table>
            <div *ngIf="!st.loans?.length" style="color:#9e9e9e;padding:16px">No loans on record.</div>
          </div>
        </div>
      </mat-tab>

    </mat-tab-group>
  </div>
  `
})
export class SaccosReportsComponent implements OnInit {
  private reportsService = inject(SaccosReportsService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  portfolio: any = null;
  overdue: any = null;
  shareRegister: any = null;
  statement: any = null;
  statementMemberId = 1;

  portfolioCols = ['loanNo', 'member', 'status', 'disbursed', 'outstanding', 'overdue'];
  overdueCols = ['loanNo', 'member', 'installments', 'amount', 'oldest'];
  shareCols = ['member', 'subscribed', 'paidUp', 'outstanding', 'amount', 'status'];
  statementLoanCols = ['loanNo', 'status', 'disbursed', 'repaid', 'outstanding'];

  ngOnInit(): void {
    this.loadPortfolio();
  }

  onTabChange(index: number): void {
    if (index === 0 && !this.portfolio) this.loadPortfolio();
    if (index === 1 && !this.overdue) this.loadOverdue();
    if (index === 2 && !this.shareRegister) this.loadShareRegister();
  }

  loadPortfolio(): void {
    this.loading = true;
    this.reportsService.getLoanPortfolio().subscribe({
      next: (d) => { this.portfolio = d; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadOverdue(): void {
    this.reportsService.getOverdueReport().subscribe({
      next: (d) => { this.overdue = d; this.cdr.detectChanges(); }
    });
  }

  loadShareRegister(): void {
    this.reportsService.getShareRegister().subscribe({
      next: (d) => { this.shareRegister = d; this.cdr.detectChanges(); }
    });
  }

  loadStatement(): void {
    this.reportsService.getMemberStatement(this.statementMemberId).subscribe({
      next: (d) => { this.statement = d; this.cdr.detectChanges(); },
      error: (e: any) => { alert(e?.error?.error || 'Failed to load statement'); }
    });
  }

  loanBg(s: string): string {
    const m: any = { ACTIVE:'#e8f5e9', APPROVED:'#e3f2fd', PENDING_APPROVAL:'#fff3e0', CLOSED:'#f5f5f5', REJECTED:'#ffebee' };
    return m[s] || '#f5f5f5';
  }
  loanFg(s: string): string {
    const m: any = { ACTIVE:'#2e7d32', APPROVED:'#1565c0', PENDING_APPROVAL:'#e65100', CLOSED:'#616161', REJECTED:'#c62828' };
    return m[s] || '#333';
  }
}
