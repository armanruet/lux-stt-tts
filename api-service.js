/**
 * Sproochmaschinn API Service
 * Handles all communication with the Luxembourgish TTS/STT API
 * Uses local proxy to avoid CORS issues
 */

class SproochmaschinnAPI {
    constructor() {
        // Detect environment: use proxy on localhost, direct API on production
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        // In production (GitHub Pages), use direct API URL
        // Locally, use proxy to avoid CORS
        this.baseUrl = isLocalhost ? '' : 'https://sproochmaschinn.lu';
        this.isProduction = !isLocalhost;

        this.sessionId = null;
        this.websocket = null;
        this.sessionCheckInterval = null;
        this.onSessionChange = null;
        this.onWebSocketMessage = null;

        console.log(`API Mode: ${isLocalhost ? 'Development (proxy)' : 'Production (direct)'}`);
    }

    async init(onSessionChange) {
        this.onSessionChange = onSessionChange;
        await this.createSession();
        this.startSessionKeepAlive();
    }

    async createSession() {
        try {
            this.onSessionChange?.('connecting');
            const response = await fetch(`${this.baseUrl}/api/session`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`Session failed: ${response.status}`);
            const data = await response.json();
            this.sessionId = data.session_id;
            console.log('Session created:', this.sessionId);
            this.onSessionChange?.('connected');
            this.connectWebSocket();
            return this.sessionId;
        } catch (error) {
            console.error('Session error:', error);
            this.onSessionChange?.('error');
            throw error;
        }
    }

    connectWebSocket() {
        if (!this.sessionId) return;
        try {
            // WebSocket connects directly (not through proxy)
            this.websocket = new WebSocket(`wss://sproochmaschinn.lu/api/ws/${this.sessionId}`);
            this.websocket.onopen = () => {
                console.log('WebSocket connected');
                this.startWebSocketPing();
            };
            this.websocket.onmessage = (e) => {
                try {
                    const data = JSON.parse(e.data);
                    console.log('WS message:', data);
                    this.onWebSocketMessage?.(data);
                } catch { }
            };
            this.websocket.onerror = (e) => console.error('WS error:', e);
            this.websocket.onclose = () => {
                console.log('WebSocket closed');
                setTimeout(() => this.sessionId && this.connectWebSocket(), 5000);
            };
        } catch (error) { console.error('WS error:', error); }
    }

    startWebSocketPing() {
        setInterval(() => {
            if (this.websocket?.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    }

    startSessionKeepAlive() {
        // Send activity every 4 minutes to keep session alive (expires after 10 min)
        this.sessionCheckInterval = setInterval(() => {
            if (this.sessionId) {
                fetch(`${this.baseUrl}/api/session/${this.sessionId}`)
                    .catch(() => this.createSession());
            }
        }, 4 * 60 * 1000);
    }

    /**
     * Text-to-Speech - POST /api/tts/{session_id}
     * Returns base64 encoded WAV audio
     */
    async textToSpeech(text, model = 'claude') {
        if (!this.sessionId) await this.createSession();

        try {
            const response = await fetch(`${this.baseUrl}/api/tts/${this.sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, model })
            });

            if (!response.ok) {
                if (response.status === 429) throw new Error('Rate limit. Please wait a moment.');
                throw new Error(`TTS failed: ${response.status}`);
            }

            const data = await response.json();
            const requestId = data.request_id;

            // Poll for result
            return await this.pollForTTSResult(requestId);
        } catch (error) {
            console.error('TTS error:', error);
            throw error;
        }
    }

    async pollForTTSResult(requestId) {
        for (let i = 0; i < 60; i++) {
            const response = await fetch(`${this.baseUrl}/api/result/${requestId}`);
            if (!response.ok) throw new Error(`Result failed: ${response.status}`);

            const data = await response.json();
            console.log('TTS poll:', data.status);

            if (data.status === 'completed') {
                // Convert base64 WAV to Blob
                const base64Audio = data.result.data;
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new Blob([bytes], { type: 'audio/wav' });
            }

            if (data.status === 'failed' || data.status === 'error') {
                throw new Error(data.error || 'TTS processing failed');
            }

            await new Promise(r => setTimeout(r, 500));
        }
        throw new Error('TTS timed out');
    }

    /**
     * Speech-to-Text - POST /api/stt/{session_id}
     */
    async speechToText(audioBlob, enableSpeakerIdentification = true, onProgress = null) {
        if (!this.sessionId) await this.createSession();

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');
            formData.append('enable_speaker_identification', enableSpeakerIdentification.toString());

            const response = await fetch(`${this.baseUrl}/api/stt/${this.sessionId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(`STT failed: ${response.status}`);
            const data = await response.json();
            console.log('STT response:', data);

            return await this.pollForSTTResult(data.request_id, onProgress);
        } catch (error) {
            console.error('STT error:', error);
            throw error;
        }
    }

    async pollForSTTResult(requestId, onProgress = null) {
        for (let i = 0; i < 120; i++) {
            const response = await fetch(`${this.baseUrl}/api/result/${requestId}`);
            if (!response.ok) throw new Error(`Result failed: ${response.status}`);

            const data = await response.json();
            console.log('STT poll:', data.status);

            // Update progress if available
            if (onProgress && data.progress !== undefined) {
                onProgress(data.progress);
            }

            if (data.status === 'completed') {
                return {
                    text: data.result.text,
                    segments: data.result.segments,
                    words: data.result.words,
                    duration: data.result.duration
                };
            }

            if (data.status === 'failed' || data.status === 'error') {
                throw new Error(data.error || 'Transcription failed');
            }

            await new Promise(r => setTimeout(r, 1000));
        }
        throw new Error('Transcription timed out');
    }

    setWebSocketHandler(handler) { this.onWebSocketMessage = handler; }

    destroy() {
        if (this.sessionCheckInterval) clearInterval(this.sessionCheckInterval);
        if (this.websocket) this.websocket.close();
        this.sessionId = null;
    }
}

const api = new SproochmaschinnAPI();
