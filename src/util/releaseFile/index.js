import fs from 'fs-extra';

function releaseFile(platform, appPlugin,appBuildType, apkLink, ipaLink, appName){
    return new Promise(function (resolve, reject) {
        var src;
        var dest;
        switch (platform){
            case 'android':
                var isCrosswalk = /crosswalk/;
                if( isCrosswalk.test(appPlugin.toString()) ){
                    src = ['platforms/android/build/outputs/apk/android-armv7-',appBuildType,'.apk'].join('');

                }else{
                    src = ['platforms/android/build/outputs/apk/android-',appBuildType,'.apk'].join('');
                }
                dest = apkLink;
                break;
            case 'ios':
                src = ['platforms/ios/build/device/',appName,'.ipa'].join('');
                dest = ipaLink;
                break;
            default:
                reject('The platform is not support.') ;
        };
        fs.copy(src, dest,function (err, data) {
            if (err) {
                reject(new Error(err))
            }
            resolve(data);
        });
    });
};
export default releaseFile;