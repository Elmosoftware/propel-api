import { ObjectPool, Disposable, Resettable } from "../core/object-pool";
import { PowerShellService } from "./powershell-service";
import { cfg } from "../core/config";
import { db } from "../core/database";
import { ObjectPoolEvent } from "../../propel-shared/models/object-pool-event";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { SecurityService } from "./security-service";
import { UserAccount } from "../../propel-shared/models/user-account";
import { DataService } from "./data-service";
import { logger } from "./logger-service";

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
            this._createServiceInstance, cfg.poolOptions, 
            (event: ObjectPoolEvent) => {
                this._handleObjectPoolEvent(event);  
            })
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
    get stats(): ObjectPoolEvent {
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

    private _handleObjectPoolEvent(event: ObjectPoolEvent): void { 
        let svc: DataService;

        if (!cfg.poolOptions.statsEnabled) return;

        try {
            svc = db.getService("ObjectPoolEvent", this._getToken())

             svc.add(event)
            .catch((err) => {
                logger.logWarn(`There was an error when trying to persist an Object pool event. Following details: ${String(err)}`)
            })
        } catch (error) {
            logger.logWarn(`There was an error when trying to persist an Object pool event. Following details: ${String(error)}`)
        }
    }

    private _getToken() {
        let ret: SecurityToken = new SecurityToken();
        let sysAccount: UserAccount = SecurityService.getSystemUser();

        ret.hydrateFromUser(sysAccount);

        return ret;
    }

    
}

export let pool = new PowerShellServicePool();