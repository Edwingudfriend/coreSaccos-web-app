/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SaccosRoutingModule } from './saccos-routing.module';
import { SaccosLandingComponent } from './landing/saccos-landing.component';
import { SaccosAuthInterceptor } from './core/saccos-auth.interceptor';

@NgModule({
  imports: [
    SaccosRoutingModule,
    SaccosLandingComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SaccosAuthInterceptor,
      multi: true
    }
  ]
})
export class SaccosModule {}
