var conn = new Mongo();
var collName = "";
var coll = null;

function showIndexes(coll) {
    coll.getIndexes().forEach((index) => {
        print(`\n${index.name}:\n${JSON.stringify(index)}`)
    });
}

print(`\n\n===============================================`)
print(`Creating database.`)
db = conn.getDB("Propel");

/**
 * Categories
 */
collName = "Categories"
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
showIndexes(coll);

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
 * Groups
 */
collName = "Groups"
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

coll.createIndex({
    name: 1
}, {
    name: "IU_Name",
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
 * Users
 */
collName = "Users"
print(`\n------------------------------------------------\nAdding collection "${collName}"`)
db.createCollection(collName);

print(`Creating indexes.`)
coll = db.getCollection(collName);

coll.createIndex({
    email: 1,
    deletedOn: 1
}, {
    name: "IU_EntityConstraint",
    unique: true,
    background: true
})

coll.createIndex({
    name: 1
}, {
    name: "I_Name",
    background: true
})
showIndexes(coll);

print(`\nScript has been finished.\n===============================================`)






