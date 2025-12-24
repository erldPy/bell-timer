# Bell Timer

A single file, mobile friendly web app that displays the current bell schedule status and a live countdown timer for two different building schedules. It can also optionally mute or enable warning sounds and can automatically detect school closed days from a local `calendar.ics` file.

## Main features

### Live bell status and countdown
The app continuously figures out what block you are currently in and shows

- A big status label like `P 3`, `Transition`, `Before School`, `Dismissal`, `After school programs`, etc
- A live countdown timer for time remaining in the current block
- A message showing the next bell time
- A time range line like `7:36 AM to 8:33 AM`

It updates frequently using `setInterval(tick, 250)` so the display feels real time.

### Two building schedules with one tap switch
There are two separate bell schedules stored in the `schedules` object under keys `"1"` and `"2"`.

- Building selection is toggled with the `Show Building 1` or `Show Building 2` button
- The choice is saved in `localStorage` under `bell_building`, so the app remembers your last selection after refresh

### Calendar based school closed detection with `calendar.ics`
The app can automatically show “School closed” and disable bell behavior for days listed as closed in `calendar.ics`.

How it works

- `ICS_URL` is set to `calendar.ics`
- On load, `initCalendarClosedCheck()` fetches the file with `cache: "no-store"`
- `parseClosedKeysFromIcs()` scans each `VEVENT`
- If an event `SUMMARY` contains words like
  - `no school`
  - `school closed`
  - `holiday`
  - `winter break`
  then it marks that event as a closure
- It reads the event date from `DTSTART` and compares it to today using `todayKey()` formatted like `YYYYMMDD`
- If today is a closed day, the UI becomes
  - Status `School closed`
  - No timer
  - Message `No bells today`

If the fetch fails, it safely falls back to normal operation.

### Sunday and off hours handling
The app has special cases that avoid confusing timers

- Sunday always shows `No School` and no timer
- Before the first block it shows `Before School` and counts down to first bell
- Between blocks it shows `Transition` and counts down to the next block start
- After the last block it shows `No Classes or Activities` and shows the next day start time

### Optional bell sounds with warning logic
Sound is controlled by the `Sound On` or `Sound Off` button.

- Your preference is stored in `localStorage` under `bell_sound_enabled`
- Sounds are generated with the Web Audio API, no external audio files needed
- `maybeBeep()` controls timing
  - Long warning beep at 2 minutes remaining during a period
  - Short beeps in the last 5 seconds of a period
  - Short beeps in the last 2 seconds of a transition
- `lastBeepKey` prevents duplicate beeps from repeated ticks

### Auto fit timer text to screen size
The timer digits automatically scale to fill the available space without overflowing.

- `fitTimerValue()` binary searches for a font size that fits inside the timer card
- It runs on every update via `requestAnimationFrame`
- It also reruns on window resize and fullscreen changes

### Fullscreen toggle by double tap or double click
The page can enter or exit fullscreen for wall displays.

- Desktop: double click toggles fullscreen
- Mobile: double tap within 300 ms toggles fullscreen

### Mobile friendly layout and smooth scrolling
The UI is designed to behave well on phones and tablets

- Uses responsive font sizes with `clamp()`
- Uses viewport based sizing with `100dvh`
- Card content can scroll with `-webkit-overflow-scrolling: touch`
- Several `@media` rules adjust layout for short screens and landscape mode

## Files

- `index.html`  
  Contains all HTML, CSS, and JavaScript for the app

- `calendar.ics`  
  Optional local iCalendar file used to detect school closed days

- `favicon-16.png`, `favicon-32.png`, `favicon-94.png`  
  Icons for browser tabs and shortcuts

## Customizing the bell schedules

Edit the `schedules` object.

Each entry is a block like

- `start` and `end` are minutes from midnight, built with `toMin(h, m)`
- Use either
  - `period: <number>` for numbered class periods
  - `label: "<text>"` for named blocks like Dismissal or After School

Example block

```js
{ start: toMin(7,36), end: toMin(8,33), period: 1 }

Customizing calendar closed keywords

Edit parseClosedKeysFromIcs().

It currently treats an event as a closure if the SUMMARY includes any of

no school

school closed

holiday

winter break

Add or remove keywords there to match your district calendar naming.

Notes and limitations

The calendar.ics parser is intentionally simple and only looks at SUMMARY and DTSTART

It treats closures as single day events based on DTSTART

It assumes the page is served from a web server so fetch("calendar.ics") works

If opened directly from the filesystem, browser security settings may block fetch depending on browser




