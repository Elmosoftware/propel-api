const DB_NAME = "Propel"
var conn = new Mongo();
var db;
var collection;
var counter = 0;
var sep = "\r\n\r\n" + "=".repeat(60);

try {
    print(`\r\nAuthenticating...`);
    db = conn.getDB("admin");
    /*
        Variables "adu" and "adp", "apu", "app" must be passed with the "-- eval" parameter" like this:
            mongo --eval "var adu='Admin user name here'; var adp='Admin password here';apu='Regular user name here'; var app='Regular user password here';" myscript.js
    */
    db.auth(adu, adp);

    print(`${sep}`)
    print(`Removing unused fields/Adding new fields.`)
    print(`${sep}`)
    print(`Opening database.`);
    db = conn.getDB("Propel");

    //-----------------------------------------------------------------
    print(`\r\nPatching Targets collection.\r\n`)
    collection = db.getCollection("Targets");
    counter = 0;

    collection.find().forEach((doc) => {
        print(`Reviewing "${doc.friendlyName}", ("${doc._id.toString()}")`)
        let alreadyPatched = true;

        //Adding the field "invokeAs" with the default value null:
        if (doc.invokeAs === undefined) {
            doc.invokeAs = null;
            alreadyPatched = false;
        }

        if (!alreadyPatched) {
            collection.save(doc);
            print(` -> Updating the document.`)
            counter++;
        }
        else {
            print(` -> No patching required.`)
        }
    });
    print(`\r\n${counter} entries patched.\r\n`)

    print(`\nScript have been finished.${sep}`)

} catch (error) {
    print(`\n\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.
    Error details:${error}${sep}`)
    throw error
}
