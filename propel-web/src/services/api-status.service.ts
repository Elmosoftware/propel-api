import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment as env } from 'src/environments/environment';
import { APIStatus } from "../../../propel-shared/models/api-status";
import { UsageStats } from "../../../propel-shared/models/usage-stats";
import { logger } from '../../../propel-shared/services/logger-service';
import { HttpHelper, Headers } from 'src/util/http-helper';

export const StatusEndpoint: string = "status"

export const enum StatusEndpointActions {
  ApplicationStats = "stats",
  UserStats = "user-stats"
}

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
  async getStatus(): Promise<APIStatus> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, StatusEndpoint);

    return this.http.get<APIStatus>(url, { 
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth) 
    })
    .toPromise();
  }

  /**
   * Retrieves the Application Usage Statistics.
   */
  async getApplicationUsageStats(): Promise<UsageStats> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, 
      [StatusEndpoint, StatusEndpointActions.ApplicationStats]);

    return this.http.get<UsageStats>(url, { 
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth) 
    })
    .toPromise();
  }

  /**
   * Retrieves the User Statistics.
   */
  async getUserStats(): Promise<UsageStats> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, 
      [StatusEndpoint, StatusEndpointActions.UserStats]);

    return this.http.get<UsageStats>(url, { 
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
    })
    .toPromise();
  }
}
