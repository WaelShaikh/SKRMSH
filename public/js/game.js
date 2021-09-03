const MAX_PLAYER_SPEED = 500;
const BULLET_SPEED = 1000;
const BULLET_LIFE = 1500;
const BULLET_DAMAGE = 10;
var FIRE_RATE = 100;
var MAG_SIZE = 20;
var BULLETS_LEFT = MAG_SIZE;
var RELOAD_TIME = 1000
var feed;
var feedTimeout;

var username;

do {
    username = prompt("Enter Your Name");
} while (username == "null" || username == null || username.trim() == "")

class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y)
    {
        super(scene, x, y, 'bullet');
        this.born = 0;

    }

    fire(shooter)
    {
        this.shooter = shooter;

        this.body.reset(shooter.x, shooter.y);
        this.setRotation(shooter.rotation);
        //this.x = shooter.x + (50 * Math.cos(this.rotation));
        //this.y = shooter.y + (50 * Math.sin(this.rotation));
        this.x = shooter.x;
        this.y = shooter.y;
        this.setVelocityX(BULLET_SPEED * Math.cos(Math.PI * this.angle / 180));
        this.setVelocityY(BULLET_SPEED * Math.sin(Math.PI * this.angle / 180));
        this.setDisplaySize(width / 33 / 1.5, width / 33 / 1.5);
        this.setActive(true);
        this.setVisible(true);


        this.born = 0;
    }

    preUpdate(time, delta)
    {
        super.preUpdate(time, delta);
        /*
                if (this.y <= -32 || this.y >= game.canvas.height)
                {
                    this.setActive(false);
                    this.setVisible(false);
                }
        */
        this.born += delta;
        if (this.born > BULLET_LIFE) {
            this.setActive(false);
            this.setVisible(false);
        }

    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor(scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 25,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
		this.bulletCooldown = 0;
		this.magSize = MAG_SIZE;
		this.bulletsLeft = BULLETS_LEFT;
    }

    fireBullet(shooter)
    {
		this.shooter = shooter;
		this.bulletCooldown = FIRE_RATE;
		this.reloadTime = RELOAD_TIME;

        let bullet = this.getFirstDead(false);

        if (bullet)
        {
            bullet.fire(shooter);
			this.bulletsLeft--;
			//console.log(this.bulletsLeft);
			if (this.bulletsLeft == 0)
			{
				this.bulletsLeft = this.magSize;
				this.bulletCooldown = this.reloadTime;
			}
		}
    }
}
/*
class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, image)
    {
        super(scene, x, y, image);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        this.health = 100;
        //this.inventory = new Inventory();
    }
}
*/
function fullscreen()
{
    game.scale.startFullscreen();
}


if (window.innerHeight > window.innerWidth)
{
    var ratio = screen.height / screen.width;
    var width = 1024;
    var height = width / ratio;
	height += 10;
}
else
{
    var ratio = screen.height / screen.width;
    var width = 1024;
    var height = width * ratio;
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser',
    //width: 800,
    //height: 600,
    width: width,
    height: height,
//    scene: {
//        preload: preload,
//        create: create,
//        update: update
//    },
    scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT,
    },
    input: {
        activePointers: 3,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    antialias: false,
};

var game = new Phaser.Game(config);

var gameScene = new Phaser.Scene("game");

gameScene.preload = function() {
    this.load.image('player', 'assets/white.png');
    this.load.image('bullet', 'assets/black.png');
//	this.load.image('bg', 'assets/Map.png');
	this.load.image('bg', 'assets/2PMap.png');
	this.load.image('green', 'assets/green.png');
    this.load.image('Tiles', 'assets/ExtrudedTiles.png');
//    this.load.image('Tiles', 'assets/Tiles.png');
    this.load.image('ShadowTiles', 'assets/ShadowTiles.png');
//	this.load.tilemapTiledJSON('map', 'assets/Map.json');
	this.load.tilemapTiledJSON('map', 'assets/2PMap.json');
    this.load.plugin('rexvirtualjoystickplugin', 'js/rexvirtualjoystickplugin.min.js');
    //this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
}

gameScene.create = function() {
	this.cameras.main.setVisible(false);
    var self = this;
    this.socket = io();

	this.LPointer = -1;
	this.RPointer = -1;

    this.otherPlayers = this.physics.add.group();

	this.mapWidth = this.textures.get('bg').getSourceImage().width;
    this.mapHeight = this.textures.get('bg').getSourceImage().height;
//	this.add.image(0, 0, 'green').setOrigin(0, 0).setDisplaySize(width * 1.5, width * 1.5 * this.mapHeight / this.mapWidth);
//	this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(width * 1.5, width * 1.5 * this.mapHeight / this.mapWidth);
	this.add.image(0, 0, 'green').setOrigin(0, 0).setDisplaySize(this.mapWidth * 6, this.mapHeight * 6);
//	this.add.image(0, 0, 'bg').setOrigin(0, 0).setDisplaySize(this.mapWidth * 6, this.mapHeight * 6);

    this.socket.emit('log', username);
    /*
        this.socket.on('currentPlayers', function(players) {
            Object.keys(players).forEach(function(id) {
                displayPlayers(self, players[id], 'player');
            });
        });
    */
    this.socket.on('currentPlayers', function(players) {
        //console.log(Object.keys(players).length);
        Object.keys(players).forEach(function(id) {
            if (players[id].playerId === self.socket.id)
                //addPlayer(self, players[id], 'player');
                addPlayer(self, players[id]);
            //else
                //addOtherPlayers(self, players[id], 'player');
                //addOtherPlayers(self, players[id]);
        });
		Object.keys(players).forEach(function(id) {
            if (players[id].playerId != self.socket.id)
                //addPlayer(self, players[id], 'player');
                //addPlayer(self, players[id]);
            //else
                //addOtherPlayers(self, players[id], 'player');
                addOtherPlayers(self, players[id]);
        })
    });

    this.socket.on('newPlayer', function(playerInfo) {
        //displayPlayers(self, playerInfo, 'player');
        //addOtherPlayers(self, playerInfo, 'player');
        addOtherPlayers(self, playerInfo);
    });

	this.socket.on('username', function(id, uname) {
		self.otherPlayers.getChildren().forEach(function(otherPlayer) {
			if (otherPlayer.playerId == id) {
				otherPlayer.username = uname;
			}
		})
	});

    this.socket.on('disconnected', function(playerId, username) {
        /*
        self.players.getChildren().forEach(function(player) {
            if (playerId === player.playerId) {
                player.destroy();
                feed.setText(username + " left");
                clearTimeout(feedTimeout);
                feedTimeout = setTimeout(function() { feed.setText(""); }, 5000);
            }
        });
        */
        self.otherPlayers.getChildren().forEach(function(otherPlayer) {
            if (playerId === otherPlayer.playerId)
                otherPlayer.destroy();
            feed.setText(username + " left");
            clearTimeout(feedTimeout);
            feedTimeout = setTimeout(function() { feed.setText(""); }, 5000);
        });
    });
    /*
        this.socket.on('playerUpdates', function(players) {
            Object.keys(players).forEach(function(id) {
                self.players.getChildren().forEach(function(player) {
                    if (players[id].playerId === player.playerId)
                    {
                        player.setPosition(players[id].x, players[id].y);
                        player.setAngle(players[id].rotation);
                    }
                });
            });
        });
    */
    this.socket.on('playerMoved', function(playerInfo) {
        self.otherPlayers.getChildren().forEach(function(otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId)
            {
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                otherPlayer.setRotation(playerInfo.rotation);
            }
        });
    });
/*
    this.socket.on('ID', function(id) {
        self.id = id;
        console.log(self.id);
    });
*/
    this.socket.on('shot', function(playerId, rot) {
        self.otherPlayers.getChildren().forEach(function(otherPlayer) {
            if (playerId === otherPlayer.playerId) {
				otherPlayer.setRotation(rot);
                otherPlayer.bullets.fireBullet(otherPlayer);
            }
        });
    });
    /*
        this.socket.on('hit', function(playerId, shooterId) {
            self.players.getChildren().forEach(function(player) {
                if (playerId === player.playerId) {
                    console.log("SHOT " + player.playerId);
                }
                if (shooterId === player.playerId) {
                    console.log("SHOOTER " + player.playerId);
                }
            });
        });
    */
    this.socket.on('killed', function(p, s) {
        feed.setText(s + " killed " + p.username);
        clearTimeout(feedTimeout);
        feedTimeout = setTimeout(function() { feed.setText(""); }, 5000);
        //alert(s + " killed" + p);
        if (p.playerId == self.player.playerId) {
			self.player.health = 100;
            self.player.setPosition(self.player.spawnX, self.player.spawnY);
            self.player.setRotation(0);
            self.socket.emit('playerMovement', { x: self.player.x, y: self.player.y, angle: self.player.angle });
        }
    });

    this.socket.on('feedUpdate', function(str) {
        feed.setText(str);
        clearTimeout(feedTimeout);
        feedTimeout = setTimeout(function() { feed.setText(""); }, 5000);
    });

    this.movementJoyStick = this.plugins.get('rexvirtualjoystickplugin').add(this.scene, {
        x: 200,
		x: -500,
        y: this.cameras.main.height - 150,
		y: -500,
        radius: 40,
        //forceMin: 0,
        base: this.add.circle(0, 0, 60, 0x888888, 0.0).setDepth(100).setStrokeStyle(5, 0xffffff, 0.5),
        //thumb: this.add.image(0, 0, 'joystick').setDisplaySize(80, 80).setDepth(100),
        thumb: this.add.circle(0, 0, 60, 0xffffff, 0.5).setDisplaySize(80, 80).setDepth(100),
    });//.on('update', () => {}, this);

    this.shootJoyStick = this.plugins.get('rexvirtualjoystickplugin').add(this.scene, {
        x: this.cameras.main.width - 200,
		x: -500,
        y: this.cameras.main.height - 150,
		y: -500,
        radius: 35,
        //forceMin: 0,
        base: this.add.circle(0, 0, 80, 0x888888, 0.0).setDepth(100).setStrokeStyle(5, 0xffffff, 0.5),
        //thumb: this.add.image(0, 0, 'joystick').setDisplaySize(80, 80).setDepth(100),
        thumb: this.add.circle(0, 0, 60, 0xffffff, 0.5).setDisplaySize(80, 80).setDepth(100),
    });//.on('update', () => {}, this);

	this.input.on('pointerdown', function(pointer){
		if (pointer.x <= 512 && this.movementJoyStick.touchCursor.pointer == undefined) {
			this.movementJoyStick.setPosition(pointer.x, pointer.y);
			this.LPointer = pointer.id;
		}
		else if (pointer.x >= 512 && this.shootJoyStick.touchCursor.pointer == undefined) {
			this.shootJoyStick.setPosition(pointer.x, pointer.y);
			this.RPointer = pointer.id;
		}
 	}, this);

	this.input.on('pointerup', function(pointer){
        if (pointer.id == this.LPointer) {
            this.movementJoyStick.setPosition(-500, -500);
        }
        if (pointer.id == this.RPointer) {
            this.shootJoyStick.setPosition(-500, -500);
        }
    }, this);
    //this.bullets = new Bullets(this);
    //this.bulletCooldown = 0;

    //this.rotation = 0;

	//this.world.setBounds(0, 0, width*1.5, width*1.5);

    this.map = this.make.tilemap({ key: 'map' });
//    this.tileset = this.map.addTilesetImage('Tiles', 'Tiles');
    this.tileset = this.map.addTilesetImage('Tiles', 'Tiles', 8, 8, 1, 2);
    //this.shadowtileset = this.map.addTilesetImage('ShadowTiles', 'ShadowTiles');
/*
    this.Map = this.map.createStaticLayer('Map', this.tileset, 0, 0).setDisplaySize(width * 1.5, width * 1.5);
    this.ShadowMap = this.map.createStaticLayer('Shadows', this.shadowtileset, 0, 0).setDisplaySize(width * 1.5, width * 1.5);
    this.CollisionMap = this.map.createStaticLayer('Collision', this.tileset, 0, 0).setDisplaySize(width * 1.5, width * 1.5);
*/
/*
	this.Map = this.map.createStaticLayer('Map', this.tileset, 0, 0).setDisplaySize(width * 1.5, width * 1.5 * this.mapHeight / this.mapWidth);
    this.ShadowMap = this.map.createStaticLayer('Shadows', this.shadowtileset, 0, 0).setDisplaySize(width * 1.5, width * 1.5 * this.mapHeight / this.mapWidth);
    this.CollisionMap = this.map.createStaticLayer('Collision', this.tileset, 0, 0).setDisplaySize(width * 1.5, width * 1.5 * this.mapHeight / this.mapWidth);
*/

	this.Map = this.map.createLayer('Map', this.tileset, 0, 0).setDisplaySize(this.mapWidth * 6, this.mapHeight * 6);
	this.ShadowMap = this.map.createLayer('Shadows', this.shadowtileset, 0, 0).setDisplaySize(this.mapWidth * 6, this.mapHeight * 6);
	this.CollisionMap = this.map.createLayer('Collision', this.tileset, 0, 0).setDisplaySize(this.mapWidth * 6, this.mapHeight * 6);

    this.CollisionMap.setCollisionByExclusion(-1, true);

    feed = this.add.text(50, 0, "", { fontSize: '20px', color: 'black', strokeThickness: 0, stroke: 'black', fontFamily: 'sans-serif' });
    feed.setScrollFactor(0);
	feed.depth = 10;
}

gameScene.update = function(time, delta) {
    if (this.player) {
        if (this.player.bullets.bulletCooldown > 0) {
            // Reduce bullet cooldown
            this.player.bullets.bulletCooldown -= delta;
        }

        if (this.movementJoyStick.force) {
            let speedMultiplier = (this.movementJoyStick.force < this.movementJoyStick.radius) ? this.movementJoyStick.force / this.movementJoyStick.radius : 1;
            let speed = MAX_PLAYER_SPEED * speedMultiplier;

            velx = speed * Math.cos(Math.PI * this.movementJoyStick.angle / 180);
            vely = speed * Math.sin(Math.PI * this.movementJoyStick.angle / 180);

            this.player.setVelocityX(speed * Math.cos(Math.PI * this.movementJoyStick.angle / 180));
            this.player.setVelocityY(speed * Math.sin(Math.PI * this.movementJoyStick.angle / 180));
        } else {
            velx = 0;
            vely = 0;
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
        }

        if (this.shootJoyStick.force) {
            // Rotate according to joystick
            this.player.setAngle(this.shootJoyStick.angle);
            //this.rotation = this.shootJoyStick.angle;
            // Fire bullet according to joystick
            if (this.shootJoyStick.force >= this.shootJoyStick.radius && this.player.bullets.bulletCooldown <= 0) {

                this.player.bullets.fireBullet(this.player);
                shooting = true;
                this.socket.emit('shoot', this.player.rotation);
                //this.player.bullets.bulletCooldown = FIRE_RATE;
            }
        }

		if (this.player.x < 0 + width/33*1.5/2)
            this.player.x = 0 + width/33*1.5/2;
        if (this.player.y < 0 + width/33*1.5/2)
            this.player.y = 0 + width/33*1.5/2;
		if (this.player.x > this.mapWidth * 6 - 1024 / 33 * 1.5 / 2)
			this.player.x = this.mapWidth * 6 - 1024 / 33 * 1.5 / 2;
		if (this.player.y > this.mapHeight * 6 - 1024 / 33 * 1.5 / 2)
			this.player.y = this.mapHeight * 6 - 1024 / 33 * 1.5 / 2;

        if (this.player.oldPosition && (this.player.oldPosition.x != this.player.x || this.player.oldPosition.y != this.player.y || this.player.oldPosition.rotation != this.player.rotation))
        {
            this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation });
        }

        // save old position data
        this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y,
            rotation: this.player.rotation
        };

        //this.socket.emit('playerMovement', { x: player.x, y: player.y, angle: player.angle });
    }
}

/*
function displayPlayers(self, playerInfo, sprite) {
    const player = self.physics.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(width / 33 * 1.5, width / 33 * 1.5);
    //const player = new Player(this, playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(width/33*1.5,width/33*1.5);
    player.playerId = playerInfo.playerId;
    self.players.add(player);

    self.players.getChildren().forEach(function(p) {
        if (p.playerId === player.playerId) {
            player.username = p.username;
        }
    });

    player.bullets = new Bullets(self);

    self.physics.add.collider(player.bullets, self.CollisionMap, function(b) {
        b.setActive(false);
        b.setVisible(false);
    });

    self.physics.add.overlap(player.bullets, self.players, function(p, b) {
        //console.log("SHOT " + p.playerId);
        //console.log("SHOOTER " + b.shooter.playerId);
        //          if(p.playerId != self.id)
        //               b.setActive(false);b.setVisible(false);
    });

    player.bullets.children.each(function(b) {
        self.physics.add.overlap(self.players, b, function(p, b)
        {
            if (b.shooter != undefined && p.playerId != b.shooter.playerId)
            {
                b.setActive(false);
                b.setVisible(false);
            }
        });
    }, this);

    self.players.getChildren().forEach(function(player) {
        if (self.id === player.playerId)
        {
            self.cameras.main.startFollow(player);
            self.cameras.main.setBounds(0, 0, width * 1.5, width * 1.5);
            self.cameras.main.roundPixels = true;
        }
    });

}
*/

function addPlayer(self, playerInfo) {
    //const player = self.physics.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(width / 33 * 1.5, width / 33 * 1.5);
    //self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(width / 33 * 1.5, width / 33 * 1.5);
	self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(1024 / 33 * 1.5, 1024 / 33 * 1.5);
	//self.player.customBoundsRectangle = new Phaser.Geom.Rectangle(0,0,100,100);
    //self.player.setCollideWorldBounds(true);
    //const player = new Player(this, playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(width/33*1.5,width/33*1.5);
    self.player.playerId = playerInfo.playerId;
    self.player.username = playerInfo.username;
    self.player.health = 100;
    self.player.spawnX = playerInfo.spawnX;
    self.player.spawnY = playerInfo.spawnY;

	self.player.bullets = new Bullets(self);

	self.physics.add.collider(self.player, self.CollisionMap);

    self.physics.add.collider(self.player.bullets, self.CollisionMap, function(b) {
        b.setActive(false);
        b.setVisible(false);
    });
/*
    self.physics.add.overlap(self.player.bullets, self.otherPlayers, function(p, b) {
        //console.log("SHOT " + p.playerId);
        //console.log("SHOOTER " + b.shooter.playerId);
        //          if(p.playerId != self.id)
        //               b.setActive(false);b.setVisible(false);
    });

    self.player.bullets.children.each(function(b) {
        self.physics.add.overlap(self.otherPlayers, b, function(p, b)
        {
            if (b.shooter != undefined && p.playerId != b.shooter.playerId)
            {
                b.setActive(false);
                b.setVisible(false);

                self.player.health -= 10;
                if (self.player.health <= 0) {
                    self.socket.emit('kill', b.shooter);
                }

            }
        }.bind(this));
    }.bind(this));
*/
    self.cameras.main.startFollow(self.player);
//    self.cameras.main.setBounds(0, 0, width * 1.5, width * 1.5);
	self.cameras.main.setBounds(0, 0,self.mapWidth * 6, self.mapHeight * 6);
    self.cameras.main.roundPixels = true;
	self.cameras.main.setVisible(true);
}

function addOtherPlayers(self, playerInfo) {
    self.otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(1024 / 33 * 1.5, 1024 / 33 * 1.5);
    self.otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayer.username = playerInfo.username;

    self.otherPlayers.add(self.otherPlayer);

    self.otherPlayer.bullets = new Bullets(self);

    self.physics.add.collider(self.otherPlayer.bullets, self.CollisionMap, function(b) {
        b.setActive(false);
        b.setVisible(false);
    });

    self.physics.add.overlap(self.otherPlayer.bullets, self.player, function(p, b) {
		b.setActive(false);
		b.setVisible(false);

		self.player.health -= 10;
		if (self.player.health <= 0) {
        	//self.socket.emit('kill', b.shooter.playerId);
			self.socket.emit('kill', b.shooter.username);
		}
    }.bind(this));

	self.physics.add.overlap(self.player.bullets, self.otherPlayer, function(p, b) {
		b.setActive(false);
		b.setVisible(false);
	});

	self.otherPlayers.children.each(function(a) {
		self.otherPlayers.children.each(function(b) {
			if (a.playerId != b.playerId) {
				self.physics.add.overlap(a.bullets, b, function(p,b) {
					b.setActive(false);
					b.setVisible(false);console.log("added overlap");
				});
			}
		}.bind(this));
	}.bind(this));

/*WRONG
    self.physics.add.overlap(self.otherPlayer.bullets, self.otherPlayers, function(p, b) {
        //console.log("SHOT " + p.playerId);
        //console.log("SHOOTER " + b.shooter.playerId);
        if(p.playerId != b.shooter.playerId) {
			b.setActive(false);
			b.setVisible(false);
		}
    });
*/
/*
    self.otherPlayer.bullets.children.each(function(b) {
        self.physics.add.overlap(self.otherPlayers, b, function(p, b)
        {
            if (b.shooter != undefined && p.playerId != b.shooter.playerId)
            {
                b.setActive(false);
                b.setVisible(false);
            }
        });
    }.bind(this));
*/
/*
    self.otherPlayer.bullets.children.each(function(b) {
        self.physics.add.overlap(self.player, b, function(p, b)
        {
            if (b.shooter != undefined && p.playerId != b.shooter.playerId)
            {
                b.setActive(false);
                b.setVisible(false);
            }
        });
    }.bind(this));
*/
/*
	self.otherPlayer.bullets.children.each(function(b) {

        self.physics.add.overlap(self.player, b, function(p, b)
        {
            if (b.shooter != undefined && p.playerId != b.shooter.playerId)
            {
                b.setActive(false);
                b.setVisible(false);

                self.player.health -= 10;
                if (self.player.health <= 0) {
                    self.socket.emit('kill', b.shooter);
                }

            }
        }.bind(this));
    }.bind(this));
*/
}

var titleScene = new Phaser.Scene("title");

titleScene.preload = function() {
	this.load.image('title', 'assets/title.png');
//  this.load.image('bg', 'assets/Map.png');
    this.load.image('bg', 'assets/2PMap.png');
}

titleScene.create = function() {
	this.mapWidth = this.textures.get('bg').getSourceImage().width;
    this.mapHeight = this.textures.get('bg').getSourceImage().height;
    this.add.image(0, 0, 'title').setOrigin(0, 0).setDisplaySize(1024,1024);

	this.input.on("pointerdown", ()=>{game.scene.start("game");game.scene.stop("title")}, titleScene);
}

game.scene.add('title', titleScene);
game.scene.add("game", gameScene);

game.scene.start('title');
