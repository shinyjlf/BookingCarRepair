import { Component, OnInit } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ruLocale } from 'ngx-bootstrap/chronos';

import { ListItem } from "./listItem";
import { DataService } from "./data.service";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  minDate: Date;
  maxDate: Date;  //bookedDateTime: Date | undefined = new Date();  
  fmGroup: FormGroup; 
  ServiceStationItems: Observable<ListItem[]>;
  AvtoMakeItems: Observable<ListItem[]>;
  AvtoModelItems: Observable<ListItem[]>;


  constructor(private formbuilder: FormBuilder, private DataService: DataService, private localeService: BsLocaleService) {
    defineLocale('ru', ruLocale);
    this.localeService.use('ru');
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setDate(this.minDate.getDate());
    this.maxDate.setDate(this.minDate.getDate() + 31);
    //this.mytime = new Date();
    //this.mytime.setHours(0, 0);    
  }

  AvtoModelItems_Fill(avtoMakeID: string) {
    this.AvtoModelItems = this.DataService.sendRequest_GetModels(avtoMakeID);
  }

  CarData_Fill() {

    if (this.fmGroup.get('avtoNumber').valid) {
      //this.DataService.sendRequest_Login().subscribe(loginRes => {
      this.DataService.sendRequest_GetCarData(this.fmGroup.get('avtoNumber').value).subscribe(res => {
        console.log(res["result"]["Response"]);
        let i = 0; let _customerID = ""; let _avtoModelID = ""; let _avtoVIN = ""; let _customerPhone = ""; let _customerName = ""; let _avtoMakeID = "";
        console.log("received avto data = " + res["result"]["Response"]["CarsByGosreg"]["data"]);

        res["result"]["Response"]["CarsByGosreg"]["data"].map(item => {
          _customerID = item.PROPERTY_CUSTOMER_ID;
          _avtoModelID = item.MODEL_ID;
          _avtoVIN = item.VIN;
          this.fmGroup.patchValue({ avtoVIN: _avtoVIN });
          i++;
          if (_customerID != "") {
            this.DataService.sendRequest_GetCustomerData(_customerID).subscribe(res1 => {
              console.log("customer by id");
              console.log(res1["result"]["Response"]);

              let data = res1["result"]["Response"]["Customer"]["data"];
              _customerPhone = data["PHONE"] ?? '';
              _customerName = (data["FIRST_NAME"] ?? '') + ' ' + (data["SECOND_NAME"] ?? '') + ' ' + (data["LAST_NAME"] ?? '');
              this.fmGroup.patchValue({ clientName: _customerName, clientPhone: _customerPhone });

            });
          }

          if (_avtoModelID != "") {
            this.DataService.sendRequest_GetCarModelData(_avtoModelID).subscribe(res1 => {
              console.log("car model by id");
              console.log(res1["result"]["Response"]);
              let data = res1["result"]["Response"]["Model"]["data"];
              let _avtoMakeID = data["MARK_ID"] ?? '';
              if (_avtoMakeID != "") { //can't be empty
                this.AvtoModelItems = this.DataService.sendRequest_GetModels(_avtoMakeID).pipe(map(res2 => {
                  console.log('model = ' + _avtoModelID + ', makeId= ' + _avtoMakeID);
                  this.fmGroup.patchValue({ avtoMake: _avtoMakeID, avtoModel: _avtoModelID });
                  return res2;
                }));
              }
              
            });

          }

        });

        if (i == 0) {
          this.DataService.sendRequest_GetCarDataExtended(this.fmGroup.get('avtoNumber').value).subscribe(res1 => {
            console.log("car by avto numberb (gibdd)");
            console.log(res1["result"]["Response"]);
            let data = res1["result"]["Response"]["rsaExtended"];
            _customerName = data["ownerFio"] ?? '';
            let _avtoMake :string = data["carMark"] ?? '';
            let _avtoModel :string = data["carModel"] ?? '';
            _avtoVIN = data["vin"] ?? '';
            this.fmGroup.patchValue({ clientName: _customerName, avtoVIN: _avtoVIN });

            this.AvtoMakeItems.forEach(itm => {                          
              let ls_item = itm.find(a => a.name.toLowerCase().trim() == _avtoMake.toLowerCase().trim());
              console.log(ls_item.id);
              _avtoMakeID = ls_item.id;
              this.fmGroup.patchValue({ avtoMake: _avtoMakeID });

              if (_avtoMakeID != "") {
                this.AvtoModelItems = this.DataService.sendRequest_GetModels(_avtoMakeID).pipe(map(res2 => {
                  _avtoModelID = res2.find(itm => (itm.name.toLowerCase().trim() == _avtoModel.toLowerCase().trim()))?.id;
                  console.log('model = ' + _avtoModelID);
                  this.fmGroup.patchValue({ avtoModel: _avtoModelID });
                  return res2;
                }));
              }

            });
            
            

            
            

          });
        }

      });
      //});
    }
    this.setValidity('avtoNumber');
  }
  
  ngOnInit() {

    this.fmGroup_init();
    
    this.DataService.sendRequest_Login().subscribe(res => {
      console.log("login");
      this.ServiceStationItems = this.DataService.sendRequest_GetServiceStations();
      this.AvtoMakeItems = this.DataService.sendRequest_GetMarks();
    });
    
  }

  onSubmit(): void {
    if (this.fmGroup.valid) {
      this.DataService.sendRequest_SaveBooking(this.fmGroup);
      this.fmGroup_init();
    }
    else {
      this.setValidity('avtoNumber', true); //validate all fields, starting from 'avtoNumber'
    }
  }

  fmGroup_init() {
    this.fmGroup = this.formbuilder.group({
      avtoNumber: ['', [Validators.required, Validators.pattern(/^\D\d{3}\D{2}\d{2,3}$/)]], //В455КВ197
      clientPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      clientName: ['', [Validators.required]],
      serviceStation: ['', Validators.required],
      avtoMake: ['', Validators.required],
      avtoModel: ['', Validators.required],
      avtoVIN: [''],
      avtoWorks: ['', Validators.required],
      agreeOnTheCost: [true, Validators.required],
      bookedDate: ['', Validators.required],
      bookedTime: ['',]
    });
  }


  avtoNumber_class: boolean = false; 
  clientPhone_class: boolean = false;
  clientName_class: boolean = false;
  serviceStation_class: boolean = false;
  avtoMake_class: boolean = false;
  avtoModel_class: boolean = false;
  avtoWorks_class: boolean = false;
  bookedDate_class: boolean = false;


  setValidity(name: any, checkAll: boolean = false) {
    console.log(name + ' = ' + this.fmGroup.get(name).invalid);
    switch (name) {
        case 'avtoNumber': this.avtoNumber_class = this.fmGroup.get('avtoNumber').invalid; if (!checkAll) break;
        case 'clientPhone': this.clientPhone_class = this.fmGroup.get('clientPhone').invalid; if (!checkAll) break;
        case 'clientName': this.clientName_class = this.fmGroup.get('clientName').invalid; if (!checkAll) break;
        case 'serviceStation': this.serviceStation_class = this.fmGroup.get('serviceStation').invalid; if (!checkAll) break;
        case 'avtoMake': this.avtoMake_class = this.fmGroup.get('avtoMake').invalid; if (!checkAll) break;
        case 'avtoModel': this.avtoModel_class = this.fmGroup.get('avtoModel').invalid; if (!checkAll) break;
        case 'avtoWorks': this.avtoWorks_class = this.fmGroup.get('avtoWorks').invalid; if (!checkAll) break;
        case 'bookedDate': this.bookedDate_class = this.fmGroup.get('bookedDate').invalid; if (!checkAll) break;

      }
     
  }

  get avtoNumber() {
    return this.fmGroup.get('avtoNumber');
  }
  get avtoMake() {
    return this.fmGroup.get('avtoMake');
  }
  //get clientPhone() :string{
  //  return 'clientPhone';
  //}


  
}
