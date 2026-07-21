/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SaccosContributionsService } from '../core/saccos-shares.service';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TYPE_BG: any = { MONTHLY:'#e3f2fd', REGISTRATION_FEE:'#f3e5f5', SPECIAL:'#e8f5e9', PENALTY:'#ffebee' };
const TYPE_FG: any = { MONTHLY:'#1565c0', REGISTRATION_FEE:'#6a1b9a', SPECIAL:'#2e7d32', PENALTY:'#c62828' };

@Component({
  selector: 'mifosx-contributions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, MatSnackBarModule],
  template: `
  <div style="padding:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div>
        <h2 style="margin:0;font-weight:600">Contributions</h2>
        <span *ngIf="items.length" style="color:#666;font-size:13px">
          Total: <strong>TZS {{ total | number:'1.0-0' }}</strong> · {{ items.length }} records
        </span>
      </div>
      <button mat-raised-button color="primary" (click)="showForm = !showForm">
        <mat-icon>add</mat-icon> Record Contribution
      </button>
    </div>

    <!-- Record Contribution Form -->
    <mat-card *ngIf="showForm" style="border-radius:16px;margin-bottom:24px">
      <mat-card-content style="padding:20px">
        <h3 style="margin:0 0 16px;color:#1a237e">New Contribution</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <mat-form-field appearance="outline">
            <mat-label>Amount (TZS)</mat-label>
            <input matInput type="number" [(ngModel)]="form.amount">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="form.type">
              <mat-option value="MONTHLY">Monthly</mat-option>
              <mat-option value="REGISTRATION_FEE">Registration Fee</mat-option>
              <mat-option value="SPECIAL">Special</mat-option>
              <mat-option value="PENALTY">Penalty</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Period Year</mat-label>
            <input matInput type="number" [(ngModel)]="form.periodYear">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Period Month</mat-label>
            <mat-select [(ngModel)]="form.periodMonth">
              <mat-option *ngFor="let m of months; let i = index" [value]="i+1">{{ m }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Payment Channel</mat-label>
            <mat-select [(ngModel)]="form.paymentChannel">
              <mat-option value="CASH">Cash</mat-option>
              <mat-option value="MOBILE_MONEY">Mobile Money</mat-option>
              <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
              <mat-option value="SALARY_CHECKOFF">Salary Checkoff</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Contribution Date</mat-label>
            <input matInput type="date" [(ngModel)]="form.contributionDate">
          </mat-form-field>
          <mat-form-field appearance="outline" style="grid-column:span 2">
            <mat-label>Reference (optional)</mat-label>
            <input matInput [(ngModel)]="form.reference">
          </mat-form-field>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button mat-stroked-button (click)="showForm = false">Cancel</button>
          <button mat-raised-button color="primary"
            [disabled]="submitting || !form.amount"
            (click)="submit()">
            {{ submitting ? 'Recording...' : 'Submit' }}
          </button>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Contributions Table -->
    <mat-card style="border-radius:16px" *ngIf="items.length > 0">
      <mat-card-content style="padding:0">
        <table mat-table [dataSource]="items" style="width:100%">
          <ng-container matColumnDef="period">
            <th mat-header-cell *matHeaderCellDef style="padding:16px">Period</th>
            <td mat-cell *matCellDef="let c" style="padding:12px 16px">{{ month(c.periodMonth) }} {{ c.periodYear }}</td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let c">
              <span [style.background]="bg(c.type)" [style.color]="fg(c.type)"
                style="padding:3px 10px;border-radius:10px;font-size:12px;font-weight:600">{{ c.type }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount (TZS)</th>
            <td mat-cell *matCellDef="let c" style="font-weight:600;color:#2e7d32">{{ c.amount | number:'1.0-0' }}</td>
          </ng-container>
          <ng-container matColumnDef="channel">
            <th mat-header-cell *matHeaderCellDef>Channel</th>
            <td mat-cell *matCellDef="let c" style="color:#666;font-size:13px">{{ c.paymentChannel || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let c">
              <span [style.color]="c.status==='COMPLETED'?'#2e7d32':'#c62828'" style="font-weight:600;font-size:13px">
                {{ c.status }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef style="padding-right:16px">Date</th>
            <td mat-cell *matCellDef="let c" style="color:#666;font-size:13px;padding-right:16px">{{ c.contributionDate }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
      </mat-card-content>
    </mat-card>

    <div *ngIf="items.length === 0 && !loading" style="text-align:center;padding:48px;color:#9e9e9e">
      <mat-icon style="font-size:48px;width:48px;height:48px">savings</mat-icon>
      <p>No contributions recorded yet.</p>
    </div>
  </div>
  `
})
export class ContributionsComponent implements OnInit {
  private contributionsService = inject(SaccosContributionsService);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  items: any[] = [];
  total = 0;
  loading = true;
  showForm = false;
  submitting = false;
  memberId = 1;
  months = MONTHS;
  cols = ['period', 'type', 'amount', 'channel', 'status', 'date'];

  now = new Date();
  form = {
    amount: null as number | null,
    type: 'MONTHLY',
    periodYear: this.now.getFullYear(),
    periodMonth: this.now.getMonth() + 1,
    paymentChannel: 'MOBILE_MONEY',
    contributionDate: this.now.toISOString().split('T')[0],
    reference: ''
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.memberId = p['memberId'] ? +p['memberId'] : 1;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.contributionsService.getMemberContributions(this.memberId).subscribe({
      next: (data: any[]) => {
        this.items = data;
        this.total = data.filter(c => c.status !== 'REVERSED').reduce((s: number, c: any) => s + c.amount, 0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  submit(): void {
    if (!this.form.amount) return;
    this.submitting = true;
    this.contributionsService.recordContribution({ ...this.form, memberId: this.memberId }).subscribe({
      next: () => {
        this.snack.open('Contribution recorded!', 'OK', { duration: 3000 });
        this.submitting = false;
        this.showForm = false;
        this.load();
      },
      error: (e: any) => {
        this.submitting = false;
        alert(e?.error?.error || 'Failed');
        this.cdr.detectChanges();
      }
    });
  }

  month(m: number): string { return MONTHS[(m || 1) - 1]; }
  bg(t: string): string { return TYPE_BG[t] || '#f5f5f5'; }
  fg(t: string): string { return TYPE_FG[t] || '#333'; }
}
