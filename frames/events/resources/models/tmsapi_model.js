var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var request = require('request');
var crypto = require('crypto');
var _DEBUG = false;
var moment = require('moment');
/*
 var redis;
 if (process.env.REDISTOGO_URL) {
 console.log('redis url: %s', process.env.REDISTOGO_URL);
 var rtg = require("url").parse(process.env.REDISTOGO_URL);
 redis = require("redis").createClient(rtg.port, rtg.hostname);

 redis.auth(rtg.auth.split(":")[1]);
 } else {
 redis = require("redis").createClient();
 }
 */

/* ------------ CLOSURE --------------- */

var API = 'http://data.tmsapi.com/v1/movies/showings';

var _cache_files = null;
var DATE_FORMAT = 'YYYY-MM-DD';

function _now() {
    return new moment().format(DATE_FORMAT);
}

function _then(date) {
    if (_.isString(date) || _.isDate(date)) {
        return new moment(date, DATE_FORMAT);
    } else {
        // assume is moment
        return date;
    }
}

function _age(date_string) {
    var then = _then(date_string);

    return new moment().diff(then, 'days');
}

/* -------------- EXPORT --------------- */

module.exports = function (apiary, cb) {

    /**
     * saves the data INSTANTLY to the file system.
     *
     * @param zip {number}
     * @param callback {function}
     * @private
     */

    function _poll_api(zip, callback) {
        var p = _params(zip);
        console.log('POLLING API......... %s', util.inspect(p));
        request.get(p, function (err, req, body) {
            if (err) {
                cb(err);
            } else {
                try {
                    var data = JSON.parse(body);
                } catch (err) {
                    console.log('tms_api_model poll error: %s', err);
                    console.log(body);
                    return cb(err);
                }
                //     var str_data = JSON.stringify(_current_data(data));
                console.log('saving %s records of %s data ...', zip, data.length, body.substr(0, 2));

                var events_table_model = apiary.model('event_tables');

                events_table_model.connect(function (err, client) {

                    if (err) {
                        cb(err);
                    } else {

                        client.query(util.format("DELETE from events WHERE area = '%s' AND source = 'tmsapi';", zip), function () {
                            client.query(util.format("DELETE from event_times WHERE area = '%s' AND source = 'tmsapi';", zip), function () {
                                client.end();
                                events_table_model.load_tmsapi_tables(data, zip, function(){

                                    console.log('DONE POLLING API');
                                    callback();
                                });
                                process.nextTick(function () {
                                    var fpath = path.resolve(__dirname, 'cache', zip + '.json');
                                    console.log('writing %s', fpath);
                                    fs.writeFile(
                                        fpath,
                                        body, {encoding: 'utf8'}, _.identity);

                                })
                            });
                        });
                    }

                });
            }
        });
    }

    function _params(zip) {
        return {
            url: API,
            qs: {
                startDate: _now(),
                api_key: apiary.get_config('tmsapi_auth_key'),
                radius: 100,
                units: 'mi',
                numDays: 10,
                zip: zip
            }
        };
    }

    function _get_movies(zip, cb) {
        model.poll_api(zip, cb);
    }

    function _current_data(data) {
        return {
            startDate: _now(),
            data: data
        };
    }

    function _flush(cb) {
        redis.flushall(cb);
    }


    var model = {
        flush: _flush,
        name: 'tmsapi',
        search: _get_movies,
        age: _age,
        then: _then,
        poll_api: _poll_api,
        get_movies: _get_movies,
        current_data: _current_data
    };

    cb(null, model);
}