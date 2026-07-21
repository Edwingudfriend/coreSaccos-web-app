/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SACCOS_API_CONFIG, SaccosApiConfig } from '../core/saccos-api.config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  SaccosLoansService, LoanResponse, ScheduleResponse,
  RepaymentResponse, LoanSummaryResponse, MakeRepaymentRequest
} from '../core/saccos-shares.service';

@Component({
  selector: 'mifosx-loan-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule,
            MatProgressSpinnerModule, MatIconModule, MatTableModule,
            MatButtonModule, MatTabsModule, MatInputModule, MatFormFieldModule,
            MatSelectModule, MatSnackBarModule],
  template: `
    <div style="padding:24px">
      <div style="margin-bottom:16px">
        <a routerLink="/saccos/loans" style="color:#1a237e;text-decoration:none;font-size:14px;">
          ← Back to Loans
        </a>
      </div>

      <div *ngIf="loading" style="display:flex;justify-content:center;padding:48px">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!loading && loan">

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <div>
            <h2 style="margin:0;font-weight:700;color:#1a237e">{{ loan.loanNo }}</h2>
            <p style="margin:4px 0 0;color:#666">{{ loan.purpose }}</p>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <span [style.background]="statusBg(loan.status)"
                  [style.color]="statusColor(loan.status)"
                  style="padding:6px 16px;border-radius:16px;font-weight:600;font-size:14px">
              {{ loan.status }}
            </span>
            <mat-form-field appearance="outline" style="width:160px;margin-bottom:-1.25em"
              *ngIf="loan.status === 'PENDING_APPROVAL'">
              <mat-label>Approve Amount</mat-label>
              <input matInput type="number" [(ngModel)]="approveAmount"
                [max]="loan.maxEligibleAmount" [placeholder]="loan.amountRequested.toString()">
            </mat-form-field>
            <button mat-raised-button color="primary"
              *ngIf="loan.status === 'PENDING_APPROVAL'"
              [disabled]="actionBusy || !approveAmount"
              (click)="approveLoan()">
              <mat-icon>check_circle</mat-icon> Approve
            </button>
            <button mat-stroked-button color="warn"
              *ngIf="loan.status === 'PENDING_APPROVAL'"
              [disabled]="actionBusy"
              (click)="rejectLoan()">
              <mat-icon>cancel</mat-icon> Reject
            </button>
            <button mat-raised-button color="primary"
              *ngIf="loan.status === 'APPROVED'"
              [disabled]="actionBusy"
              (click)="disburseLoan()">
              <mat-icon>payments</mat-icon> Disburse
            </button>
          </div>
        </div>

        <!-- Summary cards -->
        <div *ngIf="summary" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:24px">
          <mat-card style="border-radius:12px;background:#e3f2fd">
            <mat-card-content style="padding:16px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:#1565c0">
                TZS {{ summary.amountDisbursed | number:'1.0-0' }}
              </div>
              <div style="font-size:12px;color:#666;margin-top:4px">Disbursed</div>
            </mat-card-content>
          </mat-card>
          <mat-card style="border-radius:12px;background:#e8f5e9">
            <mat-card-content style="padding:16px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:#2e7d32">
                TZS {{ summary.totalRepaid | number:'1.0-0' }}
              </div>
              <div style="font-size:12px;color:#666;margin-top:4px">Repaid</div>
            </mat-card-content>
          </mat-card>
          <mat-card style="border-radius:12px;background:#fff3e0">
            <mat-card-content style="padding:16px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:#e65100">
                TZS {{ summary.outstandingBalance | number:'1.0-0' }}
              </div>
              <div style="font-size:12px;color:#666;margin-top:4px">Outstanding</div>
            </mat-card-content>
          </mat-card>
          <mat-card style="border-radius:12px;background:#f3e5f5">
            <mat-card-content style="padding:16px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:#6a1b9a">
                {{ summary.paidInstallments }}/{{ summary.totalInstallments }}
              </div>
              <div style="font-size:12px;color:#666;margin-top:4px">Installments</div>
            </mat-card-content>
          </mat-card>
          <mat-card *ngIf="summary.overdueInstallments > 0"
                    style="border-radius:12px;background:#ffebee">
            <mat-card-content style="padding:16px;text-align:center">
              <div style="font-size:18px;font-weight:700;color:#c62828">
                {{ summary.overdueInstallments }}
              </div>
              <div style="font-size:12px;color:#666;margin-top:4px">Overdue</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Progress bar -->
        <div *ngIf="summary" style="margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
            <span>Repayment Progress</span>
            <span style="font-weight:600">{{ repaymentProgress() }}%</span>
          </div>
          <div style="background:#e0e0e0;border-radius:4px;height:10px;overflow:hidden">
            <div [style.width]="repaymentProgress() + '%'"
                 style="height:100%;background:#2e7d32;border-radius:4px;transition:width 0.3s"></div>
          </div>
        </div>

        <!-- Tabs -->
        <mat-tab-group>

          <!-- Schedule Tab -->
          <mat-tab label="Repayment Schedule">
            <div style="padding-top:16px">
              <div *ngIf="schedule.length === 0 && loan.status === 'ACTIVE'"
                   style="text-align:center;padding:32px">
                <p style="color:#666">No schedule generated yet.</p>
                <button mat-raised-button color="primary" (click)="generateSchedule()">
                  Generate Schedule
                </button>
              </div>

              <mat-card *ngIf="schedule.length > 0" style="border-radius:12px">
                <mat-card-content style="padding:0;overflow-x:auto">
                  <table mat-table [dataSource]="schedule" style="width:100%">

                    <ng-container matColumnDef="no">
                      <th mat-header-cell *matHeaderCellDef style="padding:12px 16px">#</th>
                      <td mat-cell *matCellDef="let s" style="padding:12px 16px">{{ s.installmentNo }}</td>
                    </ng-container>

                    <ng-container matColumnDef="dueDate">
                      <th mat-header-cell *matHeaderCellDef>Due Date</th>
                      <td mat-cell *matCellDef="let s">{{ s.dueDate }}</td>
                    </ng-container>

                    <ng-container matColumnDef="principal">
                      <th mat-header-cell *matHeaderCellDef style="text-align:right">Principal</th>
                      <td mat-cell *matCellDef="let s" style="text-align:right">
                        {{ s.principalDue | number:'1.0-0' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="interest">
                      <th mat-header-cell *matHeaderCellDef style="text-align:right">Interest</th>
                      <td mat-cell *matCellDef="let s" style="text-align:right;color:#666">
                        {{ s.interestDue | number:'1.0-0' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="total">
                      <th mat-header-cell *matHeaderCellDef style="text-align:right">EMI</th>
                      <td mat-cell *matCellDef="let s" style="text-align:right;font-weight:600">
                        {{ s.totalDue | number:'1.0-0' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="balance">
                      <th mat-header-cell *matHeaderCellDef style="text-align:right">Balance</th>
                      <td mat-cell *matCellDef="let s" style="text-align:right;color:#e65100">
                        {{ s.balance | number:'1.0-0' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let s">
                        <span [style.color]="scheduleStatusColor(s.status)"
                              [style.background]="scheduleStatusBg(s.status)"
                              style="padding:2px 8px;border-radius:8px;font-size:12px;font-weight:500">
                          {{ s.status }}
                        </span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="schedCols" style="background:#f5f5f5"></tr>
                    <tr mat-row *matRowDef="let row; columns: schedCols;"
                        [style.background]="row.status==='PAID' ? '#f9fff9' : row.status==='OVERDUE' ? '#fff9f9' : ''"
                        style="border-bottom:1px solid #f0f0f0"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Make Repayment Tab -->
          <mat-tab label="Make Repayment" *ngIf="loan.status === 'ACTIVE'">
            <div style="padding-top:24px;max-width:480px">
              <mat-card style="border-radius:12px">
                <mat-card-content style="padding:24px">
                  <h3 style="margin:0 0 20px;font-weight:600">Record Repayment</h3>

                  <mat-form-field appearance="outline" style="width:100%;margin-bottom:4px">
                    <mat-label>Amount (TZS)</mat-label>
                    <input matInput type="number" [(ngModel)]="repayForm.amountPaid"
                           [placeholder]="nextInstallmentAmount()">
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="width:100%;margin-bottom:4px">
                    <mat-label>Payment Date</mat-label>
                    <input matInput type="date" [(ngModel)]="repayForm.paymentDate">
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="width:100%;margin-bottom:4px">
                    <mat-label>Payment Method</mat-label>
                    <mat-select [(ngModel)]="repayForm.paymentMethod">
                      <mat-option value="CASH">Cash</mat-option>
                      <mat-option value="MOBILE_MONEY">Mobile Money</mat-option>
                      <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
                      <mat-option value="CHEQUE">Cheque</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="width:100%;margin-bottom:4px">
                    <mat-label>Reference No (optional)</mat-label>
                    <input matInput [(ngModel)]="repayForm.referenceNo">
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px">
                    <mat-label>Notes (optional)</mat-label>
                    <input matInput [(ngModel)]="repayForm.notes">
                  </mat-form-field>

                  <button mat-raised-button color="primary" style="width:100%;height:44px"
                          [disabled]="submitting || !repayForm.amountPaid"
                          (click)="submitRepayment()">
                    <mat-spinner *ngIf="submitting" diameter="20"
                                 style="display:inline-block;margin-right:8px"></mat-spinner>
                    {{ submitting ? 'Processing...' : 'Submit Repayment' }}
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Repayment History Tab -->
          <mat-tab label="Payment History">
            <div style="padding-top:16px">
              <div *ngIf="repayments.length === 0"
                   style="text-align:center;padding:32px;color:#9e9e9e">
                <mat-icon style="font-size:40px;width:40px;height:40px">receipt_long</mat-icon>
                <p>No payments recorded yet.</p>
              </div>

              <mat-card *ngIf="repayments.length > 0" style="border-radius:12px">
                <mat-card-content style="padding:0">
                  <table mat-table [dataSource]="repayments" style="width:100%">

                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef style="padding:12px 16px">Date</th>
                      <td mat-cell *matCellDef="let r" style="padding:12px 16px">{{ r.paymentDate }}</td>
                    </ng-container>

                    <ng-container matColumnDef="amount">
                      <th mat-header-cell *matHeaderCellDef style="text-align:right">Amount (TZS)</th>
                      <td mat-cell *matCellDef="let r"
                          style="text-align:right;font-weight:600;color:#2e7d32">
                        {{ r.amountPaid | number:'1.0-0' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="method">
                      <th mat-header-cell *matHeaderCellDef>Method</th>
                      <td mat-cell *matCellDef="let r" style="font-size:13px">{{ r.paymentMethod }}</td>
                    </ng-container>

                    <ng-container matColumnDef="ref">
                      <th mat-header-cell *matHeaderCellDef>Reference</th>
                      <td mat-cell *matCellDef="let r" style="font-size:13px;color:#666">
                        {{ r.referenceNo || '—' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="by">
                      <th mat-header-cell *matHeaderCellDef>Recorded By</th>
                      <td mat-cell *matCellDef="let r" style="font-size:13px;color:#666">
                        {{ r.recordedBy }}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="repayCols" style="background:#f5f5f5"></tr>
                    <tr mat-row *matRowDef="let row; columns: repayCols;"
                        style="border-bottom:1px solid #f0f0f0"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>


          <!-- Guarantors Tab -->
          <mat-tab label="Guarantors">
            <div style="padding-top:16px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                <span style="font-weight:600;font-size:15px">Loan Guarantors</span>
                <button mat-raised-button color="primary" style="font-size:13px"
                  *ngIf="loan.status === 'PENDING_APPROVAL'"
                  (click)="showAddGuarantor=!showAddGuarantor">
                  + Add Guarantor
                </button>
              </div>

              <!-- Add Guarantor Form -->
              <mat-card *ngIf="showAddGuarantor" style="border-radius:12px;margin-bottom:16px;background:#f8f9fa">
                <mat-card-content style="padding:20px">
                  <h4 style="margin:0 0 16px;color:#1a237e">Add Guarantor</h4>
                  <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
                    <mat-label>Guarantor Member ID</mat-label>
                    <input matInput type="number" [(ngModel)]="newGuarantor.memberId" placeholder="Enter member ID" (change)="lookupGuarantorMember()">
                  </mat-form-field>
                  <div *ngIf="resolvedGuarantorName" style="margin:4px 0 12px;padding:8px 12px;border-radius:8px;font-size:13px;display:flex;align-items:center;gap:6px"
                    [style.background]="resolvedGuarantorName === 'Member not found' ? '#fff3e0' : '#e8f5e9'"
                    [style.color]="resolvedGuarantorName === 'Member not found' ? '#e65100' : '#2e7d32'">
                    <mat-icon style="font-size:16px;width:16px;height:16px">
                      {{resolvedGuarantorName === 'Member not found' ? 'error_outline' : 'check_circle'}}
                    </mat-icon>
                    {{resolvedGuarantorName}}
                  </div>
                  <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px">
                    <mat-label>Guaranteed Amount (TZS)</mat-label>
                    <input matInput type="number" [(ngModel)]="newGuarantor.amount" placeholder="Enter amount">
                  </mat-form-field>
                  <div style="display:flex;gap:8px">
                    <button mat-raised-button color="primary" [disabled]="addingGuarantor"
                      (click)="addGuarantor()">Submit</button>
                    <button mat-button (click)="showAddGuarantor=false">Cancel</button>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Guarantors List -->
              <div *ngIf="guarantors.length === 0" style="text-align:center;padding:32px;color:#9e9e9e">
                <mat-icon style="font-size:40px;width:40px;height:40px">people</mat-icon>
                <p>No guarantors added yet.</p>
              </div>

              <div *ngFor="let g of guarantors" style="margin-bottom:12px">
                <mat-card style="border-radius:12px">
                  <mat-card-content style="padding:20px">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                      <div>
                        <div style="font-weight:600;font-size:15px">{{ g.guarantorName }}</div>
                        <div style="color:#666;font-size:13px;margin-top:4px">
                          Member ID: {{ g.guarantorMemberId }}
                        </div>
                        <div style="font-size:13px;margin-top:4px">
                          Guaranteed: <strong>TZS {{ g.guaranteedAmount | number }}</strong>
                        </div>
                        <div style="font-size:12px;color:#888;margin-top:4px">
                          Requested by: {{ g.requestedBy }} · {{ g.requestedAt | date:'mediumDate' }}
                        </div>
                      </div>
                      <div style="text-align:right">
                        <span [style.background]="gStatusBg(g.status)"
                              [style.color]="gStatusColor(g.status)"
                              style="padding:4px 12px;border-radius:12px;font-size:13px;font-weight:500;display:block;margin-bottom:8px">
                          {{ g.status }}
                        </span>
                        <div *ngIf="g.status === 'PENDING'" style="display:flex;gap:4px;justify-content:flex-end">
                          <button mat-mini-fab color="primary" style="width:32px;height:32px"
                            (click)="respondGuarantor(g.id, 'ACCEPT')" title="Accept">
                            <mat-icon style="font-size:16px">check</mat-icon>
                          </button>
                          <button mat-mini-fab color="warn" style="width:32px;height:32px"
                            (click)="respondGuarantor(g.id, 'DECLINE')" title="Decline">
                            <mat-icon style="font-size:16px">close</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `
})
export class LoanDetailComponent implements OnInit {
  private loansService = inject(SaccosLoansService);
  private http = inject(HttpClient);
  private apiConfig = inject(SACCOS_API_CONFIG);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  submitting = false;
  guarantors: any[] = [];
  showAddGuarantor = false;
  addingGuarantor = false;
  newGuarantor: { memberId: number | null, amount: number | null } = { memberId: null, amount: null };
  resolvedGuarantorName: string | null = null;
  lookingUpMember = false;
  loan: LoanResponse | null = null;
  approveAmount: number | null = null;
  summary: LoanSummaryResponse | null = null;
  schedule: ScheduleResponse[] = [];
  repayments: RepaymentResponse[] = [];

  schedCols = ['no', 'dueDate', 'principal', 'interest', 'total', 'balance', 'status'];
  repayCols = ['date', 'amount', 'method', 'ref', 'by'];

  repayForm: MakeRepaymentRequest = {
    amountPaid: 0,
    paymentDate: new Date().toISOString().substring(0, 10),
    paymentMethod: 'MOBILE_MONEY',
    referenceNo: '',
    notes: ''
  };

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: number): void {
    this.loading = true;
    this.loansService.getLoan(id).subscribe({
      next: (loan) => {
        this.loan = loan;
        this.approveAmount = loan.amountRequested;
        this.loansService.getSchedule(id).subscribe(s => this.schedule = s);
        this.loansService.getRepayments(id).subscribe(r => this.repayments = r);
        this.loansService.getSummary(id).subscribe(s => this.summary = s);
        this.loansService.getLoanGuarantors(id).subscribe(g => { this.guarantors = g; this.cdr.detectChanges(); });
        this.loading = false; this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  generateSchedule(): void {
    if (!this.loan) return;
    this.loansService.generateSchedule(this.loan.id).subscribe({
      next: () => {
        this.loansService.getSchedule(this.loan!.id).subscribe(s => this.schedule = s);
        this.snackBar.open('Schedule generated', 'OK', { duration: 3000 });
      }
    });
  }

  submitRepayment(): void {
    if (!this.loan || !this.repayForm.amountPaid) return;
    this.submitting = true;
    this.loansService.makeRepayment(this.loan.id, this.repayForm).subscribe({
      next: () => {
        this.snackBar.open('Repayment recorded successfully', 'OK', { duration: 3000 });
        this.submitting = false;
        this.load(this.loan!.id);
        this.repayForm.amountPaid = 0;
        this.repayForm.referenceNo = '';
        this.repayForm.notes = '';
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Repayment failed', 'Close', { duration: 5000 });
        this.submitting = false;
      }
    });
  }

  repaymentProgress(): number {
    if (!this.summary || !this.summary.amountDisbursed) return 0;
    return Math.round((this.summary.totalRepaid / this.summary.amountDisbursed) * 100);
  }

  nextInstallmentAmount(): string {
    const next = this.schedule.find(s => s.status === 'PENDING' || s.status === 'PARTIAL' || s.status === 'OVERDUE');
    return next ? next.totalDue.toFixed(0) : '0';
  }

  loadGuarantors(): void {
    this.loansService.getLoanGuarantors(this.loan?.id).subscribe({
      next: (g) => { this.guarantors = g; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  lookupGuarantorMember(): void {
    if (!this.newGuarantor.memberId) { this.resolvedGuarantorName = null; return; }
    this.lookingUpMember = true;
    this.resolvedGuarantorName = null;
    this.http.get<{fullName: string}>(`${this.apiConfig.members}/${this.newGuarantor.memberId}`).subscribe({
      next: (m: {fullName: string}) => { this.resolvedGuarantorName = m.fullName; this.lookingUpMember = false; },
      error: () => { this.resolvedGuarantorName = 'Member not found'; this.lookingUpMember = false; }
    });
  }

  addGuarantor(): void {
    if (!this.newGuarantor.memberId) return;
    this.addingGuarantor = true;
    this.loansService.addGuarantor(this.loan?.id, this.newGuarantor.memberId!, this.newGuarantor.amount).subscribe({
      next: (g) => {
        this.guarantors.push(g);
        this.showAddGuarantor = false;
        this.newGuarantor = { memberId: null, amount: null };
        this.resolvedGuarantorName = null;
        this.addingGuarantor = false;
        this.snackBar.open('Guarantor added', 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.snackBar.open(e.error?.error || 'Failed to add guarantor', 'Close', { duration: 4000 });
        this.addingGuarantor = false;
      }
    });
  }

  respondGuarantor(id: number, action: string): void {
    this.loansService.respondGuarantor(id, action).subscribe({
      next: (g) => {
        const idx = this.guarantors.findIndex(x => x.id === id);
        if (idx >= 0) this.guarantors[idx] = g;
        this.snackBar.open('Response recorded', 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: () => this.snackBar.open('Failed to respond', 'Close', { duration: 3000 })
    });
  }

  gStatusBg(s: string): string {
    const m: Record<string,string> = { ACCEPTED:'#e8f5e9', PENDING:'#fff3e0', DECLINED:'#ffebee', CANCELLED:'#f5f5f5' };
    return m[s] || '#f5f5f5';
  }

  gStatusColor(s: string): string {
    const m: Record<string,string> = { ACCEPTED:'#2e7d32', PENDING:'#e65100', DECLINED:'#c62828', CANCELLED:'#616161' };
    return m[s] || '#333';
  }

  statusBg(s: string): string {
    const m: Record<string,string> = { ACTIVE:'#e8f5e9', APPROVED:'#e3f2fd', PENDING_APPROVAL:'#fff3e0', CLOSED:'#f5f5f5', REJECTED:'#ffebee' };
    return m[s] || '#f5f5f5';
  }
  statusColor(s: string): string {
    const m: Record<string,string> = { ACTIVE:'#2e7d32', APPROVED:'#1565c0', PENDING_APPROVAL:'#e65100', CLOSED:'#616161', REJECTED:'#c62828' };
    return m[s] || '#333';
  }
  scheduleStatusBg(s: string): string {
    const m: Record<string,string> = { PAID:'#e8f5e9', PARTIAL:'#fff3e0', PENDING:'#f5f5f5', OVERDUE:'#ffebee' };
    return m[s] || '#f5f5f5';
  }
  scheduleStatusColor(s: string): string {
    const m: Record<string,string> = { PAID:'#2e7d32', PARTIAL:'#e65100', PENDING:'#616161', OVERDUE:'#c62828' };
    return m[s] || '#333';
  }

  actionBusy = false;

  approveLoan(): void {
    if (!this.loan || !this.approveAmount) return;
    this.actionBusy = true;
    this.loansService.approveLoan(this.loan.id, this.approveAmount).subscribe({
      next: (l: any) => { this.loan = l; this.actionBusy = false; this.cdr.detectChanges(); },
      error: (e: any) => { this.actionBusy = false; alert(e?.error?.error || 'Approve failed'); }
    });
  }

  rejectLoan(): void {
    if (!this.loan) return;
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    this.actionBusy = true;
    this.loansService.rejectLoan(this.loan.id, reason).subscribe({
      next: (l: any) => { this.loan = l; this.actionBusy = false; this.cdr.detectChanges(); },
      error: (e: any) => { this.actionBusy = false; alert(e?.error?.error || 'Reject failed'); }
    });
  }

  disburseLoan(): void {
    if (!this.loan) return;
    this.actionBusy = true;
    this.loansService.disburseLoan(this.loan.id).subscribe({
      next: (l: any) => {
        this.loan = l;
        this.actionBusy = false;
        this.loansService.getSummary(this.loan.id).subscribe(s => { this.summary = s; this.cdr.detectChanges(); });
        this.loansService.getSchedule(this.loan.id).subscribe(s => { this.schedule = s; this.cdr.detectChanges(); });
        this.cdr.detectChanges();
      },
      error: (e: any) => { this.actionBusy = false; alert(e?.error?.error || 'Disburse failed'); }
    });
  }
}
