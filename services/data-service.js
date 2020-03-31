// @ts-check
const mongoose = require("mongoose");

const { Code, StandardCodes } = require("../core/api-error-codes")
// const  = require("../core/api-error-codes")
const APIError = require("../core/api-error")
// const ServiceValidator = require("./service-validator");
// const Security = require("./security-service");
// const Entities = require("./entities");
// const Codes = require("./codes")

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
        return this._model.repository.create(document);
    }

    /**
     * Update an existing Entity document.
     * @param {object} document Entity Document updated data.
     */
    update(document) {
        // var val = new ServiceValidator();
        // var promises = [];

        // if (!val.validateCallback(callback)
        //     .validateAccess(Security.ACCESS_TYPE.WRITE, this._entity, session)
        //     .validateDocument(document, this._entity)
        //     .isValid) {
        //     return (callback(val.getErrors(), {}));
        // }

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

    // /**
    //  * Count projection.
    //  * @param {string} conditions JSON Filter conditions.
    //  * @param {object} session RequestContext.activeSession object.
    //  * @param {object} query RequestContext.query object.
    //  */
    // count(conditions, session, query) {
    //     var val = new ServiceValidator();

    //     if (!val.validateConditions(conditions, false, this._entity)
    //         .validateQuery(query, session)
    //         .validateAccess(Security.ACCESS_TYPE.READ, this._entity, session, query)
    //         .isValid) {
    //         return Promise.reject(val.getErrors());
    //     }

    //     return this._entity.model.countDocuments(this._parseConditions(Security.ACCESS_TYPE.READ, conditions, session, query))
    //         .exec();
    // }

    // /**
    //  * Search an Entity document by his Id or all that match the provided JSON Filter conditions.
    //  * @param {string} conditions JSON Filter conditions or and Entity Object ID.
    //  * @param {*} projection Query Projection.
    //  * @param {object} session RequestContext.activeSession object.
    //  * @param {object} query RequestContext.query object.
    //  */
    // find(conditions, projection, session, query) {
    //     var val = new ServiceValidator();
    //     var cursor = null;

    //     if (!val.validateConditions(conditions, false, this._entity)
    //         .validateQuery(query, session)
    //         .validateAccess(Security.ACCESS_TYPE.READ, this._entity, session, query)
    //         .isValid) {
    //         return Promise.reject(val.getErrors());
    //     }

    //     cursor = this._entity.model.find(this._parseConditions(Security.ACCESS_TYPE.READ, conditions, session, query), projection)
    //         .skip(Number(query.skip));

    //     if (query.fields) {
    //         cursor.select(query.fields);
    //     }

    //     if (query.top) {
    //         cursor.limit(Number(query.top));
    //     }

    //     if (query.sort) {
    //         cursor.sort(query.sort);
    //     }

    //     if (query.pop != "false") {
    //         //Populating first level references:
    //         cursor.populate(this._entity.references.join(" ").toString())

    //         //We now populate subdocuments references too (up to first subdoc level only):
    //         this._entity.references.forEach((item) => {
    //             let subdocEntity = null;

    //             if (Array.isArray(this._entity.model.schema.tree[item])) {
    //                 subdocEntity = Entities.getEntityByModelName(this._entity.model.schema.tree[item][0].ref);
    //             }
    //             else {
    //                 subdocEntity = Entities.getEntityByModelName(this._entity.model.schema.tree[item].ref);
    //             }

    //             //If the subdoc has references to  other documents, we need to add them to the populate list:
    //             if (subdocEntity.references.length > 0) {
    //                 subdocEntity.references.forEach((ref) => {
    //                     //#region WATCH OUT!
    //                     /* 
    //                         If the subdocument have a reference to the parent document, we MUST NOT 
    //                         POPULATE IT IN ORDER TO AVOID CIRCULAR REFERENCES.

    //                         e.g.: 
    //                             To illustrate the case, let's suppose to have the following model defined in our app:

    //                         mongoose.model("MyCategory",
    //                             new mongoose.Schema({
    //                                 name: { type: String, required: true, unique: true }
    //                             }));

    //                         mongoose.model("MySubDoc",
    //                             new mongoose.Schema({
    //                                 name: { type: String, required: true, unique: true },
    //                                 parent: { type: mongoose.Schema.Types.ObjectId, ref: "MyParentDoc", required: true }
    //                                 category: { type: mongoose.Schema.Types.ObjectId, ref: "MyCategory", required: true }
    //                             }));

    //                         mongoose.model("MyParentDoc",
    //                             new mongoose.Schema({
    //                                 name: { type: String, required: true, unique: true },
    //                                 subdocs: [{ type: mongoose.Schema.Types.ObjectId, ref: "MySubDoc", required: true }]
    //                             }));

    //                         So if we don't populate, (query.pop == "false"), we can have for example the following document:

    //                         {
    //                             "_id": "5b22bf5282e20a4d18840633",
    //                             "name": "I'm the parent doc",
    //                             "subdocs": [
    //                                 {
    //                                     "_id": "5b22bf5282e20a4d18840634",
    //                                     "name": "I'm the first subdoc",
    //                                     "parent": "5b22bf5282e20a4d18840633",
    //                                     "category": "5af1fe0f52bf1d8be0edd407"
    //                                 },
    //                                 {
    //                                     "_id": "5b22bf5282e20a4d18840635",
    //                                     "name": "I'm the second subdoc",
    //                                     "parent": "5b22bf5282e20a4d18840633"
    //                                     "category": "5af1fe0f52bf1d8be0edd408"
    //                                 }
    //                             ]
    //                         }

    //                         If we execute the same request, but this time populating, (query.pop != "false"), we will have all the 
    //                         subdocuments properties (up to first level), populated, with the exception of "parent". Because that one 
    //                         is a reference of the same model that the parent document.                            

    //                         So we will get something like this:

    //                         {
    //                             "_id": "5b22bf5282e20a4d18840633",
    //                             "name": "I'm the parent doc",
    //                             "subdocs": [
    //                                 {
    //                                     "_id": "5b22bf5282e20a4d18840634",
    //                                     "name": "I'm the first subdoc",
    //                                     "parent": "5b22bf5282e20a4d18840633",
    //                                     "category": {
    //                                         "_id": "5af1fe0f52bf1d8be0edd407",
    //                                         "name": "My first category"
    //                                     }
    //                                 },
    //                                 {
    //                                     "_id": "5b22bf5282e20a4d18840635",
    //                                     "name": "I'm the second subdoc",
    //                                     "parent": "5b22bf5282e20a4d18840633"
    //                                     "category": {
    //                                         "_id": "5af1fe0f52bf1d8be0edd408",
    //                                         "name": "My second category"
    //                                     }
    //                                 }
    //                             ]
    //                         }

    //                         The reason why we will not populate beyond first level of subdocuments is because seems to 
    //                         not be possible on the current version of Mongoose.
    //                         This means that if for example if the categories holds a property that is a reference to another 
    //                         model. That property won't be populated.
    //                     */
    //                     //#endregion
    //                     if (subdocEntity.model.schema.tree[ref].ref != this._entity.model.modelName) {
    //                         cursor.populate({
    //                             path: item,
    //                             populate: {
    //                                 path: ref
    //                             }
    //                         })
    //                     }
    //                 })
    //             }
    //         })
    //     }

    //     return cursor.exec();
    // }

    // /**
    //  * Delete an Entity document from the database.
    //  * @param {string} id Entity Object ID
    //  * @param {object} session RequestContext.activeSession
    //  * @param {function} callback Callback Function.
    //  */
    // delete(id, session, callback) {
    //     var val = new ServiceValidator();

    //     if (!val.validateCallback(callback)
    //         .validateConditions(id, true, this._entity) //We will admit only an Object Id here as condition.
    //         .validateAccess(Security.ACCESS_TYPE.DELETE, this._entity, session, null)
    //         .isValid) {
    //         return (callback(val.getErrors(), {}));
    //     }

    //     this._entity.model.updateOne(this._parseConditions(Security.ACCESS_TYPE.DELETE, id, session),
    //         { $set: { deletedOn: new Date() } }, (err, data) => {

    //             if (this.errorIsDupKey(err)) {
    //                 Codes.addUserErrorCode(err, Codes.DuplicatedItem.key)
    //             }

    //             //The attempt to soft delete a non existent document by Id is not reported as error by Mongoose:
    //             if (!err && data.n == 0) {
    //                 err = new Error(`The last DELETE operation affects no documents. This can be caused by the following issues: \n
    //                             - The document you try to delete no longer exists.
    //                             - The document is owned by another user and therefore you are not able to change it in any way.`);
    //                 Codes.addUserErrorCode(err, Codes.VoidDelete.key)
    //             }

    //             return (callback(err, {}));
    //         });
    // }

    // //#region Private Methods

    // /**
    //  * This method look into any of the references of the parent document schema in order to persist each one of the subdocuments 
    //  * that has not been set as Object Ids but the hold subdocument.
    //  * e.g.;
    //  * If the document holds a property named "address", that is actually a reference to another "Address" schema and the document
    //  * sent the property with an object id only. Like this:
    //  *  {
    //  *      address: "5c7d004982cf9867cceeb9ad"
    //  *  }
    //  * We assume the subdoc is already persisted and we are holding just the reference, if that's teh case this method will d Nothing.
    //  * But this API enable you to pass the hold new subdocument in the property, like this:
    //  *  {
    //  *      address: {
    //  *          city: "London"
    //  *          street: "Cherry Tree Lane, 17"
    //  *      }
    //  *  }
    //  * The subdocument will be saved and the reference to the new object id will be replaced in the property.
    //  * Note: If the subdocument is embedded like in the last example, but includes the "_id" property will be automatically updated.
    //  * @param {any} doc Parent document which subdocs will be evaluated.
    //  * @param {any} session Session data including user information
    //  * @param {boolean} saveAsNew Indicates if the parent doc is been inserted or updated
    //  * @param {boolean} isParentDocument This flag must be true only for the parent document. 
    //  */
    // saveSubDocs(doc, session, saveAsNew, isParentDocument = false) {
    //     var val = new ServiceValidator();
    //     var promises = [];

    //     /*
    //         //DEBUG ONLY - ENABLE IF NEEDED:
    //         console.log(`Evaluating - ${this._entity.model.modelName}`);
    //     */

    //     if (this._entity.references.length > 0) {
    //         this._entity.references.forEach((prop) => {

    //             //Check if the property exists:
    //             if (!doc[prop]) {
    //                 promises.push(Promise.reject(new Error(`Reference property "${prop}" is missing in ${this._entity.model.modelName}.`)))
    //                 return;
    //             }

    //             //If the property holds an array of child documents (One to many relationship):
    //             if (Array.isArray(doc[prop])) {
    //                 /*
    //                     NOTE:
    //                         Sadly when it comes to arrays  of child documents, mongoose is not able to track them, (chek more 
    //                         details here: https://mongoosejs.com/docs/faq.html.
    //                         So in this particular case we need to force update the subdoc.
    //                  */
    //                 for (var i = 0; i < doc[prop].length; i++) {
    //                     if (!val.isValidObjectId(doc[prop][i])) {
    //                         //Save the  subdoc:
    //                         promises = promises.concat(this._saveSubDoc(doc, session, prop, i));
    //                         //Replacing the reference by the subdoc Id only:
    //                         doc[prop][i] = doc[prop][i]._id;
    //                     }
    //                 }
    //             }
    //             //If the property holds one single child document, (One to One relationship), we need 
    //             //to proceed in the same way:
    //             /*
    //               NOTE:
    //                 Unlike in the previous case, now we need to do inserts only, (mongoose is taking care of the 
    //                 updates automatically).
    //             */
    //             else if (!val.isValidObjectId(doc[prop]) && !doc[prop]._id) {
    //                 promises = promises.concat(this._saveSubDoc(doc, session, prop));
    //                 doc[prop] = doc[prop]._id;
    //             }
    //         });
    //     }

    //     //The parent document is not persisted here, only his subdocs:
    //     if (!isParentDocument) {

    //         if (saveAsNew) {
    //             /*
    //                 //DEBUG ONLY - ENABLE IF NEEDED:
    //             console.log(`Creating -> ${this._entity.model.modelName}#${doc._id}`)
    //             */
    //             var obj = this._entity.model.hydrate(doc);

    //             obj.isNew = saveAsNew;
    //             promises.push(obj.save());
    //         }
    //         else {
    //             /*
    //                 //DEBUG ONLY - ENABLE IF NEEDED:
    //             console.log(`Updating -> ${this._entity.model.modelName}#${doc._id}`)
    //             */
    //             promises.push(this._entity.model
    //                 .updateOne({ _id: doc._id }, doc)
    //                 .exec());
    //         }
    //     }

    //     return promises;
    // }

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

    // /**
    //  * Inner private function for recursivity
    //  * @param {any} parentDocument Parent document which childs need to be evaluated.
    //  * @param {any} session Session data including usr information.
    //  * @param {string} propertyName Property of the parent document to recurse.
    //  * @param {number} index If the propety is an array, this is the child index to process.
    //  */
    // _saveSubDoc(parentDocument, session, propertyName, index = null) {

    //     let ref = this._getReferenceType(this._entity, propertyName);
    //     let refEntity = Entities.getEntityByModelName(ref);
    //     let refService = new Service(refEntity);
    //     let subDoc = null;
    //     let isNew = false;

    //     if (Number.isInteger(index)) {
    //         subDoc = parentDocument[propertyName][index];
    //     }
    //     else {
    //         subDoc = parentDocument[propertyName];
    //     }

    //     if (!subDoc._id) {
    //         //We assign the "_id" here because we need to persist the value in the parent document references without 
    //         //to wait to the async callback:
    //         subDoc._id = this.getNewobjectId();
    //         isNew = true;
    //     }

    //     //If the subdocument holds a reference to the parent document, we fill it with the parent Object id:
    //     if (refEntity.model.schema.obj.hasOwnProperty(this._entity.name)) {
    //         subDoc[this._entity.name] = parentDocument._id;
    //     }

    //     this.setAuditData(isNew, subDoc, session);

    //     return refService.saveSubDocs(subDoc, session, isNew);
    // }

    // _getReferenceType(entity, propertyName) {

    //     let schemaEntry = entity.model.schema.obj[propertyName];
    //     let ret = "";

    //     if (Array.isArray(schemaEntry)) {
    //         ret = schemaEntry[0].ref;
    //     }
    //     else {
    //         ret = schemaEntry.ref;
    //     }

    //     return ret;
    // }

    // _parseConditions(accessType, conditions, session, query) {
    //     var val = new ServiceValidator();
    //     var secSvc = new Security.SecurityService();
    //     let ret = {};

    //     if (!conditions) {
    //         conditions = "{}";
    //     }

    //     switch (accessType) {
    //         case Security.ACCESS_TYPE.READ:

    //             if (val.isValidObjectId(conditions)) {
    //                 ret._id = conditions;
    //             }
    //             else {
    //                 ret = JSON.parse(decodeURIComponent(conditions));
    //             }

    //             //Adding conditions for "pub" query value:
    //             //----------------------------------------
    //             //Default behaviour is to include only published entities:
    //             if (query.pub == "" || query.pub.toLowerCase() == "default") {
    //                 ret.publishedOn = { $ne: null };
    //             }
    //             //If was requested to include not published entities only:
    //             else if (query.pub == "notpub") {
    //                 ret.publishedOn = { $eq: null };
    //             }

    //             query.owner = query.owner.toLowerCase() //To facilitate comparisons.

    //             //If owner has no value or is "any" there is no filter to apply.
    //             if (!(query.owner == "" || query.owner == "any")) {
    //                 //The owner values "me" and others" has sense only if there is an active session:
    //                 if (query.owner == "me" && session && session.userId) {
    //                     ret.createdBy = session.userId
    //                 } else if (query.owner == "others" && session && session.userId) {
    //                     ret.createdBy = { $ne: session.userId }
    //                 } //Last chance is that the owner parameter is a user id:
    //                 else if (val.isValidObjectId(query.owner)) {
    //                     ret.createdBy = query.owner
    //                 }
    //             }

    //             break;
    //         case Security.ACCESS_TYPE.WRITE:

    //             if (val.isValidObjectId(conditions)) {
    //                 ret._id = conditions;
    //             }
    //             else { //This has been previously validated, but anyway we will throw if not Object ID was sent:
    //                 throw new Error(`We wait for an Object ID as condition for the DELETE operation, Current condition is ${String(conditions)}`);
    //             }

    //             break;
    //         case Security.ACCESS_TYPE.DELETE:

    //             if (val.isValidObjectId(conditions)) {
    //                 ret._id = conditions;
    //             }
    //             else { //This has been previously validated, but anyway we will throw if not Object ID was sent:
    //                 throw new Error(`We wait for an Object ID as condition for the DELETE operation, Current condition is ${String(conditions)}`);
    //             }

    //             break;
    //         default:
    //             throw new Error(`The provided "accessType" not been defined yet!`);
    //     }

    //     //Whatever is the access to the DB, we need to ensure only NOT DELETED documents will be affected:
    //     ret.deletedOn = { $eq: null };

    //     //If there is any security specific filter that has to be added based on the kind of access or the specific 
    //     //entity security needs, will be handled by the Security service.
    //     secSvc.updateQueryFilterWithSecurityConstraints(accessType, ret, this._entity, session, query);

    //     return ret;
    // }

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

class QueryModifier {

    constructor() {
        this.top = null;
        this.skip = 0;
        this.sortBy = "";
        this.populate = false;
        this.filterBy = "{}";
    }
}

module.exports = { QueryModifier, DataService }
