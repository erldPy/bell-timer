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
      { start: toMin(15,45), end: toMin(17,0), label: "After-school Programs" }
    ],
    "wed": [
      { start: toMin(7,36), end: toMin(8,33), period: 1 },
      { start: toMin(8,37), end: toMin(9,34), period: 2 },
      { start: toMin(9,38), end: toMin(10,35), period: 3 },
      { start: toMin(10,39), end: toMin(11,36), period: 4 },
      { start: toMin(11,40), end: toMin(12,10), period: 5 },
      { start: toMin(12,14), end: toMin(13,11), period: 6 },
      { start: toMin(13,15), end: toMin(14,12), period: 7 },
      { start: toMin(14,16), end: toMin(15,13), period: 8 },
      { start: toMin(15,13), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0), label: "Faculty Meetings" }
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
      { start: toMin(13,0),  end: toMin(13,30), label: "Dismissal" }
    ],
    "sat": [
      { start: toMin(9,0),  end: toMin(10,15), label: "Tutorial 1" },
      { start: toMin(10,15), end: toMin(10,30), label: "Break" },
      { start: toMin(10,30), end: toMin(12,0),  label: "Tutorial 2" }
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
      { start: toMin(15,45), end: toMin(17,0), label: "After-school Programs" }
    ],
    "wed": [
      { start: toMin(7,36), end: toMin(8,33), period: 1 },
      { start: toMin(8,37), end: toMin(9,34), period: 2 },
      { start: toMin(9,38), end: toMin(10,35), period: 3 },
      { start: toMin(10,39), end: toMin(11,36), period: 4 },
      { start: toMin(11,40), end: toMin(12,37), period: 5 },
      { start: toMin(12,41), end: toMin(13,11), period: 6 },
      { start: toMin(13,15), end: toMin(14,12), period: 7 },
      { start: toMin(14,16), end: toMin(15,13), period: 8 },
      { start: toMin(15,13), end: toMin(15,45), label: "Dismissal" },
      { start: toMin(15,45), end: toMin(17,0), label: "Faculty Meetings" }
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
      { start: toMin(13,0),  end: toMin(13,30), label: "Dismissal" }
    ],
    "sat": [
      { start: toMin(9,0),  end: toMin(10,15), label: "Tutorial 1" },
      { start: toMin(10,15), end: toMin(10,30), label: "Break" },
      { start: toMin(10,30), end: toMin(12,0),  label: "Tutorial 2" }
    ]
  }
};

initCalendarClosedCheck().then(() => {
  tick();
  setInterval(tick, 200);
});
