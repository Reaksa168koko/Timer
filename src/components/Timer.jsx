import { useState, useEffect, useRef } from "react";
import ringtone from "../assets/sound/ringtone.mp3";

const pad = (n) => String(n).padStart(2, "0");
const CIRC = 2 * Math.PI * 140;

const Timer = () => {
  const [inputH, setInputH] = useState(0);
  const [inputM, setInputM] = useState(5);
  const [inputS, setInputS] = useState(0);

  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [ringing, setRinging] = useState(false);

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const urgent = remaining <= 10 && remaining > 0;

  const progress =
    total > 0 ? ((total - remaining) / total) * CIRC : 0;

  const startRinging = () => {
    setRinging(true);
    audioRef.current = new Audio(ringtone);
    audioRef.current.loop = true;
    audioRef.current.play();
  };

  const stopRinging = () => {
    setRinging(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
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

  const toggle = () => {
    setRunning((r) => !r);
  };

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
            startRinging();
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

  const getRingColor = () => {
    if (ringing) return "#ec4899";
    if (done) return "#10b981";
    if (urgent) return "#ef4444";
    return "#3b82f6";
  };

  const inputFields = [
    { label: "HOURS", value: inputH, set: setInputH, max: 99 },
    { label: "MINUTES", value: inputM, set: setInputM, max: 59 },
    { label: "SECONDS", value: inputS, set: setInputS, max: 59 },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-3000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C27B0\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Animated gradient lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-slide"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-slide animation-delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Glass Card */}
        <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20 max-w-md w-full">
          
          {/* Timer Ring */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="relative" style={{ width: 300, height: 300 }}>
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 320 320"
              >
                {/* Background circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                
                {/* Progress circle with glow */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke={getRingColor()}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC - progress}
                  className="transition-all duration-500 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 12px ${getRingColor()})`,
                  }}
                />
              </svg>

              {/* Timer Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-1">
                  {[
                    { value: h, label: "HRS" },
                    { value: m, label: "MIN" },
                    { value: s, label: "SEC" },
                  ].map(({ value, label }, i) => (
                    <div key={label} className="flex items-baseline">
                      {i > 0 && (
                        <span className="text-5xl font-bold text-white/50 mb-3 mx-1">
                          :
                        </span>
                      )}
                      <div className="text-center">
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-2">
                          <span
                            className="font-bold tabular-nums text-white"
                            style={{ fontSize: 68 }}
                          >
                            {pad(value)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold tracking-wider text-white/60 uppercase block mt-2">
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status */}
                {(ringing || done || (started && !running && remaining > 0)) && (
                  <div className="mt-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <span className={`text-xs font-bold tracking-wider uppercase ${
                      ringing ? "text-pink-300 animate-pulse" :
                      done ? "text-green-300" :
                      "text-white/70"
                    }`}>
                      {ringing ? "🔔 RINGING..." : done ? "✓ COMPLETED" : "⏸ PAUSED"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Fields */}
          {!started && (
            <div className="mb-8">
              <div className="flex gap-3">
                {inputFields.map(({ label, value, set, max }) => (
                  <div key={label} className="flex-1">
                    <label className="block text-center text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                      {label}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      value={value}
                      onChange={(e) =>
                        set(
                          Math.min(
                            max,
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                      className="w-full text-center text-2xl font-bold text-white bg-white/10 border border-white/20 rounded-2xl py-3 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all backdrop-blur-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            {started && !ringing && (
              <button
                onClick={reset}
                className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                ↺ Reset
              </button>
            )}

            {ringing && (
              <button
                onClick={stopRinging}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
              >
                ⏹ Stop Alarm
              </button>
            )}

            {!ringing && (
              <button
                onClick={started ? (done ? reset : toggle) : start}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
                  !started
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : running
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    : done
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                }`}
              >
                {!started
                  ? "▶ Start Timer"
                  : running
                  ? "⏸ Pause"
                  : done
                  ? "↺ Restart"
                  : "▶ Resume"}
              </button>
            )}
          </div>

          {/* Progress Info */}
          {started && !done && remaining > 0 && (
            <div className="mt-6 text-center">
              <div className="text-sm text-white/60 font-medium">
                Time Remaining
              </div>
              <div className="text-xs text-white/40 mt-1">
                {Math.floor(remaining / 60)} minutes {remaining % 60} seconds
              </div>
            </div>
          )}
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center text-white/40 text-xs">
          <p>Focus Timer • Stay Productive</p>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-slide {
          animation: slide 3s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Timer;