import { Component, OnInit } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ruLocale } from 'ngx-bootstrap/chronos';

import { ListItem } from "./listItem";
import { DataService } from "./data.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  minDate: Date;
  maxDate: Date;
  //mytime: Date;
  fmGroup: any;
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

  AvtoModelItems_Fill() {
    this.AvtoModelItems = this.DataService.sendRequest_GetModels(this.fmGroup.get('avtoMake').value);
  }

  ngOnInit() {

    this.fmGroup = this.formbuilder.group({
      avtoNumber: ['', Validators.required],
      clientPhone: ['', Validators.required],
      clientName: ['', Validators.required],
      serviceStation: ['', Validators.required],
      avtoMake: ['', Validators.required],
      avtoModel: ['', Validators.required],
      avtoWorks: ['', Validators.required],
      agreeOnTheCost: [true, Validators.required],
      bookedDate: ['', Validators.required],
      bookedTime: ['', ]
    }); //this.fmGroup.setValue({avtoNumber: 'Carson', clientPhone: 'Drew'});

    this.DataService.sendRequest_Login().subscribe(res => {
      console.log("login");
      this.ServiceStationItems = this.DataService.sendRequest_GetServiceStations();
      this.AvtoMakeItems = this.DataService.sendRequest_GetMarks();
    });
    
  }

  onSubmit(): void {
    this.DataService.sendRequest_SaveBooking(this.fmGroup).subscribe(res => {
      console.log("saved:");
      console.log(res);

    });
      
  }

  
}
