const IP = '1.1.8.30';
export default {
    db: {
        uri: `mongodb://${IP}/koa-app`,
        options: {
            // user: 'admin',
            // pass: 'admin',
        },
    },
    server: {
        upload: `http://${IP}:3001/upload`,
        download: `http://${IP}:3001/download`,
        checkUpdate: 'https://dev.bokesoft.com/yigomobile/checkupdate',
    },
};
