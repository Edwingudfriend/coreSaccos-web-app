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
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mifosx-saccos-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatInputModule,
            MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div style="display:flex;justify-content:center;align-items:center;min-height:80vh">
      <mat-card style="width:360px;border-radius:16px;padding:8px">
        <mat-card-content style="padding:32px">
          <div style="text-align:center;margin-bottom:32px">
            <mat-icon style="font-size:48px;width:48px;height:48px;color:#1a237e">account_balance</mat-icon>
            <h2 style="margin:12px 0 4px;color:#1a237e">SACCOS Portal</h2>
            <p style="color:#666;font-size:14px;margin:0">Sign in to continue</p>
          </div>

          <div style="margin-bottom:20px">
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Username</mat-label>
              <input matInput [(ngModel)]="username" (keyup.enter)="login()">
            </mat-form-field>
          </div>

          <div style="margin-bottom:24px">
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Password</mat-label>
              <input matInput type="password" [(ngModel)]="password" (keyup.enter)="login()">
            </mat-form-field>
          </div>

          <div *ngIf="error" style="color:#c62828;font-size:13px;margin-bottom:16px;text-align:center">
            {{ error }}
          </div>

          <button mat-raised-button color="primary" style="width:100%;height:44px"
                  [disabled]="loading" (click)="login()">
            <mat-spinner *ngIf="loading" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class SaccosLoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  username = 'mifos';
  password = 'password';
  loading = false;
  error = '';

  login(): void {
    this.loading = true;
    this.error = '';
    this.http.post('https://api.reimagineafrica.co.tz/api/saccos/auth/login',
      { username: this.username, password: this.password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true }).subscribe({
      next: () => this.router.navigate(['/saccos']),
      error: () => {
        this.error = 'Invalid credentials. Please try again.';
        this.loading = false;
      }
    });
  }
}
