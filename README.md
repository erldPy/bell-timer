Bell Timer
Overview

Bell Timer is a lightweight, mobile friendly web application that displays the current school bell status and a live countdown timer. It is designed for classroom displays, hallway monitors, kiosks, and wall mounted screens.

Features
Live bell status and countdown

Displays the current period or block

Shows a live countdown timer

Displays the next bell time

Shows the current time range

Two building schedules

Supports two separate bell schedules

One tap switches between Building 1 and Building 2

Building selection is saved and restored automatically

School closed day detection

Reads from a local calendar.ics file

Detects closed days based on event titles

Automatically disables timers and bells on closed days

Optional bell sounds

Sound can be turned on or off

Warning beeps near the end of periods

Uses the Web Audio API

Sound preference is saved

Fullscreen support

Double click on desktop to toggle fullscreen

Double tap on mobile to toggle fullscreen

Designed for wall displays and kiosks

Mobile friendly design

Responsive layout

Works in portrait and landscape

Smooth scrolling on touch devices

File Structure

index.html

bell.css

bell.js

calendar.ics

favicon-16.png

favicon-32.png

favicon-94.png

Customizing Bell Schedules

Edit the schedules object in bell.js.
Each block defines a start time, end time, and either a period number or label.

Customizing Closed Day Keywords

Edit the parseClosedKeysFromIcs function in bell.js.
Update the keyword list used to identify closed days such as:

no school

school closed

holiday

winter break

Deployment Notes

Serve the files from a web server

Loading directly from the file system may block calendar loading

Works in modern Chrome, Edge, Safari, and mobile browsers

Suitable for kiosk and fullscreen deployments

License

This project is provided as is for educational and institutional use.
You may modify and deploy it freely within your organization.
