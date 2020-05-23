import { ObjectPool, Disposable, Resettable } from "../core/object-pool";
import { InvocationService } from "./invocation-service";
import { cfg } from "../core/config";

/**
 * Implements an Object pool for the @class InvocationService.
 * Each InvocationService class we creates is holding a handle to the PowerShell process running 
 * in background. Is expensive to create this resources as also ensure his disposal to be properly 
 * handled. @class ObjectPool used internally can help with both.
 * @implements Disposable
 * @implements Resettable
 */
class InvocationServicePool implements Disposable, Resettable {

    private _pool: ObjectPool<InvocationService>;

    constructor() {
        this._pool = new ObjectPool<InvocationService>(
            this.createInvocationServiceInstance, cfg.poolOptions)
    }

    /**
     * Get an object from the pool.
     */
    aquire(): Promise<InvocationService> {
        return this._pool.aquire()
    }

    /**
     * Return an InvocationService instance to the pool.
     * @param inv InvocationService instance to be released in the pool.
     */
    release(inv: InvocationService) : void {
        this._pool.release(inv);
    }

    dispose(): Promise<any> {
        return this._pool.dispose();
    }

    disposeSync(){
        this._pool.disposeSync();
    }

    reset() {
        this._pool.reset();
    }

    private createInvocationServiceInstance() :InvocationService {
        return new InvocationService();
    }
}

export let pool = new InvocationServicePool();