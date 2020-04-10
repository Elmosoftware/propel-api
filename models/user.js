// @ts-check

var mongoose = require("mongoose");
var helper = require("../util/entity-helper");

let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
    /**
     * User full name.
     */
    name: { type: String, required: true, DESCRIPTION: `User name` },
    /**
     * User email.
     */
    email: { type: String, required: true, DESCRIPTION: `User email. Is also unique identifier.`  },
    /**
     * User initials.
     */
    initials: { type: String, required: true, DESCRIPTION: `User initials`  },
    /**
     * User picture URL.
     */
    picture: { type: String, required: false, DESCRIPTION: `Optional user picture URL.`  }
}, false)); //This entity will not have audit fields. Security restrict data updetes to the user only.

schema.methods.toJSON = function () {
    return helper.preProcessJSON(this);
}

schema.index({ email: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });
schema.index({ name: 1 }, { unique: false, background: true, name: "IX_UserName" });
// @ts-ignore
schema.DESCRIPTION = `Authenticated User`

module.exports = mongoose.model("user", schema, "users");