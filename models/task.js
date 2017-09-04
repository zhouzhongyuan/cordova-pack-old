import mongoose from 'mongoose';
var Schema = mongoose.Schema;
var taskSchema = new Schema({
    id: String,
    baseSvn: String,
    appVersion: String,
    projectSvn: String,
    projectSvnUser: String,
    projectSvnPassword: String,
    appName: String,
    appPackageName: String,
    appDescription: String,
    appIcon: String,
    appContent: String,
    appPlugin: String,
    status: String,
    appPlatform: String,
    apkDownloadLink: String,
    startTime: Date,
    appBuildType: String,
    appIosMp: String,
    ipaLink: String,
    yigoVersion: Number,
    appRelease: Boolean,
    androidTargetSdkVersion: Number,
});

export default mongoose.model('task', taskSchema);
