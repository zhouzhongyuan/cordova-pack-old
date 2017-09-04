import fs from 'fs-extra';
import _ from 'underscore';
import releaseModel from '../models/release';

function saveData(query){
    return new Promise((resolve, reject) => {
        releaseModel.find({appPackageName: appPackageName}, function (err, data) {
            if (err) {
                reject(err);
            }
            if (data.length) {
                //updage
                releaseModel.findOneAndUpdate({"appPackageName": appPackageName}, query, {new: true}, function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);

                });
            } else {
                //create
                var newQuery = new releaseModel(query);
                newQuery.save(function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            }
        });
    });
}
function updateHTML(data) {
    data = JSON.stringify(data);
    data = JSON.parse(data);
    //generater-html

    fs.readFile('release/index.html', 'utf8', function (err, html) {
        function getLocalTime(date) {
            var a = new Date(date);
            const year = a.getFullYear();
            const month = a.getMonth() + 1;
            const day = a.getDate();
            return [year, month, day].join('-')
        }

        var compiled = _.template(html);
        if (data.androidUpdateTime) {
            const temp = getLocalTime(data.androidUpdateTime);
            data.androidUpdateTime = temp.toString();

        }
        if (data.iosUpdateTime) {
            const temp = getLocalTime(data.iosUpdateTime);

            data.iosUpdateTime = temp.toString();
        }
        var QRCode = require('qrcode');
        const pageUrl = `${serverPath}release/${data.appPackageName}/index.html`;
        QRCode.toDataURL(pageUrl, function (err, url) {
            if (err) {
                console.log(err);
                return err;
            }
            data.url = url;
            const result = compiled(data);
            fs.outputFile(`yigomobile/public/release/${data.appPackageName}/index.html`, result, (err) => {
                if (err) {
                    console.log(err);
                    return err;
                }
                console.log("The file was saved!");
            });
        });
    })
}

function releaseApp(tt) {
    const { appPackageName, appPlatform, appVersion, appName} = tt;
    const serverPath = 'https://dev.bokesoft.com/yigomobile/public/';
    let androidLink = `${serverPath}apk/${tt.id}/${tt.appName}-${tt.appBuildType}.apk`;
    let iosLink = `${serverPath}ios/${tt.id}/index.html`;
    switch (appPlatform) {
        case 'android':
            var query = {
                "appName": appName,
                "appPackageName": appPackageName,
                "androidVersion": appVersion,
                "androidLink": androidLink,
                'androidUpdateTime': new Date(),
            };
            break;
        case 'ios':
            var query = {
                "appName": appName,
                "appPackageName": appPackageName,
                "iosVersion": appVersion,
                "iosLink": iosLink,
                'iosUpdateTime': new Date(),
            };
            break;
    }

    let data = saveData();
    updateHTML(data);
}
export default releaseApp;