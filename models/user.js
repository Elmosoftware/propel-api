// @ts-check

var mongoose = require("mongoose");
var helper = require("../util/entity-helper");

let schema = new mongoose.Schema(helper.addCommonEntityAttributes({
    /**
     * User full name.
     */
    name: { type: String, required: true },
    /**
     * User email.
     */
    email: { type: String, required: true },
    /**
     * User initials.
     */
    initials: { type: String, required: true },
    /**
     * User picture URL.
     */
    picture: { type: String, required: false }
}, false)); //This entity will not have audit fields. Security restrict data updetes to the user only.

schema.methods.toJSON = function () {
    return helper.preProcessJSON(this);
}

schema.index({ email: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });
schema.index({ name: 1 }, { unique: false, background: true, name: "IX_UserName" });

module.exports = mongoose.model("user", schema, "users");