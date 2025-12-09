<div align="center">

# 🎵 Kirby Visualizer

### *Let Kirby groove to your beats!*

[![p5.js](https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white)](https://p5js.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A lightweight interactive music visualizer built with p5.js that brings Kirby to life with your favorite tunes. Drop an audio file onto Kirby, click to play, and watch the magic happen! ✨

![Kirby Visualizer Screenshot](/assets/Kirby.png)

[**🎮 Try it Live!**](https://nupur-gudigar.github.io/Kirby_Visualizer/)

</div>

---

## ✨ Features

🎨 **Dynamic Visuals**
- Color-cycling disco background that pulses with the beat
- Radial spectrum visualizer with vibrant gradient bars
- Responsive canvas that adapts to any screen size

🕺 **Beat-Reactive Animation**
- Kirby bobs, squishes, and tilts to the music
- Arms and feet move in sync with the rhythm
- Blush pulses with high frequencies
- Headphones appear when music is playing

🎧 **Easy Audio Control**
- Drag-and-drop MP3 files directly onto Kirby
- Click to play/pause
- Audio loops automatically while playing
- Visual feedback for all interactions

---

## 🚀 Quick Start

### Option 1: Live Demo
Just visit the [**live demo**](https://nupur-gudigar.github.io/Kirby_Visualizer/) and start playing!

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/nupur-gudigar/Kirby_Visualizer.git
   cd Kirby_Visualizer
   ```

2. **Start a local server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or use any other local server
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

4. **Drag & drop your MP3 onto Kirby and click to play!** 🎵

---

## 🎮 How to Use

| Action | Description |
|--------|-------------|
| 🎵 **Drop Audio** | Drag an MP3 file onto Kirby to load it |
| ▶️ **Play/Pause** | Click anywhere on the canvas to toggle playback |
| 👀 **Hover** | Hover over Kirby to see the drop target ring |

> **💡 Tip:** Make sure to drop the audio file directly on Kirby for best results!

---

## 📁 Project Structure

```
Kirby_Visualizer/
├── 📄 index.html        # Main HTML file with p5.js CDN links
├── 🎨 sketch.js         # Core visualizer logic & audio analysis
├── 💅 style.css         # Minimal styling for fullscreen canvas
├── 📦 p5.js             # p5.js library (local copy)
└── 📦 p5.sound.min.js   # p5.sound library (local copy)
```

---

## 🛠️ Technical Details

**Built With:**
- [p5.js](https://p5js.org/) v1.11.8 - Creative coding library
- [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) - Audio analysis with FFT
- Pure JavaScript - No frameworks required

**Key Features:**
- FFT-based spectrum analysis (1024 bins, 0.4 smoothing)
- Beat detection with adaptive threshold
- HSB color cycling for smooth transitions
- Responsive design that scales to any viewport

---

## 🎨 Customization

Want to tweak the visualizer? Here are some parameters you can adjust in `sketch.js`:

**Background Colors:**
```javascript
const BG = {
  idleColor: '#b3ddfc',  // Color when not playing
  hueDrift: 0.8,         // Speed of color cycling
  beatKick: 18,          // Extra hue shift on beats
  satBase: 70            // Base saturation (0-100)
}
```

**Kirby Motion:**
```javascript
const MOTION = {
  side: 4,        // Side-to-side movement
  bob: 2,         // Vertical bobbing
  squish: 0.04,   // Body squish/stretch
  tilt: 4,        // Head tilt angle
  arm: 8,         // Arm swing range
  foot: 3         // Foot tap distance
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 🔇 **No sound** | Click the canvas after loading audio (browser autoplay policy) |
| ❌ **File won't load** | Make sure it's a valid MP3 file and drop it directly on Kirby |
| 🎯 **Drop ignored** | Look for the white hover ring - that's the drop zone! |
| 🐌 **Performance issues** | Try a smaller audio file or close other browser tabs |

---

## 📄 License

This project is open source and available for personal and educational use.

---

<div align="center">

Made with 💖 and p5.js

**[⭐ Star this repo](https://github.com/nupur-gudigar/Kirby_Visualizer)** if you enjoyed it!

</div>
