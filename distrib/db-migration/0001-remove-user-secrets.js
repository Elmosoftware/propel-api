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
    print(`Removing user secrets.`)
    print(`${sep}`)
    print(`Opening database.`);
    db = conn.getDB("Propel");

    //-----------------------------------------------------------------

    print(`\r\nPatching Secrets collection.\r\n`)
    collection = db.getCollection("UserAccounts");
    secretsCollection = db.getCollection("Secrets");
    counter = 0;

    collection.find().forEach((doc) => {
        let alreadyPatched = true;
        let opRet = null;

        try {
            print(`Removing secret of user "${doc.name}", ("${doc._id.toString()}") -> Secret Id:${doc.secretId}`)
            opRet = secretsCollection.deleteOne({ "_id": ObjectId(doc.secretId) });
        } catch (e) {
            print(e);
        }

        if (opRet) {
            print(`Delete results: ${JSON.stringify(opRet)}.`)
            alreadyPatched = opRet.deletedCount == 0;
        }

        if (!alreadyPatched) {
            counter++;
            print(` -> User secret was removed.`)
        }
        else {
            print(` -> Missing user secret or no patching required.`)
        }
    });
    print(`\r\n${counter} entries removed on collection "Secrets".\r\n`)

    //-----------------------------------------------------------------

    print(`\r\nThe script is now finished.${sep}`)
} catch (error) {
    print(`\n\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.
    Error details:${error}${sep}`)
    throw error
}
