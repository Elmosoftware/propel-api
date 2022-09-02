import { SecurityRequest } from "../../../propel-shared/core/security-request";
import { UserAccountRoles } from "../../../propel-shared/models/user-account-roles";
import { SecurityService } from "../../services/security-service";
import { cfg, LogLevel } from "../../core/config";
import { SecuritySharedConfiguration } from "../../../propel-shared/core/security-shared-config";
import { UserLoginResponse } from "../../../propel-shared/core/user-login-response";

let ss: SecurityService;

function mockSecurityService(ss: SecurityService, options: any) {

    //@ts-ignore
    ss.testOptions = options;

    //@ts-ignore
    ss.getSharedConfig = () => {

        let ret = new SecuritySharedConfiguration()

        ret.authCodeLength = parseInt(process.env.AUTH_CODE_LENGTH!)
        ret.passwordMinLength = parseInt(process.env.PASSWORD_MIN_LENGTH!)
        ret.passwordMaxLength = parseInt(process.env.PASSWORD_MAX_LENGTH!)
        ret.legacySecurity = options.legacySecurity

        return Promise.resolve(ret);
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
    ss.saveUser = (user) => {
        //@ts-ignore
        ss.testOptions.user = user
        //@ts-ignore
        return Promise.resolve(ss.testOptions.user._id);
    }

    //@ts-ignore
    ss.getUserSecret = (secretId) => {
        //@ts-ignore
        return Promise.resolve(ss.testOptions.userSecret);
    }

    //@ts-ignore
    ss.saveUserSecret = (secret) => {
        //@ts-ignore
        ss.testOptions.userSecret.value.passwordHash = secret.value.passwordHash;
        //@ts-ignore
        return Promise.resolve(ss.testOptions.userSecret._id);
    }

    //@ts-ignore
    ss.createHash = (password: string) => {
        //For simplicity we will return the password itself, we are not 
        //trying here to test neither JWT or bcrypt:
        return Promise.resolve(password);
    }

    //@ts-ignore
    ss.verifyHash = (password: string, hash: string) => {
        //to simplify things we are just going to compare the hash with 
        //the password, in not the intention here to test bcrypt!!!
        return Promise.resolve(password == hash);
    }

    //@ts-ignore
    ss.createRefreshToken = (loginData: any): Promise<string> => {
        return Promise.resolve("000000010000000000100001");
    }

}

function setEnVars() {
    process.env.AUTH_CODE_LENGTH = "6"
    process.env.PASSWORD_MIN_LENGTH = "8"
    process.env.PASSWORD_MAX_LENGTH = "20"
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
                secretId: "2",
                name: "john.doe",
                fullName: "John Doe",
                initials: "JD",
                email: "john.doe.propel.com",
                role: UserAccountRoles.User,
                lockedSince: null,
                lastLogin: new Date()
            },
            userSecret: {
                _id: "000000010000000000100001",
                value: {
                    passwordHash: "12345678" //Recall this will be actually the 
                    //user password for this test.
                }
            },
            legacySecurity: false
        })
    })

    test(`Locked user`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "john.doe" //right user
        sr.password = "12345678" //right password

        //@ts-ignore
        ss.testOptions.user.lockedSince = new Date()

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                expect(String(err)).toMatch(`The user "${sr.userName}" is locked.`)
                done()
            })

    }, 1000);

    test(`Successful case`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "john.doe" //right user
        sr.password = "12345678" //right password

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

    test(`Non-existent user.`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "wrong.user" //WRONG user
        sr.password = "12345678" //right password

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

    test(`Wrong password.`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "john.doe" //right user
        sr.password = "xxxxxxxx" //wrong password

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                expect(String(err)).toMatch(`PropelError: Wrong password supplied`)
                done();
            })

    }, 1000);

    test(`Bad format password - Short password.`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "john.doe" //right user
        sr.password = "x" //short password

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                expect(String(err)).toMatch(`PropelError: Password bad format`)
                done();
            })

    }, 1000);

    test(`Bad format password - Long password.`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "john.doe" //right user
        sr.password = "x".repeat(cfg.passwordMaxLength + 1) //very long password

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                expect(String(err)).toMatch(`PropelError: Password bad format`)
                done();
            })

    }, 1000);

})

describe("SecurityService Class - handleUserLogin() - First Login", () => {

    beforeEach(() => {

        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.

        ss = new SecurityService();

        mockSecurityService(ss, {
            user: {
                _id: "1",
                secretId: "2",
                name: "john.doe",
                fullName: "John Doe",
                initials: "JD",
                email: "john.doe.propel.com",
                role: UserAccountRoles.User,
                lockedSince: null,
                lastLogin: null
            },
            userSecret: {
                _id: "2",
                value: {
                    passwordHash: "123456" //Recall this will be actually the 
                    //authentication code for this test.
                }
            },
            legacySecurity: false
        })
    })

    test(`Successful case`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "john.doe" //right user
        sr.password = "123456" //right auth code
        sr.newPassword = "12345678" //right auth code

        ss.handleUserLogin(sr)
            .then((result: UserLoginResponse) => {
                expect(result.accessToken).not.toBe(null);
                expect(result.refreshToken).not.toBe(null);
                //@ts-ignore
                expect(ss.testOptions.userSecret.value.passwordHash).toEqual(sr.newPassword)
                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 1000);

})

describe("SecurityService Class - handleUserLogin() - Password reset Login", () => {

    beforeEach(() => {

        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.

        ss = new SecurityService();

        mockSecurityService(ss, {
            user: {
                _id: "1",
                secretId: "2",
                name: "john.doe",
                fullName: "John Doe",
                initials: "JD",
                email: "john.doe.propel.com",
                role: UserAccountRoles.User,
                lockedSince: null,
                lastLogin: new Date(),
                mustReset: true
            },
            userSecret: {
                _id: "2",
                value: {
                    passwordHash: "123456" //Recall this will be actually the 
                    //authentication code for this test.
                }
            },
            legacySecurity: false
        })
    })

    test(`Successful case`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userName = "john.doe" //right user
        sr.password = "123456" //right password
        sr.newPassword = "12345678"; //new password

        ss.handleUserLogin(sr)
            .then((result: UserLoginResponse) => {
                expect(result.accessToken).not.toBe(null);
                expect(result.refreshToken).not.toBe(null);
                //@ts-ignore
                expect(ss.testOptions.userSecret.value.passwordHash).toEqual(sr.newPassword)
                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })
    }, 1000);
})