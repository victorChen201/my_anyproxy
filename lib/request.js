/**
 * Created by shiyl
 * Date: 2016.11.30
 */
var uuid = require('node-uuid');

function request(doc, collectionId, resBody) {
    var self = this,
        req = {};
    req.id = uuid.v4();
    req.collectionId = collectionId;
    req.name = getName(doc);
    req.description = "";
    req.method = doc.method;
    req.headersKvPairs = doc.reqHeader;
    req.headers = getHeaders(doc.reqHeader);
    req.data = doc.reqBody;
    req.dataMode = getDataMode(doc.reqHeader);
    req.responses = [];
    req.timestamp = new Date().getTime();
    req.version = 2;

    req.url = doc.url;
    req.tests = "";

    self.req = req;

}

function getName(doc) {
    var name = doc.path.slice(0, 30);
    return name;
}

function getHeaders(headers) {
    var headerString = "";
    for (key in headers) {
        headerString += key + ": " + headers[key] + "\n";
    }
    return headerString;
}

function getDataMode(headers) {
    if ("content-type" in headers) {
        var contentType = headers["content-type"];
        if (contentType.indexOf("x-www-form-urlencoded") > 0)
            return "urlencoded";
        else if (contentType.indexOf("form-data") > 0)
            return "params";
        else
            return "raw"
    } else
        return "raw"
}

request.prototype.parseResBody = function(content, cb) {
    try {
        data = JSON.parse(content); //解析为json格式,而不是直接使用字符串
    } catch (err) {
        cb && cb();
        return;
    }
    
    var assertHasData = "var jsonData = JSON.parse(responseBody);\n function assertHasData(data,key){\n    var myDate = new Date();\n    var mytime = myDate.toLocaleString() + '.' + myDate.getMilliseconds() + '   ';\n    tests[mytime + 'response has ' + key] = key in data;\n}\n";
    this.req.tests = assertHasData + parseToTestCode(data);
    cb && cb()
}

function parseToTestCode(data, p, pp, _i) {

    p = p ? '.' + p + '' : '';

    if (Object.prototype.toString.call(_i).toLowerCase() !== '[object undefined]') {
        p += '[' + _i + ']';
    }

    pp = pp || '';

    p = pp + p;

    var st = [];

    for (var key in data) {

        switch (Object.prototype.toString.call(data[key]).toLowerCase()) {
            case '[object number]':
                st.push('//检查 ' + key + ', 类型是number, p = ' + p + ', key = ' + key + '\n');

                //检查存在该字段
                st.push('assertHasData(jsonData' + p + ',"' + key + '");\n');

                //检查字段类型是否符合
                st.push('tests["jsonData' + p + '.' + key + ' = "+ Object.prototype.toString.call(jsonData' + p + '["' + key + '"]).toLowerCase()] = Object.prototype.toString.call(jsonData' + p + '["' + key + '"]).toLowerCase()  == "[object number]";\n');

                //检查数值相等
                st.push('tests["jsonData' + p + '.' + key + ' = ' + data[key] + '"] = jsonData' + p + '["' + key + '"]  === ' + data[key] + ';\r\n');

                break;


            case '[object string]':
                st.push('//检查 ' + key + ', 类型是string, p = ' + p + ', key = ' + key + '\n');
                st.push('assertHasData(jsonData' + p + ',"' + key + '");\n');

                //检查字段类型是否符合
                st.push('tests["jsonData' + p + '.' + key + ' = "+ Object.prototype.toString.call(jsonData' + p + '["' + key + '"]).toLowerCase()] = Object.prototype.toString.call(jsonData' + p + '["' + key + '"]).toLowerCase()  == "[object string]";\n');

                //检查字符串相等
                st.push('tests["jsonData' + p + '.' + key + ' = ' + data[key] + '"] = jsonData' + p + '["' + key + '"]  ==  "' + data[key] + '";\r\n');



                break;

            case '[object object]':

                st.push('//检查 ' + key + ', 类型是object, p = ' + p + ', key = ' + key + '\n');

                st.push('assertHasData(jsonData' + p + ',"' + key + '");\n');
                //检查字段类型是否符合
                st.push('tests["jsonData' + p + '.' + key + ' = "+ Object.prototype.toString.call(jsonData' + p + '["' + key + '"]).toLowerCase()] = Object.prototype.toString.call(jsonData' + p + '["' + key + '"]).toLowerCase()   == "[object object]";\r\n');
                st.push(parseToTestCode(data[key], key, p));

            case '[object array]':

                st.push('//检查 ' + key + ', 类型是array, p = ' + p + ', key = ' + key + '\n');

                //检查是否包含这个字段
                st.push('assertHasData(jsonData' + p + ',"' + key + '");\n');

                for (var i = 0; i < data[key].length; i++) {

                    if (Object.prototype.toString.call(data[key][i]).toLowerCase() == '[object object]') {
                        st.push('//=================分支内检查 ' + key + ', 类型是object, p = ' + p + ', key = ' + key + '\n');
                        st.push(parseToTestCode(data[key][i], key, p, i));
                    } else if (Object.prototype.toString.call(data[key][i]).toLowerCase() == '[object array]') {
                        st.push('//===================分支检查 ' + key + ', 类型是array, p = ' + p + ', key = ' + key + '\n');
                        st.push(parseToTestCode(data[key][i], key, p, i));
                    } else {
                        st.push('//===================分支检查 ' + key + ', 类型是数字或文字, p = ' + p + ', key = ' + key + '\n');
                        st.push('assertHasData(jsonData' + p + ',"' + key + '");\n');

                    }
                };
        }
    }



    return st.join('\r\n');
}

request.prototype.get = function() {
    return this.req;
}

request.prototype.getJson = function() {
    var r = {
        'id': this.req.id,
        'collectionId': this.req.collectionId,
        'url': this.req.url,
        'name': this.req.name,
        'description': this.req.description,
        'method': this.req.method,
        'headers': this.req.headers,
        'data': this.req.data,
        'dataMode': this.req.dataMode,
        'responses': this.req.responses,
        'version': this.req.version,
        'timestamp': this.req.timestamp,
        'tests': this.req.tests
    }

    return r
}

module.exports = request;