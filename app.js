/**
 * Lëtzebuergesch Practice App
 * Main application logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        // Session
        sessionStatus: document.getElementById('sessionStatus'),
        // Tabs
        ttsTab: document.getElementById('ttsTab'),
        sttTab: document.getElementById('sttTab'),
        ttsPanel: document.getElementById('ttsPanel'),
        sttPanel: document.getElementById('sttPanel'),
        // TTS
        ttsInput: document.getElementById('ttsInput'),
        charCount: document.getElementById('charCount'),
        speakBtn: document.getElementById('speakBtn'),
        audioPlayer: document.getElementById('audioPlayer'),
        audioElement: document.getElementById('audioElement'),
        playPauseBtn: document.getElementById('playPauseBtn'),
        progressBar: document.getElementById('progressBar'),
        progressFill: document.getElementById('progressFill'),
        currentTime: document.getElementById('currentTime'),
        duration: document.getElementById('duration'),
        downloadBtn: document.getElementById('downloadBtn'),
        ttsLoading: document.getElementById('ttsLoading'),
        // STT
        recordBtn: document.getElementById('recordBtn'),
        recordHint: document.getElementById('recordHint'),
        recordingTimer: document.getElementById('recordingTimer'),
        timerDisplay: document.getElementById('timerDisplay'),
        speakerDetection: document.getElementById('speakerDetection'),
        transcriptionOutput: document.getElementById('transcriptionOutput'),
        transcriptionText: document.getElementById('transcriptionText'),
        transcriptionMeta: document.getElementById('transcriptionMeta'),
        copyBtn: document.getElementById('copyBtn'),
        sttLoading: document.getElementById('sttLoading'),
        sttProgressFill: document.getElementById('sttProgressFill'),
        sttProgressText: document.getElementById('sttProgressText'),
        // Audio Preview
        audioPreview: document.getElementById('audioPreview'),
        previewAudioElement: document.getElementById('previewAudioElement'),
        previewPlayBtn: document.getElementById('previewPlayBtn'),
        previewProgressBar: document.getElementById('previewProgressBar'),
        previewProgressFill: document.getElementById('previewProgressFill'),
        previewCurrentTime: document.getElementById('previewCurrentTime'),
        previewDuration: document.getElementById('previewDuration'),
        // Toast
        toastContainer: document.getElementById('toastContainer')
    };

    let selectedVoice = 'claude';
    let currentAudioBlob = null;
    let currentRecordingBlob = null;

    // Initialize API
    api.init(updateSessionStatus);

    // Session status handler
    function updateSessionStatus(status) {
        elements.sessionStatus.className = 'session-status ' + status;
        const text = elements.sessionStatus.querySelector('.status-text');
        const labels = { connecting: 'Connecting...', connected: 'Connected', error: 'Disconnected' };
        text.textContent = labels[status] || status;
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + 'Panel').classList.add('active');
        });
    });

    // Character counter
    elements.ttsInput.addEventListener('input', () => {
        elements.charCount.textContent = elements.ttsInput.value.length;
        elements.speakBtn.disabled = elements.ttsInput.value.trim().length === 0;
    });

    // Voice selection
    document.querySelectorAll('.voice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedVoice = btn.dataset.voice;
        });
    });

    // Quick phrases
    document.querySelectorAll('.phrase-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.ttsInput.value = btn.dataset.phrase;
            elements.charCount.textContent = btn.dataset.phrase.length;
            elements.speakBtn.disabled = false;
        });
    });

    // TTS: Speak button
    elements.speakBtn.addEventListener('click', async () => {
        const text = elements.ttsInput.value.trim();
        if (!text) return;

        elements.speakBtn.disabled = true;
        elements.ttsLoading.classList.remove('hidden');
        elements.audioPlayer.classList.add('hidden');

        try {
            currentAudioBlob = await api.textToSpeech(text, selectedVoice);
            const audioUrl = URL.createObjectURL(currentAudioBlob);
            elements.audioElement.src = audioUrl;
            elements.audioPlayer.classList.remove('hidden');
            elements.audioElement.play();
            showToast('Audio generated successfully!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            elements.ttsLoading.classList.add('hidden');
            elements.speakBtn.disabled = false;
        }
    });

    // Audio player controls
    elements.playPauseBtn.addEventListener('click', () => {
        if (elements.audioElement.paused) {
            elements.audioElement.play();
        } else {
            elements.audioElement.pause();
        }
    });

    elements.audioElement.addEventListener('play', () => {
        elements.playPauseBtn.querySelector('.play-icon').classList.add('hidden');
        elements.playPauseBtn.querySelector('.pause-icon').classList.remove('hidden');
    });

    elements.audioElement.addEventListener('pause', () => {
        elements.playPauseBtn.querySelector('.play-icon').classList.remove('hidden');
        elements.playPauseBtn.querySelector('.pause-icon').classList.add('hidden');
    });

    elements.audioElement.addEventListener('timeupdate', () => {
        const progress = (elements.audioElement.currentTime / elements.audioElement.duration) * 100;
        elements.progressFill.style.width = progress + '%';
        elements.currentTime.textContent = AudioHandler.formatDuration(elements.audioElement.currentTime);
    });

    elements.audioElement.addEventListener('loadedmetadata', () => {
        elements.duration.textContent = AudioHandler.formatDuration(elements.audioElement.duration);
    });

    elements.progressBar.addEventListener('click', (e) => {
        const rect = elements.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        elements.audioElement.currentTime = percent * elements.audioElement.duration;
    });

    elements.downloadBtn.addEventListener('click', () => {
        if (!currentAudioBlob) return;
        const url = URL.createObjectURL(currentAudioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'luxembourgish-tts.wav';
        a.click();
        URL.revokeObjectURL(url);
    });

    // STT: Record button
    let isRecording = false;

    elements.recordBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                await audioHandler.startRecording((time) => {
                    elements.timerDisplay.textContent = time;
                });
                isRecording = true;
                elements.recordBtn.classList.add('recording');
                elements.recordHint.classList.add('hidden');
                elements.recordingTimer.classList.remove('hidden');
                elements.recordBtn.querySelector('.mic-icon').classList.add('hidden');
                elements.recordBtn.querySelector('.stop-icon').classList.remove('hidden');
                elements.transcriptionOutput.classList.add('hidden');
                elements.audioPreview.classList.add('hidden');
            } catch (error) {
                showToast(error.message, 'error');
            }
        } else {
            const audioBlob = await audioHandler.stopRecording();
            isRecording = false;
            elements.recordBtn.classList.remove('recording');
            elements.recordHint.classList.remove('hidden');
            elements.recordingTimer.classList.add('hidden');
            elements.recordBtn.querySelector('.mic-icon').classList.remove('hidden');
            elements.recordBtn.querySelector('.stop-icon').classList.add('hidden');

            if (audioBlob) {
                // Show audio preview
                currentRecordingBlob = audioBlob;
                const previewUrl = URL.createObjectURL(audioBlob);
                elements.previewAudioElement.src = previewUrl;
                elements.audioPreview.classList.remove('hidden');
                console.log('Recording complete, blob size:', audioBlob.size, 'bytes');

                // Process STT
                await processSTT(audioBlob);
            }
        }
    });

    async function processSTT(audioBlob) {
        elements.sttLoading.classList.remove('hidden');
        elements.transcriptionOutput.classList.add('hidden');
        elements.sttProgressFill.style.width = '0%';
        elements.sttProgressText.textContent = '0%';

        try {
            console.log('Starting STT, sending audio blob:', audioBlob.size, 'bytes');
            const result = await api.speechToText(
                audioBlob,
                elements.speakerDetection.checked,
                (progress) => {
                    elements.sttProgressFill.style.width = progress + '%';
                    elements.sttProgressText.textContent = Math.round(progress) + '%';
                }
            );

            console.log('STT Result:', result);

            const transcription = result.text || result.transcription || '';
            elements.transcriptionText.textContent = transcription;

            // Show metadata
            const duration = result.duration ? `Duration: ${result.duration.toFixed(1)}s` : '';
            const wordCount = result.words ? `Words: ${result.words.length}` : '';
            elements.transcriptionMeta.textContent = [duration, wordCount].filter(Boolean).join(' • ');

            elements.transcriptionOutput.classList.remove('hidden');

            if (transcription) {
                showToast('Transcription complete!', 'success');
            } else {
                showToast('No speech detected', 'info');
            }
        } catch (error) {
            console.error('STT Error:', error);
            showToast(error.message, 'error');
        } finally {
            elements.sttLoading.classList.add('hidden');
        }
    }

    // Audio preview player controls
    elements.previewPlayBtn.addEventListener('click', () => {
        if (elements.previewAudioElement.paused) {
            elements.previewAudioElement.play();
        } else {
            elements.previewAudioElement.pause();
        }
    });

    elements.previewAudioElement.addEventListener('play', () => {
        elements.previewPlayBtn.querySelector('.play-icon').classList.add('hidden');
        elements.previewPlayBtn.querySelector('.pause-icon').classList.remove('hidden');
    });

    elements.previewAudioElement.addEventListener('pause', () => {
        elements.previewPlayBtn.querySelector('.play-icon').classList.remove('hidden');
        elements.previewPlayBtn.querySelector('.pause-icon').classList.add('hidden');
    });

    elements.previewAudioElement.addEventListener('timeupdate', () => {
        const progress = (elements.previewAudioElement.currentTime / elements.previewAudioElement.duration) * 100 || 0;
        elements.previewProgressFill.style.width = progress + '%';
        elements.previewCurrentTime.textContent = AudioHandler.formatDuration(elements.previewAudioElement.currentTime);
    });

    elements.previewAudioElement.addEventListener('loadedmetadata', () => {
        elements.previewDuration.textContent = AudioHandler.formatDuration(elements.previewAudioElement.duration);
    });

    elements.previewProgressBar.addEventListener('click', (e) => {
        const rect = elements.previewProgressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        elements.previewAudioElement.currentTime = percent * elements.previewAudioElement.duration;
    });

    // Copy button
    elements.copyBtn.addEventListener('click', () => {
        const text = elements.transcriptionText.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        });
    });

    // Toast notifications
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        elements.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey && document.activeElement === elements.ttsInput) {
            elements.speakBtn.click();
        }
    });
});
