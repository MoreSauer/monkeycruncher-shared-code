/*
 * This file is part of MonkeyCruncher. Copyright (C) 2012-2013, Jony Hudson.
 *
 * MonkeyCruncher is licenced to you under the MIT licence. See the file
 * LICENCE.txt for full details.
 */

var redis = require('./heroku-redis')("redis://blank:@localhost:6379/"),
    connectRedis = require('connect-redis');

exports.createStore = function (express, prefix, ttl) {
    var RedisStore = connectRedis(express);
    return new RedisStore({client: redis.getClient(), prefix: prefix, ttl: ttl});
};


