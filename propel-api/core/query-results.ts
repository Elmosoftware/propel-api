
/**
 * Results fetched from a DataService fetch data operation  
 */
export class QueryResults{

    public readonly data: object[];
    public readonly count: number;
    public readonly totalCount: number;

    /**
     * Class constructor
     * @param {Array | object} data Fetched results
     * @param {number} totalCount Total amount of results, (only for paginated results).
     */
    constructor(data: any, totalCount?: number) {

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
