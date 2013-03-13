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

    // we wrap the native connect function for logging porpoises.
    db.connect = function (callback) {
        // assemble connection stats for logging
        var pool = pg.pools.getOrCreate(pgURL);
        var connStats = {
            poolSize: pool.getPoolSize(),
            poolFree: pool.availableObjectsCount(),
            poolWaiting: pool.waitingClientsCount()
        };
        var connectAction = logging.action("db.connect", connStats);
        // make the actual connection
        pg.connect(pgURL, function (err, client, done) {
            if (err) {
                connectAction.error(err.message);
                return callback(err);
            }
            // we patch the connection release function to monitor pool stats and log connection close.
            var customDone = function (err) {
                connStats = {
                    poolSize: pool.getPoolSize(),
                    poolFree: pool.availableObjectsCount(),
                    poolWaiting: pool.waitingClientsCount()
                };
                done(err);
                connectAction.finish(connStats);
            };
            callback(err, client, customDone);
        });
    };

    // again, wrap query for logging. Might be better to give back a modified client in OO style, but this is ok.
    db.query = function (client, query, data, callback) {
        var queryAction = logging.action("db.query", {query: '"' + query + '"'});
        client.query(
            query,
            data,
            function (err, data) {
                if (err) queryAction.error(err.message);
                queryAction.finish();
                callback(err, data);
            }
        );
    };

    // helper for the common case of making a single query with a connection
    db.connectAndQuery = function (query, data, callback) {
        db.connect(function (err, client, done) {
            if (err) return callback(err);
            db.query(client, query, data, function (err, data) {
                done();
                if (err) return callback(err);
                callback(err, data);
            })
        })
    };


    return db;
};
