/**
 * 负责所有和文件后缀的相关工作，包括
 *    同名文件根据后缀名确定merge顺序
 *    读取某后缀名的配置文件
 */

var path = require('path'),
    _ = require('lodash'),
    fs = require('fs');

var extNames = ['properties', 'coffee', 'json', 'yaml', 'yml', 'js'];
var packageNames = ['properties', 'coffee-script', 'js-yaml']

var extPackages = {
    properties: {packageName: 'properties', ext: 'properties'},
    ini: {packageName: 'properties', ext: 'ini'},
    coffee: {packageName: 'coffee-script', ext: 'coffee'},
    yaml: {packageName: 'js-yaml', ext: 'yaml'},
    yml: {packageName: 'js-yaml', ext: 'yml'}
}
var extTipTpl = _.template('运行 "npm install --save <%- packageName %>" 以支持.<%- ext %>后缀的配置文件');
var supportExt = {
    js: true,
    json: true
};
_.forIn(extPackages, function (value, key) {
    if (moduleExists(value.packageName)) {
        supportExt[key] = true;
    }
});

function moduleExists(name) {
    try {
        return require.resolve(name);
    }
    catch (e) {
        return false;
    }
}

// 根据后缀名排序，同时验证是否有该类型包的支持
exports.sortByExt = function (files) {
    var map = {}, rtn = [];
    files.forEach(function (file) {
        var ext = getExt(file);
        if (!(ext in supportExt)) {
            throw(extTipTpl(extPackages[ext]));
        }
        map[ext] = file;
    });
    var i = extNames.length,file;
    while(i--){
        file = map[extNames[i]];
        file && rtn.push(file);
    }
    return rtn;
}
function getExt(file){
    return path.extname(file).slice(1);
}

exports.extNames = extNames;

exports.readConfig = function(file){
    var ext = getExt(file);
    if (!(ext in supportExt)) {
        throw(extTipTpl(extPackages[ext]));
    }
    return reader[ext](file);
};

var reader = {
    js:readJavascript,
    json:readJavascript,
    yml:readYaml,
    yaml:readYaml,
    properties:readProperty,
    ini:readIni,
    coffee:readCoffee
};
function readJavascript(path){
    return require(path);
}
function readYaml(path){
    var yamlReader = require('js-yaml');
    return yamlReader.safeLoad(fs.readFileSync(path,'utf8'));
}
function readProperty(path){
    var propertyReader = require('properties');
    return propertyReader.parse(fs.readFileSync(path,'utf8'));
}
function readIni(path){
    var propertyReader = require('properties');
    return propertyReader.parse(fs.readFileSync(path,'utf8'),{
        sections: true,
        variables: true,
        include: true
    });
}
var registCoffee = false;
function readCoffee(path){
    if(!registCoffee){
        var Coffee = require("coffee-script");
        if (Coffee.register) {
            Coffee.register();
        }
        registCoffee = true;
    }
    return require(path);
}
