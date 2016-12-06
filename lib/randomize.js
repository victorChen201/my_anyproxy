/**
 * Created by shiyl
 * Date: 2016.11.15
 */

var rand = {};

rand.randArr = function(a) {
    return a[Math.floor(a.length * Math.random())]
};
rand.randBool = function() {
    return Math.random() > 0.5
};

rand.randRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

rand.randomString = function(length, type) {
    var mask = '';
    switch (type) {
        case 1:
            mask += 'abcdefghijklmnopqrstuvwxyz';
            break;
        case 2:
            mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            break;
        case 3:
            mask += '0123456789';
            break;
        case 4:
            mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
            break;
        default:
            mask += 'abcdefghijklmnopqrstuvwxyz';
            break;
    }
    // if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    // if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // if (chars.indexOf('#') > -1) mask += '0123456789';
    // if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
};

module.exports = rand;