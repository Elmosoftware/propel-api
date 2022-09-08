import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment as env } from 'src/environments/environment';
import { APIResponse } from "../../../propel-shared/core/api-response";
import { ScriptParameter } from '../../../propel-shared/models/script-parameter';
import { logger } from '../../../propel-shared/services/logger-service';
import { HttpHelper, Headers } from 'src/util/http-helper';

export const InferEndpoint: string = "infer"

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
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, InferEndpoint);

    return this.http.post<APIResponse<ScriptParameter>>(url, scriptCode, {
      headers: HttpHelper.buildHeaders(Headers.ContentTypeText)
    });
  }
}
