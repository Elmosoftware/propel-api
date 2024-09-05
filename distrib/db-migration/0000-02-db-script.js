/**
 * ENSURE TO KEEP THIS FILE HERE for any Propel version.
 * 
 * DESCRIPTION
 * =============
 * This script creates important database artifacts, like collections, indexes, etc. if they 
 * don't exists, also update them if neccesary. 
 * 
 * TO RUN THIS SCRIPT
 * ===================
 * In order to run this script open a OS console and type:
 * 
 *  mongosh --eval "var adu='Admin name here'; var adp='Admin password';apu='Regular user name'; var app='Regular user password';" 0000-02-db-script.js
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
    print(`\r\n      DB Creation/Updates Script`)
    print(`\r\n===============================================`)
    print(`Creating database ${DB_NAME}, (if not exists)...`);
    db = conn.getDB(DB_NAME);

    /**
     * ExecutionLog
     */
    collName = "ExecutionLogs"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
            expireAfterSeconds: 2592000  //1 month: : (60*60*24*30)
        })
        showIndexes(coll);
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    /**
     * Session
     */
    collName = "UserSessions"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
            expireAfterSeconds: 2592000  //1 month: (60*60*24*30)
        })
        showIndexes(coll);
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    /**
     * Scripts
     */
    collName = "Scripts"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    /**
     * Targets
     */
    collName = "Targets"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    /**
     * Workflows
     */
    collName = "Workflows"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    /**
     * UserAccounts
     */
    collName = "UserAccounts"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    /**
     * Credentials
     */
    collName = "Credentials"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }
    

    /**
    * Secrets
    */
    collName = "Secrets"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    /**
     * ObjectPoolEvents
     */
    collName = "ObjectPoolEvents"

    if (!db.getCollectionNames().find((name) => name == collName)) {
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
            timestamp: 1
        }, {
            name: "I_timestamp",
            background: true,
            expireAfterSeconds: 604800  //1 week: (60*60*24*7)
        })
        showIndexes(coll);
    }
    else {
        print(`\r\n Collection "${collName}" already exists.`)
    }

    print(`\nScript have been finished.\n===============================================`)
} catch (error) {
    print(`\r\nTHERE WAS AN ERROR: The Database migration process didn't finish successfully.\nError details:${error}\n`)
    throw error
}