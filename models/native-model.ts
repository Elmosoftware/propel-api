// @ts-check

/**
 * Interface that need to be implemented by Domain model entities that expose a Native model.
 */
export interface NativeModel {
    /**
     * Must be implemented to return teh native model object.
     */
    getModel(): any;
}