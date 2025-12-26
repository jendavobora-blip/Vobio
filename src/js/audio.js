class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = {};
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.unlocked = false;
    this.musicSource = null;
  }

  async unlockAudio() {
    if (!this.unlocked) {
      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a silent sound to unlock
        const buffer = this.context.createBuffer(1, 1, 22050);
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.context.destination);
        source.start(0);
        
        this.unlocked = true;
        console.log('Audio unlocked successfully');
        return true;
      } catch (e) {
        console.error('Failed to unlock audio:', e);
        return false;
      }
    }
    return true;
  }

  // Generate simple beep sound procedurally
  generateBeep(frequency = 440, duration = 0.1, type = 'sine') {
    if (!this.context) return null;
    
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(this.sfxVolume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    
    return { oscillator, gainNode, duration };
  }

  // Play weapon sound (procedurally generated)
  playWeaponSound(weapon) {
    if (!this.context || !this.unlocked) return;

    try {
      let sound;
      switch(weapon) {
        case 'pistol':
          sound = this.generateBeep(200, 0.1, 'square');
          break;
        case 'smg':
          sound = this.generateBeep(180, 0.05, 'square');
          break;
        case 'sniper':
          sound = this.generateBeep(150, 0.3, 'sawtooth');
          break;
        case 'rocket':
          sound = this.generateBeep(100, 0.5, 'sine');
          break;
        case 'shotgun':
          sound = this.generateBeep(120, 0.2, 'sawtooth');
          break;
      }
      
      if (sound) {
        sound.oscillator.start(this.context.currentTime);
        sound.oscillator.stop(this.context.currentTime + sound.duration);
      }
    } catch (e) {
      console.error('Error playing weapon sound:', e);
    }
  }

  playHitSound() {
    if (!this.context || !this.unlocked) return;
    
    try {
      const sound = this.generateBeep(300, 0.1, 'square');
      if (sound) {
        sound.oscillator.start(this.context.currentTime);
        sound.oscillator.stop(this.context.currentTime + sound.duration);
      }
    } catch (e) {
      console.error('Error playing hit sound:', e);
    }
  }

  playExplosionSound() {
    if (!this.context || !this.unlocked) return;
    
    try {
      // Create explosion effect with noise
      const duration = 0.5;
      const bufferSize = this.context.sampleRate * duration;
      const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.context.createBufferSource();
      noise.buffer = buffer;
      
      const gainNode = this.context.createGain();
      gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
      
      noise.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      noise.start(this.context.currentTime);
      noise.stop(this.context.currentTime + duration);
    } catch (e) {
      console.error('Error playing explosion sound:', e);
    }
  }

  playDeathSound() {
    if (!this.context || !this.unlocked) return;
    
    try {
      // Descending tone for death
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, this.context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(this.sfxVolume, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + 0.5);
    } catch (e) {
      console.error('Error playing death sound:', e);
    }
  }

  playRespawnSound() {
    if (!this.context || !this.unlocked) return;
    
    try {
      // Ascending tone for respawn
      const oscillator = this.context.createOscillator();
      const gainNode = this.context.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, this.context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(this.sfxVolume, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      oscillator.start(this.context.currentTime);
      oscillator.stop(this.context.currentTime + 0.3);
    } catch (e) {
      console.error('Error playing respawn sound:', e);
    }
  }

  playPickupSound() {
    if (!this.context || !this.unlocked) return;
    
    try {
      const sound = this.generateBeep(600, 0.2, 'sine');
      if (sound) {
        sound.oscillator.start(this.context.currentTime);
        sound.oscillator.stop(this.context.currentTime + sound.duration);
      }
    } catch (e) {
      console.error('Error playing pickup sound:', e);
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = clamp(volume, 0, 1);
  }

  setSFXVolume(volume) {
    this.sfxVolume = clamp(volume, 0, 1);
  }

  stopAll() {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }
}
