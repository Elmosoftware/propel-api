import { EventEmitter } from "events";

import { PropelError } from "../../propel-shared/core/propel-error";
import { ErrorCodes } from "../../propel-shared/core/error-codes";
import { logger } from "../services/logger-service";
import { ObjectPoolOptions } from "./object-pool-options";
import { ObjectPoolEvent } from "../../propel-shared/models/object-pool-event";
import { ObjectPoolEventType } from "../../propel-shared/models/object-pool-event-type";

/**
 * Implementations can be reseted. Mean to flush all content and restore the state to some default state.
 */
export interface Resettable {
    /**
     * Restore to a default state.
     */
    reset(): void;
}

/**
 * Interface exposing sync and async methods to dispose external reference or handles like 
 * Open files, database connections, etc..
 */
export interface Disposable {

    /**
     * Start the disposing of open handles and come back without waiting for the results.
     */
    disposeAnForget(): void;

    /**
     * Aynchronous disposing of open handles.
     */
    dispose(): Promise<any>;

    /**
     * Boolean value that indicates if the instance is already disposed
     */
    isDisposed: boolean;
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
    private _isDisposed: boolean = false;
    private _eventEmitter = new EventEmitter();

    /**
     * Creates a new pool of T objects.
     * @param createInstanceCallback A Function that return a new instance of T.
     * @param options Object pool options.
     */
    constructor(createInstanceCallback: Function, options?: ObjectPoolOptions, 
        objectPoolEventListener?: Function) {

        this._opt = (!options) ? new ObjectPoolOptions() : options;

        if (!createInstanceCallback || typeof createInstanceCallback !== "function") {
            throw new PropelError(`The parameter "createInstanceCallback" is required and must be a callback function.
Received type is ${ typeof createInstanceCallback}, Is a null or undefined reference: ${String(createInstanceCallback == null || createInstanceCallback == undefined)}`);
        }
        this._cb = createInstanceCallback;

        this._opt.maxSize = (this._opt.maxSize && this._opt.maxSize > 0) ?
            this._opt.maxSize : ObjectPoolOptions.DEFAULT_MAX_SIZE;
        this._opt.preallocatedSize = (this._opt.preallocatedSize > this._opt.maxSize) ?
            Math.round(ObjectPoolOptions.DEFAULT_PREALLOCATED_PERC * this._opt.maxSize) : this._opt.preallocatedSize;
        this._opt.maxQueueSize = (this._opt.maxQueueSize && this._opt.maxQueueSize < 0) ?
            ObjectPoolOptions.DEfAULT_MAX_QUEUE_SIZE : this._opt.maxQueueSize;
        
        if(objectPoolEventListener) {
            this._eventEmitter.addListener("data",
                 (event: ObjectPoolEvent) => objectPoolEventListener(event));
        }

        this._initialize();
    }

    /**
     * Current object pool options.
     */
    get options(): ObjectPoolOptions {
        return Object.freeze(this._opt);
    }

    /**
     * Current object pool stats.
     */
    get stats(): ObjectPoolEvent {
        return this._createEvent(ObjectPoolEventType.Info)
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
     * Implementation of Disposable.isDisposed attribute.
     */
    get isDisposed() : boolean {
        return this._isDisposed;
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
            let poolFreeSpace: number = 0;
            let queueFreeSpace: number = 0;

            if (!this._disposing) {
                poolFreeSpace = this._opt.maxSize - (this._availableRepo.length + this._lockedRepo.length)
            }

            queueFreeSpace = this._opt.maxQueueSize - this._requestQueue.length;

            if (this._disposing) {
                reject(this._disposingError());
            }
            //If there is some objects available in the repo, we will take one of those:
            else if (this._availableRepo.length > 0) {
                obj = (this._availableRepo.pop() as T);
                this._lockedRepo.push(obj);
                resolve(obj);
                this._eventEmitter.emit("data", this._createEvent(ObjectPoolEventType.ObjectLocked))
            }
            //If there is no available objects, but we can create, we will add a new one:
            else if (poolFreeSpace > 0) {
                obj = this._cb();
                this._lockedRepo.push(obj);
                resolve(obj);
                this._eventEmitter.emit("data", this._createEvent(ObjectPoolEventType.ObjectAdded))
            }
            //If there is no available object and also the repo is full, (mean we can't create new instances), 
            //the only option is to queue the client request. In order to do so we need to check first if 
            //there is remaining space in the requests queue: 
            else if (queueFreeSpace > 0) {
                //we will queue the request. As soon an istance is released will be assigned to the first 
                //client in the queue.
                this._requestQueue.push(resolve);
                this._eventEmitter.emit("data", this._createEvent(ObjectPoolEventType.QueuedRequest))
            }
            //If the queue is also full of waiting clients, there is no option than throw an error.
            else {
                reject(new PropelError(`ObjectPool memory queue overflow.`, ErrorCodes.QueueOverflow));
                this._eventEmitter.emit("data", this._createEvent(ObjectPoolEventType.QueueOverflow))
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
                
                //If the object we received is already disposed, we can't use it again.
                if (object.isDisposed) {
                    this._lockedRepo.splice(i, 1); //Dropping it.
                    released = false;
                }
                else if (this._requestQueue.length > 0) {//If there is a pending request queued:
                    //We extract and invoke the resolve function passing as argument for the object:
                    (this._requestQueue.shift() as Function)(item);
                    this._eventEmitter.emit("data", this._createEvent(ObjectPoolEventType.UnqueuedRequest))
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
            throw new PropelError(`The released object is not part of this pool. The ObjectPool "release" method was invoked with a nul object reference or an object instance that do not correspond anyone already leased.`)
        }

        //If the object was actually released and not assigned to a queued request we will add it 
        //to the list of available objects in the pool:
        if (released) {
            this._availableRepo.push(object);
            this._eventEmitter.emit("data", this._createEvent(ObjectPoolEventType.ObjectReleased))
        }
    }

    disposeAnForget() {
        this._dispose()
            .then(() => {})
            .catch((err) => {
                logger.logError(`ObjectPool disposing error. Following details: ${String(err)}`)
            });
    }

    dispose() {
        return this._dispose();
    }

    private _dispose(): Promise<any> {
        
        let dispositions: Promise<any>[] = [];

        logger.logDebug(`Object pool start disposing objects.`)
        this._disposing = true;
        this._cb = () => {};
        this._requestQueue = [];
        this._availableRepo = this._availableRepo.concat(this._lockedRepo);
        this._lockedRepo = [];

        this._availableRepo.forEach((obj: T) => {
            dispositions.push(obj.dispose());
        })

        this._availableRepo = []
        this._isDisposed = true;
        return Promise.all(dispositions);
    }

    reset() {
        if (!this._disposing) {
            throw new PropelError("You can't call reset() without first dispose all object in the object pool.");
        }

        this._initialize();
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
        logger.logDebug(`Object pool was initialized.`);
    }

    private _disposingError(): Error {
        return new PropelError(`ObjectPool is right now disposing objects. The Aquire or Release operations are now forbidden.
All the objects in the pool will free his resources and been deleted.`);
    }

    private _createEvent(type: ObjectPoolEventType): ObjectPoolEvent  {
        let event: ObjectPoolEvent = new ObjectPoolEvent()

        event.eventType = type;
        event.poolSizeLimit = this._opt.maxSize;
        event.queueSizeLimit = this._opt.maxQueueSize;
        
        event.lockedObjects = this._lockedRepo.length;
        event.totalObjects = event.lockedObjects + this._availableRepo.length;
        event.queuedRequests = this._requestQueue.length;
        event.queueOverflowError = (type == ObjectPoolEventType.QueueOverflow) ? 1 : 0

        return event;
    }
}