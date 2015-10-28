var _ = require('lodash'),
    listConfigPath = require('./listConfigPath'),
    extSupprot = require('./extSupport'),
    path = require('path');

//默认环境变量
var ENV = process.env.NODE_ENV || 'production';

var zelig = {};

var info = {};

function init() {
    info.ENV = ENV;
    var configPath = listConfigPath.list(ENV);
    info.configPath = configPath;
    var configList = configPath.map(function (path) {
        return extSupprot.readConfig(path);
    });
    configList.unshift(zelig);
    _.merge.apply(_, configList);
    var configObj = _.clone(zelig,true);
    configObj._projectDir = path.resolve(__dirname,'../../../');
    configObj.data = {};
    changeObjStr(zelig,function(str){
        return _.template(str)(configObj);
    });
}
function getInfo(){
    return info;
}

function update() {
    clear();
    init();
}

function clear() {
    _.keys(zelig).forEach(function (key) {
        delete zelig[key];
    });
}
//遍历对象的所有value为字符串的值，对其执行回调，数组和对象会递归
function changeObjStr(obj,cb){
    _.forOwn(obj,function(value,key,o){
        if(_.isString(value)){
            o[key] = cb(value);
        }else if(_.isObject(value)){
            changeObjStr(value,cb);
        }
    })
}
init();
exports.config = zelig;
exports.update = update;
exports.info = getInfo;