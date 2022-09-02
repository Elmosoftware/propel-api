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
    
    print(`\r\n===============================================`)
    print(`\r\n      DB Creation/Updates Script`)
    print(`\r\n===============================================`)
    print(`Creating database ${DB_NAME}, (if not exists)...`);
    db = conn.getDB(DB_NAME);

    /**
     * ExecutionLog
     */
    collName = "ExecutionLogs"
    print(`\n------------------------------------------------\nAdding collection "${collName}"`)
    db.createCollection(collName);

    print(`Creating indexes.`)
    coll = db.getCollection(collName);

    coll.createIndex({
        _id: 1,
        deletedOn: 1
    }, {
        name: "IU_EntityConstraint",
        unique: true,
        background: true
    })

    coll.createIndex({
        startedAt: 1
    }, {
        name: "I_StartedAt",
        background: true,
        expireAfterSeconds: 2592000  //1 month
    })
    showIndexes(coll);

    /**
     * Session
     */
    collName = "UserSessions"
    print(`\n------------------------------------------------\nAdding collection "${collName}"`)
    db.createCollection(collName);

    print(`Creating indexes.`)
    coll = db.getCollection(collName);

    coll.createIndex({
        _id: 1,
        deletedOn: 1
    }, {
        name: "IU_EntityConstraint",
        unique: true,
        background: true
    })

    coll.createIndex({
        sessionStartsAt: 1
    }, {
        name: "I_SessionStartsAt",
        background: true,
        expireAfterSeconds: 2592000  //1 month
    })
    showIndexes(coll);

    /**
     * Scripts
     */
    collName = "Scripts"
    print(`\n------------------------------------------------\nAdding collection "${collName}"`)
    db.createCollection(collName);

    print(`Creating indexes.`)
    coll = db.getCollection(collName);

    coll.createIndex({
        name: 1,
        deletedOn: 1
    }, {
        name: "IU_EntityConstraint",
        unique: true,
        background: true
    })

    coll.createIndex(
        {
            name: "text",
            description: "text"
        }, {
        name: "TEXT_Name_Description",
        weights: {
            name: 3,
            description: 1
        }
    });
    showIndexes(coll);

    /**
     * Targets
     */
    collName = "Targets"
    print(`\n------------------------------------------------\nAdding collection "${collName}"`)
    db.createCollection(collName);

    print(`Creating indexes.`)
    coll = db.getCollection(collName);

    coll.createIndex({
        FQDN: 1,
        deletedOn: 1
    }, {
        name: "IU_EntityConstraint",
        unique: true,
        background: true
    })

    coll.createIndex(
        {
            friendlyName: "text",
            description: "text"
        }, {
        name: "TEXT_FriendlyName_Description",
        weights: {
            friendlyName: 3,
            description: 1
        }
    });
    showIndexes(coll);

    /**
     * Workflows
     */
    collName = "Workflows"
    print(`\n------------------------------------------------\nAdding collection "${collName}"`)
    db.createCollection(collName);

    print(`Creating indexes.`)
    coll = db.getCollection(collName);

    coll.createIndex({
        name: 1,
        deletedOn: 1
    }, {
        name: "IU_EntityConstraint",
        unique: true,
        background: true
    })

    coll.createIndex(
        {
            name: "text",
            description: "text"
        }, {
        name: "TEXT_Name_Description",
        weights: {
            name: 3,
            description: 1
        }
    });
    showIndexes(coll);

    /**
     * UserAccounts
     */
    collName = "UserAccounts"
    print(`\n------------------------------------------------\nAdding collection "${collName}"`)
    db.createCollection(collName);

    print(`Creating indexes.`)
    coll = db.getCollection(collName);

    coll.createIndex({
        name: 1,
        deletedOn: 1
    }, {
        name: "IU_EntityConstraint",
        unique: true,
        background: true
    })

    coll.createIndex(
        {
            fullName: "text",
            name: "text",
            email: "text"
        }, {
        name: "TEXT_FullName_Name_Email",
        weights: {
            fullName: 3,
            name: 2,
            email: 1
        }
    });

    coll.createIndex({
        email: 1
    }, {
        name: "IU_Email",
        unique: true,
        background: true
    })
    
    showIndexes(coll);

    /**
     * Credentials
     */
     collName = "Credentials"
     print(`\n------------------------------------------------\nAdding collection "${collName}"`)
     db.createCollection(collName);
 
     print(`Creating indexes.`)
     coll = db.getCollection(collName);
 
     coll.createIndex({
         name: 1,
         deletedOn: 1
     }, {
         name: "IU_EntityConstraint",
         unique: true,
         background: true
     })
 
     coll.createIndex(
         {
             name: "text",
             description: "text"             
         }, {
         name: "TEXT_Name_Description",
         weights: {
             name: 3,
             description: 1
         }
     });
     showIndexes(coll);

     /**
     * Secrets
     */
      collName = "Secrets"
      print(`\n------------------------------------------------\nAdding collection "${collName}"`)
      db.createCollection(collName);
  
      print(`Creating indexes.`)
      coll = db.getCollection(collName);
  
      coll.createIndex({
          _id: 1,
          deletedOn: 1
      }, {
          name: "IU_EntityConstraint",
          unique: true,
          background: true
      })
      showIndexes(coll);

    print(`\nScript have been finished.\n===============================================`)

} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
    throw error
}