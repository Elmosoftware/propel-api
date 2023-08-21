import { UserLoginRequest } from "../../../propel-shared/core/user-login-request";
import { UserAccountRoles } from "../../../propel-shared/models/user-account-roles";
import { SecurityService } from "../../services/security-service";
import { LogLevel } from "../../core/config";
import { SecuritySharedConfiguration } from "../../../propel-shared/core/security-shared-config";
import { UserLoginResponse } from "../../../propel-shared/core/user-login-response";
import { RuntimeInfo } from "../../../propel-shared/core/runtime-info";
import { RDPUser } from "../../../propel-shared/core/rdp-user";

let ss: SecurityService;

function mockSecurityService(ss: SecurityService, options: { 
    user:any, legacySecurity: boolean, 
    forceWrongUserName: boolean, doNotMockdecryptRuntimeInfo: boolean}) {

    //@ts-ignore
    ss.testOptions = options;

    //@ts-ignore
    ss.getSharedConfig = () => {

        let ret = new SecuritySharedConfiguration()

        ret.legacySecurity = (process.env.LEGACY_SECURITY == "On")

        return ret;
    }

    //@ts-ignore
    ss.getUserByNameOrID = (userNameOrId) => {
        //@ts-ignore
        if (userNameOrId == ss.testOptions.user.name) {
            //@ts-ignore
            return Promise.resolve(ss.testOptions.user);
        }

        return Promise.resolve(undefined);
    }

    //@ts-ignore
    if (!ss.testOptions.doNotMockdecryptRuntimeInfo) {
        ss.decryptRuntimeInfo = (runtimeToken) => {
            let ri: RuntimeInfo = new RuntimeInfo();
            //@ts-ignore
            ri.userName = ss.testOptions.user.name;
            //@ts-ignore
            if (ss.testOptions.forceWrongUserName) {
                ri.userName = "wrong.user"
            }

            ri.processId = 1
            ri.RDPUsers = [new RDPUser(ri.userName, "Active")]
            ri.runtimeToken = runtimeToken
            return ri;
        }
    }

    //@ts-ignore
    ss.saveUser = (user) => {
        //@ts-ignore
        ss.testOptions.user = user
        //@ts-ignore
        return Promise.resolve(ss.testOptions.user._id);
    }

    //@ts-ignore
    ss.createRefreshToken = (loginData: any): Promise<string> => {
        return Promise.resolve("000000010000000000100001");
    }
}

function setEnVars() {
    process.env.LEGACY_SECURITY = "Off"
}

describe("SecurityService Class - handleUserLogin() - Regular Login", () => {

    beforeEach(() => {

        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.

        setEnVars()
        ss = new SecurityService();

        mockSecurityService(ss, {
            user: {
                _id: "000000010000000000100001",
                name: "john.doe",
                fullName: "John Doe",
                initials: "JD",
                email: "john.doe.propel.com",
                role: UserAccountRoles.User,
                lockedSince: null,
                lastLogin: new Date()
            },
            legacySecurity: false,
            forceWrongUserName: false,
            doNotMockdecryptRuntimeInfo: false
        })
    })

    test(`Successful case`, (done) => {

        let sr: UserLoginRequest = new UserLoginRequest("THIS_IS_THE_RUNTIME_TOKEN");

        ss.handleUserLogin(sr)
            .then((result: UserLoginResponse) => {
                expect(result.accessToken).not.toEqual("");
                expect(result.refreshToken).not.toEqual("");
                done();
            })
            .catch((err) => {
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 1000);

    test(`Locked user`, (done) => {

        let sr: UserLoginRequest = new UserLoginRequest("THIS_IS_THE_RUNTIME_TOKEN");

        //@ts-ignore
        ss.testOptions.user.lockedSince = new Date()

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                //@ts-ignore
                expect(String(err)).toMatch(`The user "${ss.testOptions.user.name}" is locked.`)
                done()
            })

    }, 1000);

    test(`Non-existent user.`, (done) => {

        let sr: UserLoginRequest = new UserLoginRequest("THIS_IS_THE_RUNTIME_TOKEN");
        //@ts-ignore
        ss.testOptions.forceWrongUserName = true;

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                expect(String(err)).toMatch(`PropelError: No user with Name or ID`)
                done();
            })

    }, 1000);
})

describe("SecurityService Class - handleUserLogin() - Runtime Token decryption", () => {

    beforeEach(() => {

        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.

        setEnVars()
        ss = new SecurityService();

        mockSecurityService(ss, {
            user: {
                _id: "000000010000000000100001",
                name: "john.doe",
                fullName: "John Doe",
                initials: "JD",
                email: "john.doe.propel.com",
                role: UserAccountRoles.User,
                lockedSince: null,
                lastLogin: new Date()
            },
            legacySecurity: false,
            forceWrongUserName: false,
            doNotMockdecryptRuntimeInfo: true //<-- This force no mock for the "decryptRuntimeInfo" function.
        })
    })

    test(`Wrong RuntimeToken.`, (done) => {

        let sr: UserLoginRequest = new UserLoginRequest("THIS_IS_AN INVALID_RUNTIME_TOKENa0cabc2858e8dab4180d3e6684cad5ed0925e203188665d54013269f119fa8098a060b06f41d4ca6e31df90e00cb80df28b9f8fc0290748d6101ef949e2960");

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                expect(String(err)).toMatch(`wrong final block length`)
                done();
            })

    }, 1000);

    test(`Right RuntimeToken.`, (done) => {
        //For this test, we need a valid runtime token, so you can generate one by running the following
        //Node script located in \propel-shell\tools:
        //  node runtimeinfo-generator.js -userName john.doe -rdpusers john.doe, other.user
        let sr: UserLoginRequest = new UserLoginRequest("4be7089ef6bf84c8939c00f23986c34aae514717825ecd6726eba61ec0c0a5336522325fea7319dfc7ed98d43b84e3c0aeb0a217eafffd74a2e04c3c8d3fae0480f198ae23bf0ee12b83c4e0b05271e0fe3cb17d2910a4dd652bf267649a9269b75190c5abcb796db62753a17eec87842f19ea4e4fafbbd4afd97bd67ffa6c6a522183c93d286ea67082b9fefc032ba24f1937426fa0f956770d65963b045acc");

        ss.handleUserLogin(sr)
            .then((result: UserLoginResponse) => {
                expect(result.accessToken).not.toEqual("");
                expect(result.refreshToken).not.toEqual("");
                done();
            })
            .catch((err) => {
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 1000);
})
