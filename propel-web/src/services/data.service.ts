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
import { PropelAppError } from "../core/propel-app-error";

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

  /**
   * This method creates a copy of an existing entoty with exactly the same data. The name or identifier 
   * of the document is going to be modified in order to ensure uniquenes. 
   * e.g.: If the document identifier is "Server 01". The copy will have as name: "Server 01 (Duplicate)"
   * if that name is already existent, "Server 01 (Duplicate 2)" will be created and so on.
   * At this moment, you can creat duplicaes only for the following entities: Workflows and Targets.
   * An attempt of createa duplicate for any other entity will throw an error. 
   * @param entityType The type of items that is going to be duplicated.
   * @param identifier The unique text that identify uniquely the item. Usually his name.
   */
  duplicate(entityType: DataEntity, identifier: string): Observable<APIResponse<string>> {
    return new Observable<APIResponse<string>>((subscriber) => {

      let qm = new QueryModifier();
      let property: string = "name";
      
      if(!(entityType == DataEntity.Target || entityType == DataEntity.Workflow)) {
        throw new PropelAppError(`We can duplicate only Workflows and Targets. There is not logic yet to duplicate "${entityType.toString()}".`)
      }

      if(entityType == DataEntity.Target){
        property = "FQDN";
      }

      qm.populate = false;
      //Searching for all the Workflows that starts with the supplied name:      
      qm.filterBy = {
        // [`${property}`]: {
        [property]: {
          $regex: new RegExp(`^${Utils.escapeRegEx(identifier)}`)
            .toString()
            .replace(/\//g, "") //Removing forwardslashes for conversion as JSON string.
        }
      }
      qm.sortBy = property;

      this.find(entityType, qm)
        .subscribe((results: APIResponse<Entity>) => {
          //This is the item that have the data that is going to be duplicated
          let masterCopy: Entity = results.data.find((item) => (item as any)[property] == identifier); 
          let newName = Utils.getNextDuplicateName(identifier, results.data.map(item => (item as any)[property]))

          masterCopy._id = ""; //Removing the ID from the master copy, so save will create a new document.
          (masterCopy as any)[property] = newName; //Changing the name for the duplicate of the master copy.

          //Creating the new workflow as a copy from the master:
          this.save(entityType, masterCopy)
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
