var net = require('net');
var utils = require('spdy').utils;
var Frame = require('spdy').Frame;


var Pinger = exports.Pinger = function (port, host) {
	if (!(this instanceof Pinger))
		throw Error('not called with new');
	
	if (!port)
		throw Error('no port given');
	
	var pinger = this;
	this.socket = new net.Socket();
	this.port = port;
	this.host = host;
	this.frame = new Frame();
	this.frame.headers = {
		c: true,
		version: 3,
		type: 'PING',
		length: 4,
		pingId: 1
	};
	var buffers = [];
	this.socket.on('data', function (data) {
		buffers.push(data);
	});
	this.socket.on('end', function () {
		var buffer = utils.concatBuffers(buffers);
		var frame = new Frame(buffer);
		if (frame.isPing()) {
			console.log('PING REPLY FROM [' + pinger.socket.remoteAddress + ':' + pinger.socket.remotePort + '] id=' + frame.headers.pingId);
		}
		buffers = [];
	});
}

Pinger.prototype.connect = function () {
	this.socket.connect(this.port, this.host);
}

Pinger.prototype.ping = function () {
	var frame_buffer = this.frame.toBuffer();
	console.log('PING TO [' + this.socket.remoteAddress + ':' + this.socket.remotePort + '] id=' + this.frame.headers.pingId);
	this.socket.write(frame_buffer);
	this.frame.headers.pingId++;
}

Pinger.prototype.end = function () {
	this.socket.end();
}

Pinger.prototype.start = function () {
	var pinger = this;
	console.log('Will ping [' + this.host + ':' + this.port + ']');
	this.intervalId = setInterval(function () {
		pinger.connect();
		pinger.ping();
		pinger.end();
	}, 1000);
}

Pinger.prototype.stop = function() {
	clearInterval(this.intervalId);
	this.socket.end();
}

exports.createPinger = function (port, host, callback) {
	return new Pinger().connect(port, host, callback);
}