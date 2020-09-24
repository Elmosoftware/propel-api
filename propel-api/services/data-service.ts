// @ts-check
import mongoose from "mongoose";
import { ErrorCodes } from "../../propel-shared/core/error-codes";
import { PropelError } from "../../propel-shared/core/propel-error";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { AdapterModel } from "../schema/mongoose-schema-adapter";
import { APIResponse } from "../../propel-shared/core/api-response";

/**
 * Data Service
 */
export class DataService {

    private _model: AdapterModel;

    constructor(model: AdapterModel) {
        this._model = model;
    }

    /**
     * Return the model name currently servicing.
     */
    get modelName(): string {
        return this._model.name;
    }

    /**
     * Return a new Entity Object ID
     */
    getNewobjectId() {
        return mongoose.Types.ObjectId();
    }

    /**
     * Returns a boolean value indicating if the supplied string is a valid Object ID.
     * @param {any} id Object ID
     */
    isValidObjectId(id: any) {
        /*
            Created by Felipe Lorenzo VI 
            https://github.com/cnkdynamics/valid-objectid
        */

        // check first if undefined
        if (!id) {
            return false;
        }

        // check if id is a valid string
        if (typeof id !== 'string') {
            id = String(id);
        }

        // simply match the id from regular expression
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Add an Entity document to the database.
     * 
     * @param {any} document Entity document
     */
    add(document: any): Promise<APIResponse<any>> {
        return new Promise((resolve, reject) => {

            let obj = null;
            this._setAuditData(true, document, null);

            if (!this.isValidObjectId(document._id)) {
                document._id = this.getNewobjectId();
            }

            obj = this._model.model.hydrate(document);
            obj.isNew = true;

            obj.save((err: any, data: any) => {
                if (err) {
                    if (this.isDupKeyError(err)) {
                        err = new PropelError(err, ErrorCodes.DuplicatedItem)
                    }
                    reject(new APIResponse<any>(err, null));
                }
                else {
                    resolve(new APIResponse<any>(null, data._id));
                }
            })
        })
    }

    /**
     * Update an existing Entity document.
     * @param {any} document Entity Document updated data.
     */
    update(document: any): Promise<APIResponse<any>> {
        return new Promise((resolve, reject) => {
            let e: PropelError | null = null;

            if (!document) {
                e = new PropelError(`The method "update" expect a not null reference for the "document" param.Provided value: "${String(document)}".`)
            }
            else if (!document._id) {
                e = new PropelError(`The method "update" expect a document with an "_id" attribute for the "document" param, (we can't update new documents!).Provided value was: "${JSON.stringify(document)}".`)
            }
            else if (!this.isValidObjectId(document._id)) {
                e = new PropelError(`The method "update" expect a valid ObjectId in the parameter "id". Provided value: "${String(document._id)}".`)
            }

            if (e) {
                reject(new APIResponse<any>(e, null));
            }
            else {
                this._setAuditData(false, document, null);
                this._model.model.updateOne({ _id: document._id }, document, (err: any, data: any) => {
                    if (err) {
                        if (this.isDupKeyError(err)) {
                            err = new PropelError(err, ErrorCodes.DuplicatedItem)
                        }
                        reject(new APIResponse<any>(err, null));
                    }
                    else if (this.isVoidWrite(data)) {
                        let err = new PropelError(`The last UPDATE operation affects no documents. Please verify: \n
                    - If The document you try to update no longer exists.
                    - If you have been granted with the necessary permissions.`,
                            ErrorCodes.VoidUpdate
                        );
                        reject(new APIResponse<any>(err, null));
                    }
                    else {
                        resolve(new APIResponse<any>(null, document._id));
                    }
                })
            }
        })
    }

    /**
     * Fecth documents with different options.
     * @param {any} queryModifier Query optons that includes Paging, sorting , filtering, etc...
     */
    find(queryModifier: any): Promise<APIResponse<any>> {

        return new Promise((resolve, reject) => {
            let qm = new QueryModifier(queryModifier);
            let filter: string;
            let e: PropelError | null = null;

            if (qm.filterBy) {
                filter = JSON.stringify(qm.filterBy);

                //We check for no INTERNAL fields included in the JSON filter:
                if (this._model.internalFieldsList.some((field) => {
                    return filter.toLowerCase().indexOf(`"${field.toLowerCase()}":`) != -1;
                })) {
                    e = new PropelError(`At least one of the following invalid attributes were found in the JSON filter: "${this._model.internalFieldsList.join(", ")}".
Those fields are for internal use only and must not take part on user queries.`);
                }
            }
            else {
                qm.filterBy = {};
            }

            //Whatever is the case, we need to ensure only NOT DELETED documents will be affected:
            if (this._model.hasInternalField("deletedOn")) {
                qm.filterBy.deletedOn = { $eq: null };
            }

            if (e) {
                reject(new APIResponse<any>(e, null))
            }
            else {
                let projection: any = null;

                //If it's a text search, we add a projection to calculate the text scores:
                if (qm.isTextSearch) {
                    projection = { 
                        score: { 
                            $meta: "textScore" 
                        } 
                    }
                }

                // let query = this._model.model.find(qm.filterBy);
                let query = this._model.model.find(qm.filterBy, projection);
                let countQuery = this._model.model.countDocuments(qm.filterBy);

                if (qm.top > 0) {
                    query.limit(qm.top);
                }

                if (qm.skip > 0) {
                    query.skip(qm.skip);
                }

                if (qm.isSorted) {
                    query.sort(qm.sortBy);
                }
                //If the query is not sorted and is a text search, we will sort by default by the 
                //text score, (so more meaningful results are showing first):
                else if(qm.isTextSearch) {
                    query.sort(projection);
                }

                if (qm.populate) {
                    query.populate(this._model.populateSchema)
                }

                //If results are paginated:
                if (qm.isPaginated) {
                    //We need to return first the total amount of documents for the specified filter:
                    countQuery.exec((err: any, count: number) => {
                        if (err) {
                            reject(new APIResponse<any>(err, null));
                        }
                        else {
                            //If documents total amount is 0, there is no reason to continue:
                            if (count > 0) {
                                this._runFetchQuery(query, resolve, reject, count)
                            }
                            else {
                                resolve(new APIResponse<any>(null, null, 0));
                            }
                        }
                    });
                }
                else {
                    this._runFetchQuery(query, resolve, reject)
                }
            }
        })
    }

    /**
     * Delete the specified document by his ID.
     * @param {string} id Entity unique identifier.
     */
    delete(id: string): Promise<APIResponse<any>> {

        return new Promise((resolve, reject) => {
            let e: PropelError | null = null;

            if (!id) {
                e = new PropelError(`The method "delete" expect a document id for the "id" param.Provided value was: "${JSON.stringify(id)}".`)
            }
            else if (!this.isValidObjectId(id)) {
                e = new PropelError(`The method "update" expect a valid ObjectId value for the parameter "id". Provided value: "${String(id)}".`)
            }

            if (e) {
                reject(new APIResponse<any>(e, null));
            }
            else {
                this._model.model.updateOne({ _id: id }, { $set: { deletedOn: new Date() } },
                    (err: any, data: any) => {
                        if (err) {
                            reject(new APIResponse<any>(err, null));
                        }
                        else if (this.isVoidWrite(data)) {
                            //The attempt to soft delete a non existent document by Id is not reported as error by Mongoose:
                            let err = new PropelError(`The last DELETE operation affects no documents. This can be caused by the following issues: \n
                    - The document you tried to delete no longer exists.
                    - You are not been granted with the necessary permissions.`, ErrorCodes.VoidDelete);
                            reject(new APIResponse<any>(err, null));
                        }
                        else {
                            resolve(new APIResponse<any>(null, id));
                        }
                    })
            }
        })
    }

    /**
     * Set the audit inforomation in the document before to be persisted.
     * @param {boolean} isNewDoc Indicates if we are doing an insert or an update of a document.
     * @param {any} doc The document to be persisted. It must inherits from Entity class in order 
     * to fullfill the audit data.
     * @param {any} session Active session details.
     */
    _setAuditData(isNewDoc: boolean, doc: any, session: any) {

        doc.deletedOn = null;

        //If the entity have audit data:
        if (this._model.auditFieldsList.length > 0) {
            if (isNewDoc) {
                doc.createdOn = new Date();
                doc.createdBy = (session && session.userId) ? session.userId : null;
                doc.lastUpdateOn = null;
                doc.lastUpdateBy = null;
            }
            else {
                doc.lastUpdateOn = new Date();
                doc.lastUpdateBy = (session && session.userId) ? session.userId : null;
            }
        }
    }

    /**
     * Run the specified query and finally call on e of the callback functions based on the results.
     * @param {object} query Mongoose model query.
     * @param {function} cbResolve Resolve callback function to be called if the operation is successfull.
     * @param {function} cbReject Reject callback function to be called if the operation is unsuccessfull.
     * @param {number} totalCount Total amounts of documents in the collection.
     */
    private _runFetchQuery(query: any, cbResolve: Function, cbReject: Function, totalCount?: number) {
        query.exec((err: any, data: any) => {
            if (err) {
                cbReject(new APIResponse<any>(err, null));
            }
            else {
                cbResolve(new APIResponse<any>(null, data, totalCount));
            }
        });
    }

    /**
     * Returns a boolean value indicating if the provided error is a duplicate key error on a Database operation.
     * @param {any} err Error to evaluate
     */
    private isDupKeyError(err: any) {
        return (err && err.code && Number(err.code) == 11000) //11000 is the error code provided by Mongo related to duplicate key infractions.
    }

    /**
    * Returns a boolean value indicating if the last write operation in the database was not hitting 
    * any documents. This mean that no document was updated or deleted.
    * @param {any} insertOneWriteOpResultObject Error to evaluate
    */
    private isVoidWrite(insertOneWriteOpResultObject: any) {
        return (insertOneWriteOpResultObject && insertOneWriteOpResultObject.n != undefined &&
            insertOneWriteOpResultObject.n == 0)
    }

    //#endregion
}
