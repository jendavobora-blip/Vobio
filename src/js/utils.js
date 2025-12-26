// Name generator for automatic player names
const NAME_GENERATOR = {
  prefixes: [
    'Super', 'Mega', 'Ultra', 'Pro', 'Epic', 'Legendary', 'Master',
    'Captain', 'Commander', 'General', 'Sgt', 'Agent', 'Dr',
    'Crazy', 'Mad', 'Wild', 'Silent', 'Shadow', 'Dark', 'Ghost'
  ],
  nouns: [
    'Bulán', 'Warrior', 'Shooter', 'Sniper', 'Hunter', 'Fighter',
    'Pilot', 'Soldier', 'Ninja', 'Samurai', 'Knight', 'Viking',
    'Panda', 'Tiger', 'Dragon', 'Phoenix', 'Wolf', 'Bear', 'Eagle',
    'Rocket', 'Thunder', 'Storm', 'Blaze', 'Frost', 'Spike'
  ],
  
  generate() {
    const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    const number = Math.floor(Math.random() * 999);
    return `${prefix}${noun}${number}`;
  }
};

// Linear interpolation
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Distance between two points
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Random number in range
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Convert degrees to radians
function degToRad(deg) {
  return deg * Math.PI / 180;
}

// Convert radians to degrees
function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

// Circle collision detection
function collisionCircle(x1, y1, r1, x2, y2, r2) {
  const dist = distance(x1, y1, x2, y2);
  return dist < r1 + r2;
}

// Check if point is in rectangle
function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// Normalize angle to 0-2PI
function normalizeAngle(angle) {
  while (angle < 0) angle += Math.PI * 2;
  while (angle > Math.PI * 2) angle -= Math.PI * 2;
  return angle;
}

// Get angle between two points
function angleBetween(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}
