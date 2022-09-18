//@ts-check
/**
 * This class encapsulates an API response that include paginated data.
 */
 export class PagedResponse<T>{

    /**
     * Collection of Data items returned by the API or an epty array if no results.
     */
    public data: T[];

    /**
     * Amount of items returned in the "data" collection.
     */
    public count: number;

    /**
     * Total amount of items available. 
     */
    public totalCount: number;

    constructor(data: T[] | T | undefined | null = null, totalCount: number = 0){
        
        //We need to ensure always return an array:
        if (!data) {
            this.data = [];
        }
        else if (Array.isArray(data)) {
            this.data = [...data]
        }
        else {
            this.data = [(data as T)]
        }

        this.count = this.data.length;
        this.totalCount = totalCount;
    }
}
