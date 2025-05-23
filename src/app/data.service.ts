import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { ListItem } from './listItem';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private REST_API_SERVER = "zenon.basgroup.ru:55724";
  private SessionID = "";


  constructor(private httpClient: HttpClient) { }

  public sendRequest_Login(): Observable<any> { //https://TEH_TEST:a1b2c3D$@zenon.basgroup.ru:55724/api-v2/auth/login?API_KEY=92ae9e4c96394cf2aa2f462a5fde3b19     //TEH_TEST:a1b2c3D$@
    console.log(" login function"); 
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('TEH_TEST:a1b2c3D$')
      })
    };
    let results = this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/auth/login?API_KEY=92ae9e4c96394cf2aa2f462a5fde3b19", httpOptions).pipe(catchError(this.handleError), map(data => {
        this.SessionID = data["SESSIONID"];
        let data1 = data["SESSIONID"];
      console.log("==" + data1);
      
      }));

    return results;
  }

  public sendRequest_GetCarData(carNumber: string): Observable<any> {
    let results = this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/CarsByGosreg/" + carNumber + "?SESSIONID=" + this.SessionID).pipe(catchError(this.handleError), map(data => {
      console.log("=getting car data 1=");
      console.log(data);
      return data;
    }));
    return results;
  }

  public sendRequest_GetCarDataExtended(carNumber: string): Observable<any> {
    let results = this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/ExtRequests/rsaExtended?GOSREG=" + carNumber + "&SESSIONID=" + this.SessionID).pipe(catchError(this.handleError), map(data => {
      console.log("=getting  car data 2=");
      console.log(data);
      return data;
    }));
    return results;
  }

  public sendRequest_GetCarModelData(modelID: string): Observable<any> {
    let results = this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/Model/" + modelID + "?SESSIONID=" + this.SessionID).pipe(catchError(this.handleError), map(data => {
      console.log("=getting model data 1=");
      console.log(data);
      return data;
    }));
    return results;
  }
  public sendRequest_GetCustomerData(customerID: string): Observable<any> {
    let results = this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/Customer/" + customerID + "?SESSIONID=" + this.SessionID).pipe(catchError(this.handleError), map(data => {
      console.log("=getting customer data 1=");
      console.log(data.toString());
      console.log(data);
      return data;
    }));
    return results;
  }

  public sendRequest_GetServiceStations(): Observable<ListItem[]> {
    return this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/RW/Directories/LDepartmentsCombo?SESSIONID=" + this.SessionID)
      .pipe(catchError(this.handleError), map(res => {
      console.log(res["result"]["Response"]);
      let results = res["result"]["Response"]["LDepartmentsCombo"]["data"].map(item => {
        return new ListItem(item.Id, item.Name);
      })
      return results;
    }));
  }

  public sendRequest_GetMarks(): Observable<ListItem[]> {
    return this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/Marks?Fields[_]=MARK_ID,MARK_NAME_RUS&SESSIONID=" + this.SessionID)
      .pipe(catchError(this.handleError), map(res => {
        console.log("status: " + res["status"]);
        console.log(res["result"]["Response"]);
        let results = res["result"]["Response"]["Marks"]["data"].map(item => {
          //this.avtoModel_disabled = false;
          return new ListItem(item.MARK_ID, item.MARK_NAME_RUS);
        });
        return results;
      }));
  }

  public sendRequest_GetModels(markId: string): Observable<ListItem[]> {
    return this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/Models?FilterString=MARK_ID=?&FilterParam[0]=" + markId + "&Fields[_]=MODEL_ID,MODEL_NAME&SESSIONID=" + this.SessionID)
      .pipe(catchError(this.handleError), map(res => {
      console.log(res["result"]["Response"]);
      let results = res["result"]["Response"]["Models"]["data"].map(item => {
        return new ListItem(item.MODEL_ID, item.MODEL_NAME);
      })
      return results;
    }));
  }

  public sendRequest_SaveBooking(form: any): Observable<any>{
    console.log(form.value);

    let start_datetime = new Date(form.get('bookedDate').value);
    if (form.get('bookedTime').value) { 
      let time = new Date(form.get('bookedTime').value);
      start_datetime = new Date(start_datetime.toDateString() + ' ' + time.toTimeString());
    }
    var datestring = this.formatDateToString(start_datetime);

    console.log("datestring = " + datestring);
    let clientPhone = form.get('clientPhone').value;
    if (clientPhone) clientPhone = "8" + clientPhone;

    let body = {
      LDEPARTMENT_ID: form.get('serviceStation').value,
      CREATE_DATE: this.formatDateToString(),
      START: datestring,
      CLIENT_NAME: form.get('clientName').value, // 'Василий Иванович Чапаев'
      CLIENT_PHONE: clientPhone, //form.get('clientPhone').value'+70001111111'
      GOSREG: form.get('avtoNumber').value,
      VIN: form.get('avtoVIN').value,
      MODEL_ID: form.get('avtoModel').value,
      COMMENT: form.get('avtoWorks').value
    };
    console.log(body);
    return this.httpClient.post("https://" + this.REST_API_SERVER + "/api-v2/Core/RW/ScheduledCar?SESSIONID=" + this.SessionID, body).pipe(catchError(this.handleError)); //of([]); //

  }

  public formatDateToString(start_datetime: Date = new Date()) {

    return start_datetime.getFullYear() + "-" + ("0" + (start_datetime.getMonth() + 1)).slice(-2) + "-" + ("0" + start_datetime.getDate()).slice(-2) + " " + ("0" + start_datetime.getHours()).slice(-2) + ":" + ("0" + start_datetime.getMinutes()).slice(-2) + ":" + ("0" + start_datetime.getSeconds()).slice(-2);
  }
  //public sendRequest_CheckSaving(serviceStationId: string, date: Date): Observable<ListItem[]> {
  //  return this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/Models?FilterString=MARK_ID=?&FilterParam[0]=" + modelId + "&Fields[_]=MODEL_ID,MODEL_NAME&SESSIONID=" + this.SessionID)
  //    .pipe(catchError(this.handleError), map(res => {
  //      console.log(res["result"]["Response"]);
  //      let results = res["result"]["Response"]["Models"]["data"].map(item => {
  //        return new ListItem(item.MODEL_ID, item.MODEL_NAME);
  //      })
  //      return results;
  //    }));
  //}

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }
}
