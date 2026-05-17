import { useState, useEffect, useRef } from "react";

const pad = (n) => String(n).padStart(2, "0");
const CIRC = 2 * Math.PI * 140;

const SOUNDS = [
  { id: "chime",   label: "🔔 Chime" },
  { id: "beep",    label: "📟 Beep" },
  { id: "alarm",   label: "🚨 Alarm" },
  { id: "bell",    label: "🎵 Bell" },
  { id: "digital", label: "💻 Digital" },
];

const playSound = (ctx, type) => {
  const now = ctx.currentTime;

  if (type === "chime") {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      const t = now + i * 0.22;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
      gain.gain.linearRampToValueAtTime(0, t + 0.35);
      osc.start(t); osc.stop(t + 0.4);
    });
    return 4 * 0.22 + 0.4;
  }

  if (type === "beep") {
    [880, 880, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "square"; osc.frequency.value = freq;
      const t = now + i * 0.3;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);
      osc.start(t); osc.stop(t + 0.2);
    });
    return 1.1;
  }

  if (type === "alarm") {
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, now + i * 0.2);
      osc.frequency.linearRampToValueAtTime(880, now + i * 0.2 + 0.1);
      gain.gain.setValueAtTime(0.25, now + i * 0.2);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.2 + 0.18);
      osc.start(now + i * 0.2); osc.stop(now + i * 0.2 + 0.2);
    }
    return 1.4;
  }

  if (type === "bell") {
    [523.25, 784, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      const t = now + i * 0.5;
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      osc.start(t); osc.stop(t + 0.85);
    });
    return 2.1;
  }

  if (type === "digital") {
    [1200, 900, 1200, 900].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "square"; osc.frequency.value = freq;
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.12);
      osc.start(t); osc.stop(t + 0.15);
    });
    return 0.9;
  }

  return 1;
};

const Timer = () => {
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(5);
  const [inputS, setInputS] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [soundType, setSoundType] = useState("chime");
  const [ringing, setRinging] = useState(false);

  const intervalRef = useRef(null);
  const soundLoopRef = useRef(null);
  const ctxRef = useRef(null);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const urgent = remaining <= 10 && remaining > 0;
  const progress = total > 0 ? ((total - remaining) / total) * CIRC : 0;

  const startRinging = (type) => {
    setRinging(true);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const loop = () => {
      if (!ctxRef.current) return;
      const duration = playSound(ctx, type);
      soundLoopRef.current = setTimeout(loop, duration * 1000 + 200);
    };
    loop();
  };

  const stopRinging = () => {
    setRinging(false);
    if (soundLoopRef.current) clearTimeout(soundLoopRef.current);
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  };

  const previewSound = (type) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    playSound(ctx, type);
    setTimeout(() => ctx.close(), 3000);
  };

  const start = () => {
    const secs = inputH * 3600 + inputM * 60 + inputS;
    if (!secs) return;
    setTotal(secs);
    setRemaining(secs);
    setRunning(true);
    setDone(false);
    setStarted(true);
  };

  const toggle = () => setRunning((r) => !r);

  const reset = () => {
    clearInterval(intervalRef.current);
    stopRinging();
    setRunning(false);
    setStarted(false);
    setDone(false);
    setRemaining(0);
    setTotal(0);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            setDone(true);
            startRinging(soundType);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    return () => {
      stopRinging();
      clearInterval(intervalRef.current);
    };
  }, []);

  const inputFields = [
    { label: "HRS", value: inputH, set: setInputH, max: 99 },
    { label: "MIN", value: inputM, set: setInputM, max: 59 },
    { label: "SEC", value: inputS, set: setInputS, max: 59 },
  ];

  const ringColor = ringing ? "#22c55e" : done ? "#22c55e" : urgent ? "#ef4444" : "#111827";

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white gap-8">

      {/* Sound picker (hidden while running or done) */}
      {!started && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest text-gray-400 uppercase">Alert Sound</span>
          <div className="flex gap-2 flex-wrap justify-center">
            {SOUNDS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setSoundType(id); previewSound(id); }}
                className="px-4 py-2 rounded-xl text-sm border transition-all active:scale-95"
                style={{
                  background: soundType === id ? "#111827" : "white",
                  color: soundType === id ? "white" : "#6b7280",
                  borderColor: soundType === id ? "#111827" : "#e5e7eb",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">Tap to preview</span>
        </div>
      )}

      {/* Ring */}
      <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r="140" fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="160" cy="160" r="140" fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC - progress}
            style={{ transition: "stroke-dashoffset 0.6s linear, stroke 0.4s" }}
          />
        </svg>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex items-end gap-2">
            {[{ value: h, label: "HRS" }, { value: m, label: "MIN" }, { value: s, label: "SEC" }].map(
              ({ value, label }, i) => (
                <div key={label} className="flex items-end gap-2">
                  {i > 0 && (
                    <span className="text-4xl font-light mb-7 leading-none" style={{ color: ringColor }}>:</span>
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="font-semibold tabular-nums leading-none transition-colors duration-300"
                      style={{ fontSize: 64, color: ringColor }}
                    >
                      {pad(value)}
                    </span>
                    <span className="text-xs tracking-widest text-gray-400 uppercase">{label}</span>
                  </div>
                </div>
              )
            )}
          </div>

          {ringing && (
            <span className="text-green-500 text-sm font-medium tracking-widest uppercase animate-pulse mt-1">
              🔔 Ringing...
            </span>
          )}
          {done && !ringing && (
            <span className="text-green-500 text-sm font-medium tracking-widest uppercase mt-1">
              ✓ Done
            </span>
          )}
        </div>
      </div>

      {/* Inputs */}
      {!started && (
        <div className="flex items-center gap-4">
          {inputFields.map(({ label, value, set, max }, i) => (
            <div key={label} className="flex items-center gap-4">
              {i > 0 && <span className="text-2xl text-gray-300">:</span>}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs tracking-widest text-gray-400 uppercase">{label}</span>
                <input
                  type="number" min={0} max={max} value={value}
                  onChange={(e) => set(Math.min(max, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-20 text-center text-2xl font-medium border border-gray-200 rounded-2xl py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {started && (
          <button
            onClick={reset}
            className="px-7 py-3.5 rounded-2xl border border-gray-200 text-base text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
          >
            ↺ Reset
          </button>
        )}

        {/* Stop ringing button — prominent when ringing */}
        {ringing && (
          <button
            onClick={stopRinging}
            className="px-9 py-3.5 rounded-2xl text-base font-medium text-white active:scale-95 transition-all animate-pulse"
            style={{ background: "#ef4444" }}
          >
            ⏹ Stop Sound
          </button>
        )}

        {!ringing && (
          <button
            onClick={started ? (done ? reset : toggle) : start}
            className="px-9 py-3.5 rounded-2xl text-base font-medium text-white active:scale-95 transition-all"
            style={{
              background: done ? "#22c55e" : urgent ? "#ef4444" : "#111827",
              transition: "background 0.4s",
            }}
          >
            {!started ? "▶  Start" : running ? "⏸  Pause" : done ? "↺  Restart" : "▶  Resume"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;