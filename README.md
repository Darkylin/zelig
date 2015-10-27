ZELIG 变色龙
===

## 根据环境变量 NODE_ENV 的值决定使用哪个配置文件
默认环境为production

## 一般而言项目的配置文件目录结构形如：

```
|--config
|    |--profiles
|    |     |--development.EXT
|    |     |--beta.EXT
|    |     |--production.EXT
|    |
|    |--common.EXT
|
|--package.json
|--...
```

## 支持的配置文件：
js, yml, yaml, json, coffee, properties, ini; 其中：
- yml,yaml 需要添加依赖 js-yaml
- coffee 格式需要添加依赖 coffee-script
- ini,properties 格式需要添加依赖 properties

## 配置文件所在路径
默认是项目根目录的 config 目录，如上结构图所示。也可以根据启动函数修改，仅支持绝对路径：
```
node app.js --configPath=/home/config
```

## 优先级（基本用不到）
对于同名但后缀不同的文件，zelig都会对其进行合并，各配置文件中的同名配置项在合并时有优先级。
- common的优先级最低。如果有多个类型的同名文件，按照js, coffee, yml, yaml, json, ini, properties的顺序优先级递减。
- 假如 dev.js 和 dev.json 中都对path有定义，那么依据优先级，最终会使用dev.js中的定义

## 支持underscore模板将配置写入配置，如：
*config/common.js*
```js
{
    wechat:{
         getCodeUrl:'...?appid=<%= media.wechat.appid %>...'
    }
}
```
*config/profile/local.yaml*
```yaml
media:
    wechat:
         appid: APPID
```
此时 require('zelig') 将得到：
```json
{
    "wechat": {
        "getCodeUrl": "...?appid=APPID..."
    },
    "media": {
        "wechat": {
            "appid": "APPID"
        }
    }
}
```
Tip:<br>
- 内置一个变量：``_projectDir`` , 值为项目根目录。
- 这带来的坏处是配置的value不能使用``<% %>``模式的文本配置了，推荐使用mustache风格
```
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
```

