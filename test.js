t = require('./lib');
p = new t.Pinger(8000, 'localhost');
p.start();
setTimeout(function () {
        p.stop();
    }, 5000);
