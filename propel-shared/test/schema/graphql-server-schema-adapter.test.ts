import { TestSchemas } from "../test-schemas";
import { SchemaRepository } from "../../schema/schema-repository";
import { GraphQLServerSchemaAdapter } from "../../schema/graphql-server-schema-adapter";

describe("GraphQLServerSchemaAdapter Class - getSchema()", () => {

	let s: TestSchemas;
    let repo: SchemaRepository;

    beforeEach(() => {
		s = new TestSchemas();
    })

    test(`Single Schema`, () => {
        repo = new SchemaRepository([
            s.refOne
		])
		let gql = new GraphQLServerSchemaAdapter(repo)
        let g: string = gql.getSchema()
        expect(repo.count).toEqual(1);
        expect(g).toEqual(
`input QueryModifier {
    top: Int
    skip: Int
    sortBy: String
    populate: Boolean
    filterBy: String
}
"""Sample reference #1"""
type RefOne {
"""Entity audit field."""
	anauditfield: String!
"""Ref#1 name."""
	refOneName: String!
}
input RefOneInput {
	refOneName: String!
}
type RefOneQueryResults {
	data: [RefOne!]!
	count: Int!
	totalCount: Int
}
type Queries {
	getRefOne(id: String!): RefOneQueryResults
	findRefOnes(q: QueryModifier): RefOneQueryResults
}
type Mutations {
	insertRefOne(doc: RefOneInput): ID!
	updateRefOne(doc: RefOneInput): ID!
	deleteRefOne(id: String!): ID!
}
schema {
	query: Queries
	mutation: Mutations
}`
        )
    })
    test(`Two schemas with reference field`, () => {
        repo = new SchemaRepository([
            s.refOne,
            s.refTwoWithRefOne
        ])
        let gql = new GraphQLServerSchemaAdapter(repo)
        let g: string = gql.getSchema()
        expect(repo.count).toEqual(2);
        expect(g).toEqual(
`input QueryModifier {
    top: Int
    skip: Int
    sortBy: String
    populate: Boolean
    filterBy: String
}
"""Sample reference #1"""
type RefOne {
"""Entity audit field."""
	anauditfield: String!
"""Ref#1 name."""
	refOneName: String!
}
input RefOneInput {
	refOneName: String!
}
type RefOneQueryResults {
	data: [RefOne!]!
	count: Int!
	totalCount: Int
}
"""Sample reference #1"""
type RefTwo {
"""Entity audit field."""
	anauditfield: String!
"""Ref#2 name."""
	refTwoName: String!
"""Reference to RefOne."""
	refonefield: RefOne!
}
input RefTwoInput {
	refTwoName: String!
	refonefield: ID!
}
type RefTwoQueryResults {
	data: [RefTwo!]!
	count: Int!
	totalCount: Int
}
type Queries {
	getRefOne(id: String!): RefOneQueryResults
	findRefOnes(q: QueryModifier): RefOneQueryResults
	getRefTwo(id: String!): RefTwoQueryResults
	findRefTwos(q: QueryModifier): RefTwoQueryResults
}
type Mutations {
	insertRefOne(doc: RefOneInput): ID!
	updateRefOne(doc: RefOneInput): ID!
	deleteRefOne(id: String!): ID!
	insertRefTwo(doc: RefTwoInput): ID!
	updateRefTwo(doc: RefTwoInput): ID!
	deleteRefTwo(id: String!): ID!
}
schema {
	query: Queries
	mutation: Mutations
}`
        )
    })
    test(`Medium Entity`, () => {
        repo = new SchemaRepository([
            s.mediumEntity
        ])
        let gql = new GraphQLServerSchemaAdapter(repo)
        let g: string = gql.getSchema()
        expect(g).toEqual(
`input QueryModifier {
    top: Int
    skip: Int
    sortBy: String
    populate: Boolean
    filterBy: String
}
"""Embedded entity here!"""
type MediumEmbedded1 {
"""simple embedded name."""
	simpleEmbeddedName: String!
}
input MediumEmbedded1Input {
	simpleEmbeddedName: String!
}
"""Medium Complexity"""
type Medium {
"""Entity audit field."""
	anauditfield: String!
"""Embedded entity here!"""
	embedded1: MediumEmbedded1
"""Medium Entity Name."""
	name: String!
}
input MediumInput {
	embedded1: MediumEmbedded1Input
	name: String!
}
type MediumQueryResults {
	data: [Medium!]!
	count: Int!
	totalCount: Int
}
type Queries {
	getMedium(id: String!): MediumQueryResults
	findMediums(q: QueryModifier): MediumQueryResults
}
type Mutations {
	insertMedium(doc: MediumInput): ID!
	updateMedium(doc: MediumInput): ID!
	deleteMedium(id: String!): ID!
}
schema {
	query: Queries
	mutation: Mutations
}`
        )
    })
    test(`Complex Entity`, () => {
        repo = new SchemaRepository([
            s.complexEntity
        ])
        let gql = new GraphQLServerSchemaAdapter(repo)
        let g: string = gql.getSchema()
        expect(g).toEqual(
`input QueryModifier {
    top: Int
    skip: Int
    sortBy: String
    populate: Boolean
    filterBy: String
}
"""Embedded simple as array!"""
type EmbeddedArrayTwoEmbeddedArray22 {
"""simple embedded name."""
	simpleEmbeddedName: String!
}
input EmbeddedArrayTwoEmbeddedArray22Input {
	simpleEmbeddedName: String!
}
"""second level embedded."""
type SimpleTwoLevelsEmbeddedSecondLevel {
"""simple embedded name."""
	simpleEmbeddedName: String!
}
input SimpleTwoLevelsEmbeddedSecondLevelInput {
	simpleEmbeddedName: String!
}
"""2 Levels Embedded as array!"""
type EmbeddedArrayTwoEmbeddedArray23 {
"""simple 2 levels embedded name."""
	name: String!
"""second level embedded."""
	secondLevel: SimpleTwoLevelsEmbeddedSecondLevel
}
input EmbeddedArrayTwoEmbeddedArray23Input {
	name: String!
	secondLevel: SimpleTwoLevelsEmbeddedSecondLevelInput
}
""""""
type ComplexEntitySteps {
"""Embedded as a number array!"""
	embeddedArray21: [Int]!
"""Embedded simple as array!"""
	embeddedArray22: [EmbeddedArrayTwoEmbeddedArray22]!
"""2 Levels Embedded as array!"""
	embeddedArray23: [EmbeddedArrayTwoEmbeddedArray23]!
"""is enabled."""
	enabled: Boolean!
"""embedded array level 2 name."""
	name: String!
"""Array of "refOnes"!"""
	refOneArray: [RefOne]!
}
input ComplexEntityStepsInput {
	embeddedArray21: [Int]!
	embeddedArray22: [EmbeddedArrayTwoEmbeddedArray22Input]!
	embeddedArray23: [EmbeddedArrayTwoEmbeddedArray23Input]!
	enabled: Boolean!
	name: String!
	refOneArray: [ID]!
}
"""Main Entity"""
type ComplexEntity {
""""""
	MyNumber: Int
"""Entity audit field."""
	anauditfield: String!
""""""
	category: RefOne!
""""""
	embeddedArray1: [String!]!
""""""
	name: String!
""""""
	steps: [ComplexEntitySteps]!
}
input ComplexEntityInput {
	MyNumber: Int
	category: ID!
	embeddedArray1: [String!]!
	name: String!
	steps: [ComplexEntityStepsInput]!
}
type ComplexEntityQueryResults {
	data: [ComplexEntity!]!
	count: Int!
	totalCount: Int
}
type Queries {
	getComplexEntity(id: String!): ComplexEntityQueryResults
	findComplexEntities(q: QueryModifier): ComplexEntityQueryResults
}
type Mutations {
	insertComplexEntity(doc: ComplexEntityInput): ID!
	updateComplexEntity(doc: ComplexEntityInput): ID!
	deleteComplexEntity(id: String!): ID!
}
schema {
	query: Queries
	mutation: Mutations
}`
        )
    })
})
