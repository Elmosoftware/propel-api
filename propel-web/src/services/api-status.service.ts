import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { APIStatus } from "../../../propel-shared/models/api-status";
import { UsageStats } from "../../../propel-shared/models/usage-stats";
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
   * Retrieves the API status.
   */
  getStatus(): Observable<APIResponse<APIStatus>> {
    let url: string = this.buildURLForStatus();

    return this.http.get<APIResponse<APIStatus>>(url, { headers: this.buildHeaders() });
  }

  /**
   * Retrieves the Application Usage Statistics.
   */
  getApplicationUsageStats(): Observable<APIResponse<UsageStats>> {
    let url: string = this.buildURLForApplicationUsageStats();

    return this.http.get<APIResponse<UsageStats>>(url, { headers: this.buildHeaders() });
  }

  private buildURLForStatus() {
    return `http://${environment.api.url}${environment.api.endpoint.status}`;
  }

  private buildURLForApplicationUsageStats() {
    return this.buildURLForStatus() + "stats";
  }

  private buildHeaders(): HttpHeaders {
    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json");

    // To add other headers: 
    //ret = ret.append("New header", "value");

    return ret;
  }
}
