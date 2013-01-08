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

var pg = require('pg');

module.exports = function (localDatabaseURL) {

    var pgURL = process.env.DATABASE_URL || localDatabaseURL;

    var db = {};

    db.connect = function (callback) {
        pg.connect(pgURL, callback);
    };

    return db;
};
