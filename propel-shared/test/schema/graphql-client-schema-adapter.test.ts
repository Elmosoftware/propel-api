import { TestSchemas } from "../test-schemas";
import { SchemaRepository } from "../../schema/schema-repository";
import { GraphQLClientSchemaAdapter } from "../../schema/graphql-client-schema-adapter";

describe("SchemaDefinition Class - getFieldListForQuery()", () => {

    let s: TestSchemas;

    beforeEach(() => {
        s = new TestSchemas();
    })

    test(`Single Schema`, () => {
        let gql = new GraphQLClientSchemaAdapter(new SchemaRepository([]));
        let f: string = gql.getFieldListForQuery(s.refOne);
        expect(f).toBe(
            `data{anauditfield
refOneName}count
totalCount}`)
    })
    test(`Single with reference`, () => {
        let gql = new GraphQLClientSchemaAdapter(new SchemaRepository([]));
        let f: string = gql.getFieldListForQuery(s.refTwoWithRefOne);
        expect(f).toBe(
            `data{anauditfield
refTwoName
refonefield {anauditfield
refOneName}}count
totalCount}`)
    })
    test(`Medium with embedded`, () => {
        let gql = new GraphQLClientSchemaAdapter(new SchemaRepository([]));
        let f: string = gql.getFieldListForQuery(s.mediumEntity);
        expect(f).toBe(
            `data{anauditfield
embedded1 {simpleEmbeddedName}
name}count
totalCount}`)
    })
    test(`Complex`, () => {
        let gql = new GraphQLClientSchemaAdapter(new SchemaRepository([]));
        let f: string = gql.getFieldListForQuery(s.complexEntity);
        expect(f).toBe(
            `data{MyNumber
anauditfield
category {anauditfield
refOneName}
embeddedArray1
name
steps {embeddedArray21
embeddedArray22 {simpleEmbeddedName}
embeddedArray23 {name
secondLevel {simpleEmbeddedName}}
enabled
name
refOneArray {anauditfield
refOneName}}}count
totalCount}`)
    })
    test(`Complex excluding first level fields`, () => {
        let gql = new GraphQLClientSchemaAdapter(new SchemaRepository([]));
        let f: string = gql.getFieldListForQuery(s.complexEntity, ["anauditfield", "name"]);
        expect(f).toBe(
            `data{MyNumber
category {anauditfield
refOneName}
embeddedArray1
steps {embeddedArray21
embeddedArray22 {simpleEmbeddedName}
embeddedArray23 {name
secondLevel {simpleEmbeddedName}}
enabled
name
refOneArray {anauditfield
refOneName}}}count
totalCount}`)
    })
    test(`Complex excluding an entire first level branch`, () => {
        let gql = new GraphQLClientSchemaAdapter(new SchemaRepository([]));
        let f: string = gql.getFieldListForQuery(s.complexEntity, ["steps"]);
        expect(f).toBe(
            `data{MyNumber
anauditfield
category {anauditfield
refOneName}
embeddedArray1
name}count
totalCount}`)
    })
    test(`Complex excluding a field in 1st level branch and an entire second level branch`, () => {
        let gql = new GraphQLClientSchemaAdapter(new SchemaRepository([]));
        let f: string = gql.getFieldListForQuery(s.complexEntity, ["category.anauditfield", "steps.embeddedArray22"]);
        expect(f).toBe(
            `data{MyNumber
anauditfield
category {refOneName}
embeddedArray1
name
steps {embeddedArray21
embeddedArray23 {name
secondLevel {simpleEmbeddedName}}
enabled
name
refOneArray {anauditfield
refOneName}}}count
totalCount}`)
    })
})