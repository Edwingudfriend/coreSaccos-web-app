/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Route } from '../core/route/route.service';
import { SaccosAuthGuard } from './core/saccos-auth.guard';
import { SaccosLandingComponent } from './landing/saccos-landing.component';
import { MembersListComponent } from './members/members-list.component';
import { MemberRegisterComponent } from './members/member-register.component';
import { MemberDetailComponent } from './members/member-detail.component';
import { SaccosLoginComponent } from './auth/saccos-login.component';
import { SharesComponent } from './shares/shares.component';
import { ContributionsComponent } from './contributions/contributions.component';
import { LoansComponent } from './loans/loans.component';
import { LoanDetailComponent } from './loans/loan-detail.component';
import { LoanApplyComponent } from './loans/loan-apply.component';
import { BoardVotingComponent } from './loans/board-voting.component';
import { SaccosReportsComponent } from './reports/reports.component';
import { RulesComponent } from './rules/rules.component';
import { RulesCreateComponent } from './rules/rules-create.component';

const routes: Routes = [
  { path: 'login', component: SaccosLoginComponent },
  Route.withShell([
    {
      path: '',
      data: { title: 'SACCOS', breadcrumb: 'SACCOS' },
      children: [
        { path: '', component: SaccosLandingComponent, canActivate: [SaccosAuthGuard] },
        {
          path: 'members',
          data: { title: 'Members', breadcrumb: 'Members' },
          canActivateChild: [SaccosAuthGuard],
          children: [
            { path: '', component: MembersListComponent },
            { path: 'register', component: MemberRegisterComponent,
              data: { title: 'Register Member', breadcrumb: 'Register' } },
            { path: ':id', component: MemberDetailComponent,
              data: { title: 'Member Detail', breadcrumb: 'Detail' } }
          ]
        },
        {
          path: 'shares',
          data: { title: 'Shares', breadcrumb: 'Shares' },
          canActivate: [SaccosAuthGuard],
          children: [{ path: '', component: SharesComponent }]
        },
        {
          path: 'contributions',
          data: { title: 'Contributions', breadcrumb: 'Contributions' },
          canActivate: [SaccosAuthGuard],
          children: [{ path: '', component: ContributionsComponent }]
        },
        {
          path: 'reports',
          data: { title: 'Reports', breadcrumb: 'Reports' },
          canActivate: [SaccosAuthGuard],
          children: [{ path: '', component: SaccosReportsComponent }]
        },
        {
          path: 'loans',
          data: { title: 'Loans', breadcrumb: 'Loans' },
          canActivate: [SaccosAuthGuard],
          children: [
            { path: '', component: LoansComponent },
            { path: 'apply', component: LoanApplyComponent, data: { title: 'Apply for Loan', breadcrumb: 'Apply' } },
            { path: 'board', component: BoardVotingComponent, data: { title: 'Board Approval', breadcrumb: 'Board Approval' } },
            { path: ':id', component: LoanDetailComponent,
              data: { title: 'Loan Details', breadcrumb: 'Detail' } }
          ]
        },
        {
          path: 'rules',
          data: { title: 'SACCOS Rules', breadcrumb: 'Rules' },
          canActivate: [SaccosAuthGuard],
          children: [
            { path: '', component: RulesComponent },
            { path: 'create', component: RulesCreateComponent,
              data: { title: 'New Rules Version', breadcrumb: 'Create' } }
          ]
        },
        { path: '**', redirectTo: '' }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaccosRoutingModule {}
