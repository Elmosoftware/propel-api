
/**
 * Results fetched from a DataService fetch data operation  
 */
class QueryResults{

    /**
     * Class constructor
     * @param {Array | object} data Fetched results
     * @param {number} totalCount Total amount of results, (only for paginated results).
     */
    constructor(data, totalCount = null) {

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

module.exports = QueryResults