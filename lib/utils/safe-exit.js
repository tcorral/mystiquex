var handler = function () {
    global.killOnExit.processes.forEach(function (_process) {
        try{
            console.log('Killing process: ' + _process.pid + ' - ' + _process.spawnfile);
            process.kill(_process.pid);
            console.log('Killed');
        }catch(er){
            console.log('Process: ' + _process.pid + ' - ' + _process.spawnfile + 'could not be found');
        }
    });
    global.killOnExit = {
        processes: []
    };
    process.exit(0);
};
module.exports = function () {
    process.on('uncaughtException', handler);
    process.on('SIGINT', handler);
};