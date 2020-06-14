// @ts-check
import { PropelError } from "../core/propel-error";
import { SchemaDefinition } from "./schema-definition";
import { schemas } from "./schemas";

/**
 * Schema repository
 */
export class SchemaRepository {

    private _entitySchemas: Readonly<SchemaDefinition>[] = [];

    constructor(s: Readonly<SchemaDefinition>[] | SchemaDefinition[]) {
        this._entitySchemas = s;
    }

    /**
     * Schema collection.
     */
    get entitySchemas(): Readonly<SchemaDefinition>[] {
        return this._entitySchemas;
    }

    getEntitySchemaByName(name: string): Readonly<SchemaDefinition> {
        let ret = this._entitySchemas.find((s) => s.name.toLowerCase() == name.toLowerCase());

        if (!ret) {
            throw new PropelError(`There is no schema with name "${name}".`);
        }

        return ret;
    }

    /**
     * Returns the amount of schemas stored in the repository.
     */
    get count(): number {
        return this._entitySchemas.length;
    }
}

export let schemaRepo: SchemaRepository = new SchemaRepository(schemas.getEntitySchemas());
