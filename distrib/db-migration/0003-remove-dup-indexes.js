/**
 * ENSURE TO KEEP THIS FILE HERE for any Propel version.
 * 
 * This scritp creates important database artifacts, like collections, indexes, etc. if they 
 * don't exists, also update them if neccesary. 
 */

const DB_NAME = "Propel"
var conn = new Mongo();
var collName = "";
var indexName = "";
var coll = null;

function showIndexes(coll) {
    coll.getIndexes().forEach((index) => {
        print(`\n${index.name}:\n${JSON.stringify(index)}`)
    });
}

try {
    print(`\r\nAuthenticating...`);
    db = conn.getDB("admin");
    /*
        Variables "adu" and "adp", "apu", "app" must be passed with the "-- eval" parameter" like this:
            mongosh --eval "var adu='Admin user name here'; var adp='Admin password here';apu='Regular user name here'; var app='Regular user password here';" myscript.js
    */
    db.auth(adu, adp);
    db = conn.getDB(DB_NAME);

    /**
     * Workflows
     */
    collName = "Workflows"
    indexName = "IX_Name"
    coll = db.getCollection(collName);
    print(`\r\nDropping index: "${indexName}" from collection "${collName}".`)

    if(coll.getIndexes().find((index) => index.name == indexName)) {
        coll.dropIndex(indexName);
        print(`The index "${indexName}" was dropped successfully.
Following the list of remaining indexes in collection ${collName}:`)
        showIndexes(coll);
    }
    else {
        print(`The index "${indexName}" is missing, probably was already deleted.`)
    }

    /**
     * Credentials
     */
    collName = "Credentials"
    indexName = "IX_Name"
    coll = db.getCollection(collName);
    print(`\r\nDropping index: "${indexName}" from collection "${collName}".`)

    if(coll.getIndexes().find((index) => index.name == indexName)) {
        coll.dropIndex(indexName);
        print(`The index "${indexName}" was dropped successfully.
Following the list of remaining indexes in collection ${collName}:`)
        showIndexes(coll);
    }
    else {
        print(`The index "${indexName}" is missing, probably was already deleted.`)
    }

    print(`\r\nScript have been finished.\n===============================================`)

} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
    throw error
}