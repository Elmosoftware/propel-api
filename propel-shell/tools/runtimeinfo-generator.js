/*
    RuntimeInfo generator
    =====================

    Usage: 
        node runtimeinfo-generator.js -userName john.doe -RDPUsers john.doe, jane.doe
*/
const util = require("../util");
require('dotenv').config(
    { 
        path: '../.env'
    }
);

let ri = {
    processId: 1,
    userName: "",
    RDPUsers: [],
    error: ""
}

let args = process.argv.slice(2).join(" ").split("-");
console.log(args);

args.forEach(value => {
    if (value) {
        value = String(value).trim().split(" ");
    
        switch (value[0].toLowerCase()) {
            case "username":
                ri.userName = value[1];
                break;
            case "rdpusers":
                value.slice(1).forEach(user => {
                    ri.RDPUsers.push({userName: user, state: "Active"});
                })
                break;
            default:
                throw `Parameter "${value[0]}" is unknown.`;
        }
    }
});

ri.runtimeToken = util.encrypt(ri);

console.log(`PropelRuntimeInfo:\r\n${JSON.stringify(ri)}`);