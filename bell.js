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
const DAY_START_MIN = toMin(7, 0);

// 2026-2027 instructional school year
// JavaScript months begin at 0: January = 0, August = 7, May = 4
const SCHOOL_START = new Date(2026, 7, 12); // August 12, 2026
const SCHOOL_END = new Date(2027, 4, 27);   // May 27, 2027

function isOutsideSchoolYear() {
  const now = new Date();

  // Remove the current time so only calendar dates are compared
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return today < SCHOOL_START || today > SCHOOL_END;
}

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
      { start: toMin(7,45), end: toMin(8,46), period: 1 },
      { start: toMin(8,51), end: toMin(9,48), period: 2 },
      { start: toMin(9,53), end: toMin(10,50), period: 3 },
      { start: toMin(10,55), end: toMin(11,52), period: 4 },
      { start: toMin(11,57), end: toMin(12,22), period: 5 },
      { start: toMin(12,27), end: toMin(13,24), period: 6 },
      { start: toMin(13,29), end: toMin(14,26), period: 7 },
      { start: toMin(14,31), end: toMin(15,28), period: 8 },
      { start: toMin(15,28), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0), label: "After-school Programs" }
    ],

    "wed": [
      { start: toMin(7,45), end: toMin(8,46), period: 1 },
      { start: toMin(8,51), end: toMin(9,48), period: 2 },
      { start: toMin(9,53), end: toMin(10,50), period: 3 },
      { start: toMin(10,55), end: toMin(11,52), period: 4 },
      { start: toMin(11,57), end: toMin(12,22), period: 5 },
      { start: toMin(12,27), end: toMin(13,24), period: 6 },
      { start: toMin(13,29), end: toMin(14,26), period: 7 },
      { start: toMin(14,31), end: toMin(15,28), period: 8 },
      { start: toMin(15,28), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0), label: "Faculty Meetings" }
    ],

    "fri": [
      { start: toMin(7,45), end: toMin(8,23), period: 1 },
      { start: toMin(8,28), end: toMin(9,6), period: 2 },
      { start: toMin(9,11), end: toMin(9,49), period: 3 },
      { start: toMin(9,54), end: toMin(10,32), period: 4 },
      { start: toMin(10,37), end: toMin(11,2), period: 5 },
      { start: toMin(11,7), end: toMin(11,45), period: 6 },
      { start: toMin(11,50), end: toMin(12,28), period: 7 },
      { start: toMin(12,33), end: toMin(13,11), period: 8 },
      { start: toMin(13,11), end: toMin(13,30), label: "Dismissal" }
    ],

    "sat": [
      { start: toMin(9,0), end: toMin(10,15), label: "Tutorial 1" },
      { start: toMin(10,15), end: toMin(10,30), label: "Break" },
      { start: toMin(10,30), end: toMin(12,0), label: "Tutorial 2" }
    ]
  },

  "2": {
    "mon_thurs": [
      { start: toMin(7,45), end: toMin(8,46), period: 1 },
      { start: toMin(8,51), end: toMin(9,48), period: 2 },
      { start: toMin(9,53), end: toMin(10,50), period: 3 },
      { start: toMin(10,55), end: toMin(11,52), period: 4 },
      { start: toMin(11,57), end: toMin(12,54), period: 5 },
      { start: toMin(12,59), end: toMin(13,24), period: 6 },
      { start: toMin(13,29), end: toMin(14,26), period: 7 },
      { start: toMin(14,31), end: toMin(15,28), period: 8 },
      { start: toMin(15,28), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0), label: "After-school Programs" }
    ],

    "wed": [
      { start: toMin(7,45), end: toMin(8,46), period: 1 },
      { start: toMin(8,51), end: toMin(9,48), period: 2 },
      { start: toMin(9,53), end: toMin(10,50), period: 3 },
      { start: toMin(10,55), end: toMin(11,52), period: 4 },
      { start: toMin(11,57), end: toMin(12,54), period: 5 },
      { start: toMin(12,59), end: toMin(13,24), period: 6 },
      { start: toMin(13,29), end: toMin(14,26), period: 7 },
      { start: toMin(14,31), end: toMin(15,28), period: 8 },
      { start: toMin(15,28), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0), label: "Faculty Meetings" }
    ],

    "fri": [
      { start: toMin(7,45), end: toMin(8,23), period: 1 },
      { start: toMin(8,28), end: toMin(9,6), period: 2 },
      { start: toMin(9,11), end: toMin(9,49), period: 3 },
      { start: toMin(9,54), end: toMin(10,32), period: 4 },
      { start: toMin(10,37), end: toMin(11,15), period: 5 },
      { start: toMin(11,20), end: toMin(11,45), period: 6 },
      { start: toMin(11,50), end: toMin(12,28), period: 7 },
      { start: toMin(12,33), end: toMin(13,11), period: 8 },
      { start: toMin(13,11), end: toMin(13,30), label: "Dismissal" }
    ],

    "sat": [
      { start: toMin(9,0), end: toMin(10,15), label: "Tutorial 1" },
      { start: toMin(10,15), end: toMin(10,30), label: "Break" },
      { start: toMin(10,30), end: toMin(12,0), label: "Tutorial 2" }
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
  if (d === 3) return "wed";
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

let currentBlockId = "";
let playedTwoMinForBlock = false;
let playedEndForBlock = false;

let lastSeenPeriodBlockId = "";
let lastSeenPeriodEndMin = null;
let endBellFiredForBlockId = "";

let playedMorningBellForDay = "";

function resetSoundState(){
  currentBlockId = "";
  playedTwoMinForBlock = false;
  playedEndForBlock = false;

  lastSeenPeriodBlockId = "";
  lastSeenPeriodEndMin = null;
  endBellFiredForBlockId = "";
}

function maybePeriodLongSounds(secondsLeftInt, blockId){
  if (!soundEnabled) return;

  if (currentBlockId !== blockId) {
    currentBlockId = blockId;
    playedTwoMinForBlock = false;
    playedEndForBlock = false;

    longBeep();
  }

  if (!playedTwoMinForBlock && secondsLeftInt <= 120 && secondsLeftInt > 0) {
    playedTwoMinForBlock = true;
    longBeep();
  }

  if (!playedEndForBlock && secondsLeftInt <= 0) {
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
  const dayKey = getDayKey();

  if (calendarReady && closedToday) {
    setDisplay("School closed", "", null, "No bells today");
    resetSoundState();
    return;
  }

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
      const secondsLeft = Math.max(0, Math.round((b.end - nowM) * 60));

      let statusText = b.label ? b.label : `P ${b.period}`;

      if (building === "1" && b.period === 5) statusText += " Lunch 1";
      if (building === "2" && b.period === 6) statusText += " Lunch 2";

      setDisplay(
        statusText,
        `${formatTime(b.start)} to ${formatTime(b.end)}`,
        secondsLeft,
        `Next bell at ${formatTime(b.end)}`
      );

      const blockId = `${dayKey}_${building}_${i}_${b.start}_${b.end}`;
      lastSeenPeriodBlockId = blockId;
      lastSeenPeriodEndMin = b.end;

      if (b.period) {
        maybePeriodLongSounds(secondsLeft, blockId);
      }
      return;
    }
  }

  if (
    lastSeenPeriodBlockId &&
    endBellFiredForBlockId !== lastSeenPeriodBlockId &&
    lastSeenPeriodEndMin !== null &&
    nowM >= lastSeenPeriodEndMin
  ) {
    endBellFiredForBlockId = lastSeenPeriodBlockId;
    longBeep();
  }

  if (nowM < blocks[0].start) {
    if (nowM < DAY_START_MIN) {
      setDisplay(
        "Before School",
        `Day starts at ${formatTime(DAY_START_MIN)}`,
        null,
        `Next bell at ${formatTime(blocks[0].start)}`
      );
    } else {
      const secondsLeft = Math.max(0, Math.round((blocks[0].start - nowM) * 60));
      const morningKey = todayKey();

      if (playedMorningBellForDay !== morningKey && secondsLeft <= 2 && secondsLeft >= 0) {
        playedMorningBellForDay = morningKey;
        longBeep();
      }

      setDisplay(
        "Before School",
        `First bell at ${formatTime(blocks[0].start)}`,
        secondsLeft,
        `Next bell at ${formatTime(blocks[0].start)}`
      );
    }
    resetSoundState();
    return;
  }

  for (let i = 0; i < blocks.length - 1; i++) {
    if (nowM >= blocks[i].end && nowM < blocks[i + 1].start) {
      const secondsLeft = Math.max(0, Math.round((blocks[i + 1].start - nowM) * 60));
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
  setInterval(tick, 200);
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

let audioUnlocked = false;

function unlockAudioOnce(){
  if (audioUnlocked) return;
  audioUnlocked = true;

  soundEnabled = true;
  localStorage.setItem("bell_sound_enabled", "1");
  ensureAudio();
  updateSoundButton();
}

document.addEventListener("pointerdown", unlockAudioOnce, { once: true });
document.addEventListener("touchstart", unlockAudioOnce, { once: true });
