import { QueryValidator } from "../validators/query-validator";

const DEFAULT_TOP = 0;
const DEFAULT_SKIP = 0;
const DEFAULT_SORTBY = "";
const DEFAULT_FILTERBY = "{}";

/**
 * Query options that allows to modify the results by specifying sorting, filtering, pagination, etc. 
 */
export class QueryModifier {

    /**
     * Maximum amount of results the query must return.
     */
    public top: number;

    /**
     * How many items we need to skip before toretrieve the first results, (based on the current 
     * filter and/or sort conditions).
     */
    public skip: number;

    /**
     * Sorting condition
     */
    public sortBy: string;

    /**
     * Filter condition
     */
    public filterBy: string;

    /**
     * Indicates if we need to fully populate the entity.
     */
    public populate: boolean;

    constructor(modifiers?: any) {

        let val = new QueryValidator();

        //Adding missing properties with default values:
        this.top = (modifiers && modifiers.top) ? modifiers.top : DEFAULT_TOP;
        this.skip = (modifiers && modifiers.skip) ? modifiers.skip : DEFAULT_SKIP;
        this.sortBy = (modifiers && modifiers.sortBy) ? modifiers.sortBy : DEFAULT_SORTBY;
        this.populate = (modifiers && typeof modifiers.populate == "boolean") ? modifiers.populate : true;
        this.filterBy = (modifiers && modifiers.filterBy) ? modifiers.filterBy : DEFAULT_FILTERBY;

        if (!val.validateQuery(this).isValid) {
            throw val.getErrors();
        }
    }

    /**
     * Boolean value that indicates if this query modifier includes pagination features, (this mean 
     * if top or skip has been set).
     */
    get isPaginated() {
        return (this.top != DEFAULT_TOP || this.skip != DEFAULT_SKIP);
    }

    /**
     * Boolean value indicating if a sorting condition is applied.
     */
    get isSorted() {
        return this.sortBy != DEFAULT_SORTBY;
    }

    /**
     * Boolean value indicating if a filter condition is applied.
     */
    get isFiltered() {
        return this.filterBy != DEFAULT_FILTERBY;
    }
}
