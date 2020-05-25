//@ts-check
import { PropelError } from "../../propel-shared/core/propel-error";
import { errorFormatter } from "../schema/error-formatter";

/**
 * This class encapsulates the unified response body sent always by this API.
 */
export class APIResponse{

    /**
     * Collection of errors or an empty array if no errors occurred resolving request.
     */
    public readonly errors: any[];

    /**
     * Collection of Data items returned by the API or an epty array if no results.
     */
    public readonly data: any[];

    constructor(errors: any[] | any, data: any[] | any){
        this.errors = this._toArray(errors, (error: any) => errorFormatter.format(new PropelError(error)));
        this.data = this._toArray(data, (dataItem: any) => dataItem);
    }

    _toArray(items: any[] | any, processCallback: Function): any[] {

        let ret: any[] = [];

        //We need to ensure always return an array of errors:
        if (Array.isArray(items)) {
            items.forEach((item) => {
                ret.push(processCallback(item));
            })
        }
        else if(items) {
            ret.push(processCallback(items));
        }

        return ret;
    }
}
