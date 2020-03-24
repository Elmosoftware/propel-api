//@ts-check

class Codes{

    /**
     * The user attempts to insert or update data in such a way that results on creating a duplicate key in the database Storage.
     */
    get DuplicatedItem(){
        return new Code("DUP_ITEM", 
            "The user attempts to insert or update data in such a way that results on creating a duplicate key in the database Storage.");
    }

    /**
     * The user try to update an entity that no longer exists or is forbidden. So the operation hits no documents.
     */
    get VoidUpdate(){
        return new Code("VOID_UPDATE", 
            "The user try to update an entity that no longer exists or is forbidden. So the operation hits no documents.");
    }

    /**
     * The user try to delete an entity that no longer exists or is forbidden. So the operation hits no documents.
     */
    get VoidDelete(){
        return new Code("VOID_DELETE", 
            "The user try to delete an entity that no longer exists or is forbidden. So the operation hits no documents.");
    }

    /**
     * Add to the Error object the attributes related to the user Error code key provided.
     * @param {Error|any} error Error to update by adding the code error
     * @param {string} userErrorKey Code Error Key.
     */
    addUserErrorCode(error, userErrorKey) {
        if (error && userErrorKey) {
            error.userErrorCode = userErrorKey;
        }
    }
}

class Code{
    constructor(key, description){
        this.key = key;
        this.description = description    
    }
}

module.exports = new Codes()