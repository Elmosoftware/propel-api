//@ts-check

/**
 * Standard API error codes.
 * These are not HTTP codes, but codes that reflect specific errors which root cause was identified 
 * so can be treated in the UI. 
 */
class StandardCodes{

    /**
     * The user attempts to insert or update data in such a way that results on creating a duplicate key 
     * in the database.
     */
    static get DuplicatedItem(){
        return new Code("DUP_ITEM", 
            "The user attempts to insert or update data in such a way that results on creating a duplicate key in the database Storage.");
    }

    /**
     * The user try to update an entity that no longer exists or is forbidden. So the operation hits no documents.
     */
    static get VoidUpdate(){
        return new Code("VOID_UPDATE", 
            "The user try to update an entity that no longer exists or is forbidden. So the operation hits no documents.");
    }

    /**
     * The user try to delete an entity that no longer exists or is forbidden. So the operation hits no documents.
     */
    static get VoidDelete(){
        return new Code("VOID_DELETE", 
            "The user try to delete an entity that no longer exists or is forbidden. So the operation hits no documents.");
    }
}

/**
 * Represnts one error code having a unique Key and a generic error description.
 */
class Code{
    /**
     * Represents a identified error root cause.
     * @param {string} key Unique error code
     * @param {string} description Error description 
     */
    constructor(key = "", description = ""){
        this.key = key;
        this.description = description    
    }
}

module.exports = { Code, StandardCodes }