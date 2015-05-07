var getHandler = function (detachedProcesses) {
    return function () {
        detachedProcesses.processes.forEach(function (_process){
            console.log('Killing process: ' + _process.pid + ' - ' + _process.command + ' in ' + _process.cwd);
            process.kill(_process.pid);
            console.log('Killed');
        });
        detachedProcesses.processes = [];
        process.exit(0);
    };
};
module.exports = function (detachedProcesses) {
    var handler = getHandler(detachedProcesses);
    process.on('uncaughtException', handler);
    process.on('SIGINT', handler);
};