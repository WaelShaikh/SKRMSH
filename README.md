# SKRMSH

SKRMSH (pronounced skirmish) is an exciting mobile multiplayer top-down pixel-art twin-stick shooter.  Engage in intense battles with other players in this action-packed arena!

<img src="/images/SKRMSH_1.png" width="480">
<img src="/images/SKRMSH_2.png" width="480">
<img src="/images/SKRMSH_3.png" width="480">

## Try It

Play at: [skrmsh.glitch.me](skrmsh.glitch.me)

## Install Locally
    git clone https://github.com/WaelShaikh/SKRMSH.git
    cd SKRMSH/
    npm install
    npm start

## Technical Details:

### Server-side (Node.js with Express and Socket.io)
+ The server uses Express to create a web server and serves static files from the `/public` directory.
+ It defines a set of spawn points where players can join the game.
+ Socket.io is used to handle WebSocket connections and real-time communication between the server and clients.
+ When a player connects, a new player object is created and added to the `players` object, representing the player's state.
+ The server sends the current list of players to the newly connected player.
+ It listens for various events such as player movement, shooting, and disconnection, and broadcasts these events to other players.

### Client-side (Phaser 3)
+ The game is created using Phaser 3.
+ The game scene is responsible for most of the game logic.
+ It handles player input via virtual joysticks for movement and shooting.
+ Players can shoot bullets with cooldown and reload mechanics.
+ The game world is tile-based and loaded from a Tiled map.
+ Players and bullets are represented as sprites, and collisions are handled with the tilemap.
+ Player movement, shooting, and other actions are synchronized with the server using WebSocket events.
+ The game includes features like player health, respawn, and kill tracking.
+ There's a title scene that serves as the starting screen.
