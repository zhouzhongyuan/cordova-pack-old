var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var mobileProvisionSchema   = new Schema({
    id: String,
    UUID: String,
    Name: String,
    appId: String
});

module.exports = mongoose.model('mobileProvision', mobileProvisionSchema);