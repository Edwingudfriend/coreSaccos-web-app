/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { SaccosLoansService, LoanResponse, LoanApprovalVoteResponse } from '../core/saccos-shares.service';

interface PendingLoanRow {
  loan: LoanResponse;
  votes: LoanApprovalVoteResponse[];
  approveCount: number;
  rejectCount: number;
  boardSize: number;
  comment: string;
  submitting: boolean;
}

@Component({
  selector: 'app-board-voting',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatChipsModule, MatSnackBarModule],
  template: `
  <div style="padding:24px;max-width:800px;margin:0 auto">
    <div style="margin-bottom:16px">
      <a routerLink="/saccos/loans" style="color:#1a237e;text-decoration:none;font-size:14px">
        &larr; Back to Loans
      </a>
    </div>
    <h2 style="font-weight:700;color:#1a237e;margin:0 0 8px">Loans Awaiting Board Approval</h2>
    <p style="color:#666;font-size:13px;margin:0 0 20px">
      Simple majority (2 of 3) resolves a loan automatically once enough votes are in.
    </p>

    <mat-card style="border-radius:12px;margin-bottom:20px;background:#fff8e1">
      <mat-card-content style="padding:16px 20px">
        <mat-form-field appearance="outline" style="width:220px">
          <mat-label>Voting as (Member ID)</mat-label>
          <input matInput type="number" [(ngModel)]="voterId" placeholder="e.g. 1">
        </mat-form-field>
        <p style="color:#8d5a00;font-size:12px;margin:4px 0 0">
          Temporary stand-in until board members have individual logins.
        </p>
      </mat-card-content>
    </mat-card>

    <div *ngIf="loading" style="text-align:center;color:#666;padding:40px">Loading pending loans...</div>
    <div *ngIf="!loading && rows.length === 0" style="text-align:center;color:#666;padding:40px">
      No loans are currently awaiting board approval.
    </div>

    <mat-card *ngFor="let row of rows" style="border-radius:12px;margin-bottom:16px">
      <mat-card-content style="padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <p style="font-weight:600;font-size:16px;margin:0">{{ row.loan.loanNo }}</p>
            <p style="font-size:13px;color:#666;margin:2px 0 0">
              {{ row.loan.loanTypeName }} &middot; TZS {{ row.loan.amountRequested | number }} &middot; {{ row.loan.tenureMonths }} months
            </p>
            <p style="font-size:13px;color:#666;margin:2px 0 0">{{ row.loan.purpose }}</p>
          </div>
          <span style="background:#fff3e0;color:#8d5a00;font-size:12px;padding:4px 10px;border-radius:6px;white-space:nowrap">
            {{ row.approveCount }} approve / {{ row.rejectCount }} reject of {{ row.boardSize }}
          </span>
        </div>

        <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
          <div *ngFor="let v of row.votes" style="display:flex;align-items:center;gap:6px;font-size:13px;color:#666">
            <mat-icon [style.color]="v.decision === 'APPROVE' ? '#2e7d32' : '#c62828'" style="font-size:16px;width:16px;height:16px">
              {{ v.decision === 'APPROVE' ? 'check_circle' : 'cancel' }}
            </mat-icon>
            Member #{{ v.voterId }}
          </div>
        </div>

        <mat-form-field appearance="outline" style="width:100%;margin-bottom:8px">
          <mat-label>Comment (optional)</mat-label>
          <input matInput [(ngModel)]="row.comment" placeholder="Add reasoning for the board">
        </mat-form-field>

        <div style="display:flex;gap:12px">
          <button mat-stroked-button color="primary" [disabled]="row.submitting || !voterId"
            (click)="vote(row, 'APPROVE')" style="flex:1">
            <mat-icon>check</mat-icon> Approve
          </button>
          <button mat-stroked-button color="warn" [disabled]="row.submitting || !voterId"
            (click)="vote(row, 'REJECT')" style="flex:1">
            <mat-icon>close</mat-icon> Reject
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  </div>
  `
})
export class BoardVotingComponent implements OnInit {
  private loansService = inject(SaccosLoansService);
  private snack = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  voterId: number | null = null;
  loading = true;
  rows: PendingLoanRow[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loansService.getAllLoans().subscribe({
      next: (loans) => {
        const pending = loans.filter(l => l.status === 'PENDING_APPROVAL');
        this.rows = pending.map(loan => ({
          loan, votes: [] as LoanApprovalVoteResponse[], approveCount: 0, rejectCount: 0, boardSize: 3,
          comment: '', submitting: false
        }));
        this.loading = false;
        this.cdr.detectChanges();
        this.rows.forEach(row => this.loadVotes(row));
      },
      error: () => {
        this.loading = false;
        this.snack.open('Failed to load pending loans', 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  loadVotes(row: PendingLoanRow): void {
    this.loansService.getVotes(row.loan.id).subscribe({
      next: (votes) => {
        row.votes = votes;
        if (votes.length > 0) {
          row.approveCount = votes[0].approveCount;
          row.rejectCount = votes[0].rejectCount;
          row.boardSize = votes[0].boardSize;
        }
        this.cdr.detectChanges();
      }
    });
  }

  vote(row: PendingLoanRow, decision: 'APPROVE' | 'REJECT'): void {
    if (!this.voterId) return;
    row.submitting = true;
    this.loansService.castVote(row.loan.id, {
      voterId: this.voterId, decision, comment: row.comment
    }).subscribe({
      next: (result) => {
        row.submitting = false;
        if (result.loanStatus !== 'PENDING_APPROVAL') {
          this.snack.open(`Loan ${row.loan.loanNo} is now ${result.loanStatus}`, 'OK', { duration: 4000 });
          this.rows = this.rows.filter(r => r !== row);
        } else {
          this.loadVotes(row);
          this.snack.open('Vote recorded', 'OK', { duration: 2000 });
        }
        this.cdr.detectChanges();
      },
      error: (e) => {
        row.submitting = false;
        this.snack.open(e?.error?.error || 'Failed to record vote', 'OK', { duration: 4000 });
        this.cdr.detectChanges();
      }
    });
  }
}
