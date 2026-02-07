# 🇱🇺 Lëtzebuergesch Practice

A beautiful, modern web app for practicing **Luxembourgish pronunciation** using Text-to-Speech (TTS) and Speech-to-Text (STT) powered by [Sproochmaschinn](https://sproochmaschinn.lu).

![Luxembourgish Practice App](https://img.shields.io/badge/Language-L%C3%ABtzebuergesch-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-brightgreen?style=for-the-badge)

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

### Option 1: Run Locally (Recommended)

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

The local server includes a CORS proxy that enables full TTS and STT functionality.

### Option 2: Use Online (Requires CORS Proxy)

The live app at [armanruet.github.io/lux-stt-tts](https://armanruet.github.io/lux-stt-tts) requires a CORS proxy to work.

**To enable the live site:**

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com/) and create a free account
2. Create a new Worker and paste the contents of `cloudflare-worker.js`
3. Deploy and copy your worker URL (e.g., `https://lux-stt-tts-proxy.your-name.workers.dev`)
4. Update `CORS_PROXY_URL` in `api-service.js` with your worker URL
5. Push the changes to GitHub

> ⚠️ **Why?** The Sproochmaschinn API doesn't allow cross-origin requests from browser domains like `github.io`. The Cloudflare Worker acts as a proxy to bypass this restriction.

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure & semantics |
| **CSS3** | Styling with CSS variables, glassmorphism |
| **Vanilla JS** | No framework dependencies |
| **Sproochmaschinn API** | TTS & STT services |
| **GitHub Actions** | CI/CD deployment |
| **GitHub Pages** | Static hosting |

## 📁 Project Structure

```
lux-stt-tts/
├── index.html        # Main HTML file
├── styles.css        # All styles (responsive included)
├── app.js            # Main application logic
├── api-service.js    # Sproochmaschinn API client
├── audio-handler.js  # Audio recording utilities
├── server.js         # Local CORS proxy (dev only)
├── package.json      # Dependencies
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

## 🎯 Usage Tips

### Text-to-Speech
1. Select a voice (Claude, Max, or Maxine)
2. Type or paste Luxembourgish text
3. Click "Lauschteren" (Listen)
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

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- [Sproochmaschinn](https://sproochmaschinn.lu) - Luxembourgish language technology
- [Zenter fir d'Lëtzebuerger Sprooch](https://portal.education.lu/zls/) - Language resources

---

<p align="center">
  Made with ❤️ for learning Lëtzebuergesch
</p>
