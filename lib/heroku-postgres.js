/*
 * This file is part of MonkeyCruncher. Copyright (C) 2012-2013, Jony Hudson.
 *
 * MonkeyCruncher is licenced to you under the MIT licence. See the file
 * LICENCE.txt for full details.
 */

// This module wraps up the database. The database URL configuration is perhaps a bit non-obvious:
// The module takes a database URL as a parameter. This will be used UNLESS there is a DATABASE_URL
// environment variable, which will take precedence if present. This means you should pass the local
// URL into the module as a parameter, but when running on Heroku the correct URL will be picked up.

var pg = require('pg'),
    logging = require('./logging');


module.exports = function (localDatabaseURL) {

    var pgURL = process.env.DATABASE_URL || localDatabaseURL;

    var db = {};

    db.connect = function (callback) {
        pg.connect(pgURL, callback);
    };

    db.query = function (query, data, callback) {
        var connectAction = logging.action("db_connect");
        db.connect(function (err, client) {
            if (err) {
                connectAction.error(err.message);
                return callback(err);
            }
            connectAction.finish();
            var queryAction = logging.action("db_query", {query: '"' + query + '"'});
            client.query(
                query,
                data,
                function (err, data) {
                    if (err) queryAction.error(err.message);
                    queryAction.finish();
                    callback(err, data);
                }
            );
        });
    };

    return db;
};
