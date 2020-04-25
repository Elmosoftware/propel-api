
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