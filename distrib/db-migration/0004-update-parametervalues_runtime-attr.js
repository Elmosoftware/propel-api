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

    print(`\r\nPatching Workflows collection.\r\n`)
    collection = db.getCollection("Workflows");
    counter = 0;

    collection.find().forEach((doc) => {
        let alreadyPatched = true;

        print(`Patching Workflow "${doc.name}"\r\n-------------------------`)

        doc.steps.forEach((step) => {
            print(`Updating Step "${step.name}" values...`)
            if (step.values && step.values.length > 0) {
                let paramCount = 0;
                step.values.forEach((pv) => {
                    if (pv.isRuntimeParameter === undefined) {
                        pv.isRuntimeParameter = false;
                        alreadyPatched = false
                        paramCount++;
                    }
                })
                print(`${paramCount.toString()} of ${step.values.length.toString()} parameter values needed to be updated.`)
            }
            else {
                print(`No values found...`)
            }
        })

        if (!alreadyPatched) {
            print(`Saving changes to workflow "${doc.name}", ("${doc._id.toString()}") ...`)
            patchResult = collection.replaceOne({ _id: ObjectId(doc._id.toString()) }, doc)
            print(`Patch results: ${JSON.stringify(patchResult)}.`)
            counter++;
        }
        else {
            print(` -> The workflow was already updated or it has no parameter values on any of his steps, no patching required.`)
        }
    });

    print(`\r\n${counter} documents updated on collection "Workflows".\r\n`)
    print(`\r\nThe script is now finished.${sep}`)
} catch (error) {
    print(`\n\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.
    Error details:${error}${sep}`)
    throw error
}
