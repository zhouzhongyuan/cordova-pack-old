import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost/koa-app');
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import {
    emptyDir,
} from './src/util/';
import pack from './index';
import findTask from './src/findTask';
import releaseApp from './src/releaseApp';
let busy = false;
let buildInterval = null;

async function monitor() {
    let task = null;
    try {
        if (busy)
            return;
        console.log('searching...');
        task = await findTask();
        busy = true;
        const logFileName = path.resolve(__dirname, '../../pack2/yigomobile/public/log/', `${task.id}.log`);
        const stream = fs.createWriteStream(logFileName);
        const file = new (winston.transports.File)({
            stream: stream,
            handleExceptions: true,
            humanReadableUnhandledException: true
        });
        task.winston = new (winston.Logger)({transports: [file]});

        task.status = "accepted";
        task.save();
        task.winston.log('info', 'Save task status \"accepted\" success.');


        task.winston.info('begin to pack ', task.id);
        var packInstance = pack(task);
        await packInstance.build();

        task.status = "finished";
        task.save();
        task.winston.info('pack success');
        if (task.appRelease) {
            task.winston.info('release.');
            await releaseApp(task);
        }
        busy = false;
    } catch (e) {
        console.log('Catch到了错误：');
        console.log(e);
        if (task) {
            task.status = "rejected";
            task.save();
            task.winston.info('错误如下：');
            const err = e.toString();
            task.winston.info(err);
            console.log('错误开始==============')
            console.log(e)
            console.log('==============错误结束')
            const err65 = /Error\ code\ 65\ for\ command/;
            if(err.match(err65)){
                console.log('Get error 65, restarting...');
                setTimeout(() => {
                    process.exit(1);
                },0);
            }
        }
        busy = false;

    } finally {
        if(!busy){
            const entryPoint = path.dirname(require.main.filename);
            console.log('finally:', entryPoint);
            process.chdir(entryPoint);
            // 清空working
            // await emptyDir('working');
        }
    }
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
