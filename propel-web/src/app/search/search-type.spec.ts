import { DataEntity } from "src/services/data.service";
import { SearchType, SearchTypeDefinition, DEFAULT_SEARCH_TYPE } from "./search-type";

describe("SearchTypeDefinition Class", () => {
    describe("getFullTextFields()", () => {
        it(`For searchType = SearchType.Workflows -> ["name", "description"]`, () => {
            expect(SearchTypeDefinition.getFullTextFields(SearchType.Workflows)).toEqual(["name", "description"]);
        });        
        it(`For searchType = SearchType.Scripts -> ["name", "description"]`, () => {
            expect(SearchTypeDefinition.getFullTextFields(SearchType.Scripts)).toEqual(["name", "description"]);
        });        
        it(`For searchType = SearchType.Targets -> ["friendlyName", "description"]`, () => {
            expect(SearchTypeDefinition.getFullTextFields(SearchType.Targets)).toEqual(["friendlyName", "description"]);
        });        
        it(`For searchType = SearchType.Credentials -> ["name", "description"]`, () => {
            expect(SearchTypeDefinition.getFullTextFields(SearchType.Credentials)).toEqual(["name", "description"]);
        });        
        it(`For searchType = SearchType.UserAccounts -> ["name", "description"]`, () => {
            expect(SearchTypeDefinition.getFullTextFields(SearchType.UserAccounts)).toEqual(["fullName", "name", "email"]);
        });        
    });
    describe("getDataEntity()", () => {
        it(`For searchType = SearchType.Workflows -> DataEntity.Workflow`, () => {
            expect(SearchTypeDefinition.getDataEntity(SearchType.Workflows)).toEqual(DataEntity.Workflow);
        });        
        it(`For searchType = SearchType.Scripts -> DataEntity.Script`, () => {
            expect(SearchTypeDefinition.getDataEntity(SearchType.Scripts)).toEqual(DataEntity.Script);
        });        
        it(`For searchType = SearchType.Targets -> DataEntity.Target`, () => {
            expect(SearchTypeDefinition.getDataEntity(SearchType.Targets)).toEqual(DataEntity.Target);
        });        
        it(`For searchType = SearchType.Credentials -> DataEntity.Credential`, () => {
            expect(SearchTypeDefinition.getDataEntity(SearchType.Credentials)).toEqual(DataEntity.Credential);
        });        
        it(`For searchType = SearchType.UserAccounts -> DataEntity.UserAccount`, () => {
            expect(SearchTypeDefinition.getDataEntity(SearchType.UserAccounts)).toEqual(DataEntity.UserAccount);
        });        
    });
    describe("getDefaultSort()", () => {
        it(`For searchType = SearchType.Workflows -> "name"`, () => {
            expect(SearchTypeDefinition.getDefaultSort(SearchType.Workflows)).toEqual("name");
        });        
        it(`For searchType = SearchType.Scripts -> "name"`, () => {
            expect(SearchTypeDefinition.getDefaultSort(SearchType.Scripts)).toEqual("name");
        });        
        it(`For searchType = SearchType.Targets -> "friendlyName"`, () => {
            expect(SearchTypeDefinition.getDefaultSort(SearchType.Targets)).toEqual("friendlyName");
        });        
        it(`For searchType = SearchType.Credentials -> "name"`, () => {
            expect(SearchTypeDefinition.getDefaultSort(SearchType.Credentials)).toEqual("name");
        });        
        it(`For searchType = SearchType.UserAccounts -> "name"`, () => {
            expect(SearchTypeDefinition.getDefaultSort(SearchType.UserAccounts)).toEqual("name");
        });        
    });
});