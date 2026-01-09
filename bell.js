const el = (id) => document.getElementById(id);

const errBox = el("errBox");
function showErr(msg){
  errBox.style.display = "block";
  errBox.textContent = msg;
}

window.addEventListener("error", (e) => {
  const line = e.lineno ? `Line ${e.lineno}` : "";
  showErr(`JavaScript error\n${e.message}\n${line}`);
});

window.addEventListener("unhandledrejection", (e) => {
  showErr(`Promise error\n${String(e.reason || e)}`);
});

const toMin = (h, m) => h * 60 + m;

function setViewportVars(){
  const h = window.innerHeight;
  document.documentElement.style.setProperty("--appH", `${h}px`);
}
setViewportVars();
window.addEventListener("resize", setViewportVars);
window.addEventListener("orientationchange", setViewportVars);

const ICS_URL = "calendar.ics";
let closedToday = false;
let calendarReady = false;

function todayKey() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function parseClosedKeysFromIcs(text) {
  const closed = new Set();
  const lines = text.split(/\r?\n/);
  let inEvent = false;
  let isClosedEvent = false;
  let startKey = "";

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "BEGIN:VEVENT") {
      inEvent = true;
      isClosedEvent = false;
      startKey = "";
      continue;
    }

    if (line === "END:VEVENT") {
      if (inEvent && isClosedEvent && startKey) closed.add(startKey);
      inEvent = false;
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith("SUMMARY:")) {
      const s = line.slice(8).toLowerCase();
      if (
        s.includes("no school") ||
        s.includes("school closed") ||
        s.includes("holiday") ||
        s.includes("winter break")
      ) {
        isClosedEvent = true;
      }
    }

    if (line.startsWith("DTSTART")) {
      const parts = line.split(":");
      const v = parts[1] || "";
      const y = v.slice(0, 4);
      const m = v.slice(4, 6);
      const d = v.slice(6, 8);
      if (y && m && d) startKey = `${y}${m}${d}`;
    }
  }

  return closed;
}

async function initCalendarClosedCheck() {
  try {
    const res = await fetch(ICS_URL, { cache: "no-store" });
    const text = await res.text();
    const closedKeys = parseClosedKeysFromIcs(text);
    closedToday = closedKeys.has(todayKey());
  } catch (e) {
    closedToday = false;
  } finally {
    calendarReady = true;
  }
}

const schedules = {
  "1": {
    "mon_thurs": [
      { start: toMin(7,36), end: toMin(8,33), period: 1 },
      { start: toMin(8,37), end: toMin(9,34), period: 2 },
      { start: toMin(9,38), end: toMin(10,35), period: 3 },
      { start: toMin(10,39), end: toMin(11,36), period: 4 },
      { start: toMin(11,40), end: toMin(12,10), period: 5 },
      { start: toMin(12,14), end: toMin(13,11), period: 6 },
      { start: toMin(13,15), end: toMin(14,12), period: 7 },
      { start: toMin(14,16), end: toMin(15,13), period: 8 },
      { start: toMin(15,13), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0),  label: "After-school Programs" }
    ],
    "fri": [
      { start: toMin(7,36), end: toMin(8,14), period: 1 },
      { start: toMin(8,18), end: toMin(8,56), period: 2 },
      { start: toMin(9,0),  end: toMin(9,38), period: 3 },
      { start: toMin(9,42), end: toMin(10,20), period: 4 },
      { start: toMin(10,24), end: toMin(10,54), period: 5 },
      { start: toMin(10,58), end: toMin(11,36), period: 6 },
      { start: toMin(11,40), end: toMin(12,18), period: 7 },
      { start: toMin(12,22), end: toMin(13,0),  period: 8 },
      { start: toMin(13,0),  end: toMin(13,30), label: "After School" }
    ],
    "sat": [
      { start: toMin(9,0), end: toMin(12,0), label: "Tutorials" }
    ]
  },
  "2": {
    "mon_thurs": [
      { start: toMin(7,36), end: toMin(8,33), period: 1 },
      { start: toMin(8,37), end: toMin(9,34), period: 2 },
      { start: toMin(9,38), end: toMin(10,35), period: 3 },
      { start: toMin(10,39), end: toMin(11,36), period: 4 },
      { start: toMin(11,40), end: toMin(12,37), period: 5 },
      { start: toMin(12,41), end: toMin(13,11), period: 6 },
      { start: toMin(13,15), end: toMin(14,12), period: 7 },
      { start: toMin(14,16), end: toMin(15,13), period: 8 },
      { start: toMin(15,13), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0),  label: "After-school Programs" }
    ],
    "fri": [
      { start: toMin(7,36), end: toMin(8,14), period: 1 },
      { start: toMin(8,18), end: toMin(8,56), period: 2 },
      { start: toMin(9,0),  end: toMin(9,38), period: 3 },
      { start: toMin(9,42), end: toMin(10,20), period: 4 },
      { start: toMin(10,24), end: toMin(11,2),  period: 5 },
      { start: toMin(11,6),  end: toMin(11,36), period: 6 },
      { start: toMin(11,40), end: toMin(12,18), period: 7 },
      { start: toMin(12,22), end: toMin(13,0),  period: 8 },
      { start: toMin(13,0),  end: toMin(13,30), label: "After School" }
    ],
    "sat": [
      { start: toMin(9,0), end: toMin(12,0), label: "Tutorials" }
    ]
  }
};

const switchBtn = el("switchBtn");
const soundBtn = el("soundBtn");

let building = localStorage.getItem("bell_building") || "2";
let soundEnabled = (localStorage.getItem("bell_sound_enabled") || "1") === "1";

let audioCtx = null;

function pad(n){ return String(n).padStart(2, "0"); }

function formatTime(mins){
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${pad(m)} ${ampm}`;
}

function getDayKey(){
  const d = new Date().getDay();
  if (d === 6) return "sat";
  if (d === 5) return "fri";
  if (d === 0) return "sun";
  return "mon_thurs";
}

function nowMinutes(){
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;
}

function updateBuildingButton(){
  switchBtn.textContent = building === "2" ? "Show Building 1" : "Show Building 2";
}

function updateSoundButton(){
  soundBtn.textContent = soundEnabled ? "Sound On" : "Sound Off";
}

function ensureAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function longBeep(){
  if (!soundEnabled) return;
  ensureAudio();
  if (!audioCtx) return;

  const t = audioCtx.currentTime;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc1.type = "sine";
  osc2.type = "sine";

  osc1.frequency.setValueAtTime(520, t);
  osc2.frequency.setValueAtTime(780, t);

  gain.gain.setValueAtTime(0.28, t);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start(t);
  osc2.start(t);

  osc1.stop(t + 2.0);
  osc2.stop(t + 2.0);
}

/*
  Sound rules
  Long sound only
  Period start
  Exactly 2 minutes remaining
  Period end
  No transition sounds
*/

let currentBlockId = "";
let playedStartForBlock = false;
let playedTwoMinForBlock = false;
let playedEndForBlock = false;

function resetSoundState(){
  currentBlockId = "";
  playedStartForBlock = false;
  playedTwoMinForBlock = false;
  playedEndForBlock = false;
}

function maybePeriodLongSounds(secondsLeftInt, blockId, secondsSinceStart){
  if (!soundEnabled) return;

  if (currentBlockId !== blockId) {
    currentBlockId = blockId;
    playedStartForBlock = false;
    playedTwoMinForBlock = false;
    playedEndForBlock = false;
  }

  if (!playedStartForBlock && secondsSinceStart >= 0 && secondsSinceStart <= 2) {
    playedStartForBlock = true;
    longBeep();
  }

  if (!playedTwoMinForBlock && secondsLeftInt === 120) {
  playedTwoMinForBlock = true;
  longBeepHalf();
  setTimeout(longBeepHalf, 1200);
  }

  if (!playedEndForBlock && secondsLeftInt === 0) {
    playedEndForBlock = true;
    longBeep();
  }
}

function fitTimerValue(){
  const tv = el("remainingValue");
  const card = document.querySelector(".timerCard");
  if (!tv || !card) return;

  const timerTile = document.querySelector(".timerCard");
  if (timerTile && timerTile.classList.contains("noTimer")) return;

  const maxW = Math.max(140, card.clientWidth - 56);
  const maxH = Math.max(140, card.clientHeight - 90);

  const safeW = maxW * 0.98;
  const safeH = maxH * 0.98;

  let lo = 30;
  let hi = Math.min(1200, maxH * 1.2, maxW * 1.2);

  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    tv.style.fontSize = `${mid}px`;

    const r = tv.getBoundingClientRect();
    if (r.width <= safeW && r.height <= safeH) lo = mid;
    else hi = mid;
  }

  tv.style.fontSize = `${lo}px`;
}

function setDisplay(statusLabel, rangeText, secondsLeft, nextBellText){
  el("statusValue").textContent = statusLabel;
  el("periodRange").textContent = rangeText;

  const timerTile = document.querySelector(".timerCard");

  if (secondsLeft === null || secondsLeft === undefined) {
    timerTile.classList.add("noTimer");
    el("remainingValue").textContent = "";
  } else {
    timerTile.classList.remove("noTimer");
    const s = Math.max(0, Math.floor(secondsLeft));
    el("remainingValue").textContent = `${Math.floor(s / 60)}:${pad(s % 60)}`;
  }

  el("nextBellValue").textContent = nextBellText;
  requestAnimationFrame(fitTimerValue);
}

function tick(){
  if (calendarReady && closedToday) {
    setDisplay("School closed", "", null, "No bells today");
    resetSoundState();
    return;
  }

  const dayKey = getDayKey();

  if (dayKey === "sun") {
    setDisplay("No School", "Sunday", null, "No bells today");
    resetSoundState();
    return;
  }

  const blocks = schedules[building][dayKey];
  const nowM = nowMinutes();

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (nowM >= b.start && nowM < b.end) {
      const secondsLeft = Math.max(0, Math.floor((b.end - nowM) * 60));
      const statusText = b.label ? b.label : `P ${b.period}`;

      setDisplay(
        statusText,
        `${formatTime(b.start)} to ${formatTime(b.end)}`,
        secondsLeft,
        `Next bell at ${formatTime(b.end)}`
      );

      const blockId = `${dayKey}_${building}_${i}_${b.start}_${b.end}`;
      const secondsSinceStart = Math.floor((nowM - b.start) * 60);

      maybePeriodLongSounds(secondsLeft, blockId, secondsSinceStart);
      return;
    }
  }

  if (nowM < blocks[0].start) {
    const secondsLeft = Math.max(0, Math.floor((blocks[0].start - nowM) * 60));
    setDisplay(
      "Before School",
      `First bell at ${formatTime(blocks[0].start)}`,
      secondsLeft,
      `Next bell at ${formatTime(blocks[0].start)}`
    );
    resetSoundState();
    return;
  }

  for (let i = 0; i < blocks.length - 1; i++) {
    if (nowM >= blocks[i].end && nowM < blocks[i + 1].start) {
      const secondsLeft = Math.max(0, Math.floor((blocks[i + 1].start - nowM) * 60));
      const nextName = blocks[i + 1].label ? blocks[i + 1].label : `P ${blocks[i + 1].period}`;

      setDisplay(
        "Transition",
        `Next: ${nextName}`,
        secondsLeft,
        `Next bell at ${formatTime(blocks[i + 1].start)}`
      );

      resetSoundState();
      return;
    }
  }

  setDisplay(
    "No Classes or Activities",
    "",
    null,
    `Next school day starts at ${formatTime(blocks[0].start)}`
  );

  resetSoundState();
}

switchBtn.onclick = () => {
  building = building === "2" ? "1" : "2";
  localStorage.setItem("bell_building", building);
  updateBuildingButton();
  tick();
};

soundBtn.onclick = () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem("bell_sound_enabled", soundEnabled ? "1" : "0");
  if (soundEnabled) ensureAudio();
  updateSoundButton();
};

updateBuildingButton();
updateSoundButton();

initCalendarClosedCheck().then(() => {
  tick();
  setInterval(tick, 250);
});

window.addEventListener("resize", () => requestAnimationFrame(fitTimerValue));
document.addEventListener("fullscreenchange", () => requestAnimationFrame(fitTimerValue));

function toggleFullscreen(){
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

document.addEventListener("dblclick", () => toggleFullscreen());
