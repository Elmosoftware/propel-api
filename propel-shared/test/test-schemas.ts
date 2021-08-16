import { SchemaDefinition } from "../schema/schema-definition";
import { SchemaField } from "../schema/schema-field";

export class TestSchemas {

    //#region Refs & Embedds

    get refOne(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("RefOne", "RefOnes", true)
            .setFields([
                new SchemaField("refOneName", `Ref#1 name.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    })
            ])
            .merge(this.entity)
            .setDescription("Sample reference #1")
            .freeze();
    }

    get refTwoWithRefOne(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("RefTwo", "RefTwos", true)
            .setFields([
                new SchemaField("refTwoName", `Ref#2 name.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("refonefield", `Reference to RefOne.`,
                    {
                        type: this.refOne,
                        isRequired: true
                    })
            ])
            .merge(this.entity)
            .setDescription("Sample reference #1")
            .freeze();
    }

    get simpleEmbedded(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("SimpleEmbedded", "SimpleEmbeddeds", false)
            .setFields([
                new SchemaField("simpleEmbeddedName", `simple embedded name.`,
                    {
                        type: String,
                        isRequired: true
                    })
            ])
            .setDescription("Simple embedded")
            .freeze();
    }

    get simpleTwoLevelsEmbedded(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("SimpleTwoLevelsEmbedded", "SimpleTwoLevelsEmbedded", false)
            .setFields([
                new SchemaField("name", `simple 2 levels embedded name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("secondLevel", `second level embedded.`,
                    {
                        type: this.simpleEmbedded
                    })
            ])
            .setDescription("Simple 2 levels embedded")
            .freeze();
    }

    get mediumMixedEmbeddedwithRef(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("MediumMixedEmbeddedwithRef", "MediumMixedEmbeddedwithRefs", false)
            .setFields([
                new SchemaField("simpleTwoLevelsEmbeddedName", `simple 2 levels embedded name.`,
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("refWithsubRef", `Second and Third level too!`,
                    {
                        type: this.refTwoWithRefOne
                    })
            ])
            .setDescription("Medium 3 level embedded!!!")
            .freeze();
    }

    //#endregion

    get entity(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Entity", "Entities", true)
            .setFields([
                new SchemaField("entityInternal", `Entity internal field.`,
                    {
                        type: String,
                        isRequired: true,
                        isInternal: true
                    }),
                new SchemaField("anauditfield", `Entity audit field.`,
                    {
                        type: Date,
                        isRequired: true,
                        isAudit: true
                    })
            ])
            .setDescription("Our base entity schema definition.")
            .freeze();
    }

    get mediumEntity(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("Medium", "Mediums", true)
            .setFields([
                new SchemaField("name", `Medium Entity Name.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("embedded1", `Embedded entity here!`,
                    {
                        type: this.simpleEmbedded,
                    })
            ])
            .merge(this.entity)
            .setDescription("Medium Complexity")
            .freeze();
    }

    get mediumWithEmbeddedArrayEntity(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("MediumWithEmbeddedArrayEntity", "mediumWithEmbeddedArrayEntities", true)
            .merge(this.entity)
            .setFields([
                new SchemaField("name", `mediumWithEmbeddedArrayEntity name`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("embedded1", `Embedded entity as array now!`,
                    {
                        type: this.simpleEmbedded,
                        isArray: true
                    })
            ])
            .setDescription("Medium with embeded array Complexity")
            .freeze();
    }

    get mediumWithTwoLevelsEmbeddedEntity(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("MediumWithTwoLevelsEmbeddedEntity", "MediumWithTwoLevelsEmbeddedEntities", true)
            .setFields([
                new SchemaField("name", `mediumWithTwoLevelsEmbeddedEntity name.`,
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("embedded1", `Embedded and another below hierachy too!`,
                    {
                        type: this.simpleTwoLevelsEmbedded,
                    })
            ])
            .merge(this.entity)
            .setDescription("Medium with with 2 levels embedded Entity")
            .freeze()
    }

    get complexEntity(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ComplexEntity", "ComplexEntities", true)
            .merge(this.entity)
            .setFields([
                new SchemaField("name", "",
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("MyNumber", "",
                    {
                        type: Number
                    }
                ),
                new SchemaField("embeddedArray1", "",
                    {
                        type: String,
                        isRequired: true,
                        isArray: true
                    }),
                new SchemaField("category", "",
                    {
                        type: this.refOne,
                        isRequired: true
                    }),
                new SchemaField("steps", "",
                    {
                        type: this.embeddedArray2,
                        isArray: true
                    })
            ])
            .setDescription("Main Entity")
            .freeze();
    }

    get embeddedArray2(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("EmbeddedArrayTwo", "EmbeddedArrayTwos", false)
            .setFields([
                new SchemaField("name", `embedded array level 2 name.`,
                    {
                        type: String,
                        isRequired: true,
                    }),
                new SchemaField("enabled", `is enabled.`,
                    {
                        type: Boolean,
                        isRequired: true,
                    }),
                new SchemaField("embeddedArray21", `Embedded as a number array!`,
                    {
                        type: Number,
                        isArray: true
                    }),
                new SchemaField("embeddedArray22", `Embedded simple as array!`,
                    {
                        type: this.simpleEmbedded,
                        isArray: true
                    }),
                new SchemaField("embeddedArray23", `2 Levels Embedded as array!`,
                    {
                        type: this.simpleTwoLevelsEmbedded,
                        isArray: true
                    }),
                new SchemaField("refOneArray", `Array of "refOnes"!`,
                    {
                        type: this.refOne,
                        isArray: true
                    })
            ])
            .setDescription("Embedded array 2")
            .freeze();
    }

    get mediumWithSingleRef(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("MediumWithSingleRef", "MediumWithSingleRefs", true)
            .merge(this.entity)
            .setFields([
                new SchemaField("name", "",
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("refonereference", "",
                    {
                        type: this.refOne,
                        isRequired: true
                    }),
                new SchemaField("notforpopulate", "",
                    {
                        type: this.simpleEmbedded,
                        isArray: true
                    })
            ])
            .setDescription("Medium with single ref")
            .freeze();
    }

    get mediumWithSingleRefHavingSubRef(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("MediumWithSingleRefHavingSubRef", "MediumWithSingleRefHavingSubRefs", true)
            .merge(this.entity)
            .setFields([
                new SchemaField("name", "",
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("refonereference", "",
                    {
                        type: this.refOne,
                        isRequired: true
                    }),
                new SchemaField("reftworeference", "",
                    {
                        type: this.refTwoWithRefOne,
                        isArray: true
                    })
            ])
            .setDescription("Medium with single ref and another ref with sub reference")
            .freeze();
    }

    get complexRefsPlusEmbeddedWithSubRefs(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("ComplexRefsPlusEmbeddedWithSubRefs", "ComplexRefsPlusEmbeddedWithSubRefs", true)
            .merge(this.entity)
            .setFields([
                new SchemaField("name", "",
                    {
                        type: String,
                        isRequired: true,
                        isUnique: true
                    }),
                new SchemaField("refonereference", "",
                    {
                        type: this.refOne,
                        isRequired: true
                    }),
                new SchemaField("reftworeference", "",
                    {
                        type: this.refTwoWithRefOne,
                        isArray: true
                    }),
                new SchemaField("embeddedwithsubrefs", "Amazing complexity here!",
                    {
                        type: this.mediumMixedEmbeddedwithRef,
                        isArray: true
                    }),
            ])
            .setDescription("Super complex 2 refs plus an embedded with sub refs")
            .freeze();
    }

    get simpleWithEncryptedField(): Readonly<SchemaDefinition> {

        return new SchemaDefinition("SimpleWithEncryptedField", "SimpleWithEncryptedFields", true)
            .merge(this.entity)
            .setFields([
                new SchemaField("notEnc", "",
                    {
                        type: String,
                        isRequired: true
                    }),
                new SchemaField("Enc", "",
                    {
                        type: String,
                        isRequired: true,
                        mustBeEncripted: true
                    })
            ])
            .setDescription("Simple with an encrypted field.")
            .freeze();
    }
}