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
    print(`Removing "category" attribute from the "Scripts" collection documents.`)
    print(`${sep}`)
    print(`Opening database.`);
    db = conn.getDB("Propel");

    //-----------------------------------------------------------------

    print(`\r\nPatching Scripts collection.\r\n`)
    collection = db.getCollection("Scripts");
    counter = 0;

    collection.find().forEach((doc) => {
        print(`Reviewing "${doc.name}", ("${doc._id.toString()}")`)
        let alreadyPatched = true;

        if (!(doc.category === undefined)) {
            delete doc.category
            alreadyPatched = false
        }

        if (!alreadyPatched) {
            collection.save(doc);
            counter++;
            print(` -> Script category was removed.`)
        }
        else {
            print(` -> No Script category defined or no patching required.`)
        }
    });
    print(`\r\n${counter} entries patched on collection "Scripts".\r\n`)

//-----------------------------------------------------------------
    
    print(`\r\nPatching Targets collection.\r\n`)
    collection = db.getCollection("Targets");
    counter = 0;

    collection.find().forEach((doc) => {
        print(`Reviewing "${doc.friendlyName}", ("${doc._id.toString()}")`)
        let alreadyPatched = true;

        if (!(doc.groups === undefined)) {
            delete doc.groups
            alreadyPatched = false
        }

        if (!alreadyPatched) {
            collection.save(doc);
            counter++;
            print(` -> Target groups were removed.`)
        }
        else {
            print(` -> No Target groups defined or no patching required.`)
        }
    });
    print(`\r\n${counter} entries patched on collection "Scripts".\r\n`)

    //-----------------------------------------------------------------

    print(`\r\nPatching Workflows collection.\r\n`)
    collection = db.getCollection("Workflows");
    counter = 0;

    collection.find().forEach((doc) => {
        print(`Reviewing "${doc.name}", ("${doc._id.toString()}")`)
        let alreadyPatched = true;

        if (!(doc.category === undefined)) {
            delete doc.category
            alreadyPatched = false
        }

        if (!alreadyPatched) {
            collection.save(doc);
            counter++;
            print(` -> Workflow category was removed.`)
        }
        else {
            print(` -> No Workflow category defined or no patching required.`)
        }
    });
    print(`\r\n${counter} entries patched on collection "Workflows".\r\n`)

    print(`\r\nThe script is now finished.${sep}`)
} catch (error) {
    print(`\n\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.
    Error details:${error}${sep}`)
    throw error
}
