var express = require('express'),
    app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var usernames = {};
var usednames = [];
var readyGracze = 0;
var koniecRuchuGraczy = 0;
var iloscBadanGracza = 0;
var limitBadan = 5;
var punktyGraczy = 0;
var zwyciezca = "";
var maxBadan = 0;

	// listen for new web clients:

server.listen(3000, function(){
  console.log('http://localhost:3000');
});

var rooms = ['room1'];

	//	app.listen(port);

app.configure(function() {
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.configure(function () {
  io.set('transports', ['xhr-polling']);
  io.set('polling duration', 10);
});

io.sockets.on('connection', function(socket){

  socket.on('adduser', function(user){
    socket.username = user;
    usernames[user] = user;
    usednames[usednames.length] = socket.username;
    console.log('\n\n--------------------\nGracz ' + user + ' dołączył do gry\nID socket: ' + socket.id + '\n\n');
    usernames[user] = user;
    socket.join('room1');
    socket.broadcast.to('room1').emit('updateinfo', user + ' dołączył do gry!');
    socket.emit('updateusers', usednames);
    socket.broadcast.to('room1').emit('updateusers', usednames);
  });

  socket.on('userReady', function(){
    console.log('\n\n--------------------\nGracz ' + socket.username + ' gotowy\n\n');
    socket.broadcast.to('room1').emit('updateinfo', socket.username + ' jest gotowy');
    readyGracze += 1;
    if (readyGracze === usednames.length){
        console.log('\n\n--------------------\nRozpoczynamy rozgrywkę\n\n');
        socket.broadcast.to('room1').emit('startgame', 'START');
        socket.emit('startgame', 'START');
      }
  });

  socket.on('action', function(data){
    console.log('\n\n--------------------\nGracz ' + socket.username + ' wykonał ruch: ' + data + '\n\n');
    socket.broadcast.to('room1').emit('updateinfo', socket.username + ' wykonał ruch: ' + data);
    socket.emit('updateinfo', 'Wykonałeś ruch: ' + data);
  });

  socket.on('build', function(data){
    console.log('\n\n--------------------\nGracz ' + socket.username + data + '\n\n');
    console.log('\n\n--------------------\nWysyłam updateinfo\n\n');
    socket.broadcast.to('room1').emit('updateinfo', socket.username  + data);
    socket.emit('updateinfo', 'Ruch podjęty: ' + data);
  });

  socket.on('endofround', function(data){
    iloscBadanGracza = data;
    if (maxBadan < data){
      maxBadan = data;
      socket.broadcast.to('room1').emit('districtinfo', maxBadan);
      socket.emit('districtinfo', maxBadan);
    }
    console.log('\n\n--------------------\nGracz ' + socket.username + ' zakończył turę.\nPosiada ' + iloscBadanGracza + ' skończonych badań.\n\n');
    koniecRuchuGraczy +=1;
    if (koniecRuchuGraczy === readyGracze){
      if (maxBadan === limitBadan){
        console.log('\n\n--------------------\nGra Zakończona!\n\n');
        socket.emit('endofgame');
      } else {
        console.log('\n\n--------------------\nNowa Tura\n\n');
        socket.broadcast.to('room1').emit('newround');
        socket.emit('newround');
        koniecRuchuGraczy = 	0;
      }
    }
  });

  socket.on('punkty', function(data){
    console.log('\n\n--------------------\nPrzyjąłem punkty badań od gracza: ' + socket.username + ', liczba punktów badań: ' + data + '\n\n');
    if (data > punktyGraczy){
      punktyGraczy = data;
      zwyciezca = socket.username;
    }
    console.log('\n\n--------------------\nZwyciężył ' + socket.username + ' zdobywając ' + data + ' punktów badań.\n\n')
    socket.broadcast.to('room1').emit('zwyciezyl', socket.username);
    socket.emit('zwyciezyl', 'Zwyciężył ' + socket.username + ' zdobywając ' + data + ' punktów badań.');
  });

  socket.on('disconnect', function () {
    for (i=0; i<usednames.length; i++){
      if (usednames[i] === socket.username){
        usednames.splice(i, 1);
      }
    }
    console.log('\n\n--------------------\n' + socket.username + 'wyszedł\n\n');
    socket.emit('updateusers', usednames);
    socket.broadcast.to('room1').emit('updateusers', usednames);
    socket.broadcast.emit('updatechat', 'gracz, ' + socket.username + ' wyszedł');
  });

});