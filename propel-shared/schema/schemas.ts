import { SchemaDefinition } from "./schema-definition";
import { SchemaField } from "./schema-field";

/**
 * Contains the schema definition of all the entities in the domain model.
 */
class Schemas {

    constructor() {
    }

    //#region Base schema definition

    /**
     * **Entity** schema definition.
     * Every entity that is a root class from the domain model inhherit hisschema 
     * from this or any other class that also inherit from this class.
     * 
     * Entity classes are mapped to collections or tables in the database. 
     */
    get entity(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Entity", "Entities", true)
            .setFields([
                new SchemaField("_id", `Entity unique identifier.`,
                    {
                        type: String,
                        isRequired: true,
                        isId: true
                    }),
                new SchemaField("deletedOn", `Soft delete timestamp.`,
                    {
                        type: Date,
                        isAudit: true,
                        isInternal: true
                    })
            ])
            .setDescription("Basic entity definition")
            .freeze();
    }

    /**
     * **AuditedEntity** schema definition.
     * @extends Entity schema definition.
     * Extends entity schema by adding audit fields managed by the API.
     */
    get auditedEntity(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("AuditedEntity", "AuditedEntities", true)
            .setFields([
                new SchemaField("createdBy", `Creator User Id.`,
                    {
                        type: String,
                        //isRequired: true,  <== This need to change to "true" when we add users.
                        isAudit: true
                    }),
                new SchemaField("createdOn", `Creation timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: true,
                        isAudit: true
                    }),
                new SchemaField("lastUpdateBy", `User that updates the entity last time.`,
                    {
                        type: String,
                        isAudit: true
                    }),
                new SchemaField("lastUpdateOn", `Last update timestamp (UTC).`,
                    {
                        type: Date,
                        isAudit: true
                    })
            ])
            .merge(this.entity)
            .setDescription("Basic entity plus audit specific fields.")
            .freeze();
    }

    //#endregion

    //#region Entity schemas

    /**
     * **User** schema definition.
     * @extends Entity schema definition
     */
    get user(): Readonly<SchemaDefinition> {

        // return new SchemaDefinition("user", "users", true)
        return new SchemaDefinition("User", "Users", true)
            .setFields([
                new SchemaField("name", `User name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("email", `User email. Act also as unique identifier.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("initials", `User initials.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("picture", `Optional user picture URL.`,
                    {
                        type: String,
                        isRequired: false
                    })
            ])
            .merge(this.entity)
            .setDescription("Authenticated User")
            .freeze();
    }

    /**
     * **Category** schema definition.
     * @extends AuditedEntity schema definition
     */
    get category(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Category", "Categories", true)
            .setFields([
                new SchemaField("name", `Category name.`,
                    {
                        type: String,
                        isRequired: true
                    })
            ])
            .merge(this.auditedEntity)
            .setDescription("Categories used to tag both Workflows and Scripts.")
            .freeze();
    }

    /**
     * **Group** schema definition.
     * @extends AuditedEntity schema definition
     */
    get group(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Group", "Groups", true)
            .setFields([
                new SchemaField("name", `Group name.`,
                    {
                        type: String,
                        isRequired: true
                    })
            ])
            .merge(this.auditedEntity)
            .setDescription("Used to group servers based in some specific characteristics.")
            .freeze();
    }

    /**
     * **Script** schema definition.
     * @implements ScriptParameter embedded schema
     * @extends AuditedEntity schema definition
     */
    get script(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Script", "Scripts", true)
            .setFields([
                new SchemaField("name", `Script name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("description", `Brief description of the script that can help others to use it.`,
                    {
                        type: String
                    }),
                new SchemaField("isSystem", `Boolean value that indicates if the script is a System script or one uploaded by the User.
            Users are able to use System scripts, but not able to alter them.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("isTargettingServers", `Boolean value indicating if this script requires a target selection or not.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("category", `The script category, group scripts that have similar functionality. Helping in the creation of workflows to find and pick the right one.`,
                    {
                        type: this.category,
                        isRequired: true
                    }),
                new SchemaField("readonly", `Indicates if the script is not modifieng target server state in any way.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("code", `Base 64 encoded script code.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("parameters", `Collection of inferred Script parameters.`,
                    {
                        type: this.scriptParameter,
                        isArray: true
                    })
            ])
            .merge(this.auditedEntity)
            .setDescription("Script definition.")
            .freeze();
    }

    /**
     * **Target** schema definition.
     * @extends AuditedEntity schema definition
     */
    get target(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Target", "Targets", true)
            .setFields([
                new SchemaField("FQDN", `Fully Qualified Domain Name of the target server.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("friendlyName", `Target Server friendly name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("description", `Brief description of the target server. It must help to clarify server purpose, usage, location, etc.`,
                    {
                        type: String
                    }),
                new SchemaField("groups", `Groups this target is member of. Helping in the creation of workflows by finding appropiate targets.`,
                    {
                        type: this.group,
                        isArray: true
                    }),
                new SchemaField("enabled", `Indicate if the server is enabled as target. If the value is "false", the execution will be skipped on any Workflow or Task that have it.`,
                    {
                        type: Boolean,
                        isRequired: true
                    })
            ])
            .merge(this.auditedEntity)
            .setDescription("Target definition.")
            .freeze();
    }
    
    /**
     * **Workflow** schema definition.
     * @implements WorfloStep embedded schema
     * @extends AuditedEntity schema definition
     */
    get workflow(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Workflow", "Workflows", true)
            .setFields([
                new SchemaField("name", `Step name.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("description", `Workflow brief description. Be sure to express intention here.`,
                    {
                        type: String,
                        isRequired: false
                    }),
                new SchemaField("isPrivate", `Indicate if this is shared or not with other users.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("category", `Workflow category.`,
                    {
                        type: this.category,
                        isRequired: true
                    }),
                new SchemaField("steps", `Collection of workflow steps.`,
                    {
                        type: this.workflowStep,
                        isRequired: true,
                        isArray: true
                    }),

            ])
            .merge(this.auditedEntity)
            .setDescription("A Workflow represents a reusable collection of steps. Each one running a task in one or more target servers.")
            .freeze();
    }

    /**
     * **ExecutionLog** schema definition.
     * @implements ExecutionStep embedded schema
     * @extends Entity schema definition
     */
    get executionLog(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ExecutionLog", "ExecutionLogs", true)
            .setFields([
                new SchemaField("workflow", `Executed Workflow.`,
                    {
                        type: this.workflow,
                        isRequired: true
                    }),
                new SchemaField("startedAt", `Execution start timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: true
                    }),
                new SchemaField("endedAt", `Execution end timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: true
                    }),
                new SchemaField("status", `Overall execution Status.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("user", `User that starts the execution.`,
                    {
                        type: this.user,
                        isRequired: true
                    }),
                new SchemaField("executionSteps", `Execution details of each one of the Workflow steps.`,
                    {
                        type: this.executionStep,
                        isArray: true,
                        isRequired: true
                    })
            ])
            .merge(this.entity)
            .setDescription("Full log of a Workflow execution.")
            .freeze();
    }

    //#endregion

    //#region Embedded schemas

    /**
     * **ScriptParameter** embedded schema definition.
     * 
     * Used in: **Script**.
     */
    get scriptParameter(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ScriptParameter", "ScriptParameters", false)
            .setFields([
                new SchemaField("position", `Index position of the argument in the script.`,
                    {
                        type: Number,
                        isRequired: true
                    }),
                new SchemaField("name", `Argument name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("description", `Argument description, (if available).`,
                    {
                        type: String
                    }),
                new SchemaField("nativeType", `Native PowerShell type.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("type", `JavaScript equivalent type.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("required", `Boolean value indicating if this parameter need to be present in an invocation.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("validValues", `If defined, a set of valid values you can pass for an invocation.`,
                    {
                        type: String,
                        isArray: true
                    }),
                new SchemaField("canBeNull", `Indicates if when present, the parameter value can be null.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("canBeEmpty", `Indicates if the parameter value can be empty, (like an empty string or array).`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("defaultValue", `The parameter default value.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("hasDefault", `Indicates if the parameter has set a default value.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
            ])
            .setDescription("Represents all the details of an inferred script parameter.")
            .freeze();
    }

    /**
     * **ParameterValue** embedded schema definition.
     * 
     * Used in: **WorkflowStep**, **ExecutionStep**.
     */
    get parameterValue(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ParameterValue", "ParameterValues", false)
            .setFields([
                new SchemaField("name", `Parameter name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("value", `Parameter value`,
                    {
                        type: String
                    })
            ])
            .setDescription("Represent the value assigned to one script parameter for a specific task or workflow step")
            .freeze();
    }

    /**
     * **WorkflowStep** embedded schema definition.
     * @implements ParameterValue embedded schema
     */
    get workflowStep(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("WorkflowStep", "WorkflowSteps", false)
            .setFields([
                new SchemaField("name", `Step name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("enabled", `Indicates if the step will be included in the workflow execution.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("abortOnError", `If true, the entire workflow will be aborted if this step fails.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("script", `Script to be executed.`,
                    {
                        type: this.script,
                        isRequired: true
                    }),
                new SchemaField("values", `Script Parameter values.`,
                    {
                        type: this.parameterValue,
                        isArray: true,
                        isRequired: true
                    }),
                new SchemaField("targets", `Collection of targets for the task execution.`,
                    {
                        type: this.target,
                        isArray: true,
                        isRequired: true
                    })
            ])
            .setDescription("Represents one step of a complete workflow. Contains a reference to the task that is going to be executed")
            .freeze();
    }

    /**
     * **ExecutionError** embedded schema definition.
     */
    get executionError(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ExecutionError", "ExecutionErrors", false)
            .setFields([
                new SchemaField("throwAt", `Error Timestamp.`,
                    {
                        type: Date,
                        isRequired: true
                    }),
                new SchemaField("message", `Error message.`,
                    {
                        type: String
                    }),
                new SchemaField("stack", `Stack trace.`,
                    {
                        type: String,
                        isArray: true
                    })
            ])
            .setDescription("Represents the errors returned during a script invocation.")
            .freeze();
    }

    /**
     * **ExecutionTarget** schema definition.
     * @implements ExecutionError embedded schema
     */
    get executionTarget(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ExecutionTarget", "ExecutionTargets", false)
            .setFields([
                new SchemaField("FQDN", `Target fully qualified nameor an empty string if the script hits no targets.`,
                    {
                        type: String
                    }),
                new SchemaField("name", `Target name or an empty string if the script hits no targets.`,
                    {
                        type: String
                    }),
                new SchemaField("execResults", `The collection of results delivered by the script in this invocation.`,
                    {
                        type: String,
                        isArray: true,
                        isRequired: true
                    }),
                new SchemaField("execErrors", `Collection of errors that occurred during the script invocation on one particular target.`,
                    {
                        type: this.executionError,
                        isArray: true
                    }),
                new SchemaField("status", `Execution Status.`,
                    {
                        type: String,
                        isRequired: true
                    })
            ])
            .setDescription("Results and errors of a script execution on one particular target.")
            .freeze();
    }

    /**
     * **ExecutionStep** embedded schema definition.
     * @implements ParameterValue, ExecutionTarget embedded schemas
     */
    get executionStep(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ExecutionStep", "ExecutionSteps", false)
            .setFields([
                new SchemaField("stepName", `Step name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("scriptName", `Script name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("values", `Values assigned to the script for this execution.`,
                    {
                        type: this.parameterValue,
                        isArray: true
                    }),
                new SchemaField("targets", `Targets of this steps including status and error details.`,
                    {
                        type: this.executionTarget,
                        isArray: true
                    }),
                new SchemaField("status", `Step execution Status.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("execError", `Errors on this step.`,
                    {
                        type: this.executionError
                    })
            ])
            .setDescription("Details of a Workflow step execution")
            .freeze();
    }

    //#endregion

    /**
     * Return the collection of entity schemas, (excluding base schemas):
     */
    getEntitySchemas(): Readonly<SchemaDefinition>[] {
        return [
            //User:
            this.user,
            //Category:
            this.category,
            //Group:
            this.group,
            //Script:
            this.script,
            //Target:
            this.target,
            //Workflow:
            this.workflow,
            //ExecutionLog:     
            this.executionLog
        ]
    }
}

export let schemas = new Schemas();