/**
 * Realtime statistics of an Object Pool.
 */
export class ObjectPoolStats {
     /**
     * Returns the amount of objects already created and ready to be aquired.
     */
    public objectsAvailable: number = 0;

    /**
     * Returns the amounts of object already in use. 
     */
    public objectsLocked: number = 0;

    /**
     * Returns theamount of objects already created by the pool.
     */
    public objectsCreated: number = 0;

    /**
     * Returns how many objects the pool can create if all the current are aquired and new 
     * requests come in.
     */
    public availableToGrow: number = 0; 
    /**
     * Current amount of aquire request that have been queued and are waiting for 
     * released objects.
     */
    public queueSize: number = 0;

    /**
     * Remaining queue space. (Maximum queue size less current request queued).
     */
    public remainingQueueSpace: number = 0;

    /**
     * Returns a boolean value indicating if there still space to grow by creating more instances of T.
     */
    public canGrow: boolean = false;

    toString() { 
        return `Current Object pool stats:
        Items in use in the pool: ${this.objectsLocked}.
        Items released in the pool: ${this.availableToGrow}.
        Current queue size: ${this.queueSize}.
        Remaining queue space: ${this.remainingQueueSpace}.`
    }

    constructor() {
    }    
}