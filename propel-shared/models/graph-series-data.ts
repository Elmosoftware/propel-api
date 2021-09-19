/**
 * Stores a series data
 */
export class GraphSeriesData {

    /**
     * Data name.
     */
    public name: string;

    /**
     * Data value.
     */
    public value: number

    /**
     * Data identifier. Allows to eventually locate the source of the data.
     */
    public _id: string;

    /**
     * Data capturing timestamp.
     */
    public lastTimeUpdated: Date | null;

    /**
     * Creates a new instance.
     * @param name Name of the data.
     * @param value Value of the data.
     * @param _id Data identifier.
     * @param lastTimeUpdated Timestamp of the captured data.
     */
    constructor(name: string, value: number, _id: string = "", lastTimeUpdated: Date | null = null) {
        this.name = name;
        this.value = value;
        this._id = _id;
        this.lastTimeUpdated = lastTimeUpdated;
    }
}