const ip = require("ip");
const IP = ip.address();
const qs = require('querystring');
const cases_database = require('./saveToDatabase');

function fetchReportData(id,item) {
    // console.log(host,path);
    // if (item.host == IP+":8001"){
    //     var path = item.path.split("?")[0];
    //     if(path.split("?")[0] == "/test"){
    //         //start compare
    //         var p = qs.parse((item.path.split("?")[1]));
    //         // var body = item.reqBody;
    //         // let bd = isJSON(body) && JSON.parse(body);
    //         console.log(p);
    //         var cache_datas = global.recorder && global.recorder.getAllData();
    //         console.log(cache_datas.length);
    //         // cases_database.find_data(p.id);
    //
    //     }
    //     else if(path == "/delete"){
    //         //clear db
    //         global.recorder && global.recorder.removeRecord({"host":"ec.log.mgtv.com"});
    //     }
    // }
    if (item.host == "ec.log.mgtv.com"){

        cases_database.add(id,item);
    }
}
module.exports.fetchReportData = fetchReportData;