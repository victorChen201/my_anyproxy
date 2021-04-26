var qs = require('querystring');

// var options = {
//     host: 'localhost',
//     user: 'root',
//     port: '3306',
//     password: 'root',
//     database: 'report_cases'
// };
var options = {
    host: '10.200.19.65',
    user: 'check',
    port: '3306',
    password: 'PdP2$rh1',
    database: 'check'
};
function createConnection() {
    var connection = mysql.createConnection(options);
    return connection;
}
const expect_table_name ="expect_data";
const actual_table_name = "actual_data";
var mysql=require('mysql');
//实现本地链接
// var db = mysql.createConnection(options)
function parse_request(coll) {
    var method = coll && coll.method.toUpperCase();
    // console.log(method)
    if (method != 'GET' && method !='POST')
        return false
    else
        return true;
}
//响应JSON数据
var responseJSON = function(res,ret){
    if(typeof ret == 'undefined'){
        res.json({code:"-200",msg:"操作失败"});
    }else{
        res.json(ret);
    }
};
function findById(id) {
    var data = function () {
        var promise = new Promise(function (resolve, reject) {
            db.connect();
            db.query(
                'SELECT * FROM report WHERE id=?',id,
                function selectCb(err, results) {
                    if (results) {
                        // console.log(results);
                        resolve(results);
                    }
                    if (err) {
                        console.log(err);
                    }
                    db.end();
                }
            );
        });
        promise.then(function (value) {
            // console.log("promise",value);
            return value;
            // success
        }, function (value) {
            // failure
            console.log("promise failure");
        });
        console.log(promise)
        return promise;
    }();

    // console.log(data.then());
}
function sync_case(case_id, coll) {
    console.log("start connect mysql")
    //引入数据库
    // var mysql=require('mysql');
    // //实现本地链接
    // var db = mysql.createConnection(options)
    let data = {
        case_key:  case_id,
        page_name : '',
        event_name: '',
        path: coll.url.split("?")[1],
        filter_field:'',
        check_info: coll.data
    };
    // 保存
    function save(id) {
        let db = createConnection();
        db.connect(function (err) {
            if (err) {
                console.error('error connecting:' + err.stack);
            }
            console.log('connected as id ' + db.threadId);
        });
        let sql = 'SELECT * FROM %s WHERE id=?'%expect_table_name
        let query = db.query(sql,id, function (error, results, fields) {
            if (error) throw error;
            // console.log('The solution is:', results);
            if(results.length){
                // update(data);
                console.log("start update data");
                let sql = 'UPDATE %s SET ? where id=?'%expect_table_name
                let query = db.query(sql, [data,data.id], function (error, results, fields) {
                    if (error) throw error;
                    console.log('update data ok');
                });
                // console.log(query.sql);
                db.end();
            }
            else {
                // add(data);
                let sql = "INSERT INTO %s SET ?"%expect_table_name
                let query = db.query(sql, data, function (error, results, fields) {
                    if (error) throw error;
                    console.log('insert ok')
                });
                console.log(query.sql); //INSERT INTO posts 'id'=1, 'title'='Hello MySQL'
                db.end();
            }

        });
        // db.end();
        // console.log(query);
    }
    save(data.id);
    // add(data);
    // console.log("end add mysql");
}
//添加
function add(id,coll) {
    // console.log(coll);
    // var url = require("url");
    var req_body = {};
    var sp = coll['reqBody'].match(/_support=[0-9]*/)[0];
    var bid = coll['reqBody'].match(/bid=[.|0-9]*/)[0];
    // console.log("sp",sp);
    // console.log("bid",bid);
    var b = coll['reqBody'].match(/data=(.*)&bid=/);
    if(b==null){
        console.log("不正常数据",b);
        return;
    }
    // console.log("bbbbbbbbbbbbbbbbb\n",b,'\n');
    var d = b && JSON.parse(b[1]);
    req_body[sp.split("=")[0]] = sp.split("=")[1];
    req_body[bid.split("=")[0]] = bid.split("=")[1];
    req_body["data"] = d;
    var date = new Date(parseInt(d['$time']));

    console.log(date)
    console.log(d);
    let data = {
        id:  id,
        host: coll.host,
        // type: coll && coll.method.toUpperCase(),
        device_model: d['$device_id'],
        path: coll.url,
        req_info: JSON.stringify(req_body),
        start_time: date
    };
    console.log(data);
    let db = createConnection();
    db.connect(function (err) {
        if (err) {
            console.error('error connecting:' + err.stack);
        }
        console.log('connected as id ' + db.threadId);
    });
    console.log("start add data");
    var sql = "INSERT INTO "+actual_table_name+" SET ?"
    let query = db.query(sql, data, function (error, results, fields) {
        if (error) throw error;
        console.log('insert ok')
        db.end();
    });
    console.log(query.sql); //INSERT INTO posts 'id'=1, 'title'='Hello MySQL'
    // db.end();
}

function save_cases(case_id,case_list){
    // var tmp = JSON.parse(content)
    let tmp = case_list;
    // console.log(tmp)
    for ( var i in tmp.requests){
        let b = parse_request(tmp.requests[i]);
        // console.log(b);
        if(b != false  ){
            sync_case(case_id,tmp.requests[i])
        }
        else
        {
            continue
        }

    }
}

module.exports = save_cases;
module.exports.find_data = findById;
module.exports.add = add;
