//@ts-check
import { schemas } from "./schemas";

export let allModels = [
    //User:
    schemas.user.asMongooseModel(),
    //Category:
    schemas.category.asMongooseModel(),
    //Group:
    schemas.group.asMongooseModel(),
    //Script:
    schemas.script.asMongooseModel(),
    //Target:
    schemas.target.asMongooseModel(),
    //Workflow:
    schemas.workflow.asMongooseModel(),
    //ExecutionLog:     
    schemas.executionLog.asMongooseModel()
]