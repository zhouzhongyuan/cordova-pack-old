import taskModel from '../models/task';

var findTask = function () {
    return new Promise((resolve, reject) => {
        taskModel.find({status: 'waiting'}, (err, tasks) => {
            if (err) {
                reject(err);
                return;
            }
            if (tasks.length === 0) {
                reject('no task');
                return;
            }
            resolve(tasks[0]);
        })
    })
}
export default findTask;