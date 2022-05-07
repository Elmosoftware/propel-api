/**
 * ENSURE TO KEEP THIS FILE HERE for any Propel version.
 * 
 * This scritp creates important database artifacts, like collections, indexes, etc. if they 
 * don't exists, also update them if neccesary. 
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
     /*
         Variables "adu" and "adp", "apu", "app" must be passed with the "-- eval" parameter" like this:
             mongo --eval "var adu='Admin user name here'; var adp='Admin password here';apu='Regular user name here'; var app='Regular user password here';" myscript.js
     */
     db.auth(adu, adp);
     db = conn.getDB(DB_NAME);
 
     /**
      * Workflows
      */
     collName = "Workflows"
     coll = db.getCollection(collName);
     print(`Dropping index: "IX_Name" from collection Workflows`)
     coll.dropIndex("IX_Name");
     showIndexes(coll);

     /**
      * Credentials
      */
      collName = "Credentials"
      coll = db.getCollection(collName);
      print(`Dropping index: "IX_Name" from collection Credentials.`)
      coll.dropIndex("IX_Name");
      showIndexes(coll);
 
     print(`\nScript have been finished.\n===============================================`)
 
 } catch (error) {
     print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
     throw error
 }