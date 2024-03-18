/**
 * This script drops the Propel Database.
 * 
 * DESCRIPTION
 * =============
 * This scripts performs the following actions:
 *  - Drop the PropelUser from ADMIN DB.
 *  - Drop the Propel database.
 * 
 * This script can be used if you would like to recreate the Propel database.
 * 
 * TO RUN THIS SCRIPT
 * ===================
 * In order to run this script open a OS console and type:
 * 
 *  mongosh --eval "var adu='Admin name here'; var adp='Admin password here'; apu='Propel user TO BE DELETED here'" drop-database.js
 */

const DB_NAME = "Propel"
var conn = new Mongo();
var collName = "";
var coll = null;

function showIndexes(coll) {
    coll.getIndexes().forEach((index) => {
        print(`\n${index.name}:\n${JSON.stringify(index)}`)
    });
}

try {
    print(`\r\nAuthenticating...`);
    db = conn.getDB("admin");
    db.auth(adu, adp); //<-- This variables are passed in the command line.

    print(`\r\n===============================================`)
    print(`\r\n      Drop Database process started`)
    print(`\r\n===============================================`)

    print(`Dropping user "${apu}" ...`);
    db = conn.getDB(DB_NAME);
    db.dropUser(apu);

    print(`Dropping Database "${DB_NAME}" ...`);
    db.dropDatabase()

    print(`\nScript have been finished.\n===============================================`)
} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The drop databse process didn't finish successfully.\nError details:${error}\n`)
    throw error
}