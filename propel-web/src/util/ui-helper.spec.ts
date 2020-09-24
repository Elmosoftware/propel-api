import { UIHelper } from "./ui-helper";

describe("UIHelper Class", () => {

    describe("tokenizeAndStem()", () => {
        it("For s = null -> []", () => {
            expect(UIHelper.tokenizeAndStem(null)).toEqual([]);
        });
        it("For s = undefined -> []", () => {
            expect(UIHelper.tokenizeAndStem(undefined)).toEqual([]);
        });
        it("For s = {any number} -> []", () => {
            //@ts-ignore
            expect(UIHelper.tokenizeAndStem(345)).toEqual([]);
        });
        it(`For s = "a b c" -> []`, () => {
            //@ts-ignore
            expect(UIHelper.tokenizeAndStem("a b c")).toEqual([]);
        });
        it(`For s = "ab c" -> ["ab"]`, () => {
            expect(UIHelper.tokenizeAndStem("ab c"))
                .toEqual(["ab"]);
        });
        it(`For s = "abc" -> ["abc"]`, () => {
            expect(UIHelper.tokenizeAndStem("abc"))
                .toEqual(["abc"]);
        });
        it(`For s = "-abc" -> ["-abc"]`, () => {
            expect(UIHelper.tokenizeAndStem("-abc"))
                .toEqual(["-abc"]);
        });
        it(`For s = "'d a" -> ['d]`, () => {
            expect(UIHelper.tokenizeAndStem("'d"))
                .toEqual(["'d"]);
        });
        it(`For s = "'d'" -> ['d']`, () => {
            expect(UIHelper.tokenizeAndStem("'d'"))
                .toEqual(["'d'"]);
        });
        it(`For s = ""d"" -> ["d"]`, () => {
            expect(UIHelper.tokenizeAndStem("\"d\""))
                .toEqual(["\"d\""]);
        });
        it(`For s = "This is another day in paradise" -> ["day", "paradis"]`, () => {
            expect(UIHelper.tokenizeAndStem("This is another day in paradise"))
                .toEqual(["day", "paradis"]);
        });
        it(`For s = "RT4567 in Octopus Jupiterian" -> ["RT4567", "Octopus", "Jupiterian"]`, () => {
            expect(UIHelper.tokenizeAndStem("RT4567 in Octopus Jupiterian"))
                .toEqual(["RT4567", "octopu", "Jupiterian"]);
        });
        it(`For s = "The coming future -bright -shine" -> ['come', 'futur', '-bright', '-shine']`, () => {
            expect(UIHelper.tokenizeAndStem("The coming future -bright -shine"))
                .toEqual(['come', 'futur', '-bright', '-shine']);
        });
        it(`For s = "-The broadcast # broadcaster. $ is broadcasting. a handwrote piece. of % handwritten art form" -> ['-The', 'broadcast', 'broadcaster.', 'broadcasting.', 'handwrot', 'piece.', 'handwritten', 'art', 'form']`, () => {
            expect(UIHelper.tokenizeAndStem("-The broadcast # broadcaster. $ is broadcasting. a handwrote piece. of % handwritten art form"))
                .toEqual(['-The', 'broadcast', 'broadcaster.', 'broadcasting.', 'handwrot', 'piece.', 'handwritten', 'art', 'form']);
        });
    });

    describe("highlighText()", () => {
        

        let text: string;

        beforeEach(() => {
            text = "There is a sinister light at the end of the street where the wind blows " + 
            "fiercely side by side with human soul."
        })
        
        it(`For a null text and valid words must return an empty string`, () => {
            expect(UIHelper.highlighText(null, ["valid", "words"])).toEqual("");
        });
        it("For null word and a valid text must return an empty string", () => {
            expect(UIHelper.highlighText(text, [])).toEqual("");
        });
        it("For null word and a null text must return an empty string", () => {
            expect(UIHelper.highlighText(null, null)).toEqual("");
        });
        it(`Total words 1, found 0, no chunk size, `, () => {
            let words = ["xxxxxxxx"];
            expect(UIHelper.highlighText(text, words)).toEqual("There is a sinister light at the end of the street where the wind blows fiercely side by side with human soul.");
        });
        it(`Total words 1, found 0, small chunk size, `, () => {
            let words = ["xxxxxxxx"];
            let cs = 20;
            expect(UIHelper.highlighText(text, words, cs)).toEqual("There is a sinister light at the end of the street where the wind blows fiercely side by side with human soul.");
        });
        it(`Total words 1, found 1, no chunk size`, () => {
            let words = ["street"];
            expect(UIHelper.highlighText(text, words)).toEqual("There is a sinister light at the end of the <mark>street</mark> where the wind blows fiercely side by side with human soul.");
        });
        it(`Total words 2, found 2, no overlapping, no chunk size`, () => {
            let words = ["light", "street"];
            expect(UIHelper.highlighText(text, words)).toEqual("There is a sinister <mark>light</mark> at the end of the <mark>street</mark> where the wind blows fiercely side by side with human soul.");
        });
        it(`Total words 2, found 2, with overlapping, no chunk size`, () => {
            let words = ["blows", "wind blows"];
            expect(UIHelper.highlighText(text, words)).toEqual("There is a sinister light at the end of the street where the <mark>wind blows</mark> fiercely side by side with human soul.");
        });
        it(`Total words 2, found 2, adjacent, no chunk size`, () => {
            let words = ["fiercely", "side"];
            expect(UIHelper.highlighText(text, words)).toEqual("There is a sinister light at the end of the street where the wind blows <mark>fiercely</mark> <mark>side</mark> by <mark>side</mark> with human soul.");
        });
        it(`Total words 3, found 3, including first and last in sentence, no chunk size`, () => {
            let words = ["there", "soul", "at the end"];
            expect(UIHelper.highlighText(text, words)).toEqual("<mark>There</mark> is a sinister light <mark>at the end</mark> of the street where the wind blows fiercely side by side with human <mark>soul</mark>.");
        });
        it(`Total words 1, found 1, small chunk size`, () => {
            let words = ["street"];
            let cs = 20;
            expect(UIHelper.highlighText(text, words, cs)).toEqual("&hellip;nd of the <mark>street</mark> where the&hellip;");
        });
        it(`Total words 2, found 2, no overlapping, small chunk size`, () => {
            let words = ["light", "fiercely"];
            let cs = 20;
            expect(UIHelper.highlighText(text, words, cs)).toEqual("&hellip; sinister <mark>light</mark> at the en&hellip; &hellip;ind blows <mark>fiercely</mark> side by s&hellip;");
        });
        it(`Total words 2, found 2, with overlapping, small chunk size`, () => {
            let words = ["blows", "wind blows"];
            let cs = 20;
            expect(UIHelper.highlighText(text, words, cs)).toEqual("&hellip;where the <mark>wind blows</mark> fiercely &hellip;");
        });
        it(`Total words 2, found 2, adjacent, small chunk size`, () => {
            let words = ["fiercely", "side"];
            let cs = 20;
            expect(UIHelper.highlighText(text, words, cs)).toEqual("&hellip;ind blows <mark>fiercely</mark> <mark>side</mark> by <mark>side</mark> with huma&hellip;");
        });
        it(`Total words 1, found 1, huge chunk size`, () => {
            let words = ["street"];
            let cs = 400;
            expect(UIHelper.highlighText(text, words, cs)).toEqual("There is a sinister light at the end of the <mark>street</mark> where the wind blows fiercely side by side with human soul.");
        });
        it(`Total words 2, found 2, no overlapping, huge chunk size`, () => {
            let words = ["light", "fiercely"];
            let cs = 400;
            expect(UIHelper.highlighText(text, words, cs)).toEqual("There is a sinister <mark>light</mark> at the end of the street where the wind blows <mark>fiercely</mark> side by side with human soul.");
        });
    });
});