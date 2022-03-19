const DB_NAME = "Propel"
var conn = new Mongo();
var result = null;

try {
    print(`\r\nAuthenticating...`);
    db = conn.getDB("admin");
    /*
        Variables "adu" and "adp", "apu", "app" must be passed with the "-- eval" parameter" like this:
            mongo --eval "var adu='Admin user name here'; var adp='Admin password here';apu='Regular user name here'; var app='Regular user password here';" myscript.js
    */
    db.auth(adu, adp);
    
    print(`\r\n===============================================`)
    print(`\r\n      DB dropping deprecated collections`)
    print(`\r\n===============================================`)
    print(`Connecting to database ${DB_NAME} ...`);
    db = conn.getDB(DB_NAME);

    /**
     * Categories
     */
    print(`\n------------------------------------------------\nRemoving collection "Categories"`)
    result = db.Categories.drop();

    if (result) {
        print(`\nCollection "Categories" was dropped successfully!`)
    }
    else {
        print(`\nNot able to drop "Categories", most probably was already deleted.`)
    }

    /**
     * Groups
     */
    print(`\n------------------------------------------------\nRemoving collection "Groups"`)
    result = db.Groups.drop();

    if (result) {
        print(`\nCollection "Groups" was dropped successfully!`)
    }
    else {
        print(`\nNot able to drop "Groups", most probably was already deleted.`)
    }

    print(`\nScript have been finished.\n===============================================`)

} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
    throw error
}
