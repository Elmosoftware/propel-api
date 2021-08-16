import { MongooseSchemaAdapter, AdapterModel } from "../../schema/mongoose-schema-adapter";
import { TestSchemas } from "../../../propel-shared/test/test-schemas";

describe("SchemaAdapter Class - asSchema()", () => {

    let s: TestSchemas
    let sa: MongooseSchemaAdapter;

    beforeEach(() => {
        s = new TestSchemas();
        sa = new MongooseSchemaAdapter();
    })

    test(`Simple Schema`, () => {
        let schema: any = sa.asSchema(s.refOne);
        expect(schema.tree).toBeTruthy();
        expect(schema.tree._id).toBeTruthy();
        expect(schema.tree._id.type).toEqual("ObjectId");
        expect(schema.tree.refOneName).toBeTruthy();
        expect(schema.tree.refOneName.required).toBe(true);
        expect(schema.tree.refOneName.unique).toBe(true);
        expect(schema.tree.entityInternal).toBeTruthy();
        expect(schema.tree.entityInternal.type.name).toEqual("String");
        expect(schema.tree.entityInternal.required).toBe(true);
        expect(schema.tree.anauditfield).toBeTruthy();
        expect(schema.tree.anauditfield.type.name).toEqual("Date");
        expect(schema.tree.anauditfield.required).toBe(true);
    })

    test(`Schema with embedded`, () => {
        let schema: any = sa.asSchema(s.mediumEntity);
        expect(schema.tree).toBeTruthy();
        expect(schema.tree._id).toBeTruthy();
        expect(schema.tree._id.type).toEqual("ObjectId");
        expect(schema.tree.embedded1).toBeTruthy();
    })

    test(`Schema with embedded array`, () => {
        let schema: any = sa.asSchema(s.mediumWithEmbeddedArrayEntity);
        expect(schema.tree).toBeTruthy();
        expect(schema.tree._id).toBeTruthy();
        expect(schema.tree._id.type).toEqual("ObjectId");
        expect(schema.tree.embedded1).toBeTruthy();
        expect(Array.isArray(schema.tree.embedded1)).toBeTruthy();
        expect(schema.tree.embedded1[0].tree.simpleEmbeddedName).toBeTruthy();
    })

    test(`Schema with 2 levels embedded`, () => {
        let schema: any = sa.asSchema(s.mediumWithTwoLevelsEmbeddedEntity);
        expect(schema.tree).toBeTruthy();
        expect(schema.tree._id).toBeTruthy();
        expect(schema.tree._id.type).toEqual("ObjectId");
        expect(schema.tree.embedded1).toBeTruthy();
        expect(schema.tree.embedded1.tree.secondLevel).toBeTruthy();
        expect(schema.tree.embedded1.tree.secondLevel.tree.simpleEmbeddedName).toBeTruthy();
    })

    test(`Complex Schema`, () => {
        let schema: any = sa.asSchema(s.complexEntity);
        expect(schema.tree).toBeTruthy();
        expect(schema.tree._id).toBeTruthy();
        expect(schema.tree._id.type).toEqual("ObjectId");
        expect(schema.tree.category).toBeTruthy();
        expect(schema.tree.category.type.name).toEqual("ObjectId");
        expect(Array.isArray(schema.tree.steps)).toBeTruthy();
        expect(schema.tree.steps[0].tree).toBeTruthy();
        expect(Array.isArray(schema.tree.steps[0].tree.embeddedArray21)).toBeTruthy();
        expect(schema.tree.steps[0].tree.embeddedArray21[0].type.name).toEqual("Number");
        expect(Array.isArray(schema.tree.steps[0].tree.embeddedArray22)).toBeTruthy();
        expect(schema.tree.steps[0].tree.embeddedArray22[0].tree._id).toBeUndefined();
        expect(schema.tree.steps[0].tree.embeddedArray22[0].tree.simpleEmbeddedName).toBeTruthy();
        expect(Array.isArray(schema.tree.steps[0].tree.embeddedArray23)).toBeTruthy();
        expect(schema.tree.steps[0].tree.embeddedArray23[0].tree._id).toBeUndefined();
        expect(schema.tree.steps[0].tree.embeddedArray23[0].tree.secondLevel).toBeTruthy();
        expect(schema.tree.steps[0].tree.embeddedArray23[0].tree.secondLevel.tree.simpleEmbeddedName).toBeTruthy();
    })

    test(`Simple Schema with Encrypted field`, () => {
        let schema: any = sa.asSchema(s.simpleWithEncryptedField);
        expect(schema.tree).toBeTruthy();
        expect(schema.tree._id).toBeTruthy();
        expect(schema.tree._id.type).toEqual("ObjectId");
        expect(schema.tree.notEnc).toBeTruthy();
        expect(schema.tree.notEnc.required).toBe(true);
        expect(schema.tree.notEnc.type.name).toEqual("String");
        expect(schema.tree.Enc).toBeTruthy();
        expect(schema.tree.Enc.type.name).toEqual("String");
        expect(schema.tree.Enc.required).toBe(true);
    })
})

describe("SchemaAdapter Class - asModel()", () => {

    let s: TestSchemas
    let sa: MongooseSchemaAdapter;

    beforeEach(() => {
        s = new TestSchemas();
        sa = new MongooseSchemaAdapter();
    })

    test(`Simple Schema`, () => {
        let m: AdapterModel = sa.asModel(s.refOne);
        expect(m.model).toBeTruthy();
        expect(m.populateSchema.length).toEqual(0);
    })

    test(`Medium 1 reference`, () => {
        let m: AdapterModel = sa.asModel(s.mediumWithSingleRef);
        expect(m.model).toBeTruthy();
        expect(m.populateSchema.length).toEqual(1);
        expect(m.populateSchema).toEqual([
            {
                path: "refonereference"
            }
        ]);
    })

    test(`Medium 1 reference with sub reference`, () => {
        let m: AdapterModel = sa.asModel(s.mediumWithSingleRefHavingSubRef);
        expect(m.model).toBeTruthy();
        expect(m.populateSchema.length).toEqual(2);
        expect(m.populateSchema).toEqual([
            {
                path: "refonereference",
            },
            {
                path: "reftworeference",
                populate: [
                    {
                        path: "refonefield"
                    }
                ]
            },
        ]);
    })

    test(`Complex 2 references plus embeded with a reference with a sub reference too!`, () => {
        let m: AdapterModel = sa.asModel(s.complexRefsPlusEmbeddedWithSubRefs)
        expect(m.model).toBeTruthy();
        expect(m.populateSchema).toEqual(
            [
                {
                    path: "embeddedwithsubrefs.refWithsubRef",
                    populate: [
                        {
                            path: "refonefield"
                        }
                    ]
                }, 
                {
                    path: "refonereference"
                }, 
                {
                    path: "reftworeference",
                    populate: [
                        {
                            path: "refonefield"
                        }
                    ]
                }
            ]);
    })

    test(`Simple Schema with encrypted field`, () => {
        let m: AdapterModel = sa.asModel(s.simpleWithEncryptedField);
        expect(m.model).toBeTruthy();
        expect(m.populateSchema.length).toEqual(0);
    })
})