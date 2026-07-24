class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.bgmNode = null;
        this.bgmSequence = null;
        this.isMuted = false;
        this.isPlayingBGM = false;
        this.currentNoteTimeout = null;
        this.bgmIndex = 0;
        this.isInitialized = false;

        // Frequencies for notes
        this.notes = {
            'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'B5': 987.77,
            'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F#6': 1479.98, 'G6': 1567.98, 'A6': 1760.00
        };

        // Retro 8-bit arrangement of Silhouette by KANA-BOON (Naruto Op 16) chorus melody
        // Beat length = 130ms (energetic rock beat)
        this.themeMelody = [
            // Line 1: D5, E5, F#5, A5, F#5, E5, D5, B4
            {n: 'D5', d: 1.5}, {n: 'E5', d: 1.5}, {n: 'F#5', d: 2}, {n: 'A5', d: 1}, {n: 'r', d: 0.5},
            {n: 'F#5', d: 1.5}, {n: 'E5', d: 1.5}, {n: 'D5', d: 2}, {n: 'B4', d: 1.5}, {n: 'r', d: 1},
            
            // Line 2: D5, E5, F#5, A5, F#5, E5, A5, G#5
            {n: 'D5', d: 1.5}, {n: 'E5', d: 1.5}, {n: 'F#5', d: 2}, {n: 'A5', d: 1}, {n: 'r', d: 0.5},
            {n: 'F#5', d: 1.5}, {n: 'E5', d: 1.5}, {n: 'A5', d: 2}, {n: 'G#5', d: 1.5}, {n: 'r', d: 1},

            // Line 3: F#5, E5, D5, B4, D5, E5, F#5, E5, D5
            {n: 'F#5', d: 1.5}, {n: 'E5', d: 1.5}, {n: 'D5', d: 2}, {n: 'B4', d: 1}, {n: 'r', d: 0.5},
            {n: 'D5', d: 1.5}, {n: 'E5', d: 1.5}, {n: 'F#5', d: 1.5}, {n: 'E5', d: 1.5}, {n: 'D5', d: 3.5},
            {n: 'r', d: 2}
        ];
    }

    init() {
        if (this.isInitialized) return;
        
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Safe volume
            this.masterGain.connect(this.ctx.destination);
            this.isInitialized = true;
        } catch (e) {
            console.error("Audio Context could not be initialized", e);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    playSFX(type) {
        if (!this.isInitialized || this.isMuted) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const now = this.ctx.currentTime;

        switch (type) {
            case 'jump':
                // Fast rising ninja wind/swish
                this.synthesizeSweep(now, 280, 950, 0.14, 'triangle', 0.8);
                break;
            case 'coin':
                // Eat Ramen slurp/beep
                this.synthesizeTone(now, 880, 0.06, 'sine'); // A5
                this.synthesizeTone(now + 0.06, 1174.66, 0.06, 'triangle'); // D6
                this.synthesizeTone(now + 0.12, 1760.00, 0.16, 'square'); // A6
                break;
            case 'stomp':
                // Kawarimi wood substitution puff / hit
                this.synthesizeSweep(now, 200, 60, 0.12, 'sawtooth', 0.4);
                this.synthesizeSweep(now, 80, 30, 0.18, 'triangle', 0.6);
                break;
            case 'powerup':
                // Scroll collect ninja jingle
                const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A4, C#5, E5, A5, C#6, E6
                notes.forEach((freq, idx) => {
                    this.synthesizeTone(now + idx * 0.06, freq, 0.06, 'sine');
                });
                break;
            case 'powerdown':
                // Hurt - falling sound
                const notesPd = [1174.66, 880, 783.99, 587.33, 440];
                notesPd.forEach((freq, idx) => {
                    this.synthesizeTone(now + idx * 0.06, freq, 0.06, 'sawtooth');
                });
                break;
            case 'fireball': // Rasengan throw
                // High frequency energy whistle
                this.synthesizeSweep(now, 900, 450, 0.09, 'sine', 0.9);
                this.synthesizeSweep(now + 0.03, 1300, 800, 0.06, 'triangle', 0.6);
                break;
            case 'die':
                this.stopBGM();
                // Sad "Sadness and Sorrow" retro snippet
                const deathNotes = [
                    {f: 'D5', d: 0.25}, {f: 'E5', d: 0.25}, {f: 'F#5', d: 0.25}, 
                    {f: 'A5', d: 0.4}, {f: 'F#5', d: 0.3}, {f: 'E5', d: 0.5}
                ];
                let dAccum = 0;
                deathNotes.forEach(note => {
                    this.synthesizeTone(now + dAccum, this.notes[note.f], note.d - 0.02, 'sine');
                    dAccum += note.d;
                });
                break;
            case 'stage_clear':
                this.stopBGM();
                // Epic ninja victory fanfare
                const clearNotes = [
                    {f: 'D4', d: 0.12}, {f: 'F#4', d: 0.12}, {f: 'A4', d: 0.12}, {f: 'D5', d: 0.12},
                    {f: 'F#5', d: 0.24}, {f: 'E5', d: 0.12}, {f: 'D5', d: 0.24},
                    {f: 'E5', d: 0.12}, {f: 'F#5', d: 0.12}, {f: 'A5', d: 0.24}, {f: 'F#5', d: 0.12}, {f: 'A5', d: 0.48}
                ];
                let accumTime = 0;
                clearNotes.forEach(note => {
                    this.synthesizeTone(now + accumTime, this.notes[note.f], note.d, 'square');
                    accumTime += note.d + 0.01;
                });
                break;
        }
    }

    synthesizeTone(startTime, freq, duration, type = 'square') {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(1.0, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    synthesizeSweep(startTime, startFreq, endFreq, duration, type = 'triangle', startVol = 1.0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

        gainNode.gain.setValueAtTime(startVol, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playBGM() {
        if (!this.isInitialized) this.init();
        if (this.isPlayingBGM) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isPlayingBGM = true;
        this.bgmIndex = 0;
        this.playBGMNextNote();
    }

    stopBGM() {
        this.isPlayingBGM = false;
        if (this.currentNoteTimeout) {
            clearTimeout(this.currentNoteTimeout);
            this.currentNoteTimeout = null;
        }
    }

    playBGMNextNote() {
        if (!this.isPlayingBGM || this.isMuted) {
            if (this.isPlayingBGM) {
                const note = this.themeMelody[this.bgmIndex];
                const beatDuration = 125; // ms per beat
                const duration = note.d * beatDuration;
                this.bgmIndex = (this.bgmIndex + 1) % this.themeMelody.length;
                this.currentNoteTimeout = setTimeout(() => this.playBGMNextNote(), duration);
            }
            return;
        }

        const note = this.themeMelody[this.bgmIndex];
        const beatDuration = 125; // ms per beat
        const duration = note.d * beatDuration;

        if (note.n !== 'r') {
            const freq = this.notes[note.n] || 440;
            const playDurationSeconds = (duration * 0.85) / 1000;
            // Use triangle oscillator for retro lead
            this.synthesizeTone(this.ctx.currentTime, freq, playDurationSeconds, 'triangle');
        }

        this.bgmIndex = (this.bgmIndex + 1) % this.themeMelody.length;
        this.currentNoteTimeout = setTimeout(() => this.playBGMNextNote(), duration);
    }
}

// Global Sound Instance
const Sound = new SoundManager();
