import { SchemaDefinition } from "./schema-definition";
import { SchemaField } from "./schema-field";

/**
 * Contains the schema definition of all the entities in the domain model.
 */
class Schemas {

    private _allSchemas: Readonly<SchemaDefinition>[];

    constructor() {
        //We will only exclude entity and auditedEntity on the all Schemas list: 
        this._allSchemas = [
            this.userAccount,
            this.script,
            this.target,
            this.workflow,
            this.executionLog,
            this.scriptParameter,
            this.parameterValue,
            this.workflowStep,
            this.workflowSchedule,
            this.workflowScheduleMonthlyOption,
            this.executionError,
            this.executionTarget,
            this.executionStep,
            this.secret,
            this.credential,
            this.userSession
        ]
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
                    }),
                new SchemaField("deletedBy", `User name of the user that deletes the document.`,
                    {
                        type: String,
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
     * **UserAccount** schema definition.
     * @extends AuditedEntity schema definition
     */
    get userAccount(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("UserAccount", "UserAccounts", true)
            .setFields([
                new SchemaField("name", `Account name. This is an unique account identifier, can be mapped with a OS user name.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("fullName", `User full name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("initials", `User initials.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("email", `User email. Act also as unique identifier.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("role", `User role.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("lastLogin", `Timestamp (UTC) for the last user login.`,
                    {
                        type: Date,
                        isRequired: false
                    }),
                new SchemaField("lockedSince", `Timestamp (UTC) indicating the date the user was locked.`,
                    {
                        type: Date,
                        isRequired: false
                    })
            ])
            .merge(this.auditedEntity)
            .setDescription("User Account")
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
                new SchemaField("isTargettingServers", `Boolean value indicating if this script requires a target selection or not.`,
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
                    }),
                new SchemaField("enabled", `Indicate if the script is ok to be used in a Task or Workflow. If the value is "false", the execution will be skipped on any Workflow or Task that have it.`,
                    {
                        type: Boolean,
                        isRequired: true
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
                new SchemaField("enabled", `Indicate if the server is enabled as target. If the value is "false", the execution will be skipped on any Workflow or Task that have it.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("invokeAs", `Optional credentials to use for remote execution on this target.`,
                    {
                        type: this.credential,
                        isRequired: false
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
                new SchemaField("isQuickTask", `Indicate if this is a quick task.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("steps", `Collection of workflow steps.`,
                    {
                        type: this.workflowStep,
                        isRequired: true,
                        isArray: true
                    }),
                new SchemaField("schedule", `Schedule to run.`,
                    {
                        type: this.workflowSchedule,
                        isRequired: true
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
                new SchemaField("user", `User account that starts the execution.`,
                    {
                        type: this.userAccount,
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

    /**
     * **Session** schema definition.
     * @extends Entity schema definition
     */
    get userSession(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("UserSession", "UserSessions", true)
            .setFields([
                new SchemaField("user", `User account session.`,
                    {
                        type: this.userAccount,
                        isRequired: true
                    }),
                new SchemaField("startedAt", `Session start timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: true
                    })
            ])
            .merge(this.entity)
            .setDescription("User sessions.")
            .freeze();
    }

    /**
     * **Secret** schema definition.
     * @extends AuditedEntity schema definition
     */
    get secret(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Secret", "Secrets", true)
            .setFields([
                new SchemaField("value", `Propel Secret value.`,
                    {
                        type: Object,
                        isRequired: true,
                        mustBeEncripted: true
                    })
            ])
            .merge(this.auditedEntity)
            .setDescription("Propel Credential secret value.")
            .freeze();
    }

    /**
     * **Credential** schema definition.
     * @implements ParameterValue embedded schema
     * @extends AuditedEntity schema definition
     */
    get credential(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Credential", "Credentials", true)
            .setFields([
                new SchemaField("name", `Credential name.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("credentialType", `Credential type.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("description", `Credential description. Intended usage and other details.`,
                    {
                        type: String,
                        isRequired: false
                    }),
                new SchemaField("secretId", `Credential Secret identifier.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("fields", `Collection of credential non-sensitive additional fields.`,
                    {
                        type: this.parameterValue,
                        isRequired: false,
                        isArray: true
                    })
            ])
            .merge(this.auditedEntity)
            .setDescription("A Credential to be stored encrypted in the database and intended to be pass to the script for authentication purposes.")
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
                        type: String
                    }),
                new SchemaField("hasDefault", `Indicates if the parameter has set a default value.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("isPropelParameter", `Indicates if the parameter is the System Managed Propel parameter.`,
                    {
                        type: Boolean,
                        isRequired: false
                    })
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
                    }),
                new SchemaField("nativeType", `Native Javascript type`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("isRuntimeParameter", `Indicates if the user will be able to set or update the value right before to run the workflow.`,
                    {
                        type: Boolean,
                        isRequired: true
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
     * **WorkflowSchedule** embedded schema definition.
     * @implements WorkflowScheduleMonthlyOption embedded schema
     */
    get workflowSchedule(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("WorkflowSchedule", "WorkflowSchedules", false)
            .setFields([
                new SchemaField("enabled", `Indicates if the schedule is active.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("isRecurrent", `Indicates if the schedule will be executed more than once.`,
                    {
                        type: Boolean,
                        isRequired: true
                    }),
                new SchemaField("onlyOn", `Execution date and time for a single execution schedule.`,
                    {
                        type: Date,
                        isRequired: false
                    }),
                new SchemaField("everyAmount", `For a recurring schedule, this indicates how many ScheduleUnits between executions.`,
                    {
                        type: Number,
                        isRequired: true
                    }),
                new SchemaField("everyUnit", `For a recurring schedule, this indicates the schedule unit of time.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("weeklyOptions", `For a recurring schedule, this indicates the weekly options.`,
                    {
                        type: Number,
                        isArray: true,
                        isRequired: true
                    }),
                new SchemaField("monthlyOption", `For a recurring schedule, this indicates the monthly options.`,
                    {
                        type: this.workflowScheduleMonthlyOption,
                        isRequired: true
                    }),
                new SchemaField("startingAt", `For a recurring schedule, this indicates the schedule time of the day.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("lastExecution", `Last execution date and time.`,
                    {
                        type: Date,
                        isRequired: false
                    })
            ])
            .setDescription("Represents a Workflow execution schedule")
            .freeze();
    }

    /**
     * **WorkflowScheduleMonthlyOption** embedded schema definition.
     */
    get workflowScheduleMonthlyOption(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("WorkflowScheduleMonthlyOption", "WorkflowScheduleMonthlyOptions", false)
            .setFields([
                new SchemaField("ordinal", `Indicates the monthly option ordinal.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("day", `Indicates the monthly option day.`,
                    {
                        type: Number,
                        isRequired: true
                    }),
            ])
            .setDescription("Represents the monthly options of a Workflow schedule.")
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
                        type: String
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
                    }),
                new SchemaField("startedAt", `Execution target start timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: false
                    }),
                new SchemaField("endedAt", `Execution target end timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: false
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
                new SchemaField("scriptEnabled", `Script enabled, (at the moment of the execution).`,
                    {
                        type: Boolean,
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
                    }),
                new SchemaField("startedAt", `Execution step start timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: false
                    }),
                new SchemaField("endedAt", `Execution step end timestamp (UTC).`,
                    {
                        type: Date,
                        isRequired: false
                    })
            ])
            .setDescription("Details of a Workflow step execution")
            .freeze();
    }

    //#endregion


    /**
     * Return the collection of schemas, (excluding base schemas):
     */
    getSchemas(): Readonly<SchemaDefinition>[] {
        return this._allSchemas;
    }
}

export let schemas = new Schemas();