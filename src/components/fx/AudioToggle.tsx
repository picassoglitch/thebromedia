"use client";

import { useEffect, useRef, useState } from "react";

interface AudioToggleProps {
  /** Optional path to an external ambient audio file. If present, we use it.
   * Otherwise we synthesize a soft brand-appropriate drone in Web Audio so
   * the toggle works out of the box. */
  src?: string;
}

/**
 * Bottom-right ambient-audio toggle.
 *
 * Two backends:
 *   1. If `src` resolves successfully, plays the file on loop at 0.35 volume.
 *   2. Otherwise falls back to a Web Audio synthesized drone — two detuned
 *      sawtooth oscillators through a low-pass filter, soft attack/release.
 *      Brand-appropriate and works offline.
 */
export default function AudioToggle({ src }: AudioToggleProps) {
  const [on, setOn] = useState(false);

  // file-based playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasFile, setHasFile] = useState(false);

  // Web Audio fallback graph
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<Array<OscillatorNode | BiquadFilterNode | LFO>>([]);

  // Try to load the optional file source (no error if absent)
  useEffect(() => {
    if (!src) { setHasFile(false); return; }
    const a = new Audio(src);
    a.loop = true;
    a.volume = 0.35;
    a.preload = "metadata";
    let cancelled = false;
    const onCanPlay = () => { if (!cancelled) setHasFile(true); };
    const onErr = () => { if (!cancelled) setHasFile(false); };
    a.addEventListener("canplaythrough", onCanPlay);
    a.addEventListener("error", onErr);
    audioRef.current = a;
    return () => {
      cancelled = true;
      a.pause();
      a.removeEventListener("canplaythrough", onCanPlay);
      a.removeEventListener("error", onErr);
      audioRef.current = null;
    };
  }, [src]);

  const startSynth = () => {
    type Window2 = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext || (window as Window2).webkitAudioContext;
    if (!Ctor) return;
    const ctx = ctxRef.current || new Ctor();
    ctxRef.current = ctx;

    // master volume — keep it gentle so it never distracts
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterRef.current = master;

    // low-pass filter to round off the saws
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 620;
    lp.Q.value = 0.7;
    lp.connect(master);

    // a couple of soft LFOs to slowly modulate filter + master so the drone breathes
    const lfo1 = ctx.createOscillator();
    const lfo1Gain = ctx.createGain();
    lfo1.frequency.value = 0.07;
    lfo1Gain.gain.value = 90;
    lfo1.connect(lfo1Gain);
    lfo1Gain.connect(lp.frequency);
    lfo1.start();

    // two detuned saw oscillators — a perfect fifth (220Hz + 330Hz) is a
    // benign musical interval; +/- 7 cents detune adds chorusing.
    const freqs = [110, 165, 220];
    const oscs: OscillatorNode[] = [];
    freqs.forEach((freq, i) => {
      const a = ctx.createOscillator();
      const b = ctx.createOscillator();
      a.type = b.type = "sawtooth";
      a.frequency.value = freq;
      b.frequency.value = freq;
      a.detune.value = -7;
      b.detune.value = +7;
      const g = ctx.createGain();
      g.gain.value = 0.06 - i * 0.012; // higher voices quieter
      a.connect(g); b.connect(g);
      g.connect(lp);
      a.start(); b.start();
      oscs.push(a, b);
    });

    nodesRef.current = [...oscs, lp, lfo1];

    // fade in
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(0.25, now + 1.4);
  };

  const stopSynth = () => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    // fade out, then disconnect
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.8);
    setTimeout(() => {
      try {
        nodesRef.current.forEach((n) => {
          if ("stop" in n) (n as OscillatorNode).stop?.();
          (n as AudioNode).disconnect?.();
        });
        nodesRef.current = [];
        master.disconnect();
      } catch {/* ignore */}
    }, 900);
  };

  const toggle = () => {
    if (on) {
      if (hasFile) audioRef.current?.pause();
      else stopSynth();
      setOn(false);
    } else {
      if (hasFile) {
        audioRef.current?.play().then(() => setOn(true)).catch(() => {
          // fall back to synth if the file fails at play-time
          setHasFile(false);
          startSynth();
          setOn(true);
        });
      } else {
        startSynth();
        setOn(true);
      }
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute ambient audio" : "Play ambient audio"}
      data-cursor="hover"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#E85C00]/60 transition-colors group"
    >
      <div className="flex items-end gap-[3px] h-4">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block w-[2px] bg-[#E85C00] origin-bottom"
            style={{
              height: on ? "100%" : "30%",
              animation: on ? `audioBar 0.${5 + i}s ease-in-out ${i * 0.08}s infinite alternate` : "none",
              transition: "height 0.3s ease",
            }}
          />
        ))}
      </div>
      <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-colors">
        {on ? "Sound on" : "Sound off"}
      </span>
      <style jsx>{`
        @keyframes audioBar {
          from { transform: scaleY(0.35); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </button>
  );
}

// Local type that captures both Oscillator and our created nodes
type LFO = OscillatorNode;
