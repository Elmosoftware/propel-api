import { FileSystemHelper } from "../../util/file-system-helper";

describe("FileSystemHelper Class - encodeBase64(), decodeBase64()", () => {

     
    test(`Encoding null must throw`, () => {
        expect(() => {
            //@ts-ignore
            FileSystemHelper.encodeBase64(null)
          }).toThrow(`We expect a "string" for the parameter "ASCIIString"`);
    })
    test(`Encoding object must throw`, () => {
        expect(() => {
            //@ts-ignore
            FileSystemHelper.encodeBase64({})
          }).toThrow(`We expect a "string" for the parameter "ASCIIString"`);
    })
    test(`Decoding null must throw`, () => {
        expect(() => {
            //@ts-ignore
            FileSystemHelper.decodeBase64(null)
          }).toThrow(`We expect a "string" for the parameter "base64String"`);
    })
    test(`Decoding object must throw`, () => {
        expect(() => {
            //@ts-ignore
            FileSystemHelper.decodeBase64({})
          }).toThrow(`We expect a "string" for the parameter "base64String"`);
    })
    test(`Encoding and Decoding must return the same - Empty string`, () => {
        let origString = ``
        let decoded = FileSystemHelper.decodeBase64(FileSystemHelper.encodeBase64(origString));
        expect(decoded).toEqual(origString);
    })
    test(`Encoding and Decoding must return the same - Single char string`, () => {
        let origString = `?`
        let decoded = FileSystemHelper.decodeBase64(FileSystemHelper.encodeBase64(origString));
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
        let decoded = FileSystemHelper.decodeBase64(FileSystemHelper.encodeBase64(origString));
        expect(decoded).toEqual(origString);
    })



    
})
