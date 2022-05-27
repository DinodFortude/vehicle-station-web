import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { VehicleTableComponent } from './vehicle-table/vehicle-table.component';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { ToolBarModule } from '@progress/kendo-angular-toolbar';
import { LabelModule } from '@progress/kendo-angular-label';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { NumericTextBoxModule } from '@progress/kendo-angular-inputs';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    VehicleTableComponent,
    FileUploaderComponent,
  ],
  imports: [
    CommonModule,
    AdminDashboardRoutingModule,
    MatCardModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NgxSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatGridListModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    GridModule,
    DateInputsModule,
    ExcelModule,
    UploadsModule,
    ToolBarModule,
    LabelModule,
    DropDownsModule,
    NumericTextBoxModule,
  ],
  exports: [MatFormFieldModule, MatInputModule],
  entryComponents: [],
})
export class AdminDashboardModule {}
