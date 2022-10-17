import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment as env } from 'src/environments/environment';
import { ScriptParameter } from '../../../propel-shared/models/script-parameter';
import { logger } from '../../../propel-shared/services/logger-service';
import { HttpHelper, Headers } from 'src/util/http-helper';
import { lastValueFrom } from 'rxjs';

export const InferenceEndpoint: string = "infer"

/**
 * Data service
 */
@Injectable({
  providedIn: 'root'
})
export class ParamInferenceService {

  constructor(private http: HttpClient) {
    logger.logInfo("PSParametersInferrerService instance created")
  }

  /**
   * Infer script parameters.
   * @param scriptCode Script code to analyze to extract the parameters.
   * @returns A collection of Script>Parameter object representing all the 
   * parameters inthe supplied script.
   */
  async infer(scriptCode: string): Promise<ScriptParameter[]> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, InferenceEndpoint);

    return lastValueFrom(this.http.post<ScriptParameter[]>(url, scriptCode, {
      headers: HttpHelper.buildHeaders(Headers.ContentTypeText)
    }));
  }
}
