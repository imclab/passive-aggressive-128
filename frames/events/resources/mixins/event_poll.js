var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */
var EVERY_SIX_HOURS = 60 * 12;

/** ********************
 * Purpose: poll local events every 12 hours
 * @return void
 */

/* -------------- EXPORT --------------- */

module.exports = function (apiary, cb) {

    function poll(loc) {
        var tmsapi_model = apiary.model('tmsapi');

        return function () {
            tmsapi_model.poll_api(loc.zip, _.identity);
        }

    }

    cb(null, {
        name: 'poll_events',
        weight: 10000,
        respond: function (done) {
            var chronometer = apiary.get_config('chronometer');
            var location_model = apiary.model('locations');
            var et_model = apiary.model('event_tables');

            location_model.locations.forEach(function (loc, i) {
                chronometer.add_time_listener('poll data', poll(loc), EVERY_SIX_HOURS + (i * 1000 * 10));
                setTimeout(poll(loc), i * 1000 * 10);
            })
            done();
        }
    }); // end callback
};
