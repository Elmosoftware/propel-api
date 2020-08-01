import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Entity } from "../../../propel-shared/models/entity";
import { Observable } from 'rxjs';
import { QueryModifier } from '../../../propel-shared/core/query-modifier';
import { environment } from 'src/environments/environment';
import { APIResponse } from "../../../propel-shared/core/api-response";
import { APIRequest, APIRequestAction } from "../../../propel-shared/core/api-request";
import { logger } from '../../../propel-shared/services/logger-service';

/**
 * Data service
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { 
    logger.logInfo("DataService instance created")
  }

  /**
   * Retrieves and entity by his id.
   * @param entityType Entity type.
   * @param id Unique identifier.
   * @param populate Boolean value that indicates if subdocuments will be populated. true by default.
   */
  getById<T extends Entity>(entityType: { new(): T }, id: string, populate: boolean = true): Observable<APIResponse<T>> {
      let url: string = this.buildURL(entityType);
      let req: APIRequest = new APIRequest();
      let qm: QueryModifier = null;

      if (!populate) {
        qm = new QueryModifier();
        qm.populate = false;
      }

      req.action = APIRequestAction.Find;
      req.entity = id;
      req.qm = qm;

    return this.http.post<APIResponse<T>>(url, req, { headers: this.buildHeaders() })
  }

  /**
   * Retrieves all the entities of the specified type based on the supplied query modifier.
   * @param entityType Entity type.
   * @param qm Query modifier, (allows to specify filter, sorting, pagination, etc).
   */
  find<T extends Entity>(entityType: { new (): T }, qm: QueryModifier ): Observable<APIResponse<T>> {
    let url: string = this.buildURL(entityType);
    let req: APIRequest = new APIRequest();
    
    req.action = APIRequestAction.Find;
    req.qm = qm;

    return this.http.post<APIResponse<T>>(url, req, { headers: this.buildHeaders() });
  }

  /**
   * Persist a new entity instance.
   * @param entityType Entity type.
   * @param entity Instance to persist.
   */
  save<T extends Entity>(entityType: { new(): T }, entity: T): Observable<APIResponse<string>> {
    let url: string = this.buildURL(entityType);
    let req: APIRequest = new APIRequest();
    
    req.action = APIRequestAction.Save;
    req.entity = entity;

    return this.http.post<APIResponse<string>>(url, req, { headers: this.buildHeaders() });
  }

  /**
   * Delete the supplied entity by his id.
   * @param entityType Entity type.
   * @param id Entity id to delete.
   */
  delete<T extends Entity>(entityType: { new (): T }, id: string): Observable<APIResponse<string>> {
    let url: string = this.buildURL(entityType);
    let req: APIRequest = new APIRequest();
    
    req.action = APIRequestAction.Delete;
    req.entity = id;

    return this.http.post<APIResponse<string>>(url, req, { headers: this.buildHeaders() });
  }

  /**
   * Creates a new instance.
   * @param entityType Entity type. 
   */
  create<T>(entityType: { new (): T }): T {
    return new entityType();
  }

  private buildURL<T extends Entity>(entityType: { new (): T }) {
    return `http://${environment.api.url}${environment.api.endpoint.data}${entityType.name.toLowerCase()}`
  }

  private buildHeaders(): HttpHeaders {
    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json");

    // To add other headers: 
    //ret = ret.append("New header", "value");

    return ret;
  }
}
