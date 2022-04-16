import { RDPUser } from "./rdp-user";

export class RuntimeInfo {

    /**
     * Process ID of the current Propel instance.
     */
    processId: number = -1;

    /**
     * Credentials used to create the Propel frontend process.
     */
    userName: string = "";

    /**
     * List of RDP users connected remotely to the VM where Propel is executing.
     */
    RDPUsers: RDPUser[] = [];

    /**
     * Any error found gathering of this info when the app starts.
     */
    error: string = "";

    constructor() {
    }
}