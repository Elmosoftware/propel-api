import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Entity } from "../../../propel-shared/models/entity";
import { Observable } from 'rxjs';
import { QueryModifier } from '../../../propel-shared/core/query-modifier';
import { QueryResults } from "../../../propel-shared/core/query-results";
import { schemaRepo } from "../../../propel-shared/schema/schema-repository";
import { GraphQLClientSchemaAdapter } from "../../../propel-shared/schema/graphql-client-schema-adapter";

/**
 * Data service
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {

  private _gqlAdapter: GraphQLClientSchemaAdapter;

  constructor(private http: HttpClient) { 
    this._gqlAdapter = new GraphQLClientSchemaAdapter(schemaRepo);
  }

  /**
   * Retrieves and entity by his id.
   * @param entityType Entity type.
   * @param id Unique identifier.
   */
  getById<T extends Entity>(entityType: { new(): T }, id: string): Observable<QueryResults<T>> {
    return this.http.post<QueryResults<T>>("http://localhost:3000/api/data",
      this._gqlAdapter.buildGetByIdQuery<T>(entityType, id, []),
      { headers: this.buildAPIHeaders() })
      .pipe(
        map(data => {
          let ret: QueryResults<T> = data.data[Object.keys(data.data)[0]];
          return ret;
        })
      );
  }

  /**
   * Retrieves all teh entities of the specified type based on the supplied query modifier.
   * @param entityType Entity type.
   * @param qm Query modifier, (allows to specify filter, sorting, pagination, etc).
   */
  find<T extends Entity>(entityType: { new (): T }, qm: QueryModifier ): Observable<QueryResults<T>> {
    return this.http.post<QueryResults<T>>("http://localhost:3000/api/data", 
    this._gqlAdapter.buildFindQuery<T>(entityType, qm, []), 
      { headers: this.buildAPIHeaders() })
      .pipe(
        map(data => {
            let ret: QueryResults<T> = data.data[Object.keys(data.data)[0]];
            return ret;
        })
    );
  }

  /**
   * Persist a new entity instance.
   * @param entityType Entity type.
   * @param entity Instance to persist.
   */
  insert<T extends Entity>(entityType: { new(): T }, entity: T): Observable<string> {
    return this.http.post<string>("http://localhost:3000/api/data",
      this._gqlAdapter.buildInsertMutation<T>(entityType, entity),
      { headers: this.buildAPIHeaders() })
      .pipe(
        map((data: any) => {
          let ret: string = data.data[Object.keys(data.data)[0]];
          return ret;
        })
      );
  }

  /**
   * Updates an existing entity.
   * @param entityType Entity type
   * @param entity Entity to update.
   */
  update<T extends Entity>(entityType: { new (): T }, entity: T): Observable<string> {
    return this.http.post<string>("http://localhost:3000/api/data", 
    this._gqlAdapter.buildUpdateMutation<T>(entityType, entity), 
      { headers: this.buildAPIHeaders() })
      .pipe(
        map((data: any) => {
          let ret: string = data.data[Object.keys(data.data)[0]];
          return ret;
        })
      );
  }

  /**
   * Delete the supplied entity.
   * @param entityType Entity type.
   * @param entity Entity to delete.
   */
  delete<T extends Entity>(entityType: { new (): T }, entity: T): Observable<string> {
    return this.http.post<string>("http://localhost:3000/api/data", 
    this._gqlAdapter.buildDeleteMutation<T>(entityType, entity), 
      { headers: this.buildAPIHeaders() })
  }

  /**
   * Creates a new instance.
   * @param entityType Entity type. 
   */
  create<T>(entityType: { new (): T }): T {
    return new entityType();
  }

  private buildAPIHeaders(): HttpHeaders {

    let ret: HttpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json");

    // To add other headers: 
    //ret = ret.append("New header", "value");

    return ret;
  }
}