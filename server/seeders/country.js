const { State, Country } = require('../models');
const { countries } = require('../config/countries.json')
module.exports = {
    async createStates() {
        try {
            let existingCountries = await Country.find({});
            if (existingCountries.length == 0) {
                countries.forEach(async country => {
                    try {
                        let newCountry = await Country.create({ name: country.country });
                        if (country.states.length > 0) {
                            country.states.forEach(async state => {
                                try {
                                    let newState = await State.create({ name: state, country: newCountry._id });
                                    if (newState) await newCountry.states.push(newState);
                                    console.log(newState.name + " created for " + newCountry.name)
                                } catch (err) {
                                    console.log(err)
                                }
                            })
                            await newCountry.save();
                            console.log(newCountry.name + " created")

                        }

                    } catch (err) {
                        console.log(err)
                    }



                })
            } else {
                console.log('Countries created already')
            }

        } catch (err) {
            console.log({ err })
        }

    }
}