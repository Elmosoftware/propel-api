// @ts-check

/**
 * Represent the value assigned to one parameter of a Script.
 */
export class ParameterValue {

    /**
     * Parameter name.
     */
    public name: string = "";

    /**
     * Parameter value.
     */
    public value: any = "";

    /**
     * Parameter native Javascript type.
     */
    public nativeType: string = "";

    constructor() {
    }
}