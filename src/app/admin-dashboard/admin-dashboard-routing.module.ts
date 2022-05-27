import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { VehicleTableComponent } from './vehicle-table/vehicle-table.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'vehicle-table' },
  {
    path: '',
    component: AdminDashboardComponent,
    children: [{ path: 'vehicle-table', component: VehicleTableComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminDashboardRoutingModule {}
