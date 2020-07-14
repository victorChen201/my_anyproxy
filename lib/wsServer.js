//websocket server manager

var WebSocketServer = require('ws').Server,
    logUtil = require("./log"),
    request = require("./request"),
    collection = require("./collection"),
    fs = require('fs'),
    util = require("./util"),
    path = require("path"),
    async = require('async');
    export_cases = require('./sync_to_autotest_platform');
function resToMsg(msg, cb) {
    var result = {},
        jsonData;

    try {
        jsonData = JSON.parse(msg);
    } catch (e) {
        result = {
            type: "error",
            error: "failed to parse your request : " + e.toString()
        };
        cb && cb(result);
        return;
    }



    if (jsonData.reqRef) {
        result.reqRef = jsonData.reqRef;
    }

    if (jsonData.type == "export") {
        var coll = new collection();
        async.forEach(jsonData.data, function(item, callback) {

            getRequestFromDB(item, coll.get().id, function(err, req) {
                // console.log(req.getJson())
                coll.addRequests(req.get().id, req.getJson());
                callback();
            });
        }, function(err) {
            // var filePath = jsonData.path;
            // if(filePath != '')
            // {
            //     fs.writeFileSync(filePath, JSON.stringify(coll.getJson()));
            // }
            export_cases(coll.getJson());
        });
    }
    if (jsonData.type == "reqBody" && jsonData.id) {
        result.type = "body";
        global.recorder.getBody(jsonData.id, function(err, data) {
            if (err) {
                result.content = {
                    id: null,
                    body: null,
                    error: err.toString()
                };
            } else {
                result.content = {
                    id: jsonData.id,
                    body: data.toString()
                };
            }
            cb && cb(result);
        });
    } else { // more req handler here
        return null;
    }
}

//add by shiyl 
function getRequestFromDB(item, collectionId, cb) {
    global.recorder.getSingleRecord(item, function(err, docs) {
        if (err || !docs || !docs[0]) {
            cb && cb();
            return;
        }
        global.recorder.getDecodedBody(item, function(err, result) {
            var req = new request(docs[0], collectionId);
            if (!result || !result.content) {
                cb && cb(null, req);
                return;
            }

            req.parseResBody(result.content, function() {
                cb && cb(null, req);
            });
        });
    });
}

//config.port
function wsServer(config) {
    //web socket interface
    var self = this,
        wss = new WebSocketServer({
            port: config.port
        });
    wss.broadcast = function(data) {
        var key = data.id;
        if (typeof data == "object") {
            data = JSON.stringify(data);
        }

        for (var i in this.clients) {
            try {
                this.clients[i].send(data);
            } catch (e) {
                logUtil.printLog("websocket failed to send data, " + e, logUtil.T_ERR);
            }
        }
    };

    wss.on("connection", function(ws) {
        ws.on("message", function(msg) {
            resToMsg(msg, function(res) {
                res && ws.send(JSON.stringify(res));
            });
        });
    });

    wss.on("close", function() {});

    global.recorder.on("update", function(data) {
        try {
            wss && wss.broadcast({
                type: "update",
                content: data
            });

        } catch (e) {
            console.log("ws error");
            console.log(e);
        }
    });

    self.wss = wss;
}

wsServer.prototype.closeAll = function() {
    var self = this;
    self.wss.close();
}

module.exports = wsServer;