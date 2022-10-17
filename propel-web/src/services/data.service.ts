import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Entity } from "../../../propel-shared/models/entity";
import { QueryModifier } from '../../../propel-shared/core/query-modifier';
import { environment as env } from 'src/environments/environment';
import { PagedResponse } from "../../../propel-shared/core/paged-response";
import { DataRequest, DataRequestAction } from "../../../propel-shared/core/data-request";
import { logger } from '../../../propel-shared/services/logger-service';
import { Utils } from '../../../propel-shared/utils/utils';
import { PropelError } from '../../../propel-shared/core/propel-error';
import { HttpHelper, Headers } from 'src/util/http-helper';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';

export const DataEndpoint: string = "data";

export enum DataEndpointActions {
  ExecutionLog = "ExecutionLog",
  Script = "Script",
  Target = "Target",
  UserAccount = "UserAccount",
  Workflow = "Workflow",
  Secret = "Secret",
  Credential = "Credential"
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
  // async getById(entityType: DataEndpointActions, id: string, populate: boolean = true): Promise<Entity | undefined> {
  async getById<T>(entityType: DataEndpointActions, id: string, populate: boolean = true): Promise<T | undefined> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, [ DataEndpoint, entityType ]);
    let req: DataRequest = new DataRequest();
    let qm: QueryModifier | undefined;

    if (!populate) {
      qm = new QueryModifier();
      qm.populate = false;
    }

    req.action = DataRequestAction.Find;
    req.entity = id;
    req.qm = qm;

    return lastValueFrom(this.http.post<PagedResponse<T>>(url, req, { 
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson) 
    })
    .pipe(
      map((result: PagedResponse<T>) => {
        return result.data[0]; 
      })
    ))
  }

  /**
   * Retrieves all the entities of the specified type based on the supplied query modifier.
   * @param entityType Entity type.
   * @param qm Query modifier, (allows to specify filter, sorting, pagination, etc).
   */
  async find(entityType: DataEndpointActions, qm: QueryModifier): Promise<PagedResponse<Entity>> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, [ DataEndpoint, entityType ]);
    let req: DataRequest = new DataRequest();

    req.action = DataRequestAction.Find;
    req.qm = qm;

    // return this.http.post<PagedResponse<Entity>>(url, req, { 
    //   headers: HttpHelper.buildHeaders(Headers.ContentTypeJson) 
    // })
    // .toPromise();
    return lastValueFrom(this.http.post<PagedResponse<Entity>>(url, req, { 
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson) 
    }));
  }

  /**
   * Persist a new entity instance.
   * @param entityType Entity type.
   * @param entity Instance to persist.
   */
  async save(entityType: DataEndpointActions, doc: any): Promise<string> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, [ DataEndpoint, entityType ]);
    let req: DataRequest = new DataRequest();

    req.action = DataRequestAction.Save;
    req.entity = doc;

    return lastValueFrom(this.http.post<string>(url, req, { 
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson) 
    }));
  }

  /**
   * Delete the supplied entity by his id.
   * @param entityType Entity type.
   * @param id Entity id to delete.
   */
  async delete(entityType: DataEndpointActions, id: string): Promise<string> {
    let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, [ DataEndpoint, entityType ]);
    let req: DataRequest = new DataRequest();

    req.action = DataRequestAction.Delete;
    req.entity = id;

    return lastValueFrom(this.http.post<string>(url, req, { 
      headers: HttpHelper.buildHeaders(Headers.ContentTypeJson) 
    }));
  }

  /**
   * This method creates a copy of an existing entity with exactly the same data. The name or identifier 
   * of the document is going to be modified in order to ensure uniquenes. 
   * e.g.: If the document identifier is "Server 01". The copy will have as name: "Server 01 (Duplicate)"
   * if that name is already existent, "Server 01 (Duplicate 2)" will be created and so on.
   * At this moment, you can creat duplicaes only for the following entities: Workflows and Targets.
   * An attempt of createa duplicate for any other entity will throw an error. 
   * @param entityType The type of items that is going to be duplicated.
   * @param identifier The unique text that identify uniquely the item. Usually his name.
   */
  async duplicate(entityType: DataEndpointActions, identifier: string): Promise<string> {

        let qm = new QueryModifier();
        let property: string = "name";
        
        if(!(entityType == DataEndpointActions.Target || entityType == DataEndpointActions.Workflow)) {
          return Promise.reject(new PropelError(`We can duplicate only Workflows and Targets. There is not logic yet to duplicate "${entityType.toString()}".`))
        }
  
        if(entityType == DataEndpointActions.Target){
          property = "FQDN";
        }
  
        qm.populate = false;
        //Searching for all the Workflows that starts with the supplied name:      
        qm.filterBy = {
          [property]: {
            $regex: new RegExp(`^${Utils.escapeRegEx(identifier)}`)
              .toString()
              .replace(/\//g, "") //Removing forwardslashes for conversion as JSON string.
          }
        }
        qm.sortBy = property;

        let master: PagedResponse<Entity> = await this.find(entityType, qm);
        //This is the item that have the data that is going to be duplicated:
        let masterCopy: Entity = master.data.find((item) => (item as any)[property] == identifier)!; 
        let newName = Utils.getNextDuplicateName(identifier, master.data.map(item => (item as any)[property]))
  
        masterCopy._id = ""; //Removing the ID from the master copy, so save will create a new document.
        (masterCopy as any)[property] = newName; //Changing the name for the duplicate of the master copy.
  
        //Creating the new item as a copy from the master:
        return Promise.resolve(await this.save(entityType, masterCopy))
    }

}
