# Cordova-pack

[online demo](https://dev.bokesoft.com/yigomobile/main)

## Start

```
npm run build

```
## pack

其中的依赖Cordova-lib需要修改文件才能正确使用打包功能


## version
cordova-lib 6.0.0

## Change

svn-spawn:
为了在checkout的时候，不显示file list
```
params = [params, '.'];

```
to
```
params = [params, '.', '-q'];

```