import { ImpersonateOptions } from "../../core/impersonate-options";

function setAllValid() {
    process.env.IMPERSONATE="false"
    process.env.IMPERSONATE_USER=""
    process.env.IMPERSONATE_DOMAIN=""
    process.env.IMPERSONATE_PASSWORD=""
}

describe("ImpersonateOptions Class", () => {

    let opts: ImpersonateOptions;

    beforeEach(() => {
        setAllValid();
        opts = new ImpersonateOptions(process.env);
    })

    test(`No Impersonate`, () => {
        expect(opts.enabled).toBe(false);
        expect(opts.user).toBe("");
        expect(opts.password).toBe("");
    })
    test(`Impersonate User without domain`, () => {
        process.env.IMPERSONATE="true"
        process.env.IMPERSONATE_USER="john.doe"

        expect(opts.enabled).toBe(true);
        expect(opts.user).toBe("john.doe");
    })
    test(`Impersonate User with domain`, () => {
        process.env.IMPERSONATE="true"
        process.env.IMPERSONATE_USER="john.doe"
        process.env.IMPERSONATE_DOMAIN="DOM"

        expect(opts.enabled).toBe(true);
        expect(opts.user).toBe("DOM\\john.doe");
    })
    test(`Retrieving password when no user is specified, (must be blank)`, () => {
        process.env.IMPERSONATE="true"
        process.env.IMPERSONATE_USER=""
        process.env.IMPERSONATE_PASSWORD=""

        expect(opts.enabled).toBe(true);
        expect(opts.password).toBe("");
    })
    test(`Retrieving password when the user is specified but there is no password set, (must be blank)`, () => {
        process.env.IMPERSONATE="true"
        process.env.IMPERSONATE_USER="john.doe"
        process.env.IMPERSONATE_PASSWORD=""

        expect(opts.enabled).toBe(true);
        expect(opts.user).toBe("john.doe");
        expect(opts.password).toBe("");
    })
    test(`Retrieving password when the user is specified and there is a password set`, () => {
        process.env.IMPERSONATE="true"
        process.env.IMPERSONATE_USER="john.doe"
        process.env.IMPERSONATE_PASSWORD="my password"

        expect(opts.enabled).toBe(true);
        expect(opts.user).toBe("john.doe");
        expect(opts.password).toBe("my password");
    })
})
