/*
 * This file is part of MonkeyCruncher. Copyright (C) 2012-2013, Jony Hudson.
 *
 * MonkeyCruncher is licenced to you under the MIT licence. See the file
 * LICENCE.txt for full details.
 */

var redis = require('redis'),
    url = require('url');

// The module is parameterized by a "localURL". This will be used if REDISTOGO_URL is not
// defined in the environment - if it is, it takes precedence.

module.exports = function (localURL) {

    // This module makes a single client connection which is shared within the app.
    var redisURL = process.env.REDISTOGO_URL || localURL;
    if (redisURL) {
        var rdURL = url.parse(redisURL);
        var redisClient = redis.createClient(rdURL.port, rdURL.hostname);
        redis.debug_mode = process.env.REDIS_DEBUG || false;
        redisClient.auth(rdURL.auth.split(":")[1]);
    }
    return {
        getClient: (function () {
            return redisClient;
        })
    };
};
