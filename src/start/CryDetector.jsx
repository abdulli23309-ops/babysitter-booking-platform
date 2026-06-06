import { useEffect, useRef, useState, useCallback } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

/* ================================================================
   CryDetector — Pastel Pink / Soft UI Version
   All ML / audio / call logic unchanged
================================================================ */

const YAMNET_MODEL_URL = "/yamnet/model.json";
const YAMNET_CSV_URL   = "/yamnet/yamnet_class_map.csv";
const CRY_LABELS       = ["baby cry", "infant cry", "crying", "sobbing", "whimper", "babbling"];

const INITIAL_SECONDS  = 15;
const FAST_SECONDS     = 5;
const SILENCE_CHECKS   = 6;
const CHECK_MS         = 500;
const DB_THRESHOLD     = -15;
const RATIO_THRESHOLD  = 0.65;
const SILENCE_FLOOR    = -40;

// ─────────────────────────────────────────────────────────────
// Pastel pink + white theme (Login screen inspired)
// ─────────────────────────────────────────────────────────────
const C = {
  // Main background gradient (pastel pink to soft rose)
  bgGradient: "linear-gradient(145deg, #FFF0F5 0%, #FFE4E9 100%)",
  card:        "#ffffff",
  cardShadow:  "0 8px 24px rgba(0, 0, 0, 0.06)",
  textPrimary: "#2D2F36",
  textSecondary: "#6B7280",
  textMuted:   "#9CA3AF",
  accent:      "#C8521A",      // orange from Login
  accentLight: "#FDE8DF",
  danger:      "#E74C3C",
  warning:     "#F39C12",
  success:     "#27AE60",
  border:      "#F3E5E5",
  surface:     "#FAF6F6",
};

// Mode colors still use the accent for ML, warning for fallback
function modeColor(mode) {
  if (mode === "ml")       return C.accent;
  if (mode === "fallback") return C.warning;
  if (mode === "loading")  return "#5D9CEC";
  return C.textMuted;
}

function PulseDot({ active, color }) {
  return (
    <span style={{
      display: "inline-block",
      width: 8, height: 8,
      borderRadius: "50%",
      background: color,
      marginRight: 7,
      animation: active ? "pulse 1.4s ease-in-out infinite" : "none",
    }} />
  );
}

function Waveform({ analyserRef, mode }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const analyser = analyserRef.current;
      let waveData;
      if (analyser) {
        const td = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(td);
        const step = Math.floor(td.length / 100);
        waveData = Array.from({ length: 100 }, (_, i) => td[i * step] ?? 128);
      } else {
        waveData = new Array(100).fill(128);
      }

      const color = modeColor(mode);
      const step  = W / waveData.length;
      const mid   = H / 2;

      // glow line
      ctx.strokeStyle = color + "44";
      ctx.lineWidth   = 4;
      ctx.beginPath();
      waveData.forEach((v, i) => {
        const x = i * step;
        const y = mid + ((v - 128) / 128) * (mid * 0.85);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // main line
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      waveData.forEach((v, i) => {
        const x = i * step;
        const y = mid + ((v - 128) / 128) * (mid * 0.85);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserRef, mode]);

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={56}
      style={{ display: "block", width: "100%", height: 56, borderRadius: 6 }}
    />
  );
}

function MetricCard({ label, value, sub, highlight }) {
  return (
    <div style={{
      background: C.card,
      borderRadius: 16,
      padding: "12px 14px",
      boxShadow: C.cardShadow,
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, color: highlight || C.textPrimary, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function ProgressTimer({ elapsed, required, active, fastMode }) {
  if (!active) return null;
  const pct   = Math.min(100, (elapsed / required) * 100);
  const color = pct > 80 ? C.danger : pct > 50 ? C.warning : C.success;

  return (
    <div style={{
      background: C.card,
      borderRadius: 16,
      padding: "12px 14px",
      marginBottom: 12,
      boxShadow: C.cardShadow,
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: C.textSecondary }}>
          {fastMode ? "Cry duration · fast mode ⚡" : "Cry duration"}
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, color }}>
          {elapsed.toFixed(0)}s / {required}s
        </span>
      </div>
      <div style={{ height: 5, background: C.surface, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: "width 0.4s, background 0.4s",
        }} />
      </div>
    </div>
  );
}

function AlertBanner({ count, onClear }) {
  if (!count) return null;
  return (
    <div style={{
      background: "#FEF2F2",
      border: `1px solid ${C.danger}40`,
      borderRadius: 16,
      padding: "10px 14px",
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 500, color: C.danger }}>{count}</div>
        <div style={{ fontSize: 11, color: C.danger }}>alerts sent this session</div>
      </div>
      <button onClick={onClear} style={{
        background: "none", border: `1px solid ${C.danger}80`, borderRadius: 6,
        color: C.danger, fontSize: 11, padding: "4px 10px", cursor: "pointer",
      }}>
        Clear
      </button>
    </div>
  );
}

function AlertLog({ entries }) {
  if (!entries.length) return null;
  return (
    <div style={{
      background: C.card,
      borderRadius: 16,
      padding: "10px 14px",
      marginBottom: 12,
      maxHeight: 110,
      overflowY: "auto",
      boxShadow: C.cardShadow,
      border: `1px solid ${C.border}`,
      className: "log-scroll",
    }}>
      {entries.map((e, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: C.textSecondary,
          padding: "3px 0",
          borderBottom: i < entries.length - 1 ? `1px solid ${C.border}` : "none",
        }}>
          <span>{e.msg}</span>
          <span style={{ color: C.textMuted, fontSize: 11 }}>{e.time}</span>
        </div>
      ))}
    </div>
  );
}

export default function CryDetector() {
  const [isListening, setIsListening] = useState(false);
  const [mode,        setMode]        = useState("idle");
  const [statusText,  setStatusText]  = useState("Press start to begin monitoring");
  const [alertCount,  setAlertCount]  = useState(0);
  const [logEntries,  setLogEntries]  = useState([]);
  const [metrics,     setMetrics]     = useState({ db: null, intensity: null, conf: null, label: null });
  const [timer,       setTimer]       = useState({ elapsed: 0, required: INITIAL_SECONDS, active: false });

  const [activeJob,   setActiveJob]   = useState(null);
  const [jitsiRoom,   setJitsiRoom]   = useState(null);
  const [inCall,      setInCall]      = useState(false);

  const analyserRef     = useRef(null);
  const audioCtxRef     = useRef(null);
  const mlCtxRef        = useRef(null);
  const scriptNodeRef   = useRef(null);
  const streamRef       = useRef(null);
  const yamnetModelRef  = useRef(null);
  const classMapRef     = useRef(null);
  const audioBufRef     = useRef(new Float32Array(15600));
  const audioBufIdxRef  = useRef(0);
  const tickTimerRef    = useRef(null);
  const cryStartRef     = useRef(null);
  const fastModeRef     = useRef(false);
  const silenceCountRef = useRef(0);
  const modeRef         = useRef("idle");

  // ─── Fetch active job on mount ───────────────────────────
  useEffect(() => {
    const sitterId = Number(localStorage.getItem("userId"));
    if (!sitterId) return;

    const fetchActiveJob = async () => {
      try {
        const res = await fetch(`/api/jobs/active?babysitterId=${sitterId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveJob(data);
          addLog("Active job found for today");
        } else {
          console.warn("No active job found for this sitter.");
        }
      } catch (error) {
        console.error("Failed to fetch active job", error);
      }
    };
    fetchActiveJob();
  }, []);

  const addLog = useCallback((msg) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogEntries(prev => [{ msg, time }, ...prev].slice(0, 6));
  }, []);

  const sendAlert = useCallback(async () => {
    setAlertCount(prev => prev + 1);
    addLog("Alert sent — cry detected");

    if (!activeJob) {
      setStatusText("⚠️ No active job – cannot alert parent.");
      addLog("No active job to alert");
      return;
    }

    try {
      const response = await fetch("/api/cry-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "HIGH",
          jobId: activeJob.jobId,
          parentId: activeJob.parentId,
          babysitterId: Number(localStorage.getItem("userId"))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJitsiRoom(data.roomName);
        setInCall(true);
        setStatusText("📞 Connected – waiting for parent to join…");
        addLog(`Jitsi room created: ${data.roomName}`);
        stopListening();
      } else {
        console.error("Alert post failed");
        setStatusText("❌ Could not send alert to parent.");
      }
    } catch (error) {
      console.error("Network error", error);
      setStatusText("❌ Network error while alerting.");
    }
  }, [activeJob, addLog]);

  // ─── TensorFlow & YAMNet loaders (unchanged) ─────────────
  function loadTFJS() {
    return new Promise((resolve, reject) => {
      if (window.tf?.loadGraphModel) { resolve(window.tf); return; }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
      script.crossOrigin = "anonymous";
      script.onload = () => setTimeout(() => {
        window.tf?.loadGraphModel ? resolve(window.tf) : reject(new Error("TF.js missing after load"));
      }, 200);
      script.onerror = () => reject(new Error("TF.js script failed"));
      document.head.appendChild(script);
    });
  }

  async function loadYAMNet() {
    const probe = await fetch(YAMNET_MODEL_URL, { method: "HEAD" }).catch(() => null);
    if (!probe?.ok) throw new Error("model.json not found at " + YAMNET_MODEL_URL);
    await loadTFJS();
    yamnetModelRef.current = await window.tf.loadGraphModel(YAMNET_MODEL_URL);
    const csvRes = await fetch(YAMNET_CSV_URL);
    if (!csvRes.ok) throw new Error("class map CSV not found");
    const csv = await csvRes.text();
    const map = {};
    csv.split("\n").slice(1).forEach(row => {
      const p = row.split(",");
      if (p.length >= 3) map[parseInt(p[0].trim(), 10)] = p[2].trim().replace(/"/g, "");
    });
    classMapRef.current = map;
  }

  function setupMLAudio(stream) {
    const ctx    = new AudioContext({ sampleRate: 16000 });
    mlCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const gain   = ctx.createGain(); gain.gain.value = 3;
    const sp     = ctx.createScriptProcessor(4096, 1, 1);
    scriptNodeRef.current = sp;
    audioBufIdxRef.current = 0;
    source.connect(gain); gain.connect(sp); sp.connect(ctx.destination);
    sp.onaudioprocess = (e) => {
      const inp = e.inputBuffer.getChannelData(0);
      const len = inp.length;
      if (len >= 15600) {
        audioBufRef.current.set(inp.subarray(len - 15600));
      } else {
        audioBufRef.current.copyWithin(0, len);
        audioBufRef.current.set(inp, 15600 - len);
      }
      audioBufIdxRef.current = 15600;
    };
  }

  function predictCryML() {
    if (!yamnetModelRef.current || !classMapRef.current || audioBufIdxRef.current < 15600) {
      return { isCry: false };
    }
    try {
      const tf     = window.tf;
      const buffer = audioBufRef.current.slice(0, 15600);
      if (buffer.every(v => v === 0)) return { isCry: false };
      const tensor       = tf.tensor1d(buffer);
      const output       = yamnetModelRef.current.predict(tensor);
      const scoresTensor = Array.isArray(output) ? output[0] : output;
      const data         = scoresTensor.dataSync();
      const maxIdx       = data.indexOf(Math.max(...data));
      const label        = classMapRef.current[maxIdx];
      const conf         = data[maxIdx];
      tensor.dispose();
      Array.isArray(output) ? output.forEach(t => t.dispose()) : output.dispose();
      const isCry = CRY_LABELS.some(l => label.toLowerCase().includes(l)) && conf >= 0.4;
      return { isCry, conf, label };
    } catch (e) {
      console.warn("ML predict error", e);
      return { isCry: false };
    }
  }

  function getCryMetrics() {
    const analyser = analyserRef.current;
    if (!analyser) return null;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const sr  = audioCtxRef.current?.sampleRate || 44100;
    const bw  = sr / analyser.fftSize;
    const lo  = Math.floor(300  / bw), hi  = Math.floor(600  / bw);
    const tlo = Math.floor(80   / bw), thi = Math.floor(4000 / bw);
    let cE = 0, tE = 0, cC = 0, tC = 0;
    for (let i = lo; i <= hi; i++) { cE += data[i] * data[i]; cC++; }
    for (let i = tlo; i <= thi; i++) { tE += data[i] * data[i]; tC++; }
    const avgC = cC ? cE / cC : 0, avgT = tC ? tE / tC : 0;
    return {
      cryDB:   10 * Math.log10(avgC / 255 + 1e-10),
      totalDB: 10 * Math.log10(avgT / 255 + 1e-10),
      ratio:   avgT ? avgC / avgT : 0,
    };
  }

  const tick = useCallback(() => {
    const m   = getCryMetrics();
    let isCry = false;
    let conf  = null;
    let label = null;

    if (modeRef.current === "ml") {
      const res = predictCryML();
      isCry = res.isCry; conf = res.conf; label = res.label;
      if (m?.totalDB < SILENCE_FLOOR) isCry = false;
    } else if (modeRef.current === "fallback") {
      if (m && m.totalDB >= SILENCE_FLOOR && m.cryDB > DB_THRESHOLD && m.ratio >= RATIO_THRESHOLD) {
        isCry = true;
      }
    }

    setMetrics({
      db:        m?.totalDB != null ? m.totalDB.toFixed(1)         : null,
      intensity: m?.ratio   != null ? Math.round(m.ratio * 100)    : null,
      conf:      conf != null       ? Math.round(conf * 100)        : null,
      label:     label || null,
    });

    if (isCry) {
      silenceCountRef.current = 0;
      if (!cryStartRef.current) {
        cryStartRef.current = Date.now();
        setStatusText("Crying detected — timing…");
        addLog("Cry started");
      } else {
        const elapsed  = (Date.now() - cryStartRef.current) / 1000;
        const required = fastModeRef.current ? FAST_SECONDS : INITIAL_SECONDS;
        setTimer({ elapsed, required, active: true, fastMode: fastModeRef.current });
        setStatusText(
          `Crying for ${elapsed.toFixed(0)}s${fastModeRef.current ? " · fast mode ⚡" : ""}`
        );
        if (elapsed >= required) {
          sendAlert();
          fastModeRef.current = true;
          cryStartRef.current = Date.now();
        }
      }
    } else {
      silenceCountRef.current++;
      if (silenceCountRef.current >= SILENCE_CHECKS) {
        cryStartRef.current     = null;
        fastModeRef.current     = false;
        silenceCountRef.current = 0;
        setTimer({ elapsed: 0, required: INITIAL_SECONDS, active: false });
        setStatusText("Listening for cry…");
      } else if (cryStartRef.current) {
        const elapsed = (Date.now() - cryStartRef.current) / 1000;
        setStatusText(`Brief pause (${silenceCountRef.current}/${SILENCE_CHECKS}) · ${elapsed.toFixed(0)}s so far`);
      }
    }
    tickTimerRef.current = setTimeout(tick, CHECK_MS);
  }, [addLog, sendAlert]);

  async function startListening() {
    setMode("loading");
    modeRef.current = "loading";
    setStatusText("Requesting microphone…");

    try {
      let str;
      try {
        str = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
      } catch {
        str = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = str;

      const ctx      = new AudioContext();
      const source   = ctx.createMediaStreamSource(str);
      const analyser = ctx.createAnalyser(); analyser.fftSize = 2048;
      const gain     = ctx.createGain(); gain.gain.value = 2.5;
      source.connect(gain); gain.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      try {
        setupMLAudio(str);
        await loadYAMNet();
        setMode("ml");
        modeRef.current = "ml";
        setStatusText("Listening for cry…");
        addLog("Monitor started · YAMNet ML active");
      } catch (e) {
        console.warn("YAMNet unavailable, using frequency fallback:", e.message);
        setMode("fallback");
        modeRef.current = "fallback";
        setStatusText("Listening for cry…");
        addLog("Monitor started · frequency fallback mode");
      }

      setIsListening(true);
      tick();
    } catch (err) {
      console.error(err);
      setStatusText("Microphone access denied.");
      setMode("idle");
      modeRef.current = "idle";
      addLog("Error: mic access denied");
    }
  }

  function stopListening() {
    clearTimeout(tickTimerRef.current);
    if (scriptNodeRef.current) scriptNodeRef.current.disconnect();
    if (mlCtxRef.current?.state !== "closed") mlCtxRef.current?.close();
    if (audioCtxRef.current?.state !== "closed") audioCtxRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    analyserRef.current = null;
    setIsListening(false);
    setMode("idle");
    modeRef.current = "idle";
    cryStartRef.current = null;
    fastModeRef.current = false;
    silenceCountRef.current = 0;
    setTimer({ elapsed: 0, required: INITIAL_SECONDS, active: false });
    setStatusText("Press start to begin monitoring");
    setMetrics({ db: null, intensity: null, conf: null, label: null });
    addLog("Monitor stopped");
  }

  useEffect(() => {
    return () => clearTimeout(tickTimerRef.current);
  }, []);

  // ─── Jitsi call screen (keeping the same layout, but background white) ──
  if (inCall && jitsiRoom) {
    return (
      <div style={{ height: "100vh", width: "100%", position: "relative", background: "#fff" }}>
        <JitsiMeeting
          roomName={jitsiRoom}
          domain="meet.jit.si"
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              "microphone", "camera", "chat", "tileview", "fullscreen",
              "raisehand", "settings", "hangup"
            ],
          }}
          getIFrameRef={(iframeRef) => { iframeRef.style.height = "100vh"; }}
        />
        <button
          onClick={() => {
            setInCall(false);
            setJitsiRoom(null);
            setStatusText("✅ Call ended. Press Start to resume monitoring.");
            addLog("Call ended");
          }}
          style={{
            position: "absolute", bottom: 20, right: 20, zIndex: 1000,
            padding: "12px 24px", borderRadius: 99, background: C.danger,
            color: "#fff", border: "none", fontFamily: "inherit", fontWeight: 500,
            cursor: "pointer",
          }}
        >
          End Call
        </button>
      </div>
    );
  }

  // ─── Main UI (Pastel Pink) ───────────────────────────────
  const mc    = modeColor(mode);
  const mLabel = { ml: "YAMNet ML", fallback: "Frequency fallback", loading: "Loading…", idle: "Idle" }[mode];
  const statusBg = mode === "idle" || mode === "loading"
    ? C.surface
    : isListening && statusText.startsWith("Crying")
      ? "#FEF2F2"
      : "#F6F9F0";
  const statusBorderColor = isListening && statusText.startsWith("Crying") ? C.danger : mc;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        .cry-btn { cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
        .cry-btn:hover { opacity: 0.88; }
        .cry-btn:active { transform: scale(0.97); }
        .log-scroll::-webkit-scrollbar { width: 4px; }
        .log-scroll::-webkit-scrollbar-track { background: #F3E5E5; }
        .log-scroll::-webkit-scrollbar-thumb { background: #D1A3A3; border-radius: 99px; }
      `}</style>

      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: C.bgGradient,
        minHeight: "100vh",
        padding: "1.5rem 1rem",
        color: C.textPrimary,
      }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: C.card, boxShadow: C.cardShadow,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              border: `1px solid ${C.border}`,
            }}>
              👶
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 500 }}>Baby monitor</div>
              <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 1 }}>
                Cry detection · ML + frequency analysis
              </div>
            </div>
          </div>

          {/* Status card */}
          <div style={{
            background: statusBg,
            border: `1px solid ${statusBorderColor}40`,
            borderLeft: `3px solid ${statusBorderColor}`,
            borderRadius: 20,
            padding: "12px 14px",
            marginBottom: 12,
            transition: "background 0.4s, border-color 0.4s",
            boxShadow: C.cardShadow,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: mc + "18", borderRadius: 99,
              padding: "3px 10px", marginBottom: 8,
              fontSize: 11, fontWeight: 500, color: mc,
            }}>
              <PulseDot active={isListening} color={mc} />
              {mLabel}
            </div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 10 }}>
              {statusText}
            </div>
            <div style={{ background: C.surface, borderRadius: 12, padding: 8 }}>
              <Waveform analyserRef={analyserRef} mode={mode} />
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <MetricCard label="Loudness" value={metrics.db != null ? metrics.db : "—"} sub="dB overall" />
            <MetricCard label="Cry intensity" value={metrics.intensity != null ? `${metrics.intensity}%` : "—"}
              sub="300–600 Hz band"
              highlight={metrics.intensity > 60 ? C.danger : metrics.intensity > 30 ? C.warning : null} />
            <MetricCard label="AI confidence" value={metrics.conf != null ? `${metrics.conf}%` : "—"}
              sub={metrics.label || (mode === "ml" ? "listening…" : "ML unavailable")}
              highlight={metrics.conf > 60 ? C.danger : null} />
            <MetricCard label="Mode" value={mLabel}
              sub={mode === "ml" ? "YAMNet loaded" : mode === "fallback" ? "freq analysis" : "—"}
              highlight={mc} />
          </div>

          <ProgressTimer
            elapsed={timer.elapsed}
            required={timer.required}
            active={timer.active}
            fastMode={timer.fastMode}
          />

          <AlertBanner count={alertCount} onClear={() => setAlertCount(0)} />
          <AlertLog entries={logEntries} />

          {/* Controls */}
          <div style={{ display: "flex", gap: 10 }}>
            {!isListening ? (
              <button
                className="cry-btn"
                onClick={startListening}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 99,
                  background: C.accent, color: "#fff", border: "none",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(200,82,26,0.3)",
                }}
              >
                ▶ Start listening
              </button>
            ) : (
              <button
                className="cry-btn"
                onClick={stopListening}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 99,
                  background: C.danger, color: "#fff", border: "none",
                  fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                }}
              >
                ■ Stop
              </button>
            )}
            <button
              className="cry-btn"
              onClick={() => sendAlert()}
              style={{
                padding: "12px 18px", borderRadius: 99,
                background: "transparent", color: C.danger,
                border: `1px solid ${C.danger}80`,
                fontFamily: "inherit", fontSize: 13, fontWeight: 500,
              }}
            >
              Demo
            </button>
          </div>

          {/* Footer info */}
          <div style={{
            marginTop: 16, display: "flex", flexWrap: "wrap", gap: "4px 20px",
            fontSize: 11, color: C.textMuted, lineHeight: 1.8,
            background: C.card + "80",
            padding: "8px 12px",
            borderRadius: 20,
          }}>
            <span><span style={{ color: C.textSecondary }}>Alert after:</span> {INITIAL_SECONDS}s continuous cry</span>
            <span><span style={{ color: C.textSecondary }}>Fast mode:</span> every {FAST_SECONDS}s</span>
            <span><span style={{ color: C.textSecondary }}>Reset:</span> {(SILENCE_CHECKS * CHECK_MS / 1000)}s silence</span>
            <span><span style={{ color: C.textSecondary }}>Gain:</span> analyser 2.5× · ML mic 3×</span>
          </div>

        </div>
      </div>
    </>
  );
}