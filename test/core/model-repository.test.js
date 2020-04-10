const mongoose = require("mongoose");
const ModelRepository = require("../../core/model-repository");

var m01NoRef = mongoose.model("m01NoRef", mongoose.Schema({
    m01Field01: { type: String, required: true, unique: true },
    m01Field02: { type: Boolean, required: true }
}), "m01NoRefs");

var m02With1Ref = mongoose.model("m02With1Ref", mongoose.Schema({
    m02Field01: { type: String, required: true, unique: true },
    m02Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true }
}), "m02With1Refs");

var m03With2Ref = mongoose.model("m03With2Ref", mongoose.Schema({
    m03Field01: { type: String, required: true, unique: true },
    m03Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true },
    m03Field03: { type: mongoose.Schema.Types.ObjectId, ref: "m02With1Ref", required: true }
}), "m03With2Refs");

var m04With1RefColl = mongoose.model("m04With1RefColl", mongoose.Schema({
    m04Field01: { type: String, required: true, unique: true },
    m04Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true },
    m04Field03: { type: mongoose.Schema.Types.ObjectId, ref: "m02With1Ref", required: true },
    m04Field04: [{ type: mongoose.Schema.Types.ObjectId, ref: "m03With2Ref", required: true }],
}), "m04With1RefColls");

var addressEmbeddedSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true }
},
    { _id: false });
mongoose.model("addressEmbeddedSchema", addressEmbeddedSchema)

var nestedSchema = new mongoose.Schema({
    nested01: { type: Number, required: true, unique: true },
    nested02: { type: Boolean, required: false },
},
    { _id: false });
mongoose.model("nestedSchema", nestedSchema)

var doubleEmbeddedSchema = new mongoose.Schema({
    doubleEmbedded01: { type: String, required: true },
    doubleEmbedded02: { type: Date, required: false },
    doubleEmbedded03: nestedSchema
},
    { _id: false });
mongoose.model("doubleEmbeddedSchema", doubleEmbeddedSchema)

var m05With1Emb = mongoose.model("m05With1Emb", mongoose.Schema({
    m05Field01: { type: String, required: true, unique: true },
    m05Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true },
    m05Field03: { type: mongoose.Schema.Types.ObjectId, ref: "m02With1Ref", required: true },
    m05Field04: [{ type: mongoose.Schema.Types.ObjectId, ref: "m03With2Ref", required: true }],
    m05Field05: addressEmbeddedSchema,
    m05Field06: [addressEmbeddedSchema],
    m05Field07: { type: String, required: true, unique: true, INTERNAL: true },
    m05Field08: { type: String, required: true, unique: true, INTERNAL: false },
    m05Field09: { type: Boolean },
    m05Field10: { type: mongoose.Schema.Types.Decimal128, required: false, AUDIT: true },
    m05Field11: { type: Date, required: true },
    m05Field12: doubleEmbeddedSchema
}), "m05With1Embs");

function getGraphQLTypeByName(types, nameToFind) {
    return types.find((type) => {
        return String(type).indexOf(`${nameToFind} {`) != -1;
    })
}

function getGraphQLQueriesAndMutationsByTypeName(qorms, typeNameToFind) {
    return qorms.filter((qorm) => {
        return String(qorm).indexOf(typeNameToFind) != -1;
    })
}

var repo = null;

describe("ModelRepository Class - Single Model with no refs", () => {

    let repo;

    beforeEach(() => {
        repo = new ModelRepository([
            m01NoRef
        ]);
    })

    test(`ModelRepository.models returns 1 element"`, () => {
        expect(repo.count).toEqual(1);
    })
    test(`ModelRepository.getModelByName() model is correct"`, () => {
        let m1 = repo.getModelByName("m01NoRef");
        expect(m1.populateSchema).toBe("");
    })
})

describe("ModelRepository Class - Two models, One with 1 ref", () => {

    beforeAll(() => {
        repo = new ModelRepository([
            m01NoRef,
            m02With1Ref
        ]);
    })

    test(`ModelRepository.models returns 2 elements"`, () => {
        expect(repo.count).toEqual(2);
    })
    test(`ModelRepository.getModelByName() model is correct"`, () => {
        let m1 = repo.getModelByName("m01NoRef");
        let m2 = repo.getModelByName("m02With1Ref");

        expect(m1.populateSchema).toBe("");
        expect(m2.populateSchema).toEqual({
            path: "m02Field02"
        });
    })
})

describe("ModelRepository Class - Three models, 1 with 1 ref, 1 with 2 refs", () => {

    beforeAll(() => {
        repo = new ModelRepository([
            m01NoRef,
            m02With1Ref,
            m03With2Ref
        ]);
    })

    test(`ModelRepository.models returns 3 elements"`, () => {
        expect(repo.count).toEqual(3);
    })
    test(`ModelRepository.getModelByName() model is correct"`, () => {
        let m1 = repo.getModelByName("m01NoRef");
        let m2 = repo.getModelByName("m02With1Ref");
        let m3 = repo.getModelByName("m03With2Ref");

        expect(m1.populateSchema).toBe("");
        expect(m2.populateSchema).toEqual({
            path: "m02Field02"
        });
        expect(m3.populateSchema).toEqual({
            path: "m03Field02 m03Field03",
            populate: {
                path: "m02Field02"
            }
        });
    })
})

describe("ModelRepository Class - Fourth models, 1 with 1 ref, 1 with 2 refs, 1 with a Collection of refs", () => {

    beforeAll(() => {
        repo = new ModelRepository([
            m01NoRef,
            m02With1Ref,
            m03With2Ref,
            m04With1RefColl
        ]);
    })

    test(`ModelRepository.models returns 4 elements"`, () => {
        expect(repo.count).toEqual(4);
    })
    test(`ModelRepository.getModelByName() model is correct"`, () => {
        let m1 = repo.getModelByName("m01NoRef");
        let m2 = repo.getModelByName("m02With1Ref");
        let m3 = repo.getModelByName("m03With2Ref");
        let m4 = repo.getModelByName("m04With1RefColl");

        expect(m1.populateSchema).toBe("");
        expect(m2.populateSchema).toEqual({
            path: "m02Field02"
        });
        expect(m3.populateSchema).toEqual({
            path: "m03Field02 m03Field03",
            populate: {
                path: "m02Field02"
            }
        });
        expect(m4.populateSchema).toEqual({
            path: "m04Field02 m04Field03 m04Field04",
            populate: {
                path: "m03Field02 m03Field03",
                populate: {
                    path: "m02Field02"
                }
            }
        });
    })
})

describe("ModelRepository Class - Fifth models, 1 with 1 ref, 1 with 2 refs, 1 with a Collection of refs, 2 embedded", () => {

    beforeAll(() => {
        repo = new ModelRepository([
            m01NoRef,
            m02With1Ref,
            m03With2Ref,
            m04With1RefColl,
            m05With1Emb
        ]);
    })

    test(`ModelRepository.models returns 1 element"`, () => {
        expect(repo.count).toEqual(5);
    })
    test(`ModelRepository.getModelByName() model is correct"`, () => {
        let m1 = repo.getModelByName("m01NoRef");
        let m2 = repo.getModelByName("m02With1Ref");
        let m3 = repo.getModelByName("m03With2Ref");
        let m4 = repo.getModelByName("m04With1RefColl");
        let m5 = repo.getModelByName("m05With1Emb");

        expect(m1.populateSchema).toBe("");
        expect(m2.populateSchema).toEqual({
            path: "m02Field02"
        });
        expect(m3.populateSchema).toEqual({
            path: "m03Field02 m03Field03",
            populate: {
                path: "m02Field02"
            }
        });
        expect(m4.populateSchema).toEqual({
            path: "m04Field02 m04Field03 m04Field04",
            populate: {
                path: "m03Field02 m03Field03",
                populate: {
                    path: "m02Field02"
                }
            }
        });
        expect(m5.populateSchema).toEqual({
            path: "m05Field02 m05Field03 m05Field04",
            populate: {
                path: "m03Field02 m03Field03",
                populate: {
                    path: "m02Field02"
                }
            }
        });
        expect(m5.internalFields).toEqual(["m05Field07"])
    })
})

describe("ModelRepository Class - Fifth models, 1 with 1 ref, 1 with 2 refs, 1 with a Collection of refs, 2 embedded", () => {

    beforeAll(() => {
        repo = new ModelRepository([
            m01NoRef,
            m02With1Ref,
            m03With2Ref,
            m04With1RefColl,
            m05With1Emb
        ]);
    })

    test(`ModelRepository.getFieldDefinition() built correctly for Scalar type"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("m05Field01");

        expect(f.name).toEqual("m05Field01");
        expect(f.isArray).toEqual(false);
        expect(f.isScalar).toEqual(true);
        expect(f.isEmbedded).toEqual(false);
        expect(f.isReference).toEqual(false);
        expect(f.embeddedSchema).toBe(null);
        expect(f.referenceName).toEqual("");
        expect(f.isRequired).toEqual(true);
        expect(f.isInternal).toEqual(false);
        expect(f.type).toEqual("String");
        expect(f.graphQLType).toEqual("String");
    })
    test(`ModelRepository.getFieldDefinition() built correctly for Reference type"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("m05Field02");

        expect(f.name).toEqual("m05Field02");
        expect(f.isArray).toEqual(false);
        expect(f.isScalar).toEqual(true);
        expect(f.isEmbedded).toEqual(false);
        expect(f.isReference).toEqual(true);
        expect(f.embeddedSchema).toBe(null);
        expect(f.referenceName).toEqual("m01NoRef");
        expect(f.isRequired).toEqual(true);
        expect(f.isInternal).toEqual(false);
        expect(f.type).toEqual("M01NoRef");
        expect(f.graphQLType).toEqual("M01NoRef");
    })
    test(`ModelRepository.getFieldDefinition() built correctly for Embedded types"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("m05Field05");

        expect(f.name).toEqual("m05Field05");
        expect(f.isArray).toEqual(false);
        expect(f.isScalar).toEqual(false);
        expect(f.isEmbedded).toEqual(true);
        expect(f.isReference).toEqual(false);
        expect(f.embeddedSchema).not.toBe(null);
        expect(f.referenceName).toEqual("");
        expect(f.isRequired).toEqual(false);
        expect(f.isInternal).toEqual(false);
        expect(f.type).toBe(null);
        expect(f.graphQLType).toBe(null);
    })
    test(`ModelRepository.getFieldDefinition() built correctly for Array of Embedded types"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("m05Field06");

        expect(f.name).toEqual("m05Field06");
        expect(f.isArray).toEqual(true);
        expect(f.isScalar).toEqual(false);
        expect(f.isEmbedded).toEqual(true);
        expect(f.isReference).toEqual(false);
        expect(f.embeddedSchema).not.toBe(null);
        expect(f.referenceName).toEqual("");
        expect(f.isRequired).toEqual(false);
        expect(f.isInternal).toEqual(false);
        expect(f.type).toBe(null);
        expect(f.graphQLType).toBe(null);
    })
    test(`ModelRepository.getFieldDefinition() built correctly for nested embedded schemas"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("m05Field12");

        expect(f.name).toEqual("m05Field12");
        expect(f.isEmbedded).toBe(true);
        expect(f.isAuto).toEqual(false);
        expect(f.isUniqueIdentifier).toEqual(false);

        //Inspecting embedded schema fields:
        let emb1 = f.embeddedSchema;

        expect(emb1.length).toEqual(4);
        expect(emb1[3].name).toEqual("doubleEmbedded03");
        expect(emb1[3].isEmbedded).toBe(true);
        expect(emb1[3].isAuto).toEqual(false);
        expect(emb1[3].isUniqueIdentifier).toEqual(false);

        //Inspecting nested embedded schema fields:
        let emb2 = emb1[3].embeddedSchema;

        expect(emb2.length).toEqual(3);
        expect(emb2[1].name).toEqual("nested01");
        expect(emb2[1].isEmbedded).toBe(false);
        expect(emb2[1].isAuto).toEqual(false);
        expect(emb2[1].isUniqueIdentifier).toEqual(false);
    })
    test(`ModelRepository.getFieldDefinition() built correctly for "_id" field"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("_id");

        expect(f.name).toEqual("_id");
        expect(f.isArray).toEqual(false);
        expect(f.isScalar).toEqual(true);
        expect(f.isAuto).toEqual(true);
        expect(f.isUniqueIdentifier).toEqual(true);
        expect(f.isEmbedded).toEqual(false);
        expect(f.isReference).toEqual(false);
        expect(f.embeddedSchema).toBe(null);
        expect(f.referenceName).toEqual("");
        expect(f.isRequired).toEqual(true);
        expect(f.isInternal).toEqual(false);
        expect(f.type).toBe("ObjectID");
        expect(f.graphQLType).toBe("ID");
    })
    test(`ModelRepository.getFieldDefinition() built correctly for an AUDIT field"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("m05Field10");

        expect(f.name).toEqual("m05Field10");
        expect(f.isAudit).toEqual(true);
    })
    test(`ModelRepository.getFieldDefinition() is not including "id" virtual type."`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let f = m5.getFieldDefinition("id");

        expect(f).toBe(undefined);
    })
})

describe("ModelRepository Class - Parse GraphQL schema", () => {

    let repo;

    beforeEach(() => {
        repo = new ModelRepository([
            m01NoRef,
            m02With1Ref,
            m03With2Ref,
            m04With1RefColl,
            m05With1Emb
        ]);
    })

    test(`Types in Model with no refs`, () => {

        let m1 = repo.getModelByName("m01NoRef");
        let schemaM1 = getGraphQLTypeByName(m1.getGraphQLTypes(), "M01NoRef");

        expect(schemaM1).toContain("type M01NoRef {");
        expect(schemaM1).toContain("m01Field01: String!");
        expect(schemaM1).toContain("m01Field02: Boolean!");
        expect(schemaM1).toContain("_id: ID!");
    })

    test(`Types in Model with references"`, () => {

        let m2 = repo.getModelByName("m02With1Ref");
        let schemaM2 = getGraphQLTypeByName(m2.getGraphQLTypes(), "M02With1Ref");

        expect(schemaM2).toContain("type M02With1Ref {");
        expect(schemaM2).toContain("m02Field01: String!");
        expect(schemaM2).toContain("m02Field02: M01NoRef!");
        expect(schemaM2).toContain("_id: ID!");
    })

    test(`Types in Model with embedded types"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let schemaM5 = getGraphQLTypeByName(m5.getGraphQLTypes(), "M05With1EmbInput");
        
        expect(schemaM5).toContain("input M05With1EmbInput {");
        expect(schemaM5).toContain("_id: ID!");
        expect(schemaM5).toContain("m05Field04: [ID!]!");

        schemaM5 = getGraphQLTypeByName(m5.getGraphQLTypes(), "M05With1EmbM05Field12DoubleEmbedded03");
        expect(schemaM5).toContain("type M05With1EmbM05Field12DoubleEmbedded03 {");
        expect(schemaM5).toContain("nested01: Int!");
        expect(schemaM5).toContain("nested02: Boolean");

        schemaM5 = getGraphQLTypeByName(m5.getGraphQLTypes(), "M05With1EmbM05Field12");
        expect(schemaM5).toContain("type M05With1EmbM05Field12 {");
        expect(schemaM5).toContain("doubleEmbedded03: M05With1EmbDoubleEmbedded03");

        schemaM5 = getGraphQLTypeByName(m5.getGraphQLTypes(), "M05With1Emb");
        expect(schemaM5).toContain("type M05With1Emb {");
        expect(schemaM5).toContain("m05Field04: [M03With2Ref!]!");
        expect(schemaM5).toContain("m05Field05: M05With1EmbM05Field05");
        expect(schemaM5).toContain("m05Field06: [M05With1EmbM05Field06]!");
        expect(schemaM5).toContain("m05Field12: M05With1EmbM05Field12");
    })

    test(`Queries in Model with embedded types"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let queries = getGraphQLQueriesAndMutationsByTypeName(m5.getGraphQLQueries(), "M05With1Emb");
        
        expect(queries.length).toEqual(2);
        expect(queries[0]).toContain("getM05With1Emb");
        expect(queries[1]).toContain("findM05With1Emb");
    })

    test(`Mutations in Model with embedded types"`, () => {
        let m5 = repo.getModelByName("m05With1Emb");
        let queries = getGraphQLQueriesAndMutationsByTypeName(m5.getGraphQLMutations(), "M05With1Emb");
        
        expect(queries.length).toEqual(3);
        expect(queries[0]).toContain("insertM05With1Emb");
        expect(queries[1]).toContain("updateM05With1Emb");
        expect(queries[2]).toContain("deleteM05With1Emb");
    })

    test(`Full GraqhQL model"`, () => {
        let schema = repo.getGraphQLSchema();
        
        expect(schema).not.toBeFalsy();
        expect(schema).toContain("input M01NoRefInput {");
        expect(schema).toContain("input M02With1RefInput {");
        expect(schema).toContain("input M03With2RefInput {");
        expect(schema).toContain("input M04With1RefCollInput {");
        expect(schema).toContain("input M05With1EmbInput {");
        expect(schema).toContain("type M01NoRef {");
        expect(schema).toContain("type M02With1Ref {");
        expect(schema).toContain("type M03With2Ref {");
        expect(schema).toContain("type M04With1RefColl {");
        expect(schema).toContain("type M05With1Emb {");
        expect(schema).toContain("type M01NoRefQueryResults {");
        expect(schema).toContain("type M02With1RefQueryResults {");
        expect(schema).toContain("type M03With2RefQueryResults {");
        expect(schema).toContain("type M04With1RefCollQueryResults {");
        expect(schema).toContain("type M05With1EmbQueryResults {");
        expect(schema).toContain("type M05With1EmbQueryResults {");
        
        expect(schema).toContain("type Queries {");
        expect(schema).toContain("getM01NoRef(");
        expect(schema).toContain("getM02With1Ref(");
        expect(schema).toContain("getM03With2Ref(");
        expect(schema).toContain("getM04With1RefColl(");
        expect(schema).toContain("getM05With1Emb(");
        expect(schema).toContain("getM05With1Emb(");
        expect(schema).toContain("findM01NoRefs(");
        expect(schema).toContain("findM02With1Refs(");
        expect(schema).toContain("findM03With2Refs(");
        expect(schema).toContain("findM04With1RefColls(");
        expect(schema).toContain("findM05With1Embs(");
        expect(schema).toContain("findM05With1Embs(");

        expect(schema).toContain("type Mutations {");
        expect(schema).toContain("insertM01NoRef(");
        expect(schema).toContain("insertM02With1Ref(");
        expect(schema).toContain("insertM03With2Ref(");
        expect(schema).toContain("insertM04With1RefColl(");
        expect(schema).toContain("insertM05With1Emb(");
        expect(schema).toContain("insertM05With1Emb(");
        expect(schema).toContain("updateM01NoRef(");
        expect(schema).toContain("updateM02With1Ref(");
        expect(schema).toContain("updateM03With2Ref(");
        expect(schema).toContain("updateM04With1RefColl(");
        expect(schema).toContain("updateM05With1Emb(");
        expect(schema).toContain("updateM05With1Emb(");
        expect(schema).toContain("deleteM01NoRef(");
        expect(schema).toContain("deleteM02With1Ref(");
        expect(schema).toContain("deleteM03With2Ref(");
        expect(schema).toContain("deleteM04With1RefColl(");
        expect(schema).toContain("deleteM05With1Emb(");
        expect(schema).toContain("deleteM05With1Emb(");
    })
})