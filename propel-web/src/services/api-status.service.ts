import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { environment as env } from 'src/environments/environment';
import { APIStatus } from "../../../propel-shared/models/api-status";
import { UsageStats } from "../../../propel-shared/models/usage-stats";
import { logger } from '../../../propel-shared/services/logger-service';
import { HttpHelper, Headers } from 'src/util/http-helper';
import { SystemJob, SystemJobLogs } from "../../../propel-shared/core/system-job";

export const StatusEndpoint: string = "status"

export const enum StatusEndpointActions {
  ApplicationStats = "stats",
  UserStats = "user-stats",
  SystemJobs = "system-jobs",
  SystemJobLogs = "system-job-logs"
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

    return lastValueFrom(this.http.get<APIStatus>(url, {
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
    }));
  }

  /**
   * Retrieves the Application Usage Statistics.
   */
  async getApplicationUsageStats(): Promise<UsageStats | null> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
      [StatusEndpoint, StatusEndpointActions.ApplicationStats]);

    return lastValueFrom(this.http.get<UsageStats>(url, {
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
    }));
  }

  /**
   * Retrieves the User Statistics.
   */
  async getUserStats(): Promise<UsageStats> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
      [StatusEndpoint, StatusEndpointActions.UserStats]);

    return lastValueFrom(this.http.get<UsageStats>(url, {
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
    }));
  }

  async getSystemJobs(): Promise<SystemJob[]> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
      [StatusEndpoint, StatusEndpointActions.SystemJobs]);

    return lastValueFrom(this.http.get<SystemJob[]>(url, {
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
    }));
  }

  async getSystemJobLogs(jobName: string): Promise<SystemJobLogs | null> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
      [StatusEndpoint, StatusEndpointActions.SystemJobLogs, jobName]);

    return lastValueFrom(this.http.get<SystemJobLogs | null>(url, {
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
    }));
  }
}
