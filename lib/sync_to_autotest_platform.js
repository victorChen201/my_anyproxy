var http = require('http');
var qs = require('querystring');
var logUtil = require("./log");

var options = {
    hostname: '10.1.172.175', //172.31.33.112
    // port: 3000, //测试环境需要加这个端口
    path: '/api/casemgmt/apicase/addOrUpdateCase', ///casemgmt/apicase/addOrUpdateCase
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};
function parseData(str) {
    if (typeof str == 'object') {
        return JSON.stringify(str)
    }
    else if(typeof str == 'string'){
        return str
    }
    else
        return str.toString()
}
function isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj=JSON.parse(str);
            if(typeof obj == 'object' && obj ){
                return true;
            }else{
                return false;
            }
        } catch(e) {
            return false;
        }
    }
    return true;
}
function parse_request(coll) {
    var method = coll && coll.method.toUpperCase();
    // console.log(method)
    if (method != 'GET' && method !='POST')
        return false
    // console.log(coll)
    var body = {
        "requestType":"POST",
        "caseName": "testcase002",
        "ownerService": "anyproxy",
        "url": "https://mobile.da.mgtv.com/app/player",
        "caseDesc": "用例描述",
        "ownerTestSuites": [],
        "caseId": "",
        "caseDataGroups": [{
            "groupName": "参数组名",
            "sceneDesc": "测试场景描述",
            "groupId": "",
            "activeForAuto": "true",
            "caseScenePreprocessors": [],
            "caseScenePostprocessors": [],
            "requestHeadersAndBody": {
                "headers": [],
                "body": []
            },
            "assertion": {
                "assertType": "value", //field字段加结构，jsonp，value;SQL("sql","根据SQL语句查询结果断言"), VALUE("value","根据值进行断言,支持与&或|非!运算"),
                                        //FIELD("field","先断言json结构,再断言指定字段值"),
                                        //JSONP("jsonp","去除jsonp前缀后,先断言json结构,再断言指定字段值");
                "assertValue": "",
                "jsonConstructure": "",
                "jsonFields": "",
                "jsonpPrefix": "",
                "assertId": ""
            }
        }]
    };
    body.caseName = coll.name || "用例名称";
    body.url = coll.url;
    body.requestType = coll.method;
    var x = coll.responses;

    console.log(typeof (coll.data));
    body.caseDataGroups[0].assertion.assertValue = parseData(x);
    let bd = (isJSON(coll.data) && JSON.parse(coll.data)) || qs.parse(coll.data);
    console.log(bd);
    //get的参数需要解析出来放到body
    if (method == "GET"){
        body.url = coll.url.split("?")[0];
        bd = qs.parse((coll.url.split("?")[1]));
    }
    //请求header
    var hd = qs.parse(coll.headers,"\n",":");
    // console.log(hd)
    for(var key in hd){
        if (key.toUpperCase() == "CONTENT-LENGTH")
            continue
        let paramater = {
            "type": "key-value",
            "key": "_support",
            "value": "10100001",
            "description": "参数字段描述",
            "fromApi": "",
            "apiParamGroup": ""
        };
        paramater.key = key;
        paramater.value = hd[key];
        body.caseDataGroups[0].requestHeadersAndBody.headers.push(paramater);

    }
    // console.log(body.caseDataGroups[0].requestHeadersAndBody.headers);
    //请求body
    for(var key in bd){
        let paramater = {
            "type": "key-value",
            "key": "_support",
            "value": "10100001",
            "description": "参数字段描述",
            "fromApi": "",
            "apiParamGroup": ""
        };
        paramater.key = key;
        paramater.value = qs.unescape(bd[key]);
        body.caseDataGroups[0].requestHeadersAndBody.body.push(paramater);
    }
    // console.log(tmp.caseDataGroups[0].requestHeadersAndBody.body)
    return body;
}
function sync_case(bd) {
    let send_body = JSON.stringify(bd);
    // console.log(content)
    let req = http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        // logUtil.printLog("STATUS, " + res.statusCode, logUtil.T_TIP);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        // res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            // logUtil.printLog("BODY, " + chunk, logUtil.T_TIP);
        });
    });
    req.on('error', function (e) {
        // logUtil.printLog("problem with request, " + e.message, logUtil.T_ERR);
        console.log('problem with request: ' + e.message);
    });
    console.log(send_body)
    req.write(send_body);
    req.end();
}
function export_cases(case_list){
    // var tmp = JSON.parse(content)
    let tmp = case_list;
    // console.log(tmp)
    for ( var i in tmp.requests){
        let b = parse_request(tmp.requests[i]);
        // console.log(b);
        if(b != false  ){
            sync_case(b)
        }
        else
        {
            continue
        }

    }
}

module.exports = export_cases;