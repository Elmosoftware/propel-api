// @ts-check
const mongoose = require("mongoose");

const { StandardCodes } = require("../core/api-error-codes")
const APIError = require("../core/api-error")
const QueryModifier = require("../core/query-modifier")
const QueryResults = require("../core/query-results")

/**
 * Data Service
 */
class DataService {

    constructor(model) {
        this._model = model;
    }

    /**
     * Return the model name currently servicing.
     */
    get modelName() {
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
     * @param {string} id Object ID
     */
    isValidObjectId(id) {
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
     * @param {object} document Entity document
     */
    add(document) {
        this._setAuditData(true, document, null);

        return new Promise((resolve, reject) => {

            let obj = null;

            if (!this.isValidObjectId(document._id)) {
                document._id = this.getNewobjectId();
            }

            obj = this._model.repository.hydrate(document);
            obj.isNew = true;

            obj.save((err, data) => {
                if (err) {
                    if (this.isDupKeyError(err)) {
                        //@ts-ignore
                        err = new APIError(err, StandardCodes.DuplicatedItem)
                    }
                    reject(err);
                }
                else {
                    resolve(data._id);
                }
            })
        })
    }

    /**
     * Update an existing Entity document.
     * @param {object} document Entity Document updated data.
     */
    update(document) {

        if (!document) {
            throw new Error(`The method "update" expect a not null reference for the "document" param.Provided value: "${String(document)}".`)
        }
        else if (!document._id) {
            throw new Error(`The method "update" expect a document with an "_id" attribute for the "document" param, (we can't update new documents!).Provided value was: "${JSON.stringify(document)}".`)
        }
        else if (!this.isValidObjectId(document._id)) {
            throw new Error(`The method "update" expect a valid ObjectId in the parameter "id". Provided value: "${String(document._id)}".`)
        }

        this._setAuditData(false, document, null);

        return new Promise((resolve, reject) => {

            this._model.repository.updateOne({ _id: document._id }, document, (err, data) => {
                if (err) {
                    if (this.isDupKeyError(err)) {
                        //@ts-ignore
                        err = new APIError(err, StandardCodes.DuplicatedItem)
                    }
                    reject(err);
                }
                else if (data && data.n == 0) {

                    let err = new APIError(`The last UPDATE operation affects no documents. Please verify: \n
                    - If The document you try to update no longer exists.
                    - If you have been granted with the necessary permissions.`,
                        StandardCodes.VoidUpdate
                    );
                    reject(err);
                }
                else {
                    resolve(document._id);
                }
            })
        })
    }

    /**
     * Fecth documents with different options.
     * @param {QueryModifier} queryModifier Query optons that includes Paging, sorting , filtering, etc...
     */
    find(queryModifier) {

        let qm = new QueryModifier(queryModifier);
        let filter = null;

        //We check for no INTERNAL fields included in the JSON filter:
        if (this._model.internalFields.some((field) => {
            return qm.filterBy.toLowerCase().indexOf(`"${field.toLowerCase()}":`) != -1;
        })) {
            throw new APIError(`At least one of the following invalid attributes were found in the JSON filter: "${this._model.internalFields.join(", ")}".
             Those fields are for internal use only and can't appear in user queries.`);
        }

        filter = JSON.parse(qm.filterBy)

        //Whatever is the case, we need to ensure only NOT DELETED documents will be affected:
        if (this._model.hasInternalField("deletedOn")) {
            filter.deletedOn = { $eq: null };
        }

        return new Promise((resolve, reject) => {
            let query = this._model.repository.find(filter);
            let countQuery = this._model.repository.countDocuments(filter);

            if (qm.top > 0) {
                query.limit(qm.top);
            }

            if (qm.skip > 0) {
                query.skip(qm.skip);
            }

            if (qm.isSorted) {
                query.sort(qm.sortBy);
            }

            if (qm.populate) {
                query.populate(this._model.populateSchema)
            }

            //If results are paginated:
            if (qm.isPaginated) {
                //We need to return first the total amount of documents for the specified filter:
                countQuery.exec((err, count) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        //If documents total amount is 0, there is no reason to continue:
                        if (count > 0) {
                            this._runFetchQuery(query, resolve, reject, count)
                        }
                        else {
                            resolve(new QueryResults(null));
                        }
                    }
                });
            }
            else {
                this._runFetchQuery(query, resolve, reject)
            }
        })
    }

    /**
     * Delete the specified document by his ID.
     * @param {string} id Entity unique identifier.
     */
    delete(id) {

        if (!id) {
            throw new Error(`The method "delete" expect a document id for the "id" param.Provided value was: "${JSON.stringify(id)}".`)
        }
        else if (!this.isValidObjectId(id)) {
            throw new Error(`The method "update" expect a valid ObjectId value for the parameter "id". Provided value: "${String(id)}".`)
        }

        return new Promise((resolve, reject) => {

            this._model.repository.updateOne({ _id: id }, { $set: { deletedOn: new Date() } }, (err, data) => {
                if (err) {
                    reject(err);
                }
                else if (data && data.n == 0) {
                    //The attempt to soft delete a non existent document by Id is not reported as error by Mongoose:
                    let err = new APIError(`The last DELETE operation affects no documents. This can be caused by the following issues: \n
                    - The document you tried to delete no longer exists.
                    - You are not been granted with the necessary permissions.`, StandardCodes.VoidDelete);
                    reject(err);
                }
                else {
                    resolve(id);
                }
            })
        })
    }

    /**
     * Set the audit inforomation in the document before to be persisted.
     * @param {boolean} isNewDoc Indicates if we are doing an insert or an update of a document.
     * @param {any} doc The document to be persisted. It must inherits from Entity class in order 
     * to fullfill the audit data.
     * @param {any} session Active session details.
     */
    _setAuditData(isNewDoc, doc, session) {

        doc.deletedOn = null;

        //If the entity have audit data:
        if (this._model.schema.createdBy) { //Checking for just one of the audit fields is enough :-)
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
    _runFetchQuery(query, cbResolve, cbReject, totalCount = null) {
        query.exec((err, data) => {
            if (err) {
                cbReject(err);
            }
            else {
                cbResolve(new QueryResults(data, totalCount));
            }
        });
    }

    /**
     * Returns a boolean value indicating if the provided error is a duplicate key error on a Database operation.
     * @param {any} err Error to evaluate
     */
    isDupKeyError(err) {
        return (err && err.code && Number(err.code) == 11000) //11000 is the error code provided by Mongo related to duplicate key infractions.
    }

    /**
    * Returns a boolean value indicating if the last write operation in the database was not hitting 
    * any documents. This mean that no document was updated or deleted.
    * @param {any} insertOneWriteOpResultObject Error to evaluate
    */
    isVoidWrite(insertOneWriteOpResultObject) {
        return (insertOneWriteOpResultObject && insertOneWriteOpResultObject.n != undefined &&
            insertOneWriteOpResultObject.n == 0)
    }

    //#endregion
}

module.exports = DataService
