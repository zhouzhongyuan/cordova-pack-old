function getSvn(url,dir,username,password) {
    return new Promise(function (resolve, reject) {
        var Client = require('svn-spawn');
        var client = new Client({
            cwd: dir,
            username: username,
            password: password
        });
        client.checkout(url,function(err, data) {
            if(err){
                reject(new Error(err))
            }
            resolve(data);
        });

    });
};
export default getSvn;