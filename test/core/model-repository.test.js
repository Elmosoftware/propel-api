const mongoose = require("mongoose");
const { ModelRepository, EntityModel } = require("../../core/model-repository");

var m01NoRef = new EntityModel(mongoose.model("m01NoRef", mongoose.Schema({
    m01Field01: { type: String, required: true, unique: true },
    m01Field02: { type: Boolean, required: true }
}), "m01NoRefs"));

var m02With1Ref = new EntityModel(mongoose.model("m02With1Ref", mongoose.Schema({
    m02Field01: { type: String, required: true, unique: true },
    m02Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true }
}), "m02With1Refs"));

var m03With2Ref = new EntityModel(mongoose.model("m03With2Ref", mongoose.Schema({
    m03Field01: { type: String, required: true, unique: true },
    m03Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true },
    m03Field03: { type: mongoose.Schema.Types.ObjectId, ref: "m02With1Ref", required: true }
}), "m03With2Refs"));

var m04With1RefColl = new EntityModel(mongoose.model("m04With1RefColl", mongoose.Schema({
    m03Field01: { type: String, required: true, unique: true },
    m03Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true },
    m03Field03: { type: mongoose.Schema.Types.ObjectId, ref: "m02With1Ref", required: true },
    m04Field04: [{ type: mongoose.Schema.Types.ObjectId, ref: "m03With2Ref", required: true }],
}), "m04With1RefColls"));

var addressEmbeddedSchema = new mongoose.Schema({
    street: { type: String, required: true },
    city: { type: String, required: true }
},
    { _id: false });
mongoose.model("addressEmbeddedSchema", addressEmbeddedSchema)

var m05With1Emb = new EntityModel(mongoose.model("m05With1Emb", mongoose.Schema({
    m03Field01: { type: String, required: true, unique: true },
    m03Field02: { type: mongoose.Schema.Types.ObjectId, ref: "m01NoRef", required: true },
    m03Field03: { type: mongoose.Schema.Types.ObjectId, ref: "m02With1Ref", required: true },
    m04Field04: [{ type: mongoose.Schema.Types.ObjectId, ref: "m03With2Ref", required: true }],
    m05Field05: addressEmbeddedSchema,
    m05Field06: { type: String, required: true, unique: true, INTERNAL: true },
    m05Field07: { type: String, required: true, unique: true, INTERNAL: false }
}), "m05With1Embs"));

var repo = null;

describe("ModelRepository Class - Single Model with no refs", () => {

    let repo;

    beforeEach(() => {
        repo = new ModelRepository([
            m01NoRef
        ]);     
    })

    test(`ModelRepository.models returns 1 element"`, () => {
        expect(repo.models.length).toEqual(1);
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

    test(`ModelRepository.models returns 1 element"`, () => {
        expect(repo.models.length).toEqual(2);
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

    test(`ModelRepository.models returns 1 element"`, () => {
        expect(repo.models.length).toEqual(3);
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

    test(`ModelRepository.models returns 1 element"`, () => {
        expect(repo.models.length).toEqual(4);
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
            path: "m03Field02 m03Field03 m04Field04", 
            populate: {
                path: "m03Field02 m03Field03", 
                populate: {
                    path: "m02Field02"
                }
            }
        });
    })
})

describe("ModelRepository Class - Fifth models, 1 with 1 ref, 1 with 2 refs, 1 with a Collection of refs, 1 embedded", () => {

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
        expect(repo.models.length).toEqual(5);
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
            path: "m03Field02 m03Field03 m04Field04", 
            populate: {
                path: "m03Field02 m03Field03", 
                populate: {
                    path: "m02Field02"
                }
            }
        });
        expect(m5.populateSchema).toEqual({
            path: "m03Field02 m03Field03 m04Field04", 
            populate: {
                path: "m03Field02 m03Field03", 
                populate: {
                    path: "m02Field02"
                }
            }
        });
        expect(m5.internalFields).toEqual(["m05Field06"])
    })
})
