/**
 * Fix sessions index
 * 
 * DESCRIPTION
 * =============
 * There is an index in the UserSessions collection that is created to automatically 
 * expire old sessions. 
 * The index is not working because a wrong field name is set. 
 * We need to recreate the index by using the right field name.
 * 
 * TO RUN THIS SCRIPT
 * ===================
 * In order to run this script open a OS console and type:
 * 
 *  mongosh --eval "var adu='Admin name here'; var adp='Admin password';apu='Regular user name'; var app='Regular user password';" 0003-fix-sessions-index.js
 */

const DB_NAME = "Propel"
var conn = new Mongo();
var collName = "UserSessions";
var indexToDelete = "I_SessionStartsAt";
var indexToCreate = "I_StartedAt"
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
    db.auth(adu, adp); //<-- This variables are passed in the command line.
    db = conn.getDB(DB_NAME);

    coll = db.getCollection(collName);
    print(`\r\nDropping index: "${indexToDelete}" from collection "${collName}".`)

    if (coll.getIndexes().find((index) => index.name == indexToDelete)) {
        coll.dropIndex(indexToDelete);
        print(`The index "${indexToDelete}" was dropped successfully.`)
        print(`Creating the new index "${indexToCreate}" ...`)

        coll.createIndex({
            startedAt: 1
        }, {
            name: indexToCreate,
            background: true,
            expireAfterSeconds: 2592000  //1 month
        })
    }
    else {
        print(`The index "${indexToDelete}" is missing, probably was already deleted.`)
    }

    print(`\r\nFollowing the list of remaining indexes in collection ${collName}:`)
    showIndexes(coll);

    print(`\r\nScript have been finished.\n===============================================`)

} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
    throw error
}