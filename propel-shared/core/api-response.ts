//@ts-check
import { PropelError } from "./propel-error";
import { errorFormatter } from "../../propel-api/schema/error-formatter";

/**
 * This class encapsulates the unified response body sent always by this API.
 */
export class APIResponse<T>{

    /**
     * Collection of errors or an empty array if no errors occurred resolving request.
     */
    public readonly errors: any[];

    /**
     * Collection of Data items returned by the API or an epty array if no results.
     */
    public readonly data: T[];

    /**
     * Amount of items returned in the "data" collection.
     */
    public readonly count: number;

    /**
     * Total amount of items available in the datasource that applies to the 
     * filter criteria specified in the request. 
     */
    public readonly totalCount: number;

    constructor(errors: any[] | any, data: T[] | T, totalCount: number = 0){
        this.errors = this._toArray(errors, (error: any) => errorFormatter.format(new PropelError(error)));
        this.data = this._toArray(data, (item: T) => item);
        this.count = this.data.length;
        this.totalCount = totalCount;
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
