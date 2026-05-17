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
    if (ringing) return "#10b981";
    if (done) return "#10b981";
    if (urgent) return "#ef4444";
    return "#6366f1";
  };

  const getGradient = () => {
    if (ringing || done) return "from-emerald-500 to-teal-500";
    if (urgent) return "from-red-500 to-rose-500";
    return "from-indigo-500 to-purple-600";
  };

  const inputFields = [
    { label: "HOURS", value: inputH, set: setInputH, max: 99 },
    { label: "MINUTES", value: inputM, set: setInputM, max: 59 },
    { label: "SECONDS", value: inputS, set: setInputS, max: 59 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full">
        {/* Decorative blur elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        
        {/* Main Card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Timer Ring */}
          <div className="relative flex items-center justify-center mb-8">
            <div
              className="relative flex items-center justify-center"
              style={{ width: 300, height: 300 }}
            >
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 transform transition-all duration-700"
                viewBox="0 0 320 320"
              >
                {/* Background circle */}
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  className="transition-all"
                />
                
                {/* Progress circle */}
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
                    filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
                  }}
                />
              </svg>

              {/* Inner glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-50/50 to-transparent"></div>

              {/* Timer Display */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex items-end gap-1">
                  {[
                    { value: h, label: "HRS" },
                    { value: m, label: "MIN" },
                    { value: s, label: "SEC" },
                  ].map(({ value, label }, i) => (
                    <div key={label} className="flex items-end gap-1">
                      {i > 0 && (
                        <span
                          className="text-5xl font-light mb-5 leading-none"
                          style={{ color: getRingColor() }}
                        >
                          :
                        </span>
                      )}
                      <div className="flex flex-col items-center">
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl px-4 py-3 shadow-lg">
                          <span
                            className="font-bold tabular-nums leading-none text-white"
                            style={{ fontSize: 72 }}
                          >
                            {pad(value)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase mt-2">
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Badge */}
                {(ringing || done || (started && !running && remaining > 0)) && (
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-gray-100/80 backdrop-blur-sm">
                    <span className={`text-xs font-semibold tracking-wider uppercase ${
                      ringing ? "text-emerald-600 animate-pulse" :
                      done ? "text-emerald-600" :
                      "text-gray-500"
                    }`}>
                      {ringing ? "🔔 Ringing..." : done ? "✓ Completed" : "⏸ Paused"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input Fields */}
          {!started && (
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-center gap-3">
                {inputFields.map(({ label, value, set, max }, i) => (
                  <div key={label} className="flex-1">
                    <label className="block text-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
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
                      className="w-full text-center text-2xl font-bold text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-2xl py-3 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {started && !ringing && (
              <button
                onClick={reset}
                className="group px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </span>
              </button>
            )}

            {ringing && (
              <button
                onClick={stopRinging}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                ⏹ Stop Alarm
              </button>
            )}

            {!ringing && (
              <button
                onClick={started ? (done ? reset : toggle) : start}
                className={`px-8 py-3 rounded-xl bg-gradient-to-r ${getGradient()} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 min-w-[140px]`}
              >
                <span className="flex items-center justify-center gap-2">
                  {!started ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Start
                    </>
                  ) : running ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                      </svg>
                      Pause
                    </>
                  ) : done ? (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                      </svg>
                      Restart
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                      Resume
                    </>
                  )}
                </span>
              </button>
            )}
          </div>

          {/* Progress Text */}
          {started && !done && remaining > 0 && (
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-500 font-medium">
                Time Remaining
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {Math.floor(remaining / 60)} minutes {remaining % 60} seconds
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;