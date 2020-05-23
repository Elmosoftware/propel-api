import { QueryValidator } from "../validators/query-validator";

const DEFAULT_TOP = 0;
const DEFAULT_SKIP = 0;
const DEFAULT_SORTBY = "";
const DEFAULT_FILTERBY = "{}";

export class QueryModifier {

    public readonly top: number;
    public readonly skip: number;
    public readonly sortBy: string;
    public readonly filterBy: string;
    public readonly populate: boolean;

    constructor(modifiers: any) {

        let val = new QueryValidator();

        //Adding missing properties with default values:
        this.top = (modifiers.top) ? modifiers.top : DEFAULT_TOP;
        this.skip = (modifiers.skip) ? modifiers.skip : DEFAULT_SKIP;
        this.sortBy = (modifiers.sortBy) ? modifiers.sortBy : DEFAULT_SORTBY;
        this.populate = (typeof modifiers.populate == "boolean") ? modifiers.populate : true;
        this.filterBy = (modifiers.filterBy) ? modifiers.filterBy : DEFAULT_FILTERBY;

        if (!val.validateQuery(this).isValid) {
            throw val.getErrors();
        }
    }

    get isPaginated() {
        return (this.top != DEFAULT_TOP || this.skip != DEFAULT_SKIP);
    }

    get isSorted() {
        return this.sortBy != DEFAULT_SORTBY;
    }

    get isFiltered() {
        return this.filterBy != DEFAULT_FILTERBY;
    }
}
