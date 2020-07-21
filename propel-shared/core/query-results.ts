
/**
 * Results fetched from a DataService fetch data operation  
 */
export class QueryResults<T>{

    public readonly data: T[];
    public readonly count: number;
    public readonly totalCount: number;

    /**
     * Class constructor
     * @param {T[]} data Fetched results
     * @param {number} totalCount Total amount of results, (only for paginated results).
     */
    constructor(data: T[] | T , totalCount?: number) {

        if (data) {
            if (!Array.isArray(data)) {
                data = [data];
            }            
        }
        else {
            data = [];
        }

        this.data = data;
        this.count = data.length;

        if (totalCount == null || isNaN(totalCount)) {
            totalCount = this.count;
        }

        this.totalCount = totalCount;
    }
}
