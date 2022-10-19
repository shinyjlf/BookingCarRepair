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

  public sendRequest_Login() { //https://TEH_TEST:a1b2c3D$@zenon.basgroup.ru:55724/api-v2/auth/login?API_KEY=92ae9e4c96394cf2aa2f462a5fde3b19     //TEH_TEST:a1b2c3D$@
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
          return new ListItem(item.MARK_ID, item.MARK_NAME_RUS);
        });
        return results;
      }));
  }

  public sendRequest_GetModels(modelId: string): Observable<ListItem[]> {
    return this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/Models?FilterString=MARK_ID=?&FilterParam[0]=" + modelId + "&Fields[_]=MODEL_ID,MODEL_NAME&SESSIONID=" + this.SessionID)
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
    let date = new Date(form.get('bookedDate').value);
    let tt = form.get('bookedDate').value;
    let hh = form.get('bookedTime').value;

    let time = new Date(form.get('bookedTime').value);
    let start_datetime = new Date(date.toDateString() + ' ' + date.toTimeString());
    console.log('datetime= ' + start_datetime.toString());

    let body = {
      LDEPARTMENT_ID: form.get('serviceStation').value,
      CREATE_DATE: new Date(),
      START: date,
      CLIENT_NAME: 'Василий Иванович Чапаев', // form.get('clientName').value
      CLIENT_PHONE: '+70001111111', //form.get('clientPhone').value
      GOSREG: form.get('avtoNumber').value,
      MODEL_ID: form.get('avtoModel').value,
      COMMENT: form.get('avtoWorks').value
    };
    console.log(body);
    return this.httpClient.post("https://" + this.REST_API_SERVER + "/api-v2/Core/RW/ScheduledCar?SESSIONID=" + this.SessionID, body).pipe(catchError(this.handleError));

  }
  public sendRequest_CheckSaving(serviceStationId: string, date: Date): Observable<ListItem[]> {
    return this.httpClient.get("https://" + this.REST_API_SERVER + "/api-v2/Core/Directories/Models?FilterString=MARK_ID=?&FilterParam[0]=" + modelId + "&Fields[_]=MODEL_ID,MODEL_NAME&SESSIONID=" + this.SessionID)
      .pipe(catchError(this.handleError), map(res => {
        console.log(res["result"]["Response"]);
        let results = res["result"]["Response"]["Models"]["data"].map(item => {
          return new ListItem(item.MODEL_ID, item.MODEL_NAME);
        })
        return results;
      }));
  }

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
