/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const API = 'https://api.reimagineafrica.co.tz/api/saccos';

@Component({
  selector: 'mifosx-member-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div style="padding:24px;max-width:540px">
      <a routerLink="/saccos/members" style="color:#1a237e;text-decoration:none;font-size:14px;display:block;margin-bottom:16px">← Back to Members</a>
      <h2 style="margin:0 0 24px;font-weight:600">Register New Member</h2>
      <mat-card style="border-radius:12px">
        <mat-card-content style="padding:24px">
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:4px"><mat-label>Full Name</mat-label><input matInput [(ngModel)]="form.fullName"></mat-form-field>
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:4px"><mat-label>Mobile No</mat-label><input matInput [(ngModel)]="form.mobileNo"></mat-form-field>
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:4px"><mat-label>Email</mat-label><input matInput [(ngModel)]="form.email"></mat-form-field>
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px"><mat-label>Date of Birth</mat-label><input matInput type="date" [(ngModel)]="form.dateOfBirth"></mat-form-field>
          <button mat-raised-button color="primary" style="width:100%;height:44px" [disabled]="submitting" (click)="submit()">
            <mat-spinner *ngIf="submitting" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
            {{ submitting ? "Registering..." : "Register Member" }}
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class MemberRegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  submitting = false;
  form = { fullName: '', mobileNo: '', email: '', dateOfBirth: '' };
  submit(): void {
    this.submitting = true;
    this.http.post<any>(`${API}/members`, this.form,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), withCredentials: true }).subscribe({
      next: (m) => { this.snack.open('Member registered!', 'OK', { duration: 3000 }); this.router.navigate(['/saccos/members', m.id]); },
      error: (e) => { this.snack.open(e.error?.error || 'Registration failed', 'Close', { duration: 5000 }); this.submitting = false; }
    });
  }
}
