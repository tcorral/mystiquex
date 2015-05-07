module.exports = {
    startHandlers: function (){
        global.killOnExit = {
            processes: []
        };
        require('./safe-exit')();
    }
};