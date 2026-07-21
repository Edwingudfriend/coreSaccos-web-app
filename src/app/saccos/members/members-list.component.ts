/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

const API = 'https://api.reimagineafrica.co.tz/api/saccos';

@Component({
  selector: 'mifosx-members-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  template: `
    <div style="padding:24px">
      <a routerLink="/saccos" style="color:#1a237e;text-decoration:none;font-size:14px;display:block;margin-bottom:16px">← Back to SACCOS</a>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="margin:0;font-weight:600">Members</h2>
        <a routerLink="register" mat-raised-button style="background:#1a237e;color:#fff;padding:8px 20px;border-radius:8px;text-decoration:none;font-size:14px">+ Register Member</a>
      </div>
      <div *ngIf="loading" style="display:flex;justify-content:center;padding:48px"><mat-spinner diameter="40"></mat-spinner></div>
      <div *ngIf="!loading && members.length===0" style="text-align:center;padding:48px;color:#9e9e9e">
        <mat-icon style="font-size:48px;width:48px;height:48px">people</mat-icon>
        <p style="margin-top:16px">No members yet.</p>
      </div>
      <div *ngFor="let m of members" style="margin-bottom:12px">
        <mat-card style="border-radius:12px;cursor:pointer" (click)="view(m.id)">
          <mat-card-content style="padding:20px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600;font-size:16px">{{ m.fullName }}</div>
              <div style="color:#666;font-size:13px;margin-top:4px">{{ m.memberNo }} · {{ m.mobileNo }}</div>
            </div>
            <span [style.background]="m.status==='ACTIVE' ? '#e8f5e9' : '#fff3e0'"
                  [style.color]="m.status==='ACTIVE' ? '#2e7d32' : '#e65100'"
                  style="padding:4px 12px;border-radius:12px;font-size:13px;font-weight:500">{{ m.status }}</span>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class MembersListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  loading = true;
  private cdr = inject(ChangeDetectorRef);
  members: any[] = [];
  ngOnInit(): void {
    this.http.get<any>(`${API}/members`).subscribe({
      next: (r) => { this.members = r.members || []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }
  view(id: number): void { this.router.navigate(['/saccos/members', id]); }
}
