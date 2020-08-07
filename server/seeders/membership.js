const { Membership } = require('../models')
module.exports = {
    async createDefaultMembersip() {
        try {
            let existing = await Membership.findOne({ type: "default" });
            if (existing) console.log("Default membership already created");
            else {
                await Membership.create({ type: "default", cost: 0, description: "Default membership for all", name: "Default" });
                console.log("Default membership created")
            }
        } catch (err) {
            console.log("Error creating membership " + err.message)
        }

    }
}