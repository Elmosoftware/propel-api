// @ts-check
import mongoose from "mongoose";
import { ErrorCodes } from "../../propel-shared/core/error-codes";
import { PropelError } from "../../propel-shared/core/propel-error";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { AdapterModel } from "../schema/mongoose-schema-adapter";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { Entity } from "../../propel-shared/models/entity";
import { PagedResponse } from "../../propel-shared/core/paged-response";

/**
 * Data Service
 */
export class DataService {

    private _model: AdapterModel;
    private _token?: SecurityToken;
    private _cryptoErrorRegExp: RegExp = new RegExp("^ERR_OSSL", "gi");;

    constructor(model: AdapterModel, token?: SecurityToken) {
        this._model = model;
        this._token = token;
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
    static getNewobjectId(id?: string) {
        if (id) return new mongoose.Types.ObjectId(id);
        else return new mongoose.Types.ObjectId();
    }

    /**
     * Returns a Mongoose Object ID, but as a defined type.
     * This is just to avoid typescript conversion issues.
     * @param id Object ID string representation
     * @returns an Object ID Mongoose type
     */
    static asObjectIdOf<T>(id: string): T {
        if (!this.isValidObjectId(id)) throw new PropelError(`Invalid Object id was provided to the "asObjectId" method. Value provided: "${id}"`);
        return ((this.getNewobjectId(id) as unknown) as T);
    }

    /**
     * Returns a boolean value indicating if the supplied string is a valid Object ID.
     * @param {any} id Object ID
     */
    static isValidObjectId(id: any) {
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
     * @param {Entity} document Entity document
     */
    add(document: Entity): Promise<string> {
        return new Promise((resolve, reject) => {

            let obj = null;
            this._setAuditData(true, document);

            if (!DataService.isValidObjectId(document._id)) {
                document._id = DataService.getNewobjectId().toString();
            }

            obj = this._model.model.hydrate(document);
            obj.isNew = true;

            obj.save()
            .then((data:any) => {
                resolve(data._id);
            })
            .catch((err:any)=>{
                if (this.isDupKeyError(err)) {
                    err = new PropelError(err, ErrorCodes.DuplicatedItem)
                }
                reject(err);
            })
        })
    }

    /**
     * Update an existing Entity document.
     * @param {Entity} document Entity Document updated data.
     */
    update(document: Entity): Promise<string> {
        return new Promise((resolve, reject) => {
            let e: PropelError | null = null;

            if (!document) {
                e = new PropelError(`The method "update" expect a not null reference for the "document" param.Provided value: "${String(document)}".`)
            }
            else if (!document._id) {
                e = new PropelError(`The method "update" expect a document with an "_id" attribute for the "document" param, (we can't update new documents!).Provided value was: "${JSON.stringify(document)}".`)
            }
            else if (!DataService.isValidObjectId(document._id)) {
                e = new PropelError(`The method "update" expect a valid ObjectId in the parameter "id". Provided value: "${String(document._id)}".`)
            }

            if (e) {
                reject(e);
            }
            else {
                this._setAuditData(false, document);

                this._model.model.updateOne({ _id: document._id }, document, null)
                    .exec()
                    .then((results: mongoose.UpdateWriteOpResult) => {
                        if (this.isVoidWrite(results)) {
                            let err = new PropelError(`The last UPDATE operation affects no documents. Please verify: \r\n
    - If The document you try to update no longer exists.
    - If you have been granted with the necessary permissions.`,
                                ErrorCodes.VoidUpdate
                            );
                            reject(err);
                        }
                        else {
                            resolve(document._id);
                        }
                    })
                    .catch((err) => {
                        if (this.isDupKeyError(err)) {
                            err = new PropelError(err, ErrorCodes.DuplicatedItem)
                        }
                        reject(err);
                    })
            }
        })
    }

    /**
     * Fecth documents with different options.
     * @param {QueryModifier} queryModifier Query optons that includes Paging, sorting, filtering, etc...
     */
    find(queryModifier: QueryModifier): Promise<PagedResponse<Entity>> {

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
                reject(e)
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
                else if (qm.isTextSearch) {
                    query.sort(projection);
                }

                if (qm.populate) {
                    query.populate(this._model.populateSchema)
                }

                //If results are paginated:
                if (qm.isPaginated) {
                    //We need to return first the total amount of documents for the specified filter:
                    countQuery.exec()
                        .then((count: number) => {
                            //If documents total amount is 0, there is no reason to continue:
                            if (count > 0) {
                                this._runFetchQuery(query, resolve, reject, count)
                            }
                            else {
                                resolve(new PagedResponse<Entity>());
                            }
                        })
                        .catch((err: any) => {
                            reject(err)
                        })
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
    delete(id: string): Promise<string> {

        return new Promise((resolve, reject) => {
            let e: PropelError | null = null;

            if (!id) {
                e = new PropelError(`The method "delete" expect a document id for the "id" param.Provided value was: "${JSON.stringify(id)}".`)
            }
            else if (!DataService.isValidObjectId(id)) {
                e = new PropelError(`The method "update" expect a valid ObjectId value for the parameter "id". Provided value: "${String(id)}".`)
            }

            if (e) {
                reject(e);
            }
            else {
                this._model.model.updateOne({ _id: id }, {
                    $set: {
                        deletedOn: new Date(),
                        deletedBy: (this._token) ? this._token.userName : ""
                    }
                }, null)
                    .exec()
                    .then((results: mongoose.UpdateWriteOpResult) => {
                        if (this.isVoidWrite(results)) {
                            //The attempt to soft delete a non existent document by Id is not reported as error by Mongoose:
                            let err = new PropelError(`The last DELETE operation affects no documents. This can be caused by the following issues: \r\n
    - The document you tried to delete no longer exists.
    - You are not been granted with the necessary permissions.`, ErrorCodes.VoidDelete);
                            reject(err);
                        }
                        else {
                            resolve(id);
                        }
                    })
                    .catch((err) => {
                        reject(err);
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
    _setAuditData(isNewDoc: boolean, doc: any) {

        //Internal fields can't be present in the submitted document:
        if (this._model.internalFieldsList.length > 0) {
            this._model.internalFieldsList.forEach((field) => {
                if (doc[field] !== undefined) {
                    delete doc[field]
                }
            })
        }

        //If the entity have audit data:
        if (this._model.auditFieldsList.length > 0) {
            if (isNewDoc) {
                doc.createdOn = new Date();
                doc.createdBy = (this._token?.userName) ? this._token.userName : null;
                doc.lastUpdateOn = null;
                doc.lastUpdateBy = null;
            }
            else {
                //To avoid invalid data stamping, we are going to remove the "create" fields when 
                //is an update to an existent document.
                delete doc.createdOn;
                delete doc.createdBy;
                doc.lastUpdateOn = new Date();
                doc.lastUpdateBy = (this._token?.userName) ? this._token.userName : null;
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
        query.exec()
        .then((data: any) => {
            cbResolve(new PagedResponse<Entity>(this._postProcessData(data), totalCount));
        })
        .catch((err:any) => {
            if (err) {
                if (this.isEncryptionError(err)) {
                    err = new PropelError(err, ErrorCodes.CryptoError);
                }
                cbReject(err);
            }
        })
    }

    /**
     * Any post processing of the data to deliver in this api, need to take place here.
     * @param data Data to process
     * @returns Processed data ready to be delivered by the Data API.
     */
    private _postProcessData(data: any): any[] {

        if (!data) return data;

        //If is not an array, we will turn into one:
        if (!Array.isArray(data)) data = [data];

        //Any post process of the data before to be sent to the client need to take part here:
        for (let i = 0; i < data.length; i++) {

            //Starting at this point, data is not anymore a model, but a plain Entity Object:
            data[i] = data[i].toObject();

            //Removing internal fields:
            /*
                NOTE: Internal fields need to be handled only on API side, can't be delivered to 
                the client.
             */
            if (this._model.internalFieldsList.length > 0) {
                this._model.internalFieldsList.forEach((field) => {
                    if (data[i][field] !== undefined) {
                        delete data[i][field];
                    }
                })
            }
        }

        return data;
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
    * @param {mongoose.UpdateWriteOpResult} UpdateWriteOpResult 
    * (More info here: https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~updateWriteOpResult)
    */
    private isVoidWrite(UpdateWriteOpResult: mongoose.UpdateWriteOpResult) {
        return (UpdateWriteOpResult && UpdateWriteOpResult.modifiedCount != undefined &&
            UpdateWriteOpResult.modifiedCount == 0)
    }

    /**
     * Indicate if a crypto operation is the cause of the error.
     * @param err received error.
     * @returns A boolean value indicating if the error is related to a failed encryption/decription 
     * operation in the database.
     */
    private isEncryptionError(err: any): boolean {
        return err && err.code && (String(err.code).match(this._cryptoErrorRegExp) != null);
    }

    //#endregion
}
