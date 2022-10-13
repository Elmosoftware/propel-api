/*
    To execute this script:
    Open a Command or Powershell console and type:
        mongosh create-admin-user.js

    The script will run and create one MongoDB admin user in the "admin" system database.
*/

var conn = new Mongo();
const ADMIN_USER = "DBA";

db = conn.getDB("admin");

print(`\r\nCreating the ADMIN user:\r\n===============================================`)
print(`Please enter the password for the admin user "${ADMIN_USER}":`);

db.createUser(
    {
        user: ADMIN_USER,
        pwd: passwordPrompt(),
        roles: [
            {
                role: "userAdminAnyDatabase",
                db: "admin"
            },
            "readWriteAnyDatabase"
        ]
    }
)

print(`Administrator privileges granted for user "${ADMIN_USER}"!.`);
print(`\r\nUser created successfully, now enforce Role Based Access to the databases.`);
