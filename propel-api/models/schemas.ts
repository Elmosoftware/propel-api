//@ts-check
import { Schema } from "mongoose";
import { SchemaDefinition } from "./schema-definition";

/**
 * Contains the schema definition of all teh entities in the domain model.
 */
class Schemas {

    constructor() {
    }

    /**
     * **Entity** schema definition.
     */
    get entity(): SchemaDefinition {

        return new SchemaDefinition({
            /**
             * Internal use only for the "soft deletion" feature.
             */
            deletedOn: {
                type: Date,
                required: false,
                INTERNAL: true,
                DESCRIPTION: `Soft delete timestamp.`
            }
        })
        .setDescription("Basic entity definition")
    }

    /**
     * **AuditedEntity** schema definition.
     * @extends Entity schema definition
     */
    get auditedEntity(): SchemaDefinition {

        return new SchemaDefinition(
            {
                createdBy: {
                    type: Schema.Types.ObjectId,
                    required: false,
                    AUDIT: true,
                    DESCRIPTION: `Creator User Identifier.`
                },
                createdOn: {
                    type: Date,
                    required: true,
                    AUDIT: true,
                    DESCRIPTION: `Creation timestamp (UTC).`
                },
                lastUpdateOn: {
                    type: Date,
                    required: false,
                    AUDIT: true,
                    DESCRIPTION: `Last update user identifier.`
                },
                lastUpdateBy: {
                    type: Schema.Types.ObjectId,
                    required: false,
                    AUDIT: true,
                    DESCRIPTION: `Last update timestamp (UTC).`
                }
            })
            .merge(this.entity)
            .setDescription("Basic entity plus audit specific fields");
    }

    /**
     * **User** schema definition.
     * @extends Entity schema definition
     */
    get user(): SchemaDefinition {

        return new SchemaDefinition(
            {
                name: {
                    type: String,
                    required: true,
                    DESCRIPTION: `User name`
                },
                email: {
                    type: String,
                    required: true,
                    DESCRIPTION: `User email. Is also unique identifier.`
                },
                initials: {
                    type: String,
                    required: true,
                    DESCRIPTION: `User initials`
                },
                picture: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Optional user picture URL.`
                }
            })
            .merge(this.entity)
            .setDescription("Authenticated User")
            .setNames("user", "users");
    }

    /**
     * **Category** schema definition.
     * @extends AuditedEntity schema definition
     */
    get category(): SchemaDefinition {

        return new SchemaDefinition(
            {
                name: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Category name.`
                }
            })
            .merge(this.auditedEntity)
            .setDescription("Categories used to tag both Workflows and Scripts")
            .setNames("category", "categories");
    }

    /**
     * **Group** schema definition.
     * @extends AuditedEntity schema definition
     */
    get group(): SchemaDefinition {

        return new SchemaDefinition(
            {
                name: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Group name.`
                }
            })
            .merge(this.auditedEntity)
            .setDescription("Target groups.Used to group servers base in some specific characteristics")
            .setNames("group", "groups");
    }

    /**
     * **ScriptParameter** embedded schema definition.
     */
    get scriptParameter(): SchemaDefinition {

        return new SchemaDefinition(
            {
                position: {
                    type: Number,
                    required: true,
                    DESCRIPTION: `Index position of the argument in the script.`
                },
                name: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Argument name.`
                },
                description: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Argument description, (if available)`
                },
                nativeType: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Native PowerShell type.`
                },
                type: {
                    type: String,
                    required: true,
                    DESCRIPTION: `JavaScript equivalent type.`
                },
                required: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Boolean valueindicating if this parameter need to be present in an invocation.`
                },
                validValues: [{
                    type: String,
                    required: false,
                    DESCRIPTION: `If defined, a set of valid values you can pass for an invocation.`
                }],
                canBeNull: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Indicates if when present, the parameter value can be null.`
                },
                canBeEmpty: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Indicates if when present, the parameter value can be empty, (like an empty string or array).`
                },
                defaultValue: {
                    type: String,
                    required: true,
                    DESCRIPTION: `The parameter default value.`
                },
                hasDefault: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Indicates if the parameter has set a default value.`
                }
            },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            })
            .setDescription("Represents all the details of an inferred script parameter");
    }

    /**
     * **Script** schema definition.
     * @implements ScriptParameter embedded schema
     * @extends AuditedEntity schema definition
     */
    get script(): SchemaDefinition {

        return new SchemaDefinition(
            {
                name: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Script name.`
                },
                description: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Brief description of the script that can help others to use it.`
                },
                isSystem: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Boolean value that indicates if the script is a System script or one uploaded by the User.
Users are able to use System scripts, but not able to alter them.Brief description of the script that can help others to use it.`
                },
                isTargettingServers: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Boolean value indicating if this script requires a target selection or not.`
                },
                category: {
                    type: Schema.Types.ObjectId,
                    ref: "category",
                    required: true,
                    DESCRIPTION: `The script category, group scripts that have similar functionality. Helping in the creation of workflows to find and pick the right one.`
                },
                readonly: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Indicates if the script is not modifieng target server state in any way.`
                },
                code: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Brief description of the script that can help others to use it.`
                },
                parameters: [this.scriptParameter.asMongooseSchema()]
            })
            .merge(this.auditedEntity)
            .setDescription("Script definition")
            .setNames("script", "scripts");
    }

    /**
     * **Target** schema definition.
     * @extends AuditedEntity schema definition
     */
    get target(): SchemaDefinition {

        return new SchemaDefinition(
            {
                FQDN: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Fully Qualified Domain Name of the target server.`
                },
                friendlyName: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Target Server friendly name.`
                },
                description: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Brief description of the target server. It must help to clarify server purpose, usage, location, etc.`
                },
                groups: [{
                    type: Schema.Types.ObjectId,
                    ref: "group",
                    required: false,
                    DESCRIPTION: `The script category, group scripts that have similar functionality. Helping in the creation of workflows to find and pick the right one.`
                }],
                enabled: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Indicate if the server is enabled as target. If the value is "false", the execution will be skipped on any Workflow or Task that have it.`
                }
            })
            .merge(this.auditedEntity)
            .setDescription("Target definition")
            .setNames("target", "targets");
    }

    /**
     * **ParameterValue** embedded schema definition.
     */
    get parameterValue(): SchemaDefinition {

        return new SchemaDefinition(
            {
                name: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Parameter name.`
                },
                value: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Parameter value`
                }
            },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            })
            .setDescription("Represent the value assigned to one script parameter for a specific task or workflow step");
    }

    /**
     * **WorkflowStep** embedded schema definition.
     * @implements ParameterValue embedded schema
     */
    get workflowStep(): SchemaDefinition {

        return new SchemaDefinition(
            {
                name: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Step name.`
                },
                enabled: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Indicates if the step will be included in the workflow execution.`
                },
                abortOnError: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `If true, the entire workflow will be aborted if this step fails.`
                },
                script: {
                    type: Schema.Types.ObjectId,
                    ref: "script",
                    required: true,
                    DESCRIPTION: `Script to be executed.`
                },
                values: [this.parameterValue.asMongooseSchema()],
                targets: [{
                    type: Schema.Types.ObjectId,
                    ref: "target",
                    required: true,
                    DESCRIPTION: `Collection of targets for the task execution.`
                }]
            },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            })
            .setDescription("Represents one step of a complete workflow. Contains a reference to the task that is going to be executed");
    }

    /**
     * **Workflow** schema definition.
     * @implements WorfloStep embedded schema
     * @extends AuditedEntity schema definition
     */
    get workflow(): SchemaDefinition {

        return new SchemaDefinition(
            {
                name: {
                    type: String,
                    required: true,
                    unique: true,
                    DESCRIPTION: `Step name.`
                },
                description: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Workflow brief description. Be sure to express intention here.`
                },
                isPrivate: {
                    type: Boolean,
                    required: true,
                    DESCRIPTION: `Indicate if this is shared or not with other users.`
                },
                category: {
                    type: Schema.Types.ObjectId,
                    ref: "category",
                    required: true,
                    DESCRIPTION: `Workflow category.`
                },
                steps: [this.workflowStep.asMongooseSchema()]
            })
            .merge(this.auditedEntity)
            .setDescription("A Workflow represents a reusable collection of steps. Each one running a task in one or more target servers")
            .setNames("workflow", "workflows");
    }

    /**
     * **ExecutionError** embedded schema definition.
     */
    get executionError(): SchemaDefinition {

        return new SchemaDefinition(
            {
                throwAt: {
                    type: Date,
                    required: true,
                    DESCRIPTION: `Error Timestamp.`
                },
                message: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Error message.`
                },
                stack: [{
                    type: String,
                    required: false,
                    DESCRIPTION: `Stack trace.`
                }]                
            },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            })
            .setDescription("Represents the errors returned during a script invocation");
    }

    /**
     * **ExecutionTarget** schema definition.
     * @implements ExecutionError embedded schema
     */
    get executionTarget(): SchemaDefinition {

        return new SchemaDefinition(
            {
                FQDN: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Target fully qualified nameor an empty string if the script hits no targets.`
                },
                name: {
                    type: String,
                    required: false,
                    DESCRIPTION: `Target name or an empty string if the script hits no targets.`
                },
                execResults: [{
                    type: Object,
                    required: true,
                    DESCRIPTION: `The collection of results delivered by the script in this invocation.`
                }],
                execErrors: [this.executionError.asMongooseSchema()],
                status: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Execution Status.`
                }                       
            },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            })
            .setDescription("Results and errors of a script execution on one particular target");
    }

    /**
     * **ExecutionStep** embedded schema definition.
     * @implements ParameterValue, ExecutionTarget embedded schemas
     */
    get executionStep(): SchemaDefinition {

        return new SchemaDefinition(
            {
                stepName: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Step name.`
                },
                scriptName: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Script name.`
                },
                values: [this.parameterValue.asMongooseSchema()],
                targets: [this.executionTarget.asMongooseSchema()],
                status: {
                    type: String,
                    required: true,
                    DESCRIPTION: `Execution Status.`
                },
                execError: this.executionError.asMongooseSchema()
            },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            })
            .setDescription("Details of a Workflow step execution");
    }

    /**
     * **ExecutionLog** schema definition.
     * @implements ExecutionStep embedded schema
     * @extends Entity schema definition
     */
    get executionLog(): SchemaDefinition {

        return new SchemaDefinition(
            {
                workflow: {
                    type: Schema.Types.ObjectId, 
                    ref: "workflow", 
                    required: true,
                    DESCRIPTION: `Executed Workflow.`
                },
                startedAt: {
                    type: Date,
                    required: true,
                    DESCRIPTION: `Start timestamp (UTC).`
                },
                endedAt: {
                    type: Date,
                    required: true,
                    DESCRIPTION: `End timestamp (UTC).`
                },
                status: {
                    type: String, 
                    required: true,
                    DESCRIPTION: `Execution Status.`
                },
                user: {
                    type: Schema.Types.ObjectId, 
                    ref: "user", 
                    required: true,
                    DESCRIPTION: `User that starts the execution.`
                },
                executionSteps: [this.executionStep.asMongooseSchema()]
            })
            .merge(this.entity)
            .setDescription("Full log of a Workflow execution")
            .setNames("executionlog", "executionlogs");
    }
}

export let schemas = new Schemas();