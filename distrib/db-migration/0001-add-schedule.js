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
    print(`Updating Workflows - Adding a disabled schedule.`)
    print(`${sep}`)
    print(`Opening database.`);
    db = conn.getDB("Propel");

    //-----------------------------------------------------------------

    print(`\r\nPatching Workflows collection.\r\n`)
    collection = db.getCollection("Workflows");
    counter = 0;

    collection.find().forEach((doc) => {
        let alreadyPatched = true;

        if (doc.schedule === undefined) {
            doc.schedule = {
                enabled: false,
                isRecurrent: false,
                onlyOn: null,
                everyAmount: 1,
                everyUnit: "Days",
                weeklyOptions: [],
                monthlyOption: {
                    ordinal: "First",
                    day: 0
                },
                startingAt: "00:00",
                lastExecution: null,
                creationTS: new Date()
            }
            alreadyPatched = false;
        }

        if (!alreadyPatched) {
            print(`Updating Workflow "${doc.name}", ("${doc._id.toString()}") ...`)
            patchResult = collection.replaceOne({ _id: ObjectId(doc._id.toString()) }, doc)
            print(`Patch results: ${JSON.stringify(patchResult)}.`)
            counter++;
            print(` -> The Workflow document was updated.`)
        }
        else {
            print(` -> The Workflow document was already updated, no patching required.`)
        }
    });

    print(`\r\n${counter} documents updated on collection "Workflows".\r\n`)
    print(`\r\nThe script is now finished.${sep}`)
} catch (error) {
    print(`\n\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.
    Error details:${error}${sep}`)
    throw error
}
