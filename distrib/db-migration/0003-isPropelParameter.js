var conn = new Mongo();
var db;
var collection;
var counter = 0;
var sep = "\r\n\r\n" + "=".repeat(60);

try {
    print(`${sep}`)
    print(`Adding the "IsPropelParameter" attribute as false for the ScripParameter embedded documents.`)
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

        //Adding the "IsPropelParameter" attribute, (if is not there) to each member of the 
        //parameters embedded collection:
        if (doc.parameters && doc.parameters.length > 0) {
            doc.parameters.forEach((p) => {
                if (p.IsPropelParameter == undefined) {
                    p.IsPropelParameter = false
                    alreadyPatched = false
                }
            })
        }

        if(!alreadyPatched) {
            collection.save(doc);
            counter++;
            print(` -> All script parameters have been patched.`)
        }
        else {
            print(` -> No script parameters defined or no patching required.`)
        }
    });
    print(`\r\n${counter} entries patched.\r\n`)
    print(`\r\nScript have been finished.${sep}`)

} catch (error) {
    print(`\n\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.
    Error details:${error}${sep}`)
    throw error
}





