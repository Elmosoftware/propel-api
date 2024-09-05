const DB_NAME = "Propel"
var conn = new Mongo();
var db;
var collection;
var counter = 0;
var sep = "\r\n\r\n" + "=".repeat(60);
var patchResult = null

try {
    print(`\r\nAuthenticating...`);
    db = conn.getDB("admin");
    /*
        Variables "adu" and "adp", "apu", "app" must be passed with the "-- eval" parameter" like this:
            mongosh --eval "var adu='Admin user name here'; var adp='Admin password here';apu='Regular user name here'; var app='Regular user password here';" myscript.js
    */
    db.auth(adu, adp);

    print(`${sep}`)
    print(`Updating ExecutionLogs - Adding new attribute "runOnSchedule".`)
    print(`${sep}`)
    print(`Opening database.`);
    db = conn.getDB("Propel");

    //-----------------------------------------------------------------

    print(`\r\nPatching ExecutionLogs collection.\r\n`)
    collection = db.getCollection("ExecutionLogs");
    counter = 0;

    collection.find().forEach((doc) => {
        let alreadyPatched = true;

        if (doc.runOnSchedule === undefined) {
            doc.runOnSchedule = false;
            alreadyPatched = false;
        }

        if (!alreadyPatched) {
            print(`Updating ExecutionLog "${doc._id.toString()}" ...`)
            patchResult = collection.replaceOne({ _id: ObjectId(doc._id.toString()) }, doc)
            print(`Patch results: ${JSON.stringify(patchResult)}.`)
            counter++;
            print(` -> The ExecutionLog document was updated.`)
        }
        else {
            print(` -> The ExecutionLog document was already updated, no patching required.`)
        }
    });

    print(`\r\n${counter} documents updated on collection "ExecutionLog".\r\n`)
    print(`\r\nThe script is now finished.${sep}`)
} catch (error) {
    print(`\n\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.
    Error details:${error}${sep}`)
    throw error
}
