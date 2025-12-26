class MultiplayerManager {
  constructor(game) {
    this.game = game;
    this.socket = null;
    this.playerId = null;
    this.players = new Map();
    this.connected = false;
  }

  connect() {
    this.socket = io();
    this.setupListeners();
  }

  setupListeners() {
    // Connection established
    this.socket.on('connected', (data) => {
      this.playerId = data.id;
      this.connected = true;
      console.log('Connected to server with ID:', this.playerId);
      
      // Set local player
      if (this.game) {
        this.game.setLocalPlayer(data.player);
      }
    });

    // Receive all players
    this.socket.on('players', (players) => {
      players.forEach(playerData => {
        if (playerData.id !== this.playerId) {
          this.players.set(playerData.id, playerData);
        }
      });
      
      if (this.game) {
        this.game.updateRemotePlayers(this.players);
      }
    });

    // New player joined
    this.socket.on('playerJoined', (player) => {
      if (player.id !== this.playerId) {
        this.players.set(player.id, player);
        if (this.game) {
          this.game.updateRemotePlayers(this.players);
        }
        console.log(`Player ${player.name} joined`);
      }
    });

    // Player left
    this.socket.on('playerLeft', (id) => {
      this.players.delete(id);
      if (this.game) {
        this.game.updateRemotePlayers(this.players);
      }
      console.log(`Player ${id} left`);
    });

    // Player moved
    this.socket.on('playerMoved', (data) => {
      const player = this.players.get(data.id);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.rotation = data.rotation;
      }
    });

    // Player shot
    this.socket.on('playerShot', (data) => {
      if (this.game && data.id !== this.playerId) {
        this.game.createRemoteProjectile(data);
      }
      
      // Play sound
      if (this.game && this.game.audioManager) {
        this.game.audioManager.playWeaponSound(data.weapon);
      }
    });

    // Player hit
    this.socket.on('playerHit', (data) => {
      if (this.game) {
        this.game.handlePlayerHit(data);
      }
      
      // Play hit sound
      if (this.game && this.game.audioManager) {
        this.game.audioManager.playHitSound();
      }
    });

    // Player died
    this.socket.on('playerDied', (data) => {
      if (this.game) {
        this.game.handlePlayerDeath(data);
      }
      
      // Play death sound
      if (this.game && this.game.audioManager) {
        this.game.audioManager.playDeathSound();
      }
      
      console.log(`${data.killerName} killed ${data.victimName} with ${data.weapon}`);
    });

    // Player respawned
    this.socket.on('playerRespawned', (data) => {
      const player = this.players.get(data.id);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.health = data.health;
        player.isAlive = true;
      }
      
      // If it's local player
      if (data.id === this.playerId && this.game && this.game.localPlayer) {
        this.game.localPlayer.x = data.x;
        this.game.localPlayer.y = data.y;
        this.game.localPlayer.health = data.health;
        this.game.localPlayer.isAlive = true;
      }
      
      // Play respawn sound
      if (this.game && this.game.audioManager) {
        this.game.audioManager.playRespawnSound();
      }
    });

    // Weapon changed
    this.socket.on('weaponChanged', (data) => {
      if (this.game && this.game.localPlayer) {
        this.game.localPlayer.currentWeapon = data.weapon;
      }
    });

    // Chat message
    this.socket.on('chatMessage', (data) => {
      if (this.game) {
        this.game.addChatMessage(data);
      }
    });

    // Disconnect
    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });
  }

  join(name, roomId = 'default') {
    if (this.socket) {
      this.socket.emit('join', { name, roomId });
    }
  }

  sendPosition(x, y, rotation) {
    if (this.socket && this.connected) {
      this.socket.emit('move', { x, y, rotation });
    }
  }

  sendShoot(angle, weapon) {
    if (this.socket && this.connected) {
      this.socket.emit('shoot', { angle, weapon });
    }
  }

  sendHit(targetId) {
    if (this.socket && this.connected) {
      this.socket.emit('hit', { targetId });
    }
  }

  changeWeapon(weapon) {
    if (this.socket && this.connected) {
      this.socket.emit('changeWeapon', { weapon });
    }
  }

  sendChatMessage(message) {
    if (this.socket && this.connected) {
      this.socket.emit('chatMessage', { message });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
