import { GraphSeriesData } from "./graph-series-data";

/**
 * Store a graph serie including all the serie data.
 */
export class GraphSeries {

    /**
     * Name of the series.
     */
    public name: string;

    /**
     * Series data.
     */
    public series: GraphSeriesData[] = [];

    /**
     * Creates a new *GraphSeries* instance.
     * @param name Name of the series
     */
    constructor(name: string) {
        this.name = name;
    }
}
