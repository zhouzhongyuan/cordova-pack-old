import 'babel-polyfill';
import co from 'co';
import fs from 'fs-extra';
import plistGen from './plistGen.js';
import htmlGen from './htmlGen.js';
import {
    addPlatform,
    emptyDir,
    buildApp,
    releaseFile,
    addKey,
    buildExtras,
    addPlugin,
    processCode,
    createCordova,
    changelibConfigJSPath,
    projectDirName,
    getSvn,
    preparePack,
} from './src/util/';


function pack(cfg){
    var o = new Object();
    o.id = cfg.id;
    o.baseSvn = cfg.baseSvn;
    o.projectSvn = cfg.projectSvn;
    o.appName = cfg.appName;
    o.appEnglish = cfg.appEnglishName;
    o.appDescription = cfg.appDescription;
    o.appIcon = cfg.appIcon;
    o.appContent = cfg.appContent;
    o.appPlugin = cfg.appPlugin || cfg['appPlugin[]'];
    o.projectSvnUser = cfg.projectSvnUser;
    o.projectSvnPassword = cfg.projectSvnPassword;
    o.appPlatform = cfg.appPlatform;
    o.appNameSpace = cfg.appNameSpace;
    o.svnDir = o.appName + '/www';
    o.baseSvnUser = 'zhouzy';
    o.baseSvnPassword = 'zhouzy';
    o.configXML = o.appName + '/config.xml';
    o.projectPath = o.svnDir + '/js/lib/';
    o.projectDir = o.svnDir + '/js/lib/' + projectDirName(o.projectSvn);
    o.libConfigJSPath = o.svnDir + '/js/lib/config/config.js';
    o.platform = cfg.appPlatform;
    o.appBuildType = cfg.appBuildType;
    o.appPackageName = cfg.appPackageName;
    o.appVersion = cfg.appVersion;
    o.appIosMp = cfg.appIosMp;
    o.yigoVersion = cfg.yigoVersion;

    o.apkLink = cfg.apkDownloadLink;
    o.ipaLink = cfg.ipaLink;
    o.androidTargetSdkVersion = cfg.androidTargetSdkVersion;


    o.build = function(){
        return co(function*(){
            cfg.winston.info("pack enviroment initializing......")
            yield preparePack();
            yield emptyDir('working');
            process.chdir('working');
            cfg.winston.info("pack enviroment initialize success")
            cfg.winston.info("create cordova begin")
            yield createCordova(o.appName, o.appNameSpace);
            cfg.winston.info("create cordova success")
            yield processCode(o.configXML, o.appVersion, o.appPackageName, o.appName, o.appDescription, o.appIcon, o.androidTargetSdkVersion, o.appBuildType, o.appPlatform);
            var yigoVersion = o.yigoVersion || 1.6;
            switch (yigoVersion){
                case 1.6:
                    //Yigo 1.6
                    cfg.winston.info("svn checkout app files begin")
                    yield emptyDir(o.svnDir);
                    yield getSvn(o.baseSvn,o.svnDir, 'zhouzy','zhouzy');
                    cfg.winston.info("svn checkout app files success")
                    cfg.winston.info("svn checkout project files begin")
                    yield emptyDir(o.projectDir);
                    yield getSvn(o.projectSvn, o.projectDir,  o.projectSvnUser, o.projectSvnPassword);
                    cfg.winston.info("svn checkout project files success")
                    yield changelibConfigJSPath(o.libConfigJSPath, projectDirName(o.projectSvn));
                    break;
                case 2:
                    //Yigo 2.0
                    const npmCmd = require('npm-spawn');
                    var options = {cwd:'src'};
                    //get source code
                    cfg.winston.info("download source code begin")
                    yield emptyDir('src');
                    yield getSvn(o.baseSvn,'src', 'zhouzy','zhouzy');
                    cfg.winston.info("download source code success");
                    //npm install
                    yield emptyDir(o.svnDir);
                    yield npmCmd(['install'], options);
                    //npm run build
                    options.env = {
                        DEST_DIR:`../${o.appName}/www`
                    };
                    yield npmCmd(['run','build'], options);
                    break;
                default:
                    cfg.winston.info(`NOT SUPPORT Yigo${yigoVersion}`);
            }
            process.chdir(o.appName);
            yield addPlatform(o.appPlatform);
            yield addPlugin(o.appPlugin);
            if(o.appPlatform === 'android'){
                yield buildExtras(); //android
            }
            yield addKey(o.appIosMp);
            yield buildApp(o.platform, o.appBuildType);
            yield releaseFile(o.platform, o.appPlugin,o.appBuildType, o.apkLink, o.ipaLink, o.appName);
            if(o.appPlatform === 'ios'){
                var dest = o.ipaLink;
                var reg = new RegExp('^(.+)\/(?:[^/]+)$');
                dest = reg.exec(dest)[1];
                var SERVER = 'https://dev.bokesoft.com/';
                var ipaUrl = `${SERVER}yigomobile/public/ios/${o.id}/${o.appName}-${o.appBuildType}.ipa`;
                var plistUrl = `${SERVER}yigomobile/public/ios/${o.id}/manifest.plist`;
                var pageUrl = `${SERVER}yigomobile/public/ios/${o.id}/index.html`;
                yield plistGen(o,ipaUrl);
                yield htmlGen(plistUrl, o.appName,pageUrl);
                fs.copySync('manifest.plist', dest+'/manifest.plist');
                fs.copySync('index.html', dest+'/index.html');
            }

            process.chdir('../..');
            yield emptyDir('working');
            return o;
        })
    };

    return o;
};
export default pack;
