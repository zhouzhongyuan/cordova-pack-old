import 'babel-polyfill';
import fs from 'fs-extra';
import path from 'path';
import plistGen from './plistGen';
import htmlGen from './htmlGen';
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
    addBaiduMapScript,
} from './src/util/';


const workingDir = path.resolve(__dirname, 'working');

function pack(cfg) {
    const o = new Object();
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
    o.svnDir = `${o.appName}/www`;
    o.baseSvnUser = 'zhouzy';
    o.baseSvnPassword = 'zhouzy';
    o.configXML = `${o.appName}/config.xml`;
    o.htmlPath = `${o.appName}/www/index.html`;
    o.projectPath = `${o.svnDir}/js/lib/`;
    o.projectDir = `${o.svnDir}/js/lib/${projectDirName(o.projectSvn)}`;
    console.log(o.svnDir);
    o.libConfigJSPath = path.resolve(__dirname, 'working', o.svnDir, 'js/lib/config/config.js');
    console.log('改变后', o.libConfigJSPath);
    o.platform = cfg.appPlatform;
    o.appBuildType = cfg.appBuildType;
    o.appPackageName = cfg.appPackageName;
    o.appVersion = cfg.appVersion;
    o.appIosMp = cfg.appIosMp;
    o.yigoVersion = cfg.yigoVersion;

    o.apkLink = cfg.apkDownloadLink;
    o.ipaLink = cfg.ipaLink;
    o.androidTargetSdkVersion = cfg.androidTargetSdkVersion;


    o.build = async function () {
        cfg.winston.info('pack enviroment initializing......');
        await preparePack();
        await emptyDir(workingDir);
        process.chdir(workingDir);
        cfg.winston.info('pack enviroment initialize success');
        cfg.winston.info('create cordova begin');
        await createCordova(o.appName, o.appNameSpace);
        cfg.winston.info('create cordova success');
        await processCode(o.configXML, o.appVersion, o.appPackageName, o.appName, o.appDescription, o.appIcon, o.androidTargetSdkVersion, o.appBuildType, o.appPlatform);
        await addBaiduMapScript(o.htmlPath, o.appPlugin);
        const yigoVersion = o.yigoVersion || 1.6;
        switch (yigoVersion) {
        case 1.6:
            // Yigo 1.6
            cfg.winston.info('svn checkout app files begin');
            await emptyDir(o.svnDir);
            await getSvn(o.baseSvn, o.svnDir, 'zhouzy', 'zhouzy');
            cfg.winston.info('svn checkout app files success');
            cfg.winston.info('svn checkout project files begin');
            await emptyDir(o.projectDir);
            await getSvn(o.projectSvn, o.projectDir, o.projectSvnUser, o.projectSvnPassword);
            cfg.winston.info('svn checkout project files success');
            console.log(o.libConfigJSPath);
            await changelibConfigJSPath(o.libConfigJSPath, projectDirName(o.projectSvn));
            break;
        case 2:
            // Yigo 2.0
            const npmCmd = require('npm-spawn');
            var options = { cwd: 'src' };
            // get source code
            cfg.winston.info('download source code begin');
            await emptyDir('src');
            await getSvn(o.baseSvn, 'src', 'zhouzy', 'zhouzy');
            cfg.winston.info('download source code success');
            // npm install
            await emptyDir(o.svnDir);
            await npmCmd(['install'], options);
            // npm run build
            options.env = {
                DEST_DIR: `../${o.appName}/www`,
            };
            await npmCmd(['run', 'build'], options);
            break;
        default:
            cfg.winston.info(`NOT SUPPORT Yigo${yigoVersion}`);
        }
        process.chdir(o.appName);
        await addPlatform(o.appPlatform);
        await addPlugin(o.appPlugin);
        if (o.appPlatform === 'android') {
            await buildExtras(); // android
        }
        await addKey(o.appIosMp);
        await buildApp(o.platform, o.appBuildType);
        await releaseFile(o.platform, o.appPlugin, o.appBuildType, o.apkLink, o.ipaLink, o.appName);
        if (o.appPlatform === 'ios') {
            let dest = o.ipaLink;
            const reg = new RegExp('^(.+)\/(?:[^/]+)$');
            dest = reg.exec(dest)[1];
            const SERVER = 'https://dev.bokesoft.com/';
            const ipaUrl = `${SERVER}yigomobile/public/ios/${o.id}/${o.appName}-${o.appBuildType}.ipa`;
            const plistUrl = `${SERVER}yigomobile/public/ios/${o.id}/manifest.plist`;
            const pageUrl = `${SERVER}yigomobile/public/ios/${o.id}/index.html`;
            await plistGen(o, ipaUrl);
            await htmlGen(plistUrl, o.appName, pageUrl);
            fs.copySync('manifest.plist', `${dest}/manifest.plist`);
            fs.copySync('index.html', `${dest}/index.html`);
        }
        process.chdir('../..');
        // await emptyDir(workingDir);
    };

    return o;
}
export default pack;
