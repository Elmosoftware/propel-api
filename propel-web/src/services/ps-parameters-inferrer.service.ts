import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { APIResponse } from "../../../propel-shared/core/api-response";
import { ScriptParameter } from '../../../propel-shared/models/script-parameter';
import { logger } from '../../../propel-shared/services/logger-service';

/**
 * Data service
 */
@Injectable({
  providedIn: 'root'
})
export class PSParametersInferrerService {

  constructor(private http: HttpClient) { 
    logger.logInfo("PSParametersInferrerService instance created")
  }

  /**
   * Persist a new entity instance.
   * @param entityType Entity type.
   * @param entity Instance to persist.
   */
  infer(scriptCode: string): Observable<APIResponse<ScriptParameter>> {
    let url: string = this.buildURL();

    return this.http.post<APIResponse<ScriptParameter>>(url, scriptCode, { headers: this.buildHeaders() });
  }

  private buildURL() {
    return `http://${environment.api.url}${environment.api.endpoint.infer}`;
  }

  private buildHeaders(): HttpHeaders {
    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "text/plain");

    // To add other headers: 
    //ret = ret.append("New header", "value");

    return ret;
  }
}
