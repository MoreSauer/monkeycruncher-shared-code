var winston = require('winston'),
    _ = require('underscore');

// create an app wide logger
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)()
    ]
});

// in case you need the raw logger.
exports.logger = logger;

// an event is something that happens at a point in time, and can't fail.
exports.event = function (eventName, metadata) {
    var md = metadata || {};
    var startTime = Date.now();
    md.eventName = eventName;
    md.time = startTime;
    logger.info("Event -", md);
};

// an action is something that has a duration, or that can fail.
exports.action = function (actionName, metadata) {
    var action = {};
    var md = metadata || {};
    var startTime = Date.now();
    md.actionName = actionName;
    md.phase = "start";
    md.time = startTime;
    logger.info("Action start -", md);

    var stampEndTime = function () {
        var endTime = Date.now();
        md.time = endTime;
        md.duration = endTime - startTime;
    };

    // used when an action finishes normally
    action.finish = function (extraMetaData) {
        stampEndTime();
        if (extraMetaData) _.extend(md, extraMetaData);
        md.phase = "end";
        logger.info("Action finish -", md);
    };

    // used when an action finished abnormally due to an error, that is
    // something that ought to be fixed.
    action.error = function (message, extraMetaData) {
        stampEndTime();
        if (extraMetaData) _.extend(md, extraMetaData);
        md.message = '"' + message + '"';
        logger.error("Action error -", md);
    };

    // used when an action finished abnormally but not because of an application fault,
    // i.e. an authentication failure. Would not normally need to be fixed.
    action.warn = function (message, extraMetaData) {
        stampEndTime();
        if (extraMetaData) _.extend(md, extraMetaData);
        md.message = '"' + message + '"';
        logger.info("Action warn -", md);
    };

    return action;
};

exports.handleErrorWithAction = function (err, action, callback, optionalMessage) {
    if (optionalMessage) action.error(optionalMessage);
    else action.error(err.message);
    return callback(err);
};

// a format string for express to get its logs in to a sensible format
exports.expressFormatString = 'Request - client_ip=:remote-addr  method=:method url=":url" ' +
    'status=:status bytes=:res[content-length] duration=:response-time referrer=":referrer" user_agent=":user-agent"';

// not entirely sure this belongs here! But it'll do for now.
// This is based on the Connect default error handler.
// https://github.com/senchalabs/connect/blob/master/lib/middleware/errorHandler.js
exports.expressErrorHandler = function (err, req, res, next) {

    if (!process.env.PRODUCTION) {
        console.log(err.stack);
    }
    exports.event("express.error", {message: '"' + err.message + '"'});
    if (err.status) res.statusCode = err.status;
    else res.statusCode = 500;
    var accept = req.headers.accept || '';
    // html
    if (~accept.indexOf('html')) {
        var html = "<html><head></head><body><h1>Something bad happened ...</h1><p>" + err.message + "</p></body></html>"
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
    } else if (~accept.indexOf('json')) {
        var error = { status: "error", message: err.message};
        var json = JSON.stringify(error);
        res.setHeader('Content-Type', 'application/json');
        res.end(json);
        // plain text
    } else {
        res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
        res.end(err.stack);
    }

};
