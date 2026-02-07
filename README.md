# 🇱🇺 Lëtzebuergesch Practice

A beautiful, modern web app for practicing **Luxembourgish pronunciation** using Text-to-Speech (TTS) and Speech-to-Text (STT) powered by [Sproochmaschinn](https://sproochmaschinn.lu).

![Luxembourgish Practice App](https://img.shields.io/badge/Language-L%C3%ABtzebuergesch-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge)

## ✨ Features

### 🔊 Text-to-Speech (Lauschteren)
- Type Luxembourgish text and hear it spoken aloud
- Choose from 3 authentic voices: **Claude**, **Max**, **Maxine**
- Download audio as WAV files
- Quick practice phrases for common expressions

### 🎤 Speech-to-Text (Schwätzen)  
- Record your Luxembourgish speech
- Get instant transcriptions
- Audio preview of your recording
- Optional speaker identification

### 📱 Mobile-First Design
- Fully responsive on all devices
- Touch-optimized controls
- Safe area support for notched phones
- Beautiful glassmorphism dark theme

## 🚀 Quick Start

### Option 1: Use Online
Visit the live app deployed on Vercel *(URL will be available after deployment)*

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/armanruet/lux-stt-tts.git
   cd lux-stt-tts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3456
   ```

## 🚀 Deploy to Vercel

1. **Fork or clone this repository**
2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
3. **Click "New Project"** and import your repository
4. **Click "Deploy"** - Vercel auto-detects the configuration
5. Your app will be live at `https://your-project.vercel.app`

The app includes serverless API functions that handle the CORS proxy for the Sproochmaschinn API.

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure & semantics |
| **CSS3** | Styling with CSS variables, glassmorphism |
| **Vanilla JS** | No framework dependencies |
| **Sproochmaschinn API** | TTS & STT services |
| **Vercel** | Hosting & serverless functions |

## 📁 Project Structure

```
lux-stt-tts/
├── index.html          # Main HTML file
├── styles.css          # All styles (responsive included)
├── app.js              # Main application logic
├── api-service.js      # Sproochmaschinn API client
├── audio-handler.js    # Audio recording utilities
├── server.js           # Local CORS proxy (dev only)
├── vercel.json         # Vercel configuration
├── api/
│   └── proxy.js        # Serverless CORS proxy function
└── package.json        # Dependencies
```

## 🎯 Usage Tips

### Text-to-Speech
1. Select a voice (Claude, Max, or Maxine)
2. Type or paste Luxembourgish text
3. Click "Schwätzen!" (Speak)
4. Use the audio player to play/download

### Speech-to-Text
1. Click the microphone button to start recording
2. Speak in Luxembourgish
3. Click again to stop
4. Preview your recording and see the transcription

### Quick Phrases
Try these common Luxembourgish expressions:
- *Moien!* - Hello!
- *Wéi geet et?* - How are you?
- *Merci villmools!* - Thank you very much!
- *Äddi, bis geschwënn!* - Goodbye, see you soon!

## 🌐 API Reference

This app uses the [Sproochmaschinn API](https://sproochmaschinn.lu):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/session` | POST | Create session |
| `/api/tts/{session_id}` | POST | Text-to-Speech |
| `/api/stt/{session_id}` | POST | Speech-to-Text |
| `/api/result/{request_id}` | GET | Get results |

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- [Sproochmaschinn](https://sproochmaschinn.lu) - Luxembourgish language technology
- [Zenter fir d'Lëtzebuerger Sprooch](https://portal.education.lu/zls/) - Language resources

---

<p align="center">
  Made with ❤️ for learning Lëtzebuergesch
</p>
