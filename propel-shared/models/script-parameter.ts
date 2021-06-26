// @ts-check

/**
 * Represents one inferred script parameter.
 */
export class ScriptParameter {

    /**
     * Parameter position as described in the script.
     */
    public position: number = 0;

    /**
     * Parameter name.
     */
    public name: string = "";

    /**
     * Optional parameter description.
     */
    public description: string = "";

    /**
     * If defined in the parameter, the PowerShell type.
     */
    public nativeType: string = "";

    /**
     * If the native type is defined, this will be the Javascript type used for conversion purposes.
     */
    public type: string = "";

    /**
     * A boolean value indicating if the parameter is mandatory.
     */
    public required: boolean = false;

    /**
     * If the parameter has specified a valid set, this propety will keep the valid values the parameter can have.
     */
    public validValues: string[] = [];

    /**
     * A boolean value indicating of the parameter can accept null values.
     */
    public canBeNull: boolean = true;

    /**
     * A boolean value indicating if the parameter value can be empty, (like an empty string or array). 
     */
    public canBeEmpty: boolean = true;

    /**
     * The parameter default value.
     */
    public defaultValue: string = "";

    /**
     * Indicates if the parameter has set a default value.
     */
    public hasDefault: boolean = false;

    /**
     * Indicates if this parameter is the System Managed Propel parameter. This allows the script to get 
     * some context information related to the execution.
     */
    public isPropelParameter: boolean = false;

    constructor() {
    }
}