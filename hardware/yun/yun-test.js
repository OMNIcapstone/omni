var firmata = require('firmata');
var magnetPin = 3;

var board = new firmata.Board('/dev/ttyATH0', function(err) {

	if (err) {
		console.log(err);
		return;
	}

	board.pinMode(magnetPin, board.MODES.INPUT);

	board.digitalRead(magnetPin, function(value) {
		console.log(value);
	});


	console.log('ready');

});