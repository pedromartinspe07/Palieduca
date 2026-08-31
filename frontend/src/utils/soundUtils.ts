/**
 * soundUtils.ts - Sintetizador de áudio Web Audio API para feedback sonoro em tempo real.
 * Não requer arquivos MP3 externos, tem 0ms de latência e funciona em todos os navegadores.
 */

class SoundEngine {
    private ctx: AudioContext | null = null;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        try {
            const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtxClass) return null;
            if (!this.ctx) {
                this.ctx = new AudioCtxClass();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return this.ctx;
        } catch {
            return null;
        }
    }

    /**
     * Toca um acorde harmônico celebratório e suave ao publicar ou atualizar aula
     */
    public playPublishSuccess() {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        
        // Sequência de notas suaves e cristalinas: Dó5 (523.25Hz), Mi5 (659.25Hz), Sol5 (783.99Hz), Dó6 (1046.50Hz)
        const notes = [
            { freq: 523.25, time: 0.00, dur: 0.45, gain: 0.25 },
            { freq: 659.25, time: 0.08, dur: 0.45, gain: 0.25 },
            { freq: 783.99, time: 0.16, dur: 0.55, gain: 0.30 },
            { freq: 1046.50, time: 0.24, dur: 0.85, gain: 0.35 },
            { freq: 1318.51, time: 0.32, dur: 1.10, gain: 0.20 } // Mi6 para brilho extra
        ];

        notes.forEach(({ freq, time, dur, gain }) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + time);

            // Envelope de volume suave (Attack -> Decay exponencial)
            gainNode.gain.setValueAtTime(0.001, now + time);
            gainNode.gain.exponentialRampToValueAtTime(gain, now + time + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now + time);
            osc.stop(now + time + dur + 0.05);
        });
    }

    /**
     * Som suave para salvar rascunho
     */
    public playSaveDraft() {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const notes = [
            { freq: 587.33, time: 0.00, dur: 0.30, gain: 0.20 }, // Ré5
            { freq: 880.00, time: 0.09, dur: 0.45, gain: 0.25 }  // Lá5
        ];

        notes.forEach(({ freq, time, dur, gain }) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + time);

            gainNode.gain.setValueAtTime(0.001, now + time);
            gainNode.gain.exponentialRampToValueAtTime(gain, now + time + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start(now + time);
            osc.stop(now + time + dur + 0.05);
        });
    }
}

export const soundManager = new SoundEngine();

export const playPublishSound = () => soundManager.playPublishSuccess();
export const playSaveDraftSound = () => soundManager.playSaveDraft();
