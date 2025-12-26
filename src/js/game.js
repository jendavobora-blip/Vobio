class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.state = 'lobby'; // lobby, playing, paused, gameover
    this.localPlayer = null;
    this.remotePlayers = new Map();
    this.projectiles = [];
    this.powerUps = [];
    this.particles = [];
    this.chatMessages = [];
    this.killFeed = [];
    this.lastUpdate = Date.now();
    this.keys = {};
    this.mouse = { x: 0, y: 0, pressed: false };
    this.touch = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };
    this.camera = { x: 0, y: 0 };
    this.worldWidth = 2000;
    this.worldHeight = 1000;
    
    // Mobile controls
    this.joystick = { active: false, x: 0, y: 0, dx: 0, dy: 0 };
    this.shootButton = { pressed: false };
    
    // Managers
    this.audioManager = new AudioManager();
    this.multiplayerManager = new MultiplayerManager(this);
    
    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.setupInputHandlers();
    this.setupUI();
    
    // Show lobby
    this.showLobby();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupInputHandlers() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      
      // Weapon switching
      if (e.key >= '1' && e.key <= '5') {
        const weapons = ['pistol', 'smg', 'sniper', 'rocket', 'shotgun'];
        const weaponIndex = parseInt(e.key) - 1;
        if (weapons[weaponIndex] && this.localPlayer) {
          this.changeWeapon(weapons[weaponIndex]);
        }
      }
      
      // Pause
      if (e.key === 'Escape' && this.state === 'playing') {
        this.state = 'paused';
        this.showPauseMenu();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.pressed = true;
      if (this.state === 'playing' && this.localPlayer && this.localPlayer.isAlive) {
        this.shoot();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.pressed = false;
    });

    // Touch controls
    this.setupTouchControls();
  }

  setupTouchControls() {
    const joystickArea = document.getElementById('joystick');
    const shootBtn = document.getElementById('shootButton');

    if (joystickArea) {
      joystickArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joystickArea.getBoundingClientRect();
        this.joystick.active = true;
        this.joystick.x = touch.clientX - rect.left - rect.width / 2;
        this.joystick.y = touch.clientY - rect.top - rect.height / 2;
      });

      joystickArea.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (this.joystick.active) {
          const touch = e.touches[0];
          const rect = joystickArea.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          this.joystick.dx = (touch.clientX - rect.left - centerX) / centerX;
          this.joystick.dy = (touch.clientY - rect.top - centerY) / centerY;
          
          // Clamp to circle
          const mag = Math.sqrt(this.joystick.dx * this.joystick.dx + this.joystick.dy * this.joystick.dy);
          if (mag > 1) {
            this.joystick.dx /= mag;
            this.joystick.dy /= mag;
          }
        }
      });

      joystickArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.joystick.active = false;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
      });
    }

    if (shootBtn) {
      shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.shootButton.pressed = true;
        if (this.state === 'playing' && this.localPlayer && this.localPlayer.isAlive) {
          this.shoot();
        }
      });

      shootBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.shootButton.pressed = false;
      });
    }
  }

  setupUI() {
    // Start button
    const startBtn = document.getElementById('startButton');
    if (startBtn) {
      startBtn.addEventListener('click', async () => {
        // Unlock audio
        await this.audioManager.unlockAudio();
        
        // Get player name
        const nameInput = document.getElementById('playerName');
        const playerName = nameInput ? nameInput.value || NAME_GENERATOR.generate() : NAME_GENERATOR.generate();
        
        // Join game
        this.startGame(playerName);
      });
    }

    // Resume button
    const resumeBtn = document.getElementById('resumeButton');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        this.resume();
      });
    }

    // Chat
    const chatInput = document.getElementById('chatInput');
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (chatInput && chatInput.value.trim()) {
          this.multiplayerManager.sendChatMessage(chatInput.value.trim());
          chatInput.value = '';
        }
      });
    }
  }

  showLobby() {
    const lobby = document.getElementById('lobby');
    if (lobby) {
      lobby.style.display = 'flex';
    }
    
    // Generate random name
    const nameInput = document.getElementById('playerName');
    if (nameInput) {
      nameInput.value = NAME_GENERATOR.generate();
    }
  }

  hideLobby() {
    const lobby = document.getElementById('lobby');
    if (lobby) {
      lobby.style.display = 'none';
    }
  }

  showPauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');
    if (pauseMenu) {
      pauseMenu.style.display = 'flex';
    }
  }

  hidePauseMenu() {
    const pauseMenu = document.getElementById('pauseMenu');
    if (pauseMenu) {
      pauseMenu.style.display = 'none';
    }
  }

  resume() {
    this.state = 'playing';
    this.hidePauseMenu();
  }

  startGame(playerName) {
    this.hideLobby();
    this.state = 'playing';
    
    // Connect to server
    this.multiplayerManager.connect();
    this.multiplayerManager.join(playerName);
    
    // Show HUD
    const hud = document.getElementById('hud');
    if (hud) {
      hud.style.display = 'block';
    }
    
    // Show mobile controls on touch devices
    if ('ontouchstart' in window) {
      const mobileControls = document.getElementById('mobileControls');
      if (mobileControls) {
        mobileControls.style.display = 'flex';
      }
    }
    
    // Start game loop
    this.loop();
  }

  setLocalPlayer(playerData) {
    this.localPlayer = playerData;
  }

  updateRemotePlayers(players) {
    this.remotePlayers = new Map(players);
  }

  changeWeapon(weapon) {
    if (this.localPlayer && this.localPlayer.weapons[weapon]) {
      this.localPlayer.currentWeapon = weapon;
      this.multiplayerManager.changeWeapon(weapon);
      this.updateWeaponDisplay();
    }
  }

  updateWeaponDisplay() {
    const weaponName = document.getElementById('weaponName');
    const weaponAmmo = document.getElementById('weaponAmmo');
    
    if (this.localPlayer && weaponName && weaponAmmo) {
      const weapon = this.localPlayer.weapons[this.localPlayer.currentWeapon];
      weaponName.textContent = this.localPlayer.currentWeapon.toUpperCase();
      weaponAmmo.textContent = weapon.ammo === Infinity ? '∞' : weapon.ammo;
    }
  }

  shoot() {
    if (!this.localPlayer || !this.localPlayer.isAlive) return;
    
    const weapon = this.localPlayer.weapons[this.localPlayer.currentWeapon];
    const now = Date.now();
    
    // Check fire rate
    if (now - (this.localPlayer.lastShot || 0) < weapon.fireRate) return;
    
    // Check ammo
    if (weapon.ammo !== Infinity && weapon.ammo <= 0) return;
    
    // Calculate angle
    const worldMouseX = this.mouse.x + this.camera.x;
    const worldMouseY = this.mouse.y + this.camera.y;
    const angle = Math.atan2(worldMouseY - this.localPlayer.y, worldMouseX - this.localPlayer.x);
    
    // Create local projectile
    this.createProjectile(this.localPlayer.x, this.localPlayer.y, angle, this.localPlayer.currentWeapon, true);
    
    // Send to server
    this.multiplayerManager.sendShoot(angle, this.localPlayer.currentWeapon);
    
    // Play sound
    this.audioManager.playWeaponSound(this.localPlayer.currentWeapon);
    
    // Update last shot time
    this.localPlayer.lastShot = now;
    
    // Update ammo display
    this.updateWeaponDisplay();
  }

  createProjectile(x, y, angle, weapon, isLocal = false) {
    const speed = 10;
    const projectile = {
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      weapon: weapon,
      isLocal: isLocal,
      ttl: 2000, // 2 seconds
      createdAt: Date.now(),
      radius: weapon === 'rocket' ? 8 : 4
    };
    
    this.projectiles.push(projectile);
  }

  createRemoteProjectile(data) {
    const speed = 10;
    const projectile = {
      x: data.x,
      y: data.y,
      vx: Math.cos(data.angle) * speed,
      vy: Math.sin(data.angle) * speed,
      weapon: data.weapon,
      isLocal: false,
      ttl: 2000,
      createdAt: Date.now(),
      radius: data.weapon === 'rocket' ? 8 : 4
    };
    
    this.projectiles.push(projectile);
  }

  handlePlayerHit(data) {
    // Update health
    if (data.targetId === this.multiplayerManager.playerId && this.localPlayer) {
      this.localPlayer.health = data.health;
      this.updateHealthBar();
    }
    
    const player = this.remotePlayers.get(data.targetId);
    if (player) {
      player.health = data.health;
    }
    
    // Create hit particles
    const target = data.targetId === this.multiplayerManager.playerId ? this.localPlayer : this.remotePlayers.get(data.targetId);
    if (target) {
      this.createParticles(target.x, target.y, 10, '#ff0000');
    }
  }

  handlePlayerDeath(data) {
    // Update kill feed
    this.addKillFeedMessage(`${data.killerName} killed ${data.victimName}`);
    
    // Update local player if victim
    if (data.victimId === this.multiplayerManager.playerId && this.localPlayer) {
      this.localPlayer.isAlive = false;
      this.localPlayer.deaths++;
    }
    
    // Update local player if killer
    if (data.killerId === this.multiplayerManager.playerId && this.localPlayer) {
      this.localPlayer.kills++;
    }
    
    // Update remote player
    const player = this.remotePlayers.get(data.victimId);
    if (player) {
      player.isAlive = false;
    }
    
    // Create death particles
    const victim = data.victimId === this.multiplayerManager.playerId ? this.localPlayer : this.remotePlayers.get(data.victimId);
    if (victim) {
      this.createParticles(victim.x, victim.y, 30, '#ff0000');
    }
    
    this.updateScoreDisplay();
  }

  createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        color: color,
        life: 1.0,
        decay: 0.02
      });
    }
  }

  addChatMessage(data) {
    this.chatMessages.push({
      playerName: data.playerName,
      message: data.message,
      timestamp: data.timestamp,
      fadeTime: Date.now() + 5000 // Fade after 5 seconds
    });
    
    // Limit chat messages
    if (this.chatMessages.length > 10) {
      this.chatMessages.shift();
    }
    
    // Update chat display
    this.updateChatDisplay();
  }

  updateChatDisplay() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.innerHTML = '';
      this.chatMessages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'chat-message';
        div.textContent = `${msg.playerName}: ${msg.message}`;
        chatMessages.appendChild(div);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  addKillFeedMessage(message) {
    this.killFeed.push({
      message: message,
      timestamp: Date.now(),
      fadeTime: Date.now() + 3000
    });
    
    if (this.killFeed.length > 5) {
      this.killFeed.shift();
    }
  }

  updateHealthBar() {
    const healthFill = document.getElementById('healthFill');
    if (healthFill && this.localPlayer) {
      const percent = (this.localPlayer.health / this.localPlayer.maxHealth) * 100;
      healthFill.style.width = percent + '%';
    }
  }

  updateScoreDisplay() {
    const scoreText = document.getElementById('scoreText');
    if (scoreText && this.localPlayer) {
      scoreText.textContent = `K: ${this.localPlayer.kills} / D: ${this.localPlayer.deaths}`;
    }
  }

  update(deltaTime) {
    if (this.state !== 'playing') return;
    
    // Update local player
    if (this.localPlayer && this.localPlayer.isAlive) {
      // Movement
      let dx = 0;
      let dy = 0;
      
      // Keyboard input
      if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
      if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
      if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
      if (this.keys['d'] || this.keys['arrowright']) dx += 1;
      
      // Joystick input
      if (this.joystick.active) {
        dx = this.joystick.dx;
        dy = this.joystick.dy;
      }
      
      // Normalize diagonal movement
      if (dx !== 0 && dy !== 0) {
        const mag = Math.sqrt(dx * dx + dy * dy);
        dx /= mag;
        dy /= mag;
      }
      
      // Apply movement
      const speed = 5;
      this.localPlayer.x += dx * speed;
      this.localPlayer.y += dy * speed;
      
      // Keep in bounds
      this.localPlayer.x = clamp(this.localPlayer.x, 20, this.worldWidth - 20);
      this.localPlayer.y = clamp(this.localPlayer.y, 20, this.worldHeight - 20);
      
      // Rotation (aim at mouse)
      const worldMouseX = this.mouse.x + this.camera.x;
      const worldMouseY = this.mouse.y + this.camera.y;
      this.localPlayer.rotation = Math.atan2(worldMouseY - this.localPlayer.y, worldMouseX - this.localPlayer.x);
      
      // Send position to server (throttled)
      if (!this.lastPositionSend || Date.now() - this.lastPositionSend > 50) {
        this.multiplayerManager.sendPosition(this.localPlayer.x, this.localPlayer.y, this.localPlayer.rotation);
        this.lastPositionSend = Date.now();
      }
      
      // Update camera
      this.camera.x = this.localPlayer.x - this.canvas.width / 2;
      this.camera.y = this.localPlayer.y - this.canvas.height / 2;
      
      // Keep camera in bounds
      this.camera.x = clamp(this.camera.x, 0, this.worldWidth - this.canvas.width);
      this.camera.y = clamp(this.camera.y, 0, this.worldHeight - this.canvas.height);
      
      // Auto shoot on mobile
      if (this.shootButton.pressed && Date.now() - (this.localPlayer.lastShot || 0) > 300) {
        this.shoot();
      }
    }
    
    // Update projectiles
    this.projectiles = this.projectiles.filter(proj => {
      proj.x += proj.vx;
      proj.y += proj.vy;
      
      // Check TTL
      if (Date.now() - proj.createdAt > proj.ttl) {
        return false;
      }
      
      // Check bounds
      if (proj.x < 0 || proj.x > this.worldWidth || proj.y < 0 || proj.y > this.worldHeight) {
        return false;
      }
      
      // Check collision with players (only for local projectiles)
      if (proj.isLocal) {
        // Check against remote players
        for (const [id, player] of this.remotePlayers) {
          if (player.isAlive && collisionCircle(proj.x, proj.y, proj.radius, player.x, player.y, 20)) {
            // Hit detected
            this.multiplayerManager.sendHit(id);
            this.createParticles(proj.x, proj.y, 5, '#ffff00');
            return false;
          }
        }
      }
      
      return true;
    });
    
    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // Gravity
      p.life -= p.decay;
      return p.life > 0;
    });
    
    // Update chat message fades
    const now = Date.now();
    this.chatMessages = this.chatMessages.filter(msg => now < msg.fadeTime);
    this.killFeed = this.killFeed.filter(msg => now < msg.fadeTime);
    
    // Update displays
    this.updateHealthBar();
    this.updateScoreDisplay();
    this.updateWeaponDisplay();
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context
    this.ctx.save();
    
    // Apply camera transform
    this.ctx.translate(-this.camera.x, -this.camera.y);
    
    // Draw world bounds
    this.ctx.strokeStyle = '#16213e';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(0, 0, this.worldWidth, this.worldHeight);
    
    // Draw grid
    this.ctx.strokeStyle = '#0f1624';
    this.ctx.lineWidth = 1;
    const gridSize = 100;
    for (let x = 0; x < this.worldWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.worldHeight);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.worldHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.worldWidth, y);
      this.ctx.stroke();
    }
    
    // Draw remote players
    for (const [id, player] of this.remotePlayers) {
      if (player.isAlive) {
        this.drawPlayer(player, false);
      }
    }
    
    // Draw local player
    if (this.localPlayer) {
      this.drawPlayer(this.localPlayer, true);
    }
    
    // Draw projectiles
    this.projectiles.forEach(proj => {
      this.ctx.fillStyle = proj.weapon === 'rocket' ? '#ff6600' : '#00d9ff';
      this.ctx.beginPath();
      this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Draw particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;
    
    // Restore context
    this.ctx.restore();
    
    // Draw kill feed
    this.drawKillFeed();
  }

  drawPlayer(player, isLocal) {
    // Body
    this.ctx.fillStyle = isLocal ? '#00d9ff' : '#ff006e';
    this.ctx.beginPath();
    this.ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Gun direction
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(player.x, player.y);
    this.ctx.lineTo(
      player.x + Math.cos(player.rotation) * 30,
      player.y + Math.sin(player.rotation) * 30
    );
    this.ctx.stroke();
    
    // Name
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(player.name, player.x, player.y - 30);
    
    // Health bar
    const barWidth = 40;
    const barHeight = 4;
    const healthPercent = player.health / player.maxHealth;
    
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(player.x - barWidth / 2, player.y - 25, barWidth, barHeight);
    
    this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff88' : (healthPercent > 0.25 ? '#ffaa00' : '#ff0055');
    this.ctx.fillRect(player.x - barWidth / 2, player.y - 25, barWidth * healthPercent, barHeight);
  }

  drawKillFeed() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    
    let y = 100;
    this.killFeed.forEach((msg, index) => {
      const age = Date.now() - msg.timestamp;
      const alpha = age > 2000 ? 1 - (age - 2000) / 1000 : 1;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillText(msg.message, 10, y);
      y += 20;
    });
    this.ctx.globalAlpha = 1;
  }

  loop() {
    if (this.state === 'playing' || this.state === 'paused') {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;
      
      if (this.state === 'playing') {
        this.update(deltaTime);
      }
      
      this.render();
      
      requestAnimationFrame(() => this.loop());
    }
  }
}

// Start game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
  game = new Game();
});
