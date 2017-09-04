import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var releaseSchema = new Schema({
    id: String,
    appPackageName: {
        type: String,
        required: true,
        unique: true
    },
    iosVersion: String,
    androidVersion: String,
    iosLink: String,
    androidLink: String,
    appName: String,
    iosUpdateTime: Date,
    androidUpdateTime: Date,
});
export default mongoose.model('release', releaseSchema);
