import { cordova } from 'cordova-lib';

function addPluginReal(plugin,variable){
    console.log(`pluginName: ${plugin}.`);
    console.log(`参数: ${variable}.`);
    return new Promise(function (resolve, reject) {
        cordova.plugin('add', plugin, variable,{'verbose': true},function (err, data) {
            console.log(plugin, variable);
            if (err) {
                console.error(err.stack)
                reject(new Error(err))
            }
            resolve(data);
        });
    });
};

export default addPluginReal;