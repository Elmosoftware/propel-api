var conn = new Mongo();
var db;
var collection;
var counter = 0;
var sep = "\r\n\r\n" + "=".repeat(60);

try {
    print(`${sep}`)
    print(`Removing unused fields/Adding new fields.`)
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

        //Removing field "isSystem":
        if(doc.isSystem !== undefined){
            delete doc.isSystem;
            alreadyPatched = false;
        }

        //Removing field "readonly":
        if(doc.readonly !== undefined){
            delete doc.readonly;
            alreadyPatched = false;
        }

        //Adding the field "enabled" with the default value "true":
        if(doc.enabled == undefined){
            doc.enabled = true;
            alreadyPatched = false;
        }

        if(!alreadyPatched) {
            collection.save(doc);
            counter++;
        }
        else {
            print(` -> No patching required.`)
        }
    });
    print(`\r\n${counter} entries patched.\r\n`)
        
    //-----------------------------------------------------------------
    print(`\r\nPatching Workflows collection.\r\n`)
    collection = db.getCollection("Workflows");
    counter = 0;

    collection.find().forEach((doc) => {
        print(`Reviewing "${doc.name}", ("${doc._id.toString()}")`)
        let alreadyPatched = true;

        //Removing field "isPrivate":
        if(doc.isPrivate !== undefined){
            delete doc.isPrivate;
            alreadyPatched = false;
        }

        if(!alreadyPatched) {
            collection.save(doc);
            counter++;
        }
        else {
            print(` -> No patching required.`)
        }
    });
    print(`\r\n${counter} entries patched.\r\n`)
        
    //-----------------------------------------------------------------
    print(`\r\nPatching ExecutionLogs collection.\r\n`)
    collection = db.getCollection("ExecutionLogs");
    counter = 0;

    collection.find().forEach((doc) => {
        print(`Reviewing "${doc._id.toString()}"`)
        let alreadyPatched = true;

        doc.executionSteps.forEach((step) => {
            if(step.scriptEnabled == undefined) {
                step.scriptEnabled = true;
                alreadyPatched = false;
            }
        })

        if(!alreadyPatched) {
            collection.save(doc);
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
}





