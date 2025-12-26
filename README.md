# 🎮 Bulánci 2025

Moderní multiplayer remake klasické české hry Bulánci! Střílej polštáře, poraž protivníky a staň se legendou!

![Bulánci 2025](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Funkce

- 🌐 **Real-time multiplayer** - Hraj s přáteli online přes WebSockets
- 📱 **PWA podpora** - Instaluj jako mobilní aplikaci
- 🎯 **5 typů zbraní** - Pistole, Samopal, Sniper, Raketa, Brokovnice
- 🔊 **Zvukové efekty** - Plná audio podpora včetně mobile (Web Audio API)
- 🎨 **Moderní design** - Responzivní a touch-friendly rozhraní
- 🤖 **Auto jména** - Automatické generování cool herních jmen
- 🏆 **Leaderboard** - Sleduj své skóre a statistiky (K/D ratio)
- 🕹️ **Mobilní ovládání** - Virtual joystick a tlačítka pro touch zařízení
- 💬 **In-game chat** - Komunikuj s ostatními hráči
- ⚡ **Particle effects** - Vizuální efekty při zásazích a explozích

## 🚀 Jak spustit lokálně

### Požadavky
- Node.js 20.0.0 nebo novější
- npm nebo yarn

### Instalace

1. **Klonuj repository:**
```bash
git clone https://github.com/jendavobora-blip/Vobio.git
cd Vobio
```

2. **Nainstaluj dependencies:**
```bash
npm install
```

3. **Spusť server:**
```bash
npm start
```

4. **Otevři prohlížeč:**
```
http://localhost:3000
```

### Development mode
```bash
npm run dev
```
(Auto-restart při změnách pomocí nodemon)

## 🎮 Ovládání

### Desktop
- **W, A, S, D** nebo **šipky** - Pohyb
- **Myš** - Míření
- **Levé tlačítko myši** nebo **MEZERNÍK** - Střelba
- **1-5** - Změna zbraně
- **ESC** - Menu/Pauza
- **ENTER** - Chat

### Mobile
- **Virtual joystick** - Pohyb (levá strana obrazovky)
- **Tlačítko střelba** - Pravá strana obrazovky
- **Auto zaměření** - Na nejbližšího nepřítele
- **Touch** - Interakce s UI

## 🛠️ Technologie

### Frontend
- **HTML5 Canvas** - Rendering engine
- **Vanilla JavaScript** - Herní logika (žádné frameworky!)
- **CSS3** - Moderní styling s animacemi

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web server
- **Socket.io** - Real-time WebSocket komunikace

### PWA
- **Service Workers** - Offline podpora a caching
- **Web App Manifest** - Instalovatelnost
- **Web Audio API** - Procedurální zvuky

## 📦 Struktura projektu

```
Vobio/
├── public/                 # Statické soubory
│   ├── assets/            # Obrázky a zvuky
│   │   ├── images/        # Ikony a grafika
│   │   └── sounds/        # Zvukové efekty
│   ├── index.html         # Hlavní HTML
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js  # Service Worker
├── src/                   # Zdrojové soubory
│   ├── css/
│   │   └── style.css      # Styling
│   └── js/
│       ├── game.js        # Herní logika
│       ├── multiplayer.js # Socket.io client
│       ├── audio.js       # Audio manager
│       └── utils.js       # Pomocné funkce
├── server.js              # Express + Socket.io server
├── package.json           # Dependencies
├── .gitignore            # Git ignore pravidla
├── .env.example          # Env template
├── LICENSE               # MIT License
└── README.md             # Dokumentace
```

## 🎯 Zbraně

| Zbraň | Damage | Fire Rate | Ammo | Special |
|-------|--------|-----------|------|---------|
| **Pistole** | 10 | Střední | ∞ | Základní zbraň, nikdy nedojde munice |
| **Samopal** | 8 | Velmi rychlá | 30 | Rychlá palba pro close combat |
| **Sniper** | 50 | Pomalá | 10 | Vysoký damage pro precizní střelce |
| **Raketa** | 80 | Velmi pomalá | 5 | Area damage s explozí |
| **Brokovnice** | 30 | Pomalá | 20 | Spread shot pro krátkou vzdálenost |

**Tip:** Kombinuj různé zbraně podle situace! Sniper na dálku, samopal z blízka.

## 🗺️ Herní módy

### Aktuálně implementováno:
- ✅ **Free For All** - Všichni proti všem, získej nejvíce killů!

### Plánované (coming soon):
- 🔜 **Team Deathmatch** - Týmová bitva
- 🔜 **Capture The Flag** - Zachyť vlajku protivníka
- 🔜 **Battle Royale** - Poslední přeživší vyhrává

## 🚀 Deployment

### Render.com
1. Vytvoř nový Web Service na [render.com](https://render.com)
2. Připoj GitHub repository
3. Nastav:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy! 🚀

### Railway.app
```bash
railway login
railway init
railway up
```

### Heroku
```bash
heroku create bulanci-2025
git push heroku main
heroku open
```

### Vlastní VPS (Linux)
```bash
# Nainstaluj Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Klonuj a spusť
git clone https://github.com/jendavobora-blip/Vobio.git
cd Vobio
npm install
npm start

# Pro production použij PM2
npm install -g pm2
pm2 start server.js --name bulanci-2025
pm2 save
pm2 startup
```

## 🎨 Customizace

### Změna barev
Uprav CSS proměnné v `src/css/style.css`:
```css
:root {
  --primary-color: #00d9ff;    /* Hlavní barva */
  --secondary-color: #ff006e;  /* Sekundární barva */
  --bg-color: #1a1a2e;        /* Pozadí */
}
```

### Přidání nových zbraní
1. Přidej zbraň do `Player` class v `server.js`
2. Přidej rendering v `game.js`
3. Přidej zvuk v `audio.js`

### Vlastní mapy
Uprav `worldWidth` a `worldHeight` v `game.js` konstruktoru:
```javascript
this.worldWidth = 3000;  // Větší mapa
this.worldHeight = 2000;
```

## 🐛 Známé problémy a řešení

### Safari iOS - Audio nefunguje
**Řešení:** Klikni na "START GAME" - to odemkne audio context.

### Vysoký ping/lag
**Řešení:** 
- Použij rychlejší internet
- Hostuj server blíže hráčům
- Doporučený ping: <100ms

### Hra se nenačítá
**Řešení:**
1. Zkontroluj konzoli (F12)
2. Vymaž cache (Ctrl+Shift+Del)
3. Zkus jiný prohlížeč

### Service Worker nepracuje
**Řešení:**
- Musíš být na HTTPS (nebo localhost)
- Zkus "Unregister" v DevTools → Application → Service Workers

## 📝 Změnový log

### Version 1.0.0 (2025-01-XX)
- ✅ Iniciální release
- ✅ Multiplayer funkcionalita
- ✅ 5 typů zbraní
- ✅ PWA podpora
- ✅ Mobilní ovládání
- ✅ Chat systém
- ✅ Particle efekty
- ✅ Procedurální audio

## 🤝 Přispívání

Pull requesty jsou vítány! Pro větší změny prosím nejdřív otevři issue k diskuzi.

### Jak přispět:
1. Fork repository
2. Vytvoř feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit změny (`git commit -m 'Add some AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otevři Pull Request

### Code Style
- Používej ES6+ syntaxi
- Dokumentuj nové funkce
- Testuj před commitem
- Dodržuj existující naming conventions

## 📧 Kontakt a podpora

- **Autor:** Jan Vobora
- **GitHub:** [@jendavobora-blip](https://github.com/jendavobora-blip)
- **Repository:** [Vobio](https://github.com/jendavobora-blip/Vobio)

Máš otázku nebo nápad? Otevři [issue](https://github.com/jendavobora-blip/Vobio/issues)!

## 📜 Licence

MIT License - Vytvořeno s ❤️ Janem Voborou

Copyright (c) 2025 Jan Vobora

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🙏 Credits a poděkování

- **Inspirováno:** Originální českou hrou Bulánci
- **Rok:** 2025
- **Technologie:** Node.js, Express, Socket.io, HTML5 Canvas
- **Speciální díky:** České herní komunitě za inspiraci

## 🎓 Learning Resources

Pokud se chceš naučit, jak taková hra vzniká:

- [MDN Web Docs - Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Socket.io Documentation](https://socket.io/docs/)
- [Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 🎉 Fun Facts

- 🚀 Celá hra je napsána ve vanilla JavaScript (bez frameworků!)
- 🎨 Všechny zvuky jsou generované procedurálně (Web Audio API)
- 📦 Velikost celé hry: < 50 KB (bez dependencies)
- ⚡ 60 FPS rendering loop
- 🌍 Funguje offline díky Service Workers

---

**Užij si hru! 🎮🎉**

*Made with 💙 for the Czech gaming community*

---

### Quick Start Commands

```bash
# Instalace
npm install

# Development
npm run dev

# Production
npm start

# Build (pro deployment)
npm run build

# Test
npm test
```

---

### Environment Variables

Vytvoř `.env` soubor (z `.env.example`):

```env
PORT=3000
NODE_ENV=development
```

Pro production nastav:
```env
PORT=3000
NODE_ENV=production
```

---

**⭐ Pokud se ti hra líbí, nezapomeň dát hvězdičku na GitHubu!**
