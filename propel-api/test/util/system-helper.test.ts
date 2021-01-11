import { SystemHelper } from "../../util/system-helper";

describe("SystemHelper Class - encodeBase64(), decodeBase64()", () => {
    test(`Encoding null must throw`, () => {
        expect(() => {
            //@ts-ignore
            SystemHelper.encodeBase64(null)
          }).toThrow(`We expect a "string" for the parameter "ASCIIString"`);
    })
    test(`Encoding object must throw`, () => {
        expect(() => {
            //@ts-ignore
            SystemHelper.encodeBase64({})
          }).toThrow(`We expect a "string" for the parameter "ASCIIString"`);
    })
    test(`Decoding null must throw`, () => {
        expect(() => {
            //@ts-ignore
            SystemHelper.decodeBase64(null)
          }).toThrow(`We expect a "string" for the parameter "base64String"`);
    })
    test(`Decoding object must throw`, () => {
        expect(() => {
            //@ts-ignore
            SystemHelper.decodeBase64({})
          }).toThrow(`We expect a "string" for the parameter "base64String"`);
    })
    test(`Encoding and Decoding must return the same - Empty string`, () => {
        let origString = ``
        let decoded = SystemHelper.decodeBase64(SystemHelper.encodeBase64(origString));
        expect(decoded).toEqual(origString);
    })
    test(`Encoding and Decoding must return the same - Single char string`, () => {
        let origString = `?`
        let decoded = SystemHelper.decodeBase64(SystemHelper.encodeBase64(origString));
        expect(decoded).toEqual(origString);
    })
    test(`Encoding and Decoding must return the same - multiline String`, () => {
        let origString = `This is a long one: Orci sagittis eu volutpat odio facilisis mauris. 
Porttitor massa id neque aliquam vestibulum morbi blandit. 
Diam quis enim lobortis scelerisque fermentum dui. Sodales ut eu sem integer vitae. 
Amet tellus cras adipiscing enim eu turpis egestas pretium. 
Consectetur a erat nam at lectus urna duis. Commodo ullamcorper a lacus vestibulum. 
Nunc faucibus a pellentesque sit amet. Ultrices in iaculis nunc sed augue lacus viverra vitae. Eget aliquet nibh praesent tristique magna sit amet purus. Nulla aliquet porttitor lacus luctus accumsan tortor. 
Suspendisse ultrices gravida dictum fusce ut placerat orci. Et pharetra pharetra massa massa ultricies mi quis hendrerit.`
        let decoded = SystemHelper.decodeBase64(SystemHelper.encodeBase64(origString));
        expect(decoded).toEqual(origString);
    })
})

describe("SystemHelper Class - detectJSON()", () => {

    describe("Invalid or no JSON in supplied text", () => {

        test(`With null argument`, () => {
            //@ts-ignore
            expect(SystemHelper.detectJSON(null)).toBe(null);
        })
        test(`With empty string argument`, () => {
            expect(SystemHelper.detectJSON(``)).toBe(``);
        })
        test(`With Single line of text`, () => {
            expect(SystemHelper.detectJSON(`This is a no JSON single line`)).toBe(``);
        })
        test(`With Multiple line of text`, () => {
            expect(SystemHelper.detectJSON(`This is a no JSON\r\nmultiple line\r\nof text\r\n\r\n`)).toBe(``);
        })
        test(`With Cross line invalid JSON Object`, () => {
            expect(SystemHelper.detectJSON(`This is a no JSON\r\nmultiple {"data":[1,2,\r\n3]}of text}\r\n\r\n`)).toBe(``);
        })
        test(`With Cross line invalid JSON Object Array`, () => {
            expect(SystemHelper.detectJSON(`This is a no JSON\r\nmultiple [{"data":[1,2,\r\n3]}]of text}]\r\n\r\n`)).toBe(``);
        })
        test(`JSON with adjacent text in same line`, () => {
            expect(SystemHelper.detectJSON(`This is a no JSON\r\nadjacent text [{"data":[1,2,3]}]\r\nof text}]\r\n\r\n`)).toBe(``);
        })
        test(`Invalid JSON Object in same line`, () => {
            expect(SystemHelper.detectJSON(`This is a no JSON\r\n{:[1,2,3]}\r\nof text}]\r\n\r\n`)).toBe(``);
        })
        test(`Invalid JSON Object Array in same line`, () => {
            expect(SystemHelper.detectJSON(`This is a no JSON\r\n[{"data":[1,2,3]}, {"}]\r\nof text}]\r\n\r\n`)).toBe(``);
        })
        test(`Invalid formatted JSON, (breaklines not allowed into JSON)`, () => {
            expect(SystemHelper.detectJSON(`This a line\r\n
            {
                "data":  [
                             8,
                             9
                         ]
            }\r\nAnother line`)).toBe(``);
        })
    })
    describe("Valid JSON in supplied text", () => {

        test(`With compressed JSON`, () => {
            expect(SystemHelper.detectJSON(`This a line\r\n\t{"data":[1,2,3]}\t\r\nAnother line`)).toBe(`{"data":[1,2,3]}`);
        })
        test(`With compressed JSON, Example 2`, () => {
            expect(SystemHelper.detectJSON(`This a line\r\n\t{"data":"This is my data"}\t\r\nAnother line`)).toBe(`{"data":"This is my data"}`);
        })
        test(`With compressed JSON, Object Array`, () => {
            expect(SystemHelper.detectJSON(`This a line\r\n[{"data":[1,2,3]},{"data":[4,5,6]},{"data":[7,8,9]}]\r\nAnother line`)).toBe(`[{"data":[1,2,3]},{"data":[4,5,6]},{"data":[7,8,9]}]`);
        })
        test(`With compressed unescaped string in JSON`, () => {
            expect(SystemHelper.detectJSON(`This a line\r\n[{"data":"AB\\C"}]\r\nAnother line`)).toBe(`[{\"data\":\"AB\\\\C\"}]`);
        })
    })
});