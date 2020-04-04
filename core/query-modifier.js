const QueryValidator = require("../validators/query-validator");

const DEFAULT_TOP = 0;
const DEFAULT_SKIP = 0;
const DEFAULT_SORTBY = "";
const DEFAULT_FILTERBY = "{}";

class QueryModifier {

    constructor(modifiers) {

        let val = new QueryValidator();

        this._internal = {};

        //Adding missing properties with default values:
        this._internal.top = (modifiers.top) ? modifiers.top : DEFAULT_TOP;
        this._internal.skip = (modifiers.skip) ? modifiers.skip : DEFAULT_SKIP;
        this._internal.sortBy = (modifiers.sortBy) ? modifiers.sortBy : DEFAULT_SORTBY;
        this._internal.populate = (typeof modifiers.populate == "boolean") ? modifiers.populate : true;
        this._internal.filterBy = (modifiers.filterBy) ? modifiers.filterBy : DEFAULT_FILTERBY;

        if (!val.validate(this._internal).isValid) {
            throw val.getErrors();
        }

        this._internal = Object.freeze(this._internal);
    }

    get top() {
        return this._internal.top;
    }

    get skip() {
        return this._internal.skip;
    }

    get sortBy() {
        return this._internal.sortBy;
    }

    get populate() {
        return this._internal.populate;
    }

    get filterBy() {
        return this._internal.filterBy;
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

module.exports = QueryModifier
