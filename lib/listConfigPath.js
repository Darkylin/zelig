var fs = require('fs'),
    PATH = require('path'),
    glob = require('glob').sync,
    minimist = require('minimist'),
    _ = require('lodash'),
    ext = require('./extSupport');

var argv = minimist(process.argv.slice(2)),
    configPath = argv.configPath || PATH.resolve(__dirname, '../../../config/'),
    extNames = '.@(' + ext.extNames.join('|') + ')',
    env = process.env.NODE_ENV || 'production';

if (!_.endsWith(configPath, '/')) {
    configPath = configPath + '/';
}

var COMMON_ENV_REG = /_(\w+)\./;

var globConfig = {cwd: configPath};


function listConfigPath() {
    //找到符合条件的配置文件，每一个都可能是一个集合，因为允许同文件名，不同后缀名的合并
    var commonConfigPaths = // common.EXT 通用配置，优先级最低
            glob('common' + extNames, globConfig),
        commonEnvConfigPaths = // common_ENV^.EXT 通用配置，优先级中等。如 env=dev1, 这里得到的就是common_dev文件
            glob('common_*' + extNames, globConfig)
                .filter(function (name) {
                    return _.startsWith(env, COMMON_ENV_REG.exec(name)[1]);
                }),
        envConfigPaths = // profiles/env.EXT 环境变量配置，优先级最高
            glob('profiles/' + env + extNames, globConfig);

    // 所有待merge文件
    var mergeList =
        _.chain([commonConfigPaths, commonEnvConfigPaths, envConfigPaths])
            .map(function (arr) {
                return ext.sortByExt(arr)
            })
            .flatten()
            .map(function (file) {//补全文件路径
                return PATH.join(configPath, file);
            })
            .value();

    return mergeList;
}

module.exports = {
    list:listConfigPath,
    configPath:configPath
};