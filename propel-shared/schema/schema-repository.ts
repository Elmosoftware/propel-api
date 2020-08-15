// @ts-check
import { PropelError } from "../core/propel-error";
import { SchemaDefinition } from "./schema-definition";
import { schemas } from "./schemas";

/**
 * Schema repository
 */
export class SchemaRepository {

    private _schemas: Readonly<SchemaDefinition>[] = [];

    constructor(s: Readonly<SchemaDefinition>[] | SchemaDefinition[]) {
        this._schemas = s;
    }

    /**
     * Retrieves a collection of all the Entity schemas.
     */
    get entitySchemas(): Readonly<SchemaDefinition>[] {
        return this._schemas.filter((s: Readonly<SchemaDefinition>) => s.isEntity)
    }

    /**
     * Return the requested schema. If the nam doesn't exists an error will be throw.
     * @param name Name of the schema to find.
     */
    getSchemaByName(name: string): Readonly<SchemaDefinition> {

        let ret: Readonly<SchemaDefinition> | undefined;

        ret = this._schemas.find((s) => s.name.toLowerCase() == name.toLowerCase());

        if (!ret) throw new PropelError(`There is no schema with name "${name}".`);

        return ret;
    }

    /**
     * Returns the amount of schemas stored in the repository.
     */
    get count(): number {
        return this._schemas.length;
    }
}

export let schemaRepo: SchemaRepository = new SchemaRepository(schemas.getSchemas());
