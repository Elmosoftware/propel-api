import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { APIResponse } from "../../../propel-shared/core/api-response";
import { logger } from '../../../propel-shared/services/logger-service';

/**
 * Data service
 */
@Injectable({
  providedIn: 'root'
})
export class APIStatusService {

  constructor(private http: HttpClient) { 
    logger.logInfo("APIStatusService instance created")
  }

  /**
   * Retrives the API status.
   */
  getStatus(): Observable<APIResponse<any>> {
    let url: string = this.buildURL();

    return this.http.get<APIResponse<any>>(url, { headers: this.buildHeaders() });
  }

  private buildURL() {
    return `http://${environment.api.url}${environment.api.endpoint.status}`;
  }

  private buildHeaders(): HttpHeaders {
    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json");

    // To add other headers: 
    //ret = ret.append("New header", "value");

    return ret;
  }
}
