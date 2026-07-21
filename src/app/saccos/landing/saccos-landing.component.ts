/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0.
 */
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { SACCOS_API_CONFIG } from '../core/saccos-api.config';

const TILES = [
  { label: 'Members',       icon: 'people',                 route: 'members',       color: '#e3f2fd', iconColor: '#1565c0' },
  { label: 'Shares',        icon: 'pie_chart',              route: 'shares',        color: '#e8f5e9', iconColor: '#2e7d32' },
  { label: 'Contributions', icon: 'savings',                route: 'contributions', color: '#f3e5f5', iconColor: '#6a1b9a' },
  { label: 'Loans',         icon: 'account_balance_wallet', route: 'loans',         color: '#fff3e0', iconColor: '#e65100' },
  { label: 'Reports',       icon: 'bar_chart',              route: 'reports',       color: '#fce4ec', iconColor: '#ad1457' },
  { label: 'Rules',         icon: 'gavel',                  route: 'rules',         color: '#e8eaf6', iconColor: '#283593' },
];

@Component({
  selector: 'mifosx-saccos-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatIconModule,
    MatFormFieldModule, MatInputModule],
  template: `
    <div style="padding:32px">
      <h1 style="margin:0 0 8px;font-weight:700;color:#1a237e">SACCOS Dashboard</h1>
      <p style="color:#666;margin:0 0 24px">Reimagine Africa Cooperative Management</p>

      <!-- Search Bar -->
      <div style="position:relative;margin-bottom:32px">
        <div style="display:flex;align-items:center;background:#fff;border:2px solid #e3f2fd;border-radius:16px;padding:12px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <mat-icon style="color:#1565c0;margin-right:12px;font-size:24px">search</mat-icon>
          <input
            [(ngModel)]="query"
            (ngModelChange)="search($event)"
            placeholder="Search members, loans, member numbers..."
            style="border:none;outline:none;flex:1;font-size:16px;background:transparent;color:#1a237e"
          >
          <mat-icon *ngIf="query" (click)="clearSearch()" style="color:#9e9e9e;cursor:pointer">close</mat-icon>
        </div>

        <!-- Search Results Dropdown -->
        <div *ngIf="query && (memberResults.length > 0 || loanResults.length > 0 || searching)"
             style="position:absolute;top:100%;left:0;right:0;background:#fff;border-radius:12px;
                    box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:100;margin-top:8px;overflow:hidden">

          <div *ngIf="searching" style="padding:16px;text-align:center;color:#666">
            <mat-icon style="animation:spin 1s linear infinite">refresh</mat-icon> Searching...
          </div>

          <!-- Member Results -->
          <div *ngIf="memberResults.length > 0">
            <div style="padding:8px 16px;font-size:11px;font-weight:700;color:#9e9e9e;letter-spacing:1px;background:#f8f9fa">
              MEMBERS
            </div>
            <div *ngFor="let m of memberResults"
                 (click)="goTo('members', m.id)"
                 style="padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f0f0f0"
                 onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='#fff'">
              <mat-icon style="color:#1565c0">person</mat-icon>
              <div>
                <div style="font-weight:600;color:#1a237e">{{ m.fullName }}</div>
                <div style="font-size:12px;color:#666">{{ m.memberNo }} · {{ m.mobileNo }}</div>
              </div>
              <span style="margin-left:auto;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600"
                    [style.background]="statusBg(m.status)"
                    [style.color]="statusFg(m.status)">
                {{ m.status }}
              </span>
            </div>
          </div>

          <!-- Loan Results -->
          <div *ngIf="loanResults.length > 0">
            <div style="padding:8px 16px;font-size:11px;font-weight:700;color:#9e9e9e;letter-spacing:1px;background:#f8f9fa">
              LOANS
            </div>
            <div *ngFor="let l of loanResults"
                 (click)="goTo('loans', l.id)"
                 style="padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:12px"
                 onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='#fff'">
              <mat-icon style="color:#e65100">account_balance_wallet</mat-icon>
              <div>
                <div style="font-weight:600;color:#1a237e">{{ l.loanNo }}</div>
                <div style="font-size:12px;color:#666">{{ l.purpose }} · TZS {{ l.amountRequested | number:'1.0-0' }}</div>
              </div>
              <span style="margin-left:auto;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600"
                    [style.background]="loanBg(l.status)"
                    [style.color]="loanFg(l.status)">
                {{ l.status }}
              </span>
            </div>
          </div>

          <div *ngIf="!searching && memberResults.length === 0 && loanResults.length === 0"
               style="padding:16px;text-align:center;color:#9e9e9e">
            No results for "{{ query }}"
          </div>
        </div>
      </div>

      <!-- Dashboard Tiles -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px">
        <a *ngFor="let tile of tiles" [routerLink]="tile.route" style="text-decoration:none">
          <mat-card style="border-radius:16px;cursor:pointer" [style.background]="tile.color">
            <mat-card-content style="padding:28px;text-align:center">
              <mat-icon [style.color]="tile.iconColor" style="font-size:40px;width:40px;height:40px;margin-bottom:12px">
                {{ tile.icon }}
              </mat-icon>
              <div style="font-weight:600;font-size:16px" [style.color]="tile.iconColor">{{ tile.label }}</div>
            </mat-card-content>
          </mat-card>
        </a>
      </div>
    </div>
  `
})
export class SaccosLandingComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiConfig = inject(SACCOS_API_CONFIG);
  private cdr = inject(ChangeDetectorRef);

  tiles = TILES;
  query = '';
  searching = false;
  allMembers: any[] = [];
  allLoans: any[] = [];
  memberResults: any[] = [];
  loanResults: any[] = [];
  private searchTimer: any;

  ngOnInit(): void {
    // Preload data for instant search
    this.http.get<any>(`${this.apiConfig.baseUrl}/members`).subscribe({
      next: (r) => { this.allMembers = r.members || []; }
    });
    this.http.get<any[]>(`${this.apiConfig.baseUrl}/loans`).subscribe({
      next: (r) => { this.allLoans = Array.isArray(r) ? r : []; }
    });
  }

  search(q: string): void {
    clearTimeout(this.searchTimer);
    if (!q.trim()) { this.memberResults = []; this.loanResults = []; return; }
    this.searchTimer = setTimeout(() => {
      const term = q.toLowerCase();
      this.memberResults = this.allMembers.filter(m =>
        (m.fullName || '').toLowerCase().includes(term) ||
        (m.memberNo || '').toLowerCase().includes(term) ||
        (m.mobileNo || '').toLowerCase().includes(term) ||
        (m.email || '').toLowerCase().includes(term)
      ).slice(0, 5);
      this.loanResults = this.allLoans.filter(l =>
        (l.loanNo || '').toLowerCase().includes(term) ||
        (l.purpose || '').toLowerCase().includes(term) ||
        (l.status || '').toLowerCase().includes(term)
      ).slice(0, 5);
      this.cdr.detectChanges();
    }, 200);
  }

  clearSearch(): void { this.query = ''; this.memberResults = []; this.loanResults = []; }

  goTo(type: string, id: number): void {
    this.clearSearch();
    this.router.navigate(['/saccos', type, id]);
  }

  statusBg(s: string): string {
    const m: any = { ACTIVE:'#e8f5e9', PENDING_KYC:'#fff3e0', APPLICANT:'#fff8e1', SUSPENDED:'#ffebee' };
    return m[s] || '#f5f5f5';
  }
  statusFg(s: string): string {
    const m: any = { ACTIVE:'#2e7d32', PENDING_KYC:'#e65100', APPLICANT:'#f57f17', SUSPENDED:'#c62828' };
    return m[s] || '#333';
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
