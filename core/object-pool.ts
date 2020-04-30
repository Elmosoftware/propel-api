import { APIError } from "../core/api-error";
import { StandardCodes, Code } from "../core/api-error-codes";

/**
 * Implementations can be reseted. Mean to flush all content and restore the state to some default state.
 */
export interface Resettable {
    reset(): void;
}

export class ObjectPoolOptions {

    public maxSize: number = ObjectPoolOptions.DEFAULT_MAX_SIZE;
    public preallocatedSize: number = Math.round(ObjectPoolOptions.DEFAULT_PREALLOCATED_PERC * this.maxSize);
    public maxQueueSize: number = ObjectPoolOptions.DEfAULT_MAX_QUEUE_SIZE;

    constructor() {
    }

    static get DEFAULT_MAX_SIZE(): number {
        return 10;
    }

    static get DEFAULT_PREALLOCATED_PERC(): number {
        return 0.1;
    }

    static get DEfAULT_MAX_QUEUE_SIZE(): number {
        return 1000;
    }
}

export class ObjectPool<T extends Resettable> {

    private _availableRepo: T[];
    private _lockedRepo: T[];
    private _requestQueue: Function[];
    private _opt: ObjectPoolOptions;
    private _cb: Function;

    constructor(createInstanceCallback: Function, options?: ObjectPoolOptions) {

        this._availableRepo = [];
        this._lockedRepo = [];
        this._requestQueue = [];

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

        this._initialize(this._opt.preallocatedSize);
    }

    get options(): ObjectPoolOptions {
        return Object.freeze(this._opt);
    }

    get availableCount(): number {
        return this._availableRepo.length;
    }

    get lockedCount(): number {
        return this._lockedRepo.length;
    }

    get createdCount(): number {
        return this.availableCount + this.lockedCount;
    }

    get availableToGrow(): number {
        return this._opt.maxSize - this.createdCount;
    }

    get canGrow(): boolean {
        return (this.availableToGrow > 0);
    }

    get queueSize(): number {
        return this._requestQueue.length;
    }

    get remainingQueueSpace(): number {
        return this._opt.maxQueueSize - this.queueSize;
    }

    aquire(): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            let obj: T;

            //If there is some objects available in the repo, we will take one of those:
            if (this.availableCount > 0) {
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
                reject(new APIError(`ObjectPool memory queue overflow.
Current values are:
    Items in use in the pool: ${this.lockedCount}.
    Items released in the pool: ${this.availableCount}.
    MAX queue size: ${this._opt.maxQueueSize}.
    Current queue size: ${this.queueSize}.
    Remaining queue space: ${this.remainingQueueSpace}.`, StandardCodes.QueueOverflow));
            }
        });
    }

    release(object: T): void {
        let found: boolean = false;
        let released: boolean = false;
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

    private _initialize(size: number) {
        for (let i = 0; i < size; i++) {
            this._availableRepo.push(this._cb());
        }
    }
}