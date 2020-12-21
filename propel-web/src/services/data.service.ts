import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Entity } from "../../../propel-shared/models/entity";
import { Observable } from 'rxjs';
import { QueryModifier } from '../../../propel-shared/core/query-modifier';
import { environment } from 'src/environments/environment';
import { APIResponse } from "../../../propel-shared/core/api-response";
import { APIRequest, APIRequestAction } from "../../../propel-shared/core/api-request";
import { logger } from '../../../propel-shared/services/logger-service';
import { Utils } from '../../../propel-shared/utils/utils';

export enum DataEntity {
  Category = "Category",
  Group = "Group",
  ExecutionLog = "ExecutionLog",
  Script = "Script",
  Target = "Target",
  User = "User",
  Workflow = "Workflow"
}

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
  getById(entityType: DataEntity, id: string, populate: boolean = true): Observable<APIResponse<Entity>> {
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

    return this.http.post<APIResponse<Entity>>(url, req, { headers: this.buildHeaders() })
  }

  /**
   * Retrieves all the entities of the specified type based on the supplied query modifier.
   * @param entityType Entity type.
   * @param qm Query modifier, (allows to specify filter, sorting, pagination, etc).
   */
  find(entityType: DataEntity, qm: QueryModifier): Observable<APIResponse<Entity>> {
    let url: string = this.buildURL(entityType);
    let req: APIRequest = new APIRequest();

    req.action = APIRequestAction.Find;
    req.qm = qm;

    return this.http.post<APIResponse<Entity>>(url, req, { headers: this.buildHeaders() });
  }

  /**
   * Persist a new entity instance.
   * @param entityType Entity type.
   * @param entity Instance to persist.
   */
  save(entityType: DataEntity, doc: any): Observable<APIResponse<string>> {
    let url: string = this.buildURL(entityType);
    let req: APIRequest = new APIRequest();

    req.action = APIRequestAction.Save;
    req.entity = doc;

    return this.http.post<APIResponse<string>>(url, req, { headers: this.buildHeaders() });
  }

  /**
   * Delete the supplied entity by his id.
   * @param entityType Entity type.
   * @param id Entity id to delete.
   */
  delete(entityType: DataEntity, id: string): Observable<APIResponse<string>> {
    let url: string = this.buildURL(entityType);
    let req: APIRequest = new APIRequest();

    req.action = APIRequestAction.Delete;
    req.entity = id;

    return this.http.post<APIResponse<string>>(url, req, { headers: this.buildHeaders() });
  }

  duplicateWorkflow(name: string): Observable<APIResponse<string>> {
    return new Observable<APIResponse<string>>((subscriber) => {

      let qm = new QueryModifier();

      qm.populate = false;
      //Searching for all the Workflows that starts with the supplied name:      
      qm.filterBy = {
        name: {
          $regex: new RegExp(`^${Utils.escapeRegEx(name)}`)
            .toString()
            .replace(/\//g, "") //Removing forwardslashes for conversion as JSON string.
        }
      }
      qm.sortBy = "name";

      this.find(DataEntity.Workflow, qm)
        .subscribe((results: APIResponse<Entity>) => {

          let masterCopy: Entity = results.data.find((w) => (w as any).name == name); //This is the 
          //workflow that is going to be copied.
          let newName = Utils.getNextDuplicateName(name, results.data.map(w => (w as any).name))

          masterCopy._id = ""; //Removing the ID from the master copy, so save will create a new workflow.
          (masterCopy as any).name = newName; //Changing the name as a duplicate of the master copy.

          //Creating the new workflow as a copy from the master:
          this.save(DataEntity.Workflow, masterCopy)
            .subscribe((results: APIResponse<string>) => {
              subscriber.next(results);
              subscriber.complete();
            })
        },
          err => {
            subscriber.error(err);
          });
    });
  }

  /**
   * Creates a new instance.
   * @param entityType Entity type. 
   */
  create<T>(entityType: { new(): T }): T {
    return new entityType();
  }

  private buildURL(entityType: DataEntity) {
    return `http://${environment.api.url}${environment.api.endpoint.data}${entityType.toString().toLowerCase()}`
  }

  private buildHeaders(): HttpHeaders {
    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json");

    // To add other headers: 
    //ret = ret.append("New header", "value");

    return ret;
  }
}
