/**
 * ENSURE TO KEEP THIS FILE HERE for any Propel version.
 * 
 * Because is updating the password for the Propel DB user that is creating 
 * during the installer runtime. 
 */

const DB_NAME = "Propel"
var conn = new Mongo();

try {
    print(`\r\nAuthenticating...`);
    db = conn.getDB("admin");
    /*
        Variables "adu" and "adp", "apu", "app" must be passed with the "-- eval" parameter" like this:
            mongosh --eval "var adu='Admin user name here'; var adp='Admin password here';apu='Regular user name here'; var app='Regular user password here';" myscript.js
    */
    db.auth(adu, adp);
    
    print(`Creating database ${DB_NAME}, (if not exists)...`);
    db = conn.getDB(DB_NAME);

    print(`Checking user ${apu} on ${DB_NAME} database...`);
    if (db.getUser(apu)) {
        print(`The user already exists, updating his password...`);
        db.changeUserPassword(apu, app)
    }
    else {
        print(`Creating user ${apu}...`);
        db.createUser(
            {
                user: apu,
                pwd: app,
                roles: [{
                    role: "readWrite",
                    db: DB_NAME
                }]
            }
        )
    }
    
    print(`Read/Write privileges granted for user "${apu}" on database ${DB_NAME}!.`);
    print(`\r\nScript has been finished.\n===============================================`)

} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
    throw error
}