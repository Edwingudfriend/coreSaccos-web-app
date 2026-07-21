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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SaccosSharesService } from '../core/saccos-shares.service';

@Component({
  selector: 'mifosx-shares',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  template: `
  <div style="padding:24px">
    <h2 style="margin:0 0 24px;font-weight:600">Share Account</h2>

    <!-- Existing accounts -->
    <div *ngIf="accounts.length > 0">
      <mat-card *ngFor="let acc of accounts" style="border-radius:16px;margin-bottom:16px">
        <mat-card-content style="padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <span style="font-weight:700;font-size:16px">Share Account #{{ acc.id }}</span>
            <span [style.background]="acc.status==='FULLY_PAID'?'#e8f5e9':'#fff3e0'"
                  [style.color]="acc.status==='FULLY_PAID'?'#2e7d32':'#e65100'"
                  style="padding:4px 12px;border-radius:12px;font-size:13px;font-weight:600">
              {{ acc.status }}
            </span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
            <div style="background:#e3f2fd;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:22px;font-weight:700;color:#1565c0">{{ acc.sharesSubscribed }}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">Subscribed</div>
              <div style="font-size:11px;color:#666">TZS {{ acc.sharesSubscribed * acc.shareParValue | number:'1.0-0' }}</div>
            </div>
            <div style="background:#e8f5e9;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:22px;font-weight:700;color:#2e7d32">{{ acc.sharesPaidUp }}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">Paid Up</div>
              <div style="font-size:11px;color:#666">TZS {{ acc.sharesPaidUp * acc.shareParValue | number:'1.0-0' }}</div>
            </div>
            <div style="background:#fff3e0;border-radius:10px;padding:14px;text-align:center">
              <div style="font-size:22px;font-weight:700;color:#e65100">{{ acc.sharesSubscribed - acc.sharesPaidUp }}</div>
              <div style="font-size:11px;color:#666;margin-top:2px">Outstanding</div>
              <div style="font-size:11px;color:#666">TZS {{ (acc.sharesSubscribed - acc.sharesPaidUp) * acc.shareParValue | number:'1.0-0' }}</div>
            </div>
          </div>
          <div style="margin-bottom:8px;display:flex;justify-content:space-between;font-size:13px">
            <span>Payment progress</span>
            <span style="font-weight:600">{{ progress(acc) }}%</span>
          </div>
          <div style="background:#e0e0e0;border-radius:4px;height:8px;overflow:hidden">
            <div [style.width]="progress(acc) + '%'"
                 style="height:100%;background:#2e7d32;border-radius:4px;transition:width 0.3s"></div>
          </div>
          <div style="margin-top:12px;font-size:13px;color:#666">
            Par value: TZS {{ acc.shareParValue | number }} per share · Opened: {{ acc.openedDate }}
          </div>

          <!-- Record Payment button -->
          <div *ngIf="acc.status !== 'FULLY_PAID'" style="margin-top:16px">
            <button mat-stroked-button color="primary" (click)="selectedAccount = acc; showPaymentForm = true">
              <mat-icon>payments</mat-icon> Record Payment
            </button>
          </div>

          <!-- Payment Form -->
          <div *ngIf="showPaymentForm && selectedAccount?.id === acc.id"
               style="margin-top:16px;padding:16px;background:#f8f9fa;border-radius:12px">
            <h4 style="margin:0 0 16px;color:#1a237e">Record Share Payment</h4>
            <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
              <mat-label>Units to Pay</mat-label>
              <input matInput type="number" [(ngModel)]="payForm.unitsPaid"
                [max]="acc.sharesSubscribed - acc.sharesPaidUp">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
              <mat-label>Payment Channel</mat-label>
              <mat-select [(ngModel)]="payForm.paymentChannel">
                <mat-option value="CASH">Cash</mat-option>
                <mat-option value="MOBILE_MONEY">Mobile Money</mat-option>
                <mat-option value="BANK_TRANSFER">Bank Transfer</mat-option>
                <mat-option value="SALARY_CHECKOFF">Salary Checkoff</mat-option>
                <mat-option value="INTERNAL_TRANSFER">Internal Transfer</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
              <mat-label>Payment Date</mat-label>
              <input matInput type="date" [(ngModel)]="payForm.paymentDate">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px">
              <mat-label>Reference (optional)</mat-label>
              <input matInput [(ngModel)]="payForm.reference">
            </mat-form-field>
            <div style="display:flex;gap:8px">
              <button mat-stroked-button (click)="showPaymentForm = false">Cancel</button>
              <button mat-raised-button color="primary"
                [disabled]="paying || !payForm.unitsPaid"
                (click)="recordPayment(acc.id)">
                {{ paying ? 'Processing...' : 'Submit Payment' }}
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- No accounts — show open account form -->
    <div *ngIf="accounts.length === 0 && !loading">
      <mat-card style="border-radius:16px;margin-bottom:16px">
        <mat-card-content style="padding:24px">
          <h3 style="margin:0 0 16px;color:#1a237e">Open Share Account</h3>
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
            <mat-label>Number of Shares</mat-label>
            <input matInput type="number" [(ngModel)]="openForm.sharesSubscribed">
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
            <mat-label>Par Value per Share (TZS)</mat-label>
            <input matInput type="number" [(ngModel)]="openForm.shareParValue">
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px">
            <mat-label>Opening Date</mat-label>
            <input matInput type="date" [(ngModel)]="openForm.openedDate">
          </mat-form-field>
          <button mat-raised-button color="primary"
            [disabled]="opening || !openForm.sharesSubscribed"
            (click)="openAccount()">
            <mat-icon>account_balance</mat-icon>
            {{ opening ? 'Opening...' : 'Open Share Account' }}
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  </div>
  `
})
export class SharesComponent implements OnInit {
  private sharesService = inject(SaccosSharesService);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  accounts: any[] = [];
  loading = true;
  memberId = 1;

  showPaymentForm = false;
  selectedAccount: any = null;
  paying = false;
  opening = false;

  payForm = { unitsPaid: 1, paymentChannel: 'CASH', reference: '', paymentDate: new Date().toISOString().split('T')[0] };
  openForm = { sharesSubscribed: 100, shareParValue: 1000, openedDate: new Date().toISOString().split('T')[0] };

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.memberId = p['memberId'] ? +p['memberId'] : 1;
      this.loadShares();
    });
  }

  loadShares(): void {
    this.loading = true;
    this.sharesService.getMemberShares(this.memberId).subscribe({
      next: (data: any[]) => { this.accounts = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  progress(acc: any): number {
    return acc.sharesSubscribed ? Math.round((acc.sharesPaidUp / acc.sharesSubscribed) * 100) : 0;
  }

  openAccount(): void {
    this.opening = true;
    this.sharesService.openShareAccount({ ...this.openForm, memberId: this.memberId }).subscribe({
      next: () => { this.snack.open('Share account opened!', 'OK', { duration: 3000 }); this.opening = false; this.loadShares(); },
      error: (e: any) => { this.opening = false; alert(e?.error?.error || 'Failed'); this.cdr.detectChanges(); }
    });
  }

  recordPayment(shareId: number): void {
    this.paying = true;
    this.sharesService.recordSharePayment(shareId, this.payForm).subscribe({
      next: () => {
        this.snack.open('Payment recorded!', 'OK', { duration: 3000 });
        this.paying = false; this.showPaymentForm = false;
        this.loadShares();
      },
      error: (e: any) => { this.paying = false; alert(e?.error?.error || 'Failed'); this.cdr.detectChanges(); }
    });
  }
}
