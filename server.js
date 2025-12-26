require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Game state
const players = new Map();
const rooms = new Map();

// Player class
class Player {
  constructor(id, name, roomId = 'default') {
    this.id = id;
    this.name = name;
    this.roomId = roomId;
    this.x = Math.random() * 1800 + 100;
    this.y = Math.random() * 900 + 100;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 5;
    this.currentWeapon = 'pistol';
    this.weapons = {
      pistol: { ammo: Infinity, damage: 10, fireRate: 300 },
      smg: { ammo: 30, damage: 8, fireRate: 100 },
      sniper: { ammo: 10, damage: 50, fireRate: 1000 },
      rocket: { ammo: 5, damage: 80, fireRate: 2000 },
      shotgun: { ammo: 20, damage: 30, fireRate: 800 }
    };
    this.kills = 0;
    this.deaths = 0;
    this.isAlive = true;
    this.lastShot = 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      health: this.health,
      maxHealth: this.maxHealth,
      currentWeapon: this.currentWeapon,
      weapons: this.weapons,
      kills: this.kills,
      deaths: this.deaths,
      isAlive: this.isAlive
    };
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Handle player joining
  socket.on('join', (data) => {
    const { name, roomId = 'default' } = data;
    const player = new Player(socket.id, name, roomId);
    players.set(socket.id, player);
    
    // Join room
    socket.join(roomId);
    
    // Add to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    // Send player their ID and initial data
    socket.emit('connected', {
      id: socket.id,
      player: player.toJSON()
    });

    // Send current players to new player
    const roomPlayers = Array.from(rooms.get(roomId))
      .map(id => players.get(id))
      .filter(p => p)
      .map(p => p.toJSON());
    socket.emit('players', roomPlayers);

    // Notify others in room about new player
    socket.to(roomId).emit('playerJoined', player.toJSON());

    console.log(`Player ${name} joined room ${roomId}`);
  });

  // Handle player movement
  socket.on('move', (data) => {
    const player = players.get(socket.id);
    if (player && player.isAlive) {
      player.x = data.x;
      player.y = data.y;
      player.rotation = data.rotation;
      
      // Broadcast to others in same room
      socket.to(player.roomId).emit('playerMoved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        rotation: data.rotation
      });
    }
  });

  // Handle shooting
  socket.on('shoot', (data) => {
    const player = players.get(socket.id);
    if (player && player.isAlive) {
      const now = Date.now();
      const weapon = player.weapons[player.currentWeapon];
      
      // Check fire rate
      if (now - player.lastShot >= weapon.fireRate) {
        // Check ammo
        if (weapon.ammo === Infinity || weapon.ammo > 0) {
          if (weapon.ammo !== Infinity) {
            weapon.ammo--;
          }
          
          player.lastShot = now;
          
          // Broadcast shot to room
          io.to(player.roomId).emit('playerShot', {
            id: socket.id,
            x: player.x,
            y: player.y,
            angle: data.angle,
            weapon: player.currentWeapon
          });
        }
      }
    }
  });

  // Handle hit detection (server authoritative)
  socket.on('hit', (data) => {
    const shooter = players.get(socket.id);
    const target = players.get(data.targetId);
    
    if (shooter && target && target.isAlive && shooter.roomId === target.roomId) {
      const weapon = shooter.weapons[shooter.currentWeapon];
      target.health -= weapon.damage;
      
      // Broadcast hit
      io.to(shooter.roomId).emit('playerHit', {
        shooterId: socket.id,
        targetId: data.targetId,
        damage: weapon.damage,
        health: target.health
      });
      
      // Check if target died
      if (target.health <= 0) {
        target.health = 0;
        target.isAlive = false;
        target.deaths++;
        shooter.kills++;
        
        io.to(shooter.roomId).emit('playerDied', {
          killerId: socket.id,
          killerName: shooter.name,
          victimId: data.targetId,
          victimName: target.name,
          weapon: shooter.currentWeapon
        });
        
        // Respawn after 3 seconds
        setTimeout(() => {
          if (players.has(data.targetId)) {
            target.health = target.maxHealth;
            target.isAlive = true;
            target.x = Math.random() * 1800 + 100;
            target.y = Math.random() * 900 + 100;
            
            io.to(shooter.roomId).emit('playerRespawned', {
              id: data.targetId,
              x: target.x,
              y: target.y,
              health: target.health
            });
          }
        }, 3000);
      }
    }
  });

  // Handle weapon change
  socket.on('changeWeapon', (data) => {
    const player = players.get(socket.id);
    if (player && player.weapons[data.weapon]) {
      player.currentWeapon = data.weapon;
      socket.emit('weaponChanged', {
        weapon: data.weapon,
        ammo: player.weapons[data.weapon].ammo
      });
    }
  });

  // Handle chat message
  socket.on('chatMessage', (data) => {
    const player = players.get(socket.id);
    if (player) {
      io.to(player.roomId).emit('chatMessage', {
        playerId: socket.id,
        playerName: player.name,
        message: data.message,
        timestamp: Date.now()
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      // Remove from room
      if (rooms.has(player.roomId)) {
        rooms.get(player.roomId).delete(socket.id);
        if (rooms.get(player.roomId).size === 0) {
          rooms.delete(player.roomId);
        }
      }
      
      // Notify others
      socket.to(player.roomId).emit('playerLeft', socket.id);
      
      // Remove player
      players.delete(socket.id);
      console.log(`Player ${player.name} disconnected`);
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
http.listen(PORT, () => {
  console.log(`🎮 Bulánci 2025 server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});
