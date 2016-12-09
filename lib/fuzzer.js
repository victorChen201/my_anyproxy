var generater = {};
var random = require('./randomize')
var qs = require('querystring');
var accecptCompress = ['compress', 'deflate', 'exi', 'gzip', 'identity', 'pack200-gzip',
    'brotli', 'bzip2', 'lzma', 'peerdist', 'sdch', 'xpress', 'xz'
];

generater.generate = function(options, fuzz) {
    var fuzzRule = [];

    fuzzRule.push(options);

    if (!fuzz)
        return fuzzRule;

    fuzzRule.push(testCase1(options));
    fuzzRule.push(testCase2(options));
    fuzzRule.push(testCase3(options));
    fuzzRule.push(testCase4(options));
    fuzzRule.push(testCase5(options));
    fuzzRule.push(testCase6(options));
    fuzzRule.push(testCase7(options));
    fuzzRule.push(testCase8(options));
    fuzzRule.push(testCase9(options));
    fuzzRule.push(testCase10(options));
    fuzzRule.push(testCase11(options));
    return fuzzRule;
};

//no headers
var testCase1 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "no headers";
    testOptions.headers = {};
    return testOptions;
}

var testCase2 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "no cookie";
    testOptions.headers['cookie'] = '';
    return testOptions;
}

var testCase3 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "error cookie";
    testOptions.headers['cookie'] = '__guid=';
    return testOptions;
}

var testCase4 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "no param";
    testOptions.urlPattern.query = '';
    testOptions.path = options.urlPattern.pathname + '?' + testOptions.urlPattern.query;
    return testOptions;
}

var testCase5 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "more param";
    var params = qs.parse(testOptions.urlPattern.query);
    params['test'] = 'zz';
    testOptions.urlPattern.query = qs.stringify(params);
    testOptions.path = options.urlPattern.pathname + '?' + testOptions.urlPattern.query;
    return testOptions;
}

var testCase6 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "fuzz param";
    var params = qs.parse(testOptions.urlPattern.query);
    for (var key in params) {
        if (!params.hasOwnProperty(key)) continue;
        if (isNumber(params[key]))
            params[key] = random.randRange(-10000, 10000);
        else
            params[key] = random.randomString(random.randRange(0, 1000), 4);
    }
    testOptions.urlPattern.query = qs.stringify(params);
    testOptions.path = options.urlPattern.pathname + '?' + testOptions.urlPattern.query;
    return testOptions;
}

var testCase7 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "param no value";
    var params = qs.parse(testOptions.urlPattern.query);
    for (var key in params) {
        if (!params.hasOwnProperty(key)) continue;
        if (isNumber(params[key]))
            params[key] = undefined;
        else
            params[key] = '';
    }
    testOptions.urlPattern.query = qs.stringify(params);
    testOptions.path = options.urlPattern.pathname + '?' + testOptions.urlPattern.query;
    return testOptions;
}



var testCase8 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "fuzz date";
    testOptions.headers['accept-datetime'] = 'Tue, 15 Nov 1994 08:12:31 GMT';
    testOptions.headers['Date'] = 'Tue, 15 Nov 1994 08:12:31 GMT';
    return testOptions;
}

var testCase9 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "fuzz auth";
    testOptions.headers['From'] = 'shiyunlong@365rili.com';
    testOptions.headers['Proxy-Authorization'] = 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==';
    return testOptions;
}

var testCase10 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "fuzz content";
    testOptions.headers['accept-language'] = 'es';
    testOptions.headers['content-disposition'] = 'form-data; name="AttachedFile1"; filename="photo-1.jpg"';
    testOptions.headers['accept-encoding'] = random.randArr(accecptCompress);
    testOptions.headers['Pragma'] = 'cache';
    return testOptions;
}

var testCase11 = function(options) {
    var testOptions = clone(options)
    testOptions.description = "fuzz date";
    testOptions.headers['accept-datetime'] = 'Tue, 15 Nov 1994 08:12:31 GMT';
    testOptions.headers['Date'] = 'Tue, 15 Nov 1994 08:12:31 GMT';
    return testOptions;
}


function clone(a) {
    var b = JSON.parse(JSON.stringify(a));
    b.test = true;
    return b;
}

function isNumber(num) {
    return !isNaN(parseInt(num) && isFinite(num))
}


module.exports.generater = generater;