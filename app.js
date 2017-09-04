import "babel-polyfill";
import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost/koa-app'); // connec
import pack from './index';
import findTask from './src/findTask';
import releaseApp from './src/releaseApp';
var busy = false;
let buildInterval = null;

async function monitor() {
    try {
        if (busy)
            return;
        console.log('searching...');
        var tt = null;
        let task = await findTask();

        busy = true;
        task.status = "accepted";
        task.save();
        var winston = require('winston');
        var filename = 'yigomobile/public/log/';
        filename += task.id + '.log';
        var fs = require('fs');
        var stream = fs.createWriteStream(filename);
        var file = new (winston.transports.File)({
            stream: stream, handleExceptions: true,
            humanReadableUnhandledException: true
        });
        task.winston = new (winston.Logger)({transports: [file]});

        task.winston.info('begin to pack ', task.id);
        tt = task;
        var packIns = pack(task);
        await packIns.build();

        tt.status = "finished";
        tt.save();
        tt.winston.info('pack success');
        if (tt.appRelease) {
            await releaseApp(tt, task);
        }
        busy = false;
    } catch (e) {
        if (tt) {
            tt.status = "rejected";
            tt.save();
            var path = require('path');
            var appDir = path.dirname(require.main.filename);
            process.chdir(appDir);
            //清空working
            tt.winston.info(`进入文件夹${process.cwd()}`);
            tt.winston.info('错误如下：');
            var err = e.toString();
            console.log(err)
            tt.winston.info(err);
        }
        busy = false;


    };
}



const packUtil = {
    start: function () {
        monitor();
        buildInterval = setInterval(monitor, 20 * 1000);
    },
    stop: function () {
        clearInterval(buildInterval);
    },
    isBusy: function () {
        return busy;
    }
}
packUtil.start();

// TODO
// // 如果遇到Error code 1/2 错误，重启服务器
// if(/Error code 1/.test(err)){
//     process.exit(1);
// }
