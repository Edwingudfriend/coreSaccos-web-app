/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { SaccosSharesService } from '../core/saccos-shares.service';

const API = 'https://api.reimagineafrica.co.tz/api/saccos';

@Component({
  selector: 'mifosx-member-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatProgressSpinnerModule,
            MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div style="padding:24px">
      <a routerLink="/saccos/members" style="color:#1a237e;text-decoration:none;font-size:14px;display:block;margin-bottom:16px">← Back to Members</a>
      <div *ngIf="loading" style="display:flex;justify-content:center;padding:48px"><mat-spinner diameter="40"></mat-spinner></div>
      <div *ngIf="!loading && member">

        <!-- Member Card -->
        <mat-card style="border-radius:12px;margin-bottom:20px">
          <mat-card-content style="padding:24px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
              <div>
                <h2 style="margin:0;font-weight:700;color:#1a237e">{{ member.fullName }}</h2>
                <p style="margin:4px 0 0;color:#666">{{ member.memberNo }}</p>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span [style.background]="member.status==='ACTIVE' ? '#e8f5e9' : '#fff3e0'"
                      [style.color]="member.status==='ACTIVE' ? '#2e7d32' : '#e65100'"
                      style="padding:6px 16px;border-radius:16px;font-weight:600">{{ member.status }}</span>
                <button mat-icon-button color="primary" title="Edit member"
                  (click)="toggleEdit()">
                  <mat-icon>{{ editing ? 'close' : 'edit' }}</mat-icon>
                </button>
              </div>
            </div>

            <!-- View Mode -->
            <div *ngIf="!editing" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:14px">
              <div><span style="color:#666">Mobile:</span> {{ member.mobileNo || '—' }}</div>
              <div><span style="color:#666">Email:</span> {{ member.email || '—' }}</div>
              <div><span style="color:#666">DOB:</span> {{ member.dateOfBirth || '—' }}</div>
              <div><span style="color:#666">Joined:</span> {{ member.joinedDate }}</div>
              <div><span style="color:#666">KYC:</span>
                <span [style.color]="member.kycStatus==='VERIFIED' ? '#2e7d32' : member.kycStatus==='REJECTED' ? '#c62828' : '#e65100'"
                      style="font-weight:600">{{ member.kycStatus }}</span>
                <span *ngIf="member.kycVerifiedBy" style="color:#888;font-size:12px;margin-left:6px">
                  by {{ member.kycVerifiedBy }}
                </span>
              </div>
              <div *ngIf="member.kycNotes" style="grid-column:1/-1;background:#fff3e0;border-radius:6px;padding:8px 12px;font-size:13px;color:#e65100">
                <strong>KYC Notes:</strong> {{ member.kycNotes }}
              </div>
            </div>

            <!-- Edit Mode -->
            <div *ngIf="editing" style="margin-top:8px">
              <div style="background:#e3f2fd;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#1565c0;display:flex;align-items:center;gap:6px">
                <mat-icon style="font-size:16px;width:16px;height:16px">info</mat-icon>
                Editing member profile. Only name, mobile, email and date of birth can be updated here.
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <mat-form-field appearance="outline" style="grid-column:1/-1">
                  <mat-label>Full Name</mat-label>
                  <input matInput [(ngModel)]="editForm.fullName" required>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Mobile Number</mat-label>
                  <input matInput [(ngModel)]="editForm.mobileNo" placeholder="e.g. 0712345678">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" [(ngModel)]="editForm.email" placeholder="e.g. member@example.com">
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput type="date" [(ngModel)]="editForm.dateOfBirth">
                </mat-form-field>
              </div>
              <div style="display:flex;gap:12px;margin-top:8px">
                <button mat-raised-button color="primary"
                  [disabled]="saving || !editForm.fullName"
                  (click)="saveEdit()">
                  <mat-icon>save</mat-icon>
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
                <button mat-stroked-button (click)="toggleEdit()">Cancel</button>
              </div>
            </div>

            <!-- Status Transitions -->
            <div *ngIf="!editing" style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">
              <button mat-stroked-button color="primary"
                *ngIf="member.status==='APPLICANT'" [disabled]="transitioning"
                (click)="transition('PENDING_KYC')">
                <mat-icon>assignment</mat-icon> Start KYC
              </button>
              <button mat-raised-button color="primary"
                *ngIf="member.status==='PENDING_KYC'" [disabled]="transitioning"
                (click)="transition('PENDING_COMMITTEE')">
                <mat-icon>how_to_reg</mat-icon> Approve KYC
              </button>
              <button mat-stroked-button color="warn"
                *ngIf="member.status==='PENDING_KYC'" [disabled]="transitioning"
                (click)="transition('KYC_REJECTED')">
                <mat-icon>cancel</mat-icon> Reject KYC
              </button>
              <button mat-raised-button color="primary"
                *ngIf="member.status==='PENDING_COMMITTEE'" [disabled]="transitioning"
                (click)="transition('APPROVED')">
                <mat-icon>check_circle</mat-icon> Approve
              </button>
              <button mat-raised-button color="primary"
                *ngIf="member.status==='APPROVED'" [disabled]="transitioning"
                (click)="transition('ACTIVE')">
                <mat-icon>verified</mat-icon> Activate
              </button>
              <button mat-stroked-button color="warn"
                *ngIf="member.status==='ACTIVE'" [disabled]="transitioning"
                (click)="transition('SUSPENDED')">
                <mat-icon>block</mat-icon> Suspend
              </button>
              <button mat-raised-button color="primary"
                *ngIf="member.status==='SUSPENDED'" [disabled]="transitioning"
                (click)="transition('ACTIVE')">
                <mat-icon>check_circle</mat-icon> Reinstate
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Links -->
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a [routerLink]="['/saccos/shares']" [queryParams]="{memberId: member.id}"
             style="background:#e8f5e9;color:#2e7d32;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500">View Shares</a>
          <a [routerLink]="['/saccos/contributions']" [queryParams]="{memberId: member.id}"
             style="background:#f3e5f5;color:#6a1b9a;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500">View Contributions</a>
          <a [routerLink]="['/saccos/loans']" [queryParams]="{memberId: member.id}"
             style="background:#fff3e0;color:#e65100;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500">View Loans</a>
        </div>
      </div>
    </div>
  `
})
export class MemberDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private saccosService = inject(SaccosSharesService);
  private snack = inject(MatSnackBar);

  loading = true;
  apiBase = 'https://api.reimagineafrica.co.tz/api/saccos';
  transitioning = false;
  editing = false;
  saving = false;
  member: any = null;
  editForm = { fullName: '', mobileNo: '', email: '', dateOfBirth: '' };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<any>(`${API}/members/${id}`).subscribe({
      next: (m) => { this.member = m; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    if (this.editing && this.member) {
      this.editForm = {
        fullName: this.member.fullName || '',
        mobileNo: this.member.mobileNo || '',
        email: this.member.email || '',
        dateOfBirth: this.member.dateOfBirth || ''
      };
    }
    this.cdr.detectChanges();
  }

  saveEdit(): void {
    if (!this.member || !this.editForm.fullName) return;
    this.saving = true;
    this.http.patch<any>(`${API}/members/${this.member.id}`, this.editForm).subscribe({
      next: (m) => {
        this.member = m;
        this.editing = false;
        this.saving = false;
        this.snack.open('Member updated successfully', 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: (e: any) => {
        this.saving = false;
        this.snack.open(e?.error?.error || 'Update failed', 'Close', { duration: 5000 });
        this.cdr.detectChanges();
      }
    });
  }

  transition(to: string): void {
    if (!this.member) return;
    let reason = '';
    if (to === 'PENDING_COMMITTEE') {
      const input = prompt('KYC Approval Notes (optional):', '');
      if (input === null) return;
      reason = input;
    }
    if (to === 'KYC_REJECTED') {
      const input = prompt('Reason for KYC rejection:');
      if (input === null) return;
      reason = input;
    }
    this.transitioning = true;
    const url = reason
      ? `${this.apiBase}/members/${this.member.id}/transition?to=${to}&reason=${encodeURIComponent(reason)}`
      : `${this.apiBase}/members/${this.member.id}/transition?to=${to}`;
    this.http.post<any>(url, {}).subscribe({
      next: (m: any) => { this.member = m; this.transitioning = false; this.cdr.detectChanges(); },
      error: (e: any) => { this.transitioning = false; alert(e?.error?.error || 'Transition failed'); this.cdr.detectChanges(); }
    });
  }
}
