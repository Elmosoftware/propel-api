import { APIError } from "../core/api-error";
import { StandardCodes } from "../core/api-error-codes";
import { logger } from "../services/logger-service";

/**
 * Implementations can be reseted. Mean to flush all content and restore the state to some default state.
 */
export interface Resettable {
    reset(): void;
}

/**
 * Interface exposing sync and async methods to dispose external reference or handles like 
 * Open files, database connections, etc..
 */
export interface Disposable {

    /**
     * Synchronous disposing of open handles.
     */
    disposeSync(): void;

    /**
     * Aynchronous disposing of open handles.
     */
    dispose(): Promise<any>;
}

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

/**
 * Implements the [Object Pool design pattern](https://en.wikipedia.org/wiki/Object_pool_pattern) to 
 * allow to keep alive object that are expensive to create or are holding external OS resources like
 * File handles, database connections, processes, etc.
 * The object stored must implements the @interface Resettable as also the @interface Disposable.
 * @implements Disposable
 */
export class ObjectPool<T extends Resettable & Disposable> implements Disposable, Resettable {

    private _availableRepo: T[] = [];
    private _lockedRepo: T[] = [];
    private _requestQueue: Function[] = [];
    private _opt: ObjectPoolOptions;
    private _cb: Function;
    private _disposing: boolean = false;

    /**
     * Creates a new pool of T objects.
     * @param createInstanceCallback A Function that return a new instance of T.
     * @param options Object pool options.
     */
    constructor(createInstanceCallback: Function, options?: ObjectPoolOptions) {
        this._opt = (!options) ? new ObjectPoolOptions() : options;

        if (!createInstanceCallback || typeof createInstanceCallback !== "function") {
            throw new APIError(`The parameter "createInstanceCallback" is required and must be a callback function.
Received type is ${ typeof createInstanceCallback}, Is a null or undefined reference: ${String(createInstanceCallback == null || createInstanceCallback == undefined)}`);
        }
        this._cb = createInstanceCallback;

        this._opt.maxSize = (this._opt.maxSize && this._opt.maxSize > 0) ?
            this._opt.maxSize : ObjectPoolOptions.DEFAULT_MAX_SIZE;
        this._opt.preallocatedSize = (this._opt.preallocatedSize > this._opt.maxSize) ?
            Math.round(ObjectPoolOptions.DEFAULT_PREALLOCATED_PERC * this._opt.maxSize) : this._opt.preallocatedSize;
        this._opt.maxQueueSize = (this._opt.maxQueueSize && this._opt.maxQueueSize < 0) ?
            ObjectPoolOptions.DEfAULT_MAX_QUEUE_SIZE : this._opt.maxQueueSize;

        this._initialize();
    }

    /**
     * Current object pool options.
     */
    get options(): ObjectPoolOptions {
        return Object.freeze(this._opt);
    }

    /**
     * Returns the amount of objects already created and ready to be aquired.
     */
    get availableCount(): number {
        return this._availableRepo.length;
    }

    /**
     * Returns the amounts of object already in use. 
     */
    get lockedCount(): number {
        return this._lockedRepo.length;
    }

    /**
     * Returns theamount of objects already created by the pool.
     */
    get createdCount(): number {
        return this.availableCount + this.lockedCount;
    }

    /**
     * Returns how many objects the pool can create if all the current are aquired and new 
     * requests come in.
     */
    get availableToGrow(): number {
        return (this._disposing) ? 0 : this._opt.maxSize - this.createdCount;
    }

    /**
     * Returns a boolean value indicating if there still space to grow by creating more instances of T.
     */
    get canGrow(): boolean {
        return (this.availableToGrow > 0);
    }

    /**
     * Current amount of aquire request that has been queud and are waiting for released objects.
     */
    get queueSize(): number {
        return this._requestQueue.length;
    }

    /**
     * Remaining queue space. (Maximum queue size less current request queued).
     */
    get remainingQueueSpace(): number {
        return this._opt.maxQueueSize - this.queueSize;
    }

    /**
     * Returns a boolean value indicating if the pool is now disposing object.
     * Disposingall the ibjects in the pool is the final state. All the resouces will be released 
     * and disposed from memory, no new aquire request will take place.
     * After the dispose process is done, the object pool can be destroyed. 
     */
    get isDisposing(): boolean {
        return this._disposing;
    }

    /**
     * Allows to aquire a resource from the list of available resource in the pool.
     * If there is no resource available and there is space to grow, the pool will create a
     * new resource.
     * If there is no more space to growth, the requests will be queued wait for a released resource.
     * If the queue is full, a Queue overflow exception will be thrown. 
     * If the pool is already disposing, an exception will be thrown.
     */
    aquire(): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            let obj: T;

            if (this._disposing) {
                reject(this._disposingError());
            }
            //If there is some objects available in the repo, we will take one of those:
            else if (this.availableCount > 0) {
                obj = (this._availableRepo.pop() as T);
                this._lockedRepo.push(obj);
                resolve(obj);
            }
            //If there is no available objects, but we can create, we will add a new one:
            else if (this.canGrow) {
                obj = this._cb();
                this._lockedRepo.push(obj);
                resolve(obj);
            }
            //If there is no available object and also the repo is full, (mean we can't create new instances), 
            //the only option is to queue the client request. In order to do so we need to check first if 
            //there is remaining space in the requests queue: 
            else if (this.remainingQueueSpace > 0) {
                //we will queue the request. As soon an istance is released will be assigned to the first 
                //client in the queue.
                this._requestQueue.push(resolve);
            }
            //If the queue is also full of waiting clients, there is no option than throw an error.
            else {
                reject(new APIError(`ObjectPool memory queue overflow.\n${this._currentStatsText()}`, 
                    StandardCodes.QueueOverflow));
            }
        });
    }

    /**
     * This method returns the object in use to the list of available ones. This need to be called 
     * as soon the object is no longer required.
     * The object will be resetted and returned to the pool so it can be used again later.
     * If there is any queued requests, this object will be immediately assigned.
     * If the returned object is not part of the pool, and exception will be thrown.
     * If the pool is already disposing, an exception will be thrown. 
     * @param object Object from the pool to mark as released.
     */
    release(object: T): void {
        let found: boolean = false;
        let released: boolean = false;

        if (this._disposing) {
            throw this._disposingError();
        }

        object.reset();

        this._lockedRepo.forEach((item, i) => {
            if (item === object) {
                //If there is a pending request queued:
                if (this.queueSize > 0) {
                    //We extract and invoke the resolve function passing as argument the object:
                    (this._requestQueue.shift() as Function)(item);
                }
                else {
                    //If there is no request waiting, we can finally release the resource.
                    this._lockedRepo.splice(i, 1);
                    released = true;
                }
                found = true;
            }
        })

        if (!found) {
            throw new APIError(`The released object is not part of this pool. The ObjectPool "release" method was invoked with a nul object reference or an object instance that do not correspond anyone already leased.`)
        }

        //If the object was actually released and not assigned to a queued request:
        if (released) {
            this._availableRepo.push(object);
        }
    }

    disposeSync() {
        this._dispose()
            .then(() => {})
            .catch((err) => {
                logger.logWarn(`ObjectPool disposing error. Following details: ${String(err)}`)
            });
    }

    dispose() {
        return this._dispose();
    }

    private _dispose(): Promise<any> {
        
        let dispositions: Promise<any>[] = [];

        logger.logInfo(`Object pool start disposing objects.\n${this._currentStatsText()}`)
        this._disposing = true;
        this._cb = () => {};
        this._requestQueue = [];
        this._availableRepo = this._availableRepo.concat(this._lockedRepo);
        this._lockedRepo = [];

        this._availableRepo.forEach((obj: T) => {
            dispositions.push(obj.dispose());
        })

        this._availableRepo = []

        return Promise.all(dispositions);
    }

    reset() {
        if (!this._disposing) {
            throw new APIError("You can't call reset() without first dispose all object in the object pool.");
        }

        logger.logInfo(`Object pool is starting or it has been restarted.`)
        this._initialize();
        logger.logInfo(`Object pool started successfully.`)
    }

    private _initialize() {

        let size = this._opt.preallocatedSize;

        this._availableRepo = [];
        this._lockedRepo = [];
        this._requestQueue = [];
        
        for (let i = 0; i < size; i++) {
            this._availableRepo.push(this._cb());
        }
        
        this._disposing = false;
    }

    private _currentStatsText() :string {
        return `Current Object pool stats:
    Items in use in the pool: ${this.lockedCount}.
    Items released in the pool: ${this.availableCount}.
    MAX queue size: ${this._opt.maxQueueSize}.
    Current queue size: ${this.queueSize}.
    Remaining queue space: ${this.remainingQueueSpace}.`
    }

    private _disposingError(): Error {
        return new APIError(`ObjectPool is right now disposing objects. The Aquire or Release operations are now forbidden.
All the objects in the pool will free his resources and been deleted.`);
    }
}