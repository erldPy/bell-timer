**Bell Timer**

Free to use, copy, and fork.
You are welcome to copy this project or fork it and adapt it for your own school. Just bring your own bell schedule and calendar file and update them as needed.

A single file, mobile friendly web app that shows the current bell schedule status and a live countdown timer. It supports two building schedules, optional bell sounds, fullscreen mode, and automatic school closed detection using a local calendar.ics file.

**Features**

Live status and countdown
Shows the current block such as P 3, Transition, Before School, Dismissal, etc, with a real time countdown, next bell time, and active time range.

Two building schedules
Toggle between Building 1 and Building 2 with one button. The selected building is saved in localStorage.

School closed detection
Reads calendar.ics and automatically shows “School closed” with no bells on days marked as no school, holidays, or breaks.

Smart time handling
Handles Sundays, before school, transitions, and after school hours without confusing timers.

Optional bell sounds
Sound can be turned on or off and is generated using the Web Audio API.

Long warning tone at 2 minutes remaining

Short tones in the final seconds of periods and transitions

Auto scaling timer text
Countdown digits automatically resize to fit the screen.

Fullscreen support
Double click on desktop or double tap on mobile toggles fullscreen for wall displays.

Mobile friendly layout
Responsive design with smooth scrolling and adaptive sizing for phones, tablets, and kiosks.

**Files**

index.html
Contains all HTML, CSS, and JavaScript

calendar.ics
Optional file used to detect school closed days

favicon-16.png, favicon-32.png, favicon-94.png
Browser and shortcut icons

**Customization**

Bell schedules
Edit the schedules object to match your school’s bell times and labels.

Calendar
Replace calendar.ics with your own school calendar.

Closed day keywords
Update parseClosedKeysFromIcs() to match your district’s calendar wording.

**Notes**

The calendar parser is intentionally simple and checks only SUMMARY and DTSTART

Closed days are treated as single day events

The app should be served from a web server so fetch("calendar.ics") works correctly
