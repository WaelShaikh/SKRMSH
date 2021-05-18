var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};
 
var game = new Phaser.Game(config);
 
function preload() {
     this.load.image('player', 'assets/white.png');
     this.load.image('bg', 'assets/grass.png');
}
 
function create() {
     var self = this;
     this.socket = io();

     this.otherPlayers = this.physics.add.group();
     
     this.socket.on('currentPlayers', function(players) {
          console.log(Object.keys(players).length);
          Object.keys(players).forEach(function(id) {
               if(players[id].playerId === self.socket.id)
                    addPlayer(self, players[id]);
               else
                    addOtherPlayers(self, players[id]);
          })
     });
     
     this.socket.on('newPlayer', function(playerInfo) {
          addOtherPlayers(self, playerInfo);
     });
     
     this.socket.on('disconnect', function(playerId) {
          self.otherPlayers.getChildren().forEach(function(otherPlayer) {
               if(playerId === otherPlayer.playerId)
                    otherPlayer.destroy();
          });
     });
        
     this.socket.on('playerMoved', function(playerInfo) {
          self.otherPlayers.getChildren().forEach(function(otherPlayer) {
               if(playerInfo.playerId === otherPlayer.playerId)
               {
                    otherPlayer.setPosition(playerInfo.x, playerInfo.y);
               }
          });
     });
     
     this.up = this.input.keyboard.addKey('W');
     this.down = this.input.keyboard.addKey('S');
     this.left = this.input.keyboard.addKey('A');
     this.right = this.input.keyboard.addKey('D');

}
 
function update() {
     if(this.player)
     {
          //this.physics.collide(this.player, this.otherPlayers);
          //this.otherPlayers.getChildren().forEach(function(otherPlayer) {
          //     this.physics.collide(this.player, otherPlayer);
          //});
          
          if(this.left.isDown && this.right.isDown)
          {
               this.player.body.velocity.x = 0;
          }
          else if(this.left.isDown)
          {
               this.player.body.velocity.x = -200;
          }
          else if(this.right.isDown)
          {
               this.player.body.velocity.x = 200;
          }
          
          if(this.up.isDown && this.down.isDown)
          {
               this.player.body.velocity.y = 0;
          }
          else if(this.up.isDown)
          {
               this.player.body.velocity.y = -200;
          }
          else if(this.down.isDown)
          {
               this.player.body.velocity.y = 200;
          }
          
          // emit player movement
          var x = this.player.x;
          var y = this.player.y;
          
          if(this.player.oldPosition && (this.player.oldPosition.x != x || this.player.oldPosition.y != y))
          {
               this.socket.emit('playerMovement', {x:this.player.x, y:this.player.y});
          }
          
          // save old position data
          this.player.oldPosition = {
               x: this.player.x,
               y: this.player.y
          };
          
     }
}

function addPlayer(self, playerInfo) {
     self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5);//.setDisplaySize(50, 50);
     self.player.setDrag(1000);
     self.player.setMaxVelocity(200);
     self.player.body.collideWorldBounds = true;
     self.physics.add.collider(self.player, self.otherPlayers);
}

function addOtherPlayers(self,playerInfo) {
     const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5);//.setDisplaySize(50, 50);
     otherPlayer.body.immovable = true;otherPlayer.body.moves = false;
     otherPlayer.playerId = playerInfo.playerId;
     self.otherPlayers.add(otherPlayer);
}
