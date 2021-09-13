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
    print(`Fixing the "IsPropelParameter" attribute.`)
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

        if (doc.parameters && doc.parameters.length > 0) {
            doc.parameters.forEach((p) => {
                //By Mistake in previous Propel version we added the attribut with capital "I" at the begining.
                //Like "IsPropelParameter" instead of "isPropelParameter". this can cause some issues because of 
                //repeated fields. So we need to remove those cases:
                if (p.IsPropelParameter !== undefined) {
                    delete p.IsPropelParameter
                    alreadyPatched = false
                }

                //Regarding the right "isPropelParameter", (with lower case "i"): 
                //If exists we need to ensure is set to "false", because the name of the 
                //parameter now in V2.0.0 changed from "$Propel" to "$PropelCredentials":
                if (p.isPropelParameter !== undefined) {
                    p.isPropelParameter = (p.name == "PropelCredentials")
                    alreadyPatched = false
                }
            })
        }

        if (!alreadyPatched) {
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





