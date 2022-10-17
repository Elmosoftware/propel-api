//@ts-ignore
import { processQWINSTAOutput } from "../util"

describe("Electron Support files", () => {
    describe("Util.processQWINSTAOutput", () => {
        it("Empty string", () => {
            let stdOut = ``
            let ret = processQWINSTAOutput(stdOut);

            expect(ret.length).toEqual(0);
        });
        it("No users in STDOUT", () => {
            let stdOut =
                "   #  SESSIONNAME       USER NAME        SESSION ID   STATE    HOST NAME \r\n" +
                "   0  Services                                    0   Disc               \r\n"
            let ret = processQWINSTAOutput(stdOut);

            expect(ret.length).toEqual(0);
        });
        it("1 user in STDOUT", () => {
            let stdOut =
                "   #  SESSIONNAME       USER NAME        SESSION ID   STATE    HOST NAME \r\n" +
                "   0  Services                                    0   Disc               \r\n" +
                "   1                    test.user1                1   Active             \r\n"
            let ret = processQWINSTAOutput(stdOut);

            expect(ret.length).toEqual(1);
            expect(ret[0].userName).toEqual("test.user1");
            expect(ret[0].state).toEqual("Active");
        });
        it("2 users in STDOUT", () => {
            let stdOut =
                "   #  SESSIONNAME       USER NAME        SESSION ID   STATE    HOST NAME \r\n" +
                "   0  Services                                    0   Disc               \r\n" +
                "   1                    test.user1                1   Active             \r\n" +
                "   2                    test.user2                2   Disc               \r\n"
            let ret = processQWINSTAOutput(stdOut);

            expect(ret.length).toEqual(2);
            expect(ret[0].userName).toEqual("test.user1");
            expect(ret[0].state).toEqual("Active");
            expect(ret[1].userName).toEqual("test.user2");
            expect(ret[1].state).toEqual("Disc");
        });
    })
})