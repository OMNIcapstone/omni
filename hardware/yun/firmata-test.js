console.log('WWW blink start ...');

var ledPin = 13;
var firmata = require('firmata');

var board = new firmata.Board("/dev/ttyATH0", function(err) {
  if (err) {
    console.log(err);
    board.reset();
    return;
  }

  console.log('connected...');
  console.log('board.firmware: ', board.firmware);

  board.pinMode(ledPin, board.MODES.OUTPUT);

  var url = require('url');
  var http = require('http');

  http.createServer(function(request, response) {
    var params = url.parse(request.url, true).query;

    if (params.value.toLowerCase() == 'high') {
      board.digitalWrite(ledPin, board.HIGH);
    } else {
      board.digitalWrite(ledPin, board.LOW);
    }

    response.writeHead(200);
    response.write("The value written was: " + params.value);
    response.end();
  }.bind(this)).listen(8080);

  console.log('Listening on port 8080 ...');
});