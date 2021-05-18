const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var players = {};
/*
spawnPoints = [
    { x: 96, y: 96 },
    { x: 1440, y: 96 },
    { x: 1440, y: 1440 },
    { x: 96, y: 1440 }
];
*/
spawnPoints = [
    { x: 600, y: 200 },
    { x: 600, y: 2200 },
];
currentSpawnPoint = 0;

io.on('connection', function(socket) {
    console.log('a user connected ' + socket.request.connection.remoteAddress);

    // create a new player and add it to our players object
    players[socket.id] = {
        playerId: socket.id,
        username: "",
        x: spawnPoints[currentSpawnPoint].x,
        y: spawnPoints[currentSpawnPoint].y,
        spawnX: spawnPoints[currentSpawnPoint].x,
        spawnY: spawnPoints[currentSpawnPoint].y,
        rotation: 0,
    };
    currentSpawnPoint++;
    if (currentSpawnPoint > 1)
        currentSpawnPoint = 0;

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('disconnect', function() {
        console.log('user disconnected' + socket.request.connection.remoteAddress);

        username = players[socket.id].username;
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnected', socket.id, username);
    });

    socket.on('log', function(username) {
        //players[socket.id].username = username;
        //if(players[socket.id].username == "null")
        //     players[socket.id].username = socket.id;
        //console.log(players[socket.id].username);

        players[socket.id].username = username;
		io.emit('username', socket.id, username);
        io.emit('feedUpdate', players[socket.id].username + " joined");
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function(movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('shoot', function(rot) {
        socket.broadcast.emit("shot", socket.id, rot);
    });

    socket.on('kill', function(s) {
        //io.emit('killed', players[socket.id], players[s].username);
		io.emit('killed', players[socket.id], s);
    });

});

server.listen(8082, function() {
    console.log(`Listening on ${server.address().port}`);
});
