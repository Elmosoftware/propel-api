/*
    To execute this script:
    Open a Command or Powershell console and type:

mongo --eval "var apu='PropelUser';var app='PASSWORD'; var userAccount={name:'john.doe',fullName:'John Doe',initials:'JD',email:'john.doe@email.com',secretId:'',role:'Admin'};" create-propel-useraccount.js

    Replace the "userAccount" details by the ones for the user you would like to create.

    ------------------------------------------------------------------------------------------------------
    BE AWARE: There is no velidation of the supplied data, so please verify it before to run the script.
    ------------------------------------------------------------------------------------------------------

    The script will allow you to create a Propel user account. This need to be done when no users
    are created yet and to ensure at least one admin user in the system.
*/
var conn = new Mongo();
const DB_NAME = "Propel"
const DB_COLLECTION = "UserAccounts"

try {
    print(`\r\nAuthenticating...`);
    db = conn.getDB(DB_NAME);
    db.auth(apu, app);

    print(`\r\nCreating the new Propel user account:\r\n===============================================`)
    print(`\r\nUser account details:\r\n${JSON.stringify(userAccount)}`);

    let collection = db.getCollection(DB_COLLECTION);
    let wr = collection.save(userAccount);

    print(`\r\nOperation results: ${JSON.stringify(wr)}`);

    if (wr.nInserted > 0) {
        print(`\r\nThe user account was added succesfully!`);
    }
    else {
        print(`\r\nThere was an error inserting the data, please verify if the user already exists in the database.`);
    }

} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
    throw error
}


