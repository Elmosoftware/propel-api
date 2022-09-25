import { ObjectPool, Disposable, Resettable } from "../core/object-pool";
import { PowerShellService } from "./powershell-service";
import { cfg } from "../core/config";
import { ObjectPoolStats } from "../core/object-pool-stats";

/**
 * Implements an Object pool for the @class **PowerShellService**.
 * Each PowerShellService class we creates is holding a handle to the PowerShell process running 
 * in background. Is expensive to create this resources as also ensure his disposal to be properly 
 * handled. @class **ObjectPool** used internally can help with both.
 * @implements Disposable
 * @implements Resettable
 */
class PowerShellServicePool implements Disposable, Resettable {

    private _pool: ObjectPool<PowerShellService>;

    constructor() {
        this._pool = new ObjectPool<PowerShellService>(
            this._createServiceInstance, cfg.poolOptions)
    }

    /**
     * Implementation of Disposable.isDisposed attribute.
     */
    get isDisposed() : boolean {
        return this._pool.isDisposed;
    }

    /**
     * Get an object from the pool.
     */
    aquire(): Promise<PowerShellService> {
        return this._pool.aquire()
    }

    /**
     * Return the internal object pool statistics.
     */
    get stats(): ObjectPoolStats {
        return this._pool.stats;
    }

    /**
     * Return a PowerShellService instance back to the pool.
     * @param svc PowerShellService instance to be released in the pool.
     */
    release(svc: PowerShellService) : void {
        this._pool.release(svc);
    }

    dispose(): Promise<void> {
        return this._pool.dispose();
    }

    disposeAnForget(): void{
        this._pool.disposeAnForget();
    }

    reset() {
        this._pool.reset();
    }

    private _createServiceInstance() :PowerShellService {
        return new PowerShellService();
    }
}

export let pool = new PowerShellServicePool();