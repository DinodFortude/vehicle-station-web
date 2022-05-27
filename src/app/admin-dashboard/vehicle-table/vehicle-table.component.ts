import { Component, OnInit, ViewChild } from '@angular/core';
import { VehicleService } from '../vehicle.service';
import { Vehicle } from '../vehicle';
import { Observable } from 'rxjs';
import {
  State,
  process,
  CompositeFilterDescriptor,
} from '@progress/kendo-data-query';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketServiceService } from '../socket-service.service';
import { NotifierService } from 'angular-notifier';
import Swal from 'sweetalert2';
import {
  GridComponent,
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent,
} from '@progress/kendo-angular-grid';
import { map } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-vehicle-table',
  templateUrl: './vehicle-table.component.html',
  styleUrls: ['./vehicle-table.component.css'],
})
export class VehicleTableComponent implements OnInit {
  loading: boolean = true;
  vehicles: Vehicle[] = [];
  vehicle!: Vehicle;
  value!: boolean;
  availabilityRack: boolean[] = [];
  visibilityRack: boolean[] = [];
  private readonly notifier: NotifierService;
  totalVehicles!: number;
  skip: number = 0;
  pageSize: number = 3;
  filter: CompositeFilterDescriptor = {
    logic: 'and',
    filters: [{ field: 'model', operator: 'contains', value: '' }],
  };
  keyWord: string = '';

  public gridView!: GridDataResult;
  @ViewChild('grid') grid!: GridComponent;

  public editedRowIndex: number | undefined;
  private editedProduct: Vehicle | undefined;

  dataItem = new Vehicle();

  public formGroup!: FormGroup;
  public date: Date = new Date();
  public max = new Date();
  public fullFormat = 'dd/MMM/yyyy';
  public ageString: string = '';
  public age: number = 0;

  constructor(
    private service: VehicleService,
    private webSocketService: SocketServiceService,
    notifierService: NotifierService
  ) {
    this.getVehicles(this.keyWord, this.skip, this.pageSize);
    this.notifier = notifierService;
    this.allData = this.allData.bind(this);
  }

  createFormGroup = (dataItem: any) =>
    new FormGroup({
      id: new FormControl(dataItem.id),
      first_name: new FormControl(dataItem.first_name),
      last_name: new FormControl(dataItem.last_name, Validators.required),
      email: new FormControl(dataItem.email),
      car_make: new FormControl(
        dataItem.car_make,
        Validators.compose([
          Validators.required,
          // Validators.pattern('^[0-9]{1,3}'),
        ])
      ),
      car_model: new FormControl(dataItem.car_model),
      vin_number: new FormControl(dataItem.vin_number),
      manufactured_date: new FormControl(new Date(dataItem.manufactured_date)),
      age_of_vehicle: new FormControl(dataItem.age_of_vehicle),
    });

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    console.log(this.skip);
    this.getVehicles(this.keyWord, this.skip, this.pageSize);
  }

  async loadItems(skip: number): Promise<void> {
    this.getVehicles(this.keyWord, skip, this.pageSize);
    console.log(this.vehicles);
    this.gridView = {
      data: this.vehicles,
      total: this.totalVehicles,
    };
  }

  ngOnInit(): void {
    //this.getVehicles(this.keyWord, this.skip, this.pageSize);
    //this.loadItems(this.skip);
    this.webSocketService.listen('notification').subscribe((data: any) => {
      console.log(data);
      this.reFetching();
      this.notifier.show({
        type: 'success',
        message: data,
      });
    });
    this.webSocketService.listen('csv-export').subscribe((data: any) => {
      console.log(data);
      this.notifier.show({
        type: 'success',
        message: data,
      });
      this.getCSV();
    });
  }

  getVehicles(keyWord: string, skip: number, pageSize: number) {
    this.loading = true;
    this.service
      .getVehiclesPagi(keyWord, skip, pageSize)
      .subscribe((result: any) => {
        console.log(result.data.findAllVehiclesPagi.filteredVehicles);
        //console.log(result.loading);
        //console.log(result.data);
        this.loading = result.loading;
        this.vehicles = result.data.findAllVehiclesPagi.filteredVehicles;
        this.totalVehicles = result.data.findAllVehiclesPagi.totalCount;
        this.gridView = {
          data: result.data.findAllVehiclesPagi.filteredVehicles,
          //data: this.testData,
          total: result.data.findAllVehiclesPagi.totalCount,
        };
        console.log(this.gridView);
      });
  }

  reFetching() {
    this.skip = 0;
    this.getVehicles('', 0, this.pageSize);
    console.log('Yes Re-Fetching started...');
  }

  public addHandler({ sender }: any) {
    this.closeEditor(sender);

    this.formGroup = this.createFormGroup({
      id: 0,
      first_name: '',
      last_name: '',
      email: '',
      car_make: '',
      car_model: '',
      vin_number: '',
      manufactured_date: new Date(),
      age_of_vehicle: '0 days',
    });

    sender.addRow(this.formGroup);
  }

  public editHandler({ sender, rowIndex, dataItem }: any) {
    this.ageString = dataItem.age_of_vehicle;
    this.closeEditor(sender);

    this.formGroup = this.createFormGroup(dataItem);

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);

    console.log(this.formGroup.value);
  }
  public cancelHandler({ sender, rowIndex }: any) {
    console.log('Call cancelling...');
    this.closeEditor(sender, rowIndex);
  }
  public saveHandler({ sender, rowIndex, formGroup, isNew }: any) {
    const vehicle: Vehicle = formGroup.value;
    console.log('Call saving...');

    this.formGroup.value['manufactured_date'] = formatDate(
      this.formGroup.value['manufactured_date'],
      'MM/dd/yyyy',
      'en-US'
    );

    console.log(formGroup.value);
    if (isNew) {
      console.log('Creating Vehicle');
      this.service.createVehicle(formGroup.value).subscribe(
        ({ data }) => {
          console.log('got data', data);
          this.reFetching(); //re-fetching data
          this.notifier.show({
            type: 'success',
            // message: data['removeVehicle']['massage'],
            message: 'Vehicle Created Successfully',
          });
        },
        (error) => {
          console.log('there was an error sending the query', error);
        }
      );
    } else {
      console.log('Updating Vehicle');
      this.service.updateVehicle(formGroup.value).subscribe(
        ({ data }) => {
          console.log('got data', data);
          this.reFetching(); //re-fetching data
          this.notifier.show({
            type: 'success',
            // message: data['removeVehicle']['massage'],
            message: 'Vehicle Updated Successfully',
          });
        },
        (error) => {
          console.log('there was an error sending the query', error);
        }
      );
    }

    sender.closeRow(rowIndex);
  }

  public removeHandler({ dataItem }: any) {
    Swal.fire({
      title: 'Are you sure want to delete?',
      text: 'You will not be able to recover this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        //perform deletion action
        console.log('Call removing...');
        console.log(dataItem.id);
        this.service.removeVehicle(dataItem.id).subscribe(
          ({ data }) => {
            console.log('got data', data);
            this.reFetching(); //re-fetching data
            this.notifier.show({
              type: 'success',
              message: data['removeVehicle']['massage'],
            });
          },
          (error) => {
            console.log('there was an error sending the query', error);
          }
        );
      }
    });
  }
  private closeEditor(grid: any, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    //this.editService.resetItem(this.editedProduct);
    this.editedRowIndex = undefined;
    this.editedProduct = undefined;
  }

  public filterChange(filter: any): void {
    this.filter = filter;
    // this.gridData = filterBy(sampleProducts, filter);

    if (filter.filters[0] != undefined) {
      //console.log(filter.filters[0]!.value);
      this.keyWord = filter.filters[0]!.value;
    } else {
      console.log('No values');
      this.keyWord = '';
    }
    console.log(this.keyWord);
    this.skip = 0;
    this.getVehicles(this.keyWord, this.skip, this.pageSize);
  }

  public allData(): ExcelExportData {
    const result: ExcelExportData = {
      data: process(this.vehicles, {
        sort: [{ field: 'id', dir: 'asc' }],
        filter: {
          logic: 'or',
          filters: [{ field: 'age_of_vehicle', operator: 'gt', value: 35 }],
        },
      }).data,
    };
    return result;
  }

  exportCSV() {
    this.age = Math.round(this.age);
    console.log(`Now ready to csv exporting...${this.age}`);
    this.service.exportCsvfile(this.age).subscribe((data: any) => {
      console.log(data);
    });
  }

  getCSV() {
    console.log('Now ready to csv exporting...');
    this.service.getCsvfile().subscribe((data: any) => {
      saveAs(data, 'Vehicles.csv');
    });
  }

  public onChange(event: any): void {
    this.age = Math.round(event);
  }

  changeDate(value?: Date): void {
    console.log('data change occured' + value);
    let currentTime = new Date().getTime();
    let birthDateTime = value?.getTime();
    let difference = currentTime - birthDateTime!;
    var ageInYears = difference / (1000 * 60 * 60 * 24 * 365);
    console.log(ageInYears);

    var ageRound;

    if (ageInYears >= 1) {
      ageRound = Math.floor(ageInYears);
      if (ageRound == 1) {
        this.ageString = ageRound + ' year';
      } else {
        this.ageString = ageRound + ' years';
      }
    } else {
      ageInYears = ageInYears * 12;
      if (ageInYears >= 1) {
        ageRound = Math.floor(ageInYears);
        if (ageRound == 1) {
          this.ageString = ageRound + ' month';
        } else {
          this.ageString = ageRound + ' months';
        }
      } else {
        ageRound = Math.floor(ageInYears * 31);
        if (ageRound == 1) {
          this.ageString = ageRound + ' day';
        } else {
          this.ageString = ageRound + ' days';
        }
      }
    }

    this.formGroup.patchValue({ age_of_vehicle: this.ageString });
  }

  deleteItem() {
    Swal.fire({
      title: 'Are you sure want to delete?',
      text: 'You will not be able to recover this record',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        //perform deletion action
        console.log('Call removing...');
      }
    });
  }
}
