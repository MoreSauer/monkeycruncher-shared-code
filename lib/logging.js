var winston = require('winston');

// create an app wide logger
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)()
    ]
});

// a format string for express to get its logs in to a sensible format
exports.expressFormatString = 'Request - client_ip=:remote-addr  method=:method url=":url" ' +
    'status=:status bytes=:res[content-length] duration=:response-time referrer=":referrer"';

// in case you need the raw logger.
exports.logger = logger;

// an event is something that happens at a point in time
exports.event = function (eventName, metadata) {
    var md = metadata || {};
    var startTime = Date.now();
    md.eventName = eventName;
    md.time = startTime;
    logger.info("Event -", md);
};

// an action is something that has a duration
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
    action.finish = function () {
        stampEndTime();
        md.phase = "end";
        logger.info("Action finish -", md);
    };

    // used when an action finished abnormally due to an error, that is
    // something that ought to be fixed.
    action.error = function (message) {
        stampEndTime();
        md.message = '"' + message + '"';
        logger.error("Action error -", md);
    };

    // used when an action finished abnormally but not because of an application fault,
    // i.e. an authentication failure. Would not normally need to be fixed.
    action.warn = function (message) {
        stampEndTime();
        md.message = '"' + message + '"';
        logger.info("Action warn -", md);
    };

    return action;
};