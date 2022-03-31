import { SecurityRequest } from "../../../propel-shared/core/security-request";
import { UserAccountRoles } from "../../../propel-shared/models/user-account-roles";
import { SecurityService } from "../../services/security-service";

let ss: SecurityService;

function mockSecurityService(ss: SecurityService, options: any) {

    //@ts-ignore
    ss.testOptions = options;

    //@ts-ignore
    ss.getUserByIdOrName = (userNameOrId) => {
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
   ss.verifyHash = (password: string, hash:string) => {
       //to simplify things we are just going to compare the hash with 
       //the password, in not the intention here to test bcrypt!!!
       return Promise.resolve(password == hash);      
   }

}

describe("SecurityService Class - handleUserLogin() - Regular Login", () => {

    beforeEach(() => {

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
                lockedSince: null
            },
            userSecret: {
                _id: "2",
                value: {
                    passwordHash: "123456" //Recall this will be actually the 
                    //user password for this test.
                }
            }
        })        
    })
   
    test(`handleUserLogin() - Regular login - Locked user`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userNameOrId="john.doe" //right user
        sr.password = "123456" //right password

        //@ts-ignore
        ss.testOptions.user.lockedSince = new Date()

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).toEqual("We expected to throw an exception instead!"); //No token must be generated, Anyway we expect to throw.
                done();
            })
            .catch((err) => {
                expect(String(err)).toMatch(`The user "${sr.userNameOrId}" is locked.`)
                done()
            })

    }, 1000);

    test(`handleUserLogin() - Regular login - Successful case`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userNameOrId="john.doe" //right user
        sr.password = "123456" //right password

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).not.toEqual("");
                done();
            })
            .catch((err) => {
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 1000);

    test(`handleUserLogin() - Regular login - Non-existent user.`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userNameOrId="wrong.user" //WRONG user
        sr.password = "123456" //right password

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

    test(`handleUserLogin() - Regular login - wrong password.`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userNameOrId="john.doe" //right user
        sr.password = "xxxx" //wrong password

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
    
})

describe("SecurityService Class - handleUserLogin() - First Login", () => {

    beforeEach(() => {

        ss = new SecurityService();

        mockSecurityService(ss, {
            user: {
                _id: "1",
                secretId: "",
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
                    passwordHash: "" //Recall this will be actually the 
                    //user password for this test.
                }
            }
        })        
    })

    test(`handleUserLogin() - First login - Successful case`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userNameOrId="john.doe" //right user
        sr.password = "123456" //right password

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).not.toBe(null);
                //@ts-ignore
                expect(ss.testOptions.userSecret.value.passwordHash).toEqual(sr.password)
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
                    //user password for this test.
                }
            }
        })        
    })

    test(`handleUserLogin() - Password reset login - Successful case`, (done) => {

        let sr: SecurityRequest = new SecurityRequest();
        sr.userNameOrId="john.doe" //right user
        sr.password = "123456" //right password
        sr.newPassword = "654321"; //new password

        ss.handleUserLogin(sr)
            .then((result) => {
                expect(result).not.toEqual("");
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