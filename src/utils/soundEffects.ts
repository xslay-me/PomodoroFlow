import { SoundType } from '../types/pomodoro';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a session completion sound based on the chosen SoundType
 */
export function playCompletionSound(soundType: SoundType, volume: number = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
  masterGain.connect(ctx.destination);

  switch (soundType) {
    case 'zenBell': {
      // 528Hz Love/Solfeggio frequency with a gentle harmonic
      [528, 792, 1056].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = 0.35 / (idx + 1);
        gain.gain.setValueAtTime(initialGain, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8 + idx * 0.4);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 3.5);
      });
      break;
    }

    case 'marimba': {
      // Clay marimba warm mallet chime
      const notes = [659.25, 880, 1046.5]; // E5, A5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.3);
      });
      break;
    }

    case 'digital': {
      // Cheerful electronic chime triad
      const digitalNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      digitalNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.7);
      });
      break;
    }

    case 'gong': {
      // Low resonant meditation gong
      const freqs = [174, 348, 522];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.4 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 4.0);
      });
      break;
    }
  }
}

/**
 * Tactile clay pop sound for button presses
 */
export function playClayPopSound(volume: number = 0.25) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(640, now + 0.05);

  gain.gain.setValueAtTime(volume * 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}
