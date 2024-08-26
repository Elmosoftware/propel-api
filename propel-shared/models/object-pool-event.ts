// @ts-check
import { Entity } from "./entity";
import { ObjectPoolEventType } from "./object-pool-event-type";

/**
 * Full log of Workflow execution outcomes.
 */
export class ObjectPoolEvent extends Entity {
    /**
     * Event name.
     */
    public eventType: ObjectPoolEventType =  ObjectPoolEventType.Info;

    /**
     * Event timestamp.
     */
    public timestamp: Date = new Date();

    /**
     * Returns the amounts of objects locked, (already in use),  in the pool.
     */
    public lockedObjects: number = 0;

    /**
     * Amount of objects in the pool.
     */
    public totalObjects: number = 0;

    /**
     * This value indicates how many object this pool allows.
     */
    public poolSizeLimit: number = 0;

    /**
     * Amount of queued request waiting for a released object.
     */
    public queuedRequests: number = 0;

    /**
     * This value indicate the maximum amount of requests allowed to be queued in this pool.
     * If the maximum number at certain point in time is reached, any additional request 
     * will be denied and a n error will be throw.
     */
    public queueSizeLimit: number = 0;

    /**
     * Indicates a queue overflow error occurs in this event.
     */
    public queueOverflowError: number = 0;

    constructor() {
        super();
    }
}