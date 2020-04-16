// @ts-check
import { Schema } from "mongoose";

/**
 * Interface that need to be implemented by Domain model entities in order to expose his own native schema.
 */
export interface NativeSchema {
    /**
     * Must be implemented to retur the native schema.
     */
    getSchema(): Schema;
}