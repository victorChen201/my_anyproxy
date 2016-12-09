/**
 * Created by shiyl
 * Date: 2016.11.30
 */
var uuid = require('node-uuid');
function collection(){
    var self = this,
        coll = {};
    coll.id = uuid.v4();
    coll.name = 'default';
    coll.path = '';
    coll.order = [];
    coll.folders = [];
    coll.timestamp = new Date().getTime();
    coll.synced = false;
    coll.requests = [];

    self.coll = coll;
}

collection.prototype.get = function(){
    return this.coll;
}
collection.prototype.addRequests = function(id,req){
    this.coll.order.push(id);
    this.coll.requests.push(req);
}

function getRequests(requests){
    var r = [];
    for(request in requests){
        r.push(request);
    }
    return r;
}

collection.prototype.getJson = function() {
    var json = {
        'id': this.coll.id,
        'name': this.coll.name,
        'order': this.coll.order,
        'folders': this.coll.folders,
        'timestamp': this.coll.timestamp,
        'synced': this.coll.synced,
        'requests': this.coll.requests
    };
    return json;
}

module.exports = collection;