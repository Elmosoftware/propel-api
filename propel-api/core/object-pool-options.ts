/**
 * Define the options to use for the pool creation. Like how many object the pool will be allowed 
 * to generate. How many of this objects must be created initially, how many object request 
 * can be queued waiting for resources to be released, etc.
 */
export class ObjectPoolOptions {

    public maxSize: number = ObjectPoolOptions.DEFAULT_MAX_SIZE;
    public preallocatedSize: number = Math.round(ObjectPoolOptions.DEFAULT_PREALLOCATED_PERC * this.maxSize);
    public maxQueueSize: number = ObjectPoolOptions.DEfAULT_MAX_QUEUE_SIZE;

    constructor() {
    }

    /**
     * Default max size. This value will be used for @property maxSize if no value is specified.
     */
    static get DEFAULT_MAX_SIZE(): number {
        return 10;
    }

    /**
     * Default percentage of the @property maxsize that will be preallocated by default.
     */
    static get DEFAULT_PREALLOCATED_PERC(): number {
        return 0.1;
    }

    /**
     * Default @property maxQueueSize value.
     */
    static get DEfAULT_MAX_QUEUE_SIZE(): number {
        return 100;
    }
}