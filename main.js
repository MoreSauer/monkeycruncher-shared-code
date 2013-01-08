/*
 * This file is part of MonkeyCruncher. Copyright (C) 2012-2013, Jony Hudson.
 *
 * MonkeyCruncher is licenced to you under the MIT licence. See the file
 * LICENCE.txt for full details.
 */

// This package exports the various shared modules. It might be classier to have a real npm
// module for each piece of functionality, but it seems like a lot of faff.

var db = require('./lib/heroku-postgres'),
    redis = require('./lib/heroku-redis'),
    sessionStore = require('./lib/session-store');

exports.database = db;
exports.redis = redis;
exports.sessionStore = sessionStore;