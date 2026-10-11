# PISKRAFT DRL web controller

Mobile-first Web Bluetooth controller for the PISKRAFT DRL ESP32 board.

## Use

- Host the files over HTTPS and open the site in a browser with Web Bluetooth support.
- Connect to `PISKRAFT_DIM` while the motorcycle is parked.
- The app has two views selected by the tabs below the connection status. The lighting preview card is shared above both views. The default Board settings view contains controls whose save commands were found in the Android APK: DRL brightness, opposite-side DRL dimming, fade duration, and Welcome patterns 1–3. Read and Save are here. The `#lab` view contains the other preview-only controls and tools. The tabs work with browser Back/Forward.
- Choose Thai or English from the language selector. The choice is saved in this browser.
- Day, Night, and Rain lighting profiles start with editable values. Tap Preview to load a profile and send a temporary DRL preview if connected; without a board, the screen simulation still runs. Save current settings to a profile to keep them in this browser. This does not persist settings on the board.
- The motorcycle diagram in the live preview animates left/right/hazard signals, the return fade to DRL, and Welcome. The diagram and light bars also work without a Bluetooth connection. They show requested values, not measured light or board state.
- In Board settings, DRL presets and Welcome patterns select values for Save and animate the shared preview. They send a temporary board preview only when Live Preview is on. Live Preview starts off and requires a Bluetooth connection. Switching back from Experiments to Board settings stops an active preview. Read from device checks the connection first.
- Entering Experiments snapshots the Board settings values. The Experiments view has separate DRL, opposite-side DRL, and fade sliders for editing browser profiles and previews. Returning restores the Board settings values, so a lab preview cannot silently change what Save sends.
- Two collapsed tools sit on the Experiments view. The 30-second light check requires a connected board and runs DRL, Left, Right, Hazard, and a website-streamed Welcome preview for six seconds each at 70% test brightness. The rider records what actually lights at each step. It does not verify startup persistence or treat a successful BLE write as proof that a lamp lit.
- Rhythm lights offer 80/120 BPM shortcuts, a 60–160 BPM slider, and three left/right beat patterns. They simulate offline or send alternating preview commands while connected, stop after 30 seconds, and do not save to the board. Timing on the real board depends on BLE latency and how its firmware handles preview commands. The known protocol cannot address front and rear lights separately.
- The experimental turn-signal BPM control was removed. The independent rhythm tool still offers adjustable BPM for preview-only patterns; it does not set or save the vehicle relay timing.

## BLE behavior

The left/right preview commands are swapped in the web UI to match the user's physical wiring: tapping **Left** sends `PREVIEW,RIGHT,…`, and tapping **Right** sends `PREVIEW,LEFT,…`. The on-screen light bars show the requested physical side.

The original Android APK provided by the user was inspected. Its save path sends:

```text
CFG,DRL,<0–255>
CFG,DIM,<0–255>
CFG,FADE,<100–5000 ms>
CFG,ANIM,<0 fade-in | 1 pulse | 2 flash>
SAVE
```

`fadeDurationMs` belongs to the APK's `drl` configuration. The website places it with opposite-side DRL dimming on the Board settings view and sends `CFG,FADE,<ms>` on Save. Its physical effect after a turn signal ends remains unverified without the board. The APK includes turn brightness and DRL fade-start brightness in its configuration model, but its BLE save path does not send separate commands for those values. Turn brightness is on the Experiments view for preview only.

The opposite-side DRL slider requests an absolute brightness while a turn signal is on. For example, DRL 20% and DIM 3% sends `CFG,DRL,51` and `CFG,DIM,8`. Preview behavior cannot prove this setting was persisted. Save leaves 200 ms between configuration commands, waits 400 ms after `SAVE`, requests `REQ`, and compares the returned DIM against the PWM value sent. The board has now been observed returning flat JSON such as `{"drl":133,"dim":15,"fade":3800,"anim":2}`; these DRL/DIM values are 0–255 PWM, so the UI converts them to percentages when reading. The website also requests `REQ` automatically on reconnection so the saved values can be checked after a power cycle. An absent or different readback is shown explicitly. A matching readback still needs a real turn-signal test; if the board reports the requested DIM after a fresh boot but physically runs the opposite side brighter, the remaining fault is in board behavior or wiring rather than the web value conversion. Do not send `RESET` during the persistence test because it may restore defaults.

Welcome presets 1–3 use the APK's save commands. A successful BLE write only shows that the commands were sent. Confirm persistence by reading the board response and power cycling the board. The website does not claim that the firmware stored the selection without that test.

Welcome previews stream repeated `PREVIEW,DRL,<brightness>` commands for matching left/right levels. The Side chase, Soft crossfade, and Staggered rise patterns animate each side independently using `PREVIEW,LEFT/RIGHT,<level>,<opposite-level>` when the levels differ. The physical left/right command mapping is swapped as noted above. `PREVIEW,DRL,100` was previously verified on the board; the old `PREVIEW,ANIMATION,<brightness>` path did not light the user's motorcycle. The stream also drives the editable curve for 5–20 seconds and the other patterns (Soft wave and Double flash). Physical behavior for the new sequences still needs testing with a board.

The preset 3 Flash preview now makes both sides rise gradually, dim, then rise again and stay on. This follows the owner's description of how saved `CFG,ANIM,2` looks at startup. The website still streams this approximation; the firmware's exact timing has not been measured.

The APK builds a `SET_CONFIG` object with a 5000 ms startup duration and keyframes, but its BLE `writeJson` method actually sends only `CFG,DRL`, `CFG,DIM`, `CFG,FADE`, `CFG,ANIM`, and `SAVE`. It drops the keyframes and custom duration. The site stores the graph and duration in browser storage and blocks board Save for Custom and all five additional patterns. No command to persist these patterns was found in the inspected APK. Firmware inspection or a board test is needed to determine whether an undocumented command exists; until then, the 5–20 second graph runs only while a connected browser is streaming its preview.

The original `PREVIEW,DRL,100` command was tested on the board. Other modes, persistent save, and factory reset still require physical-device verification.

## UUIDs

- Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- Write/RX: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
- Notify/TX: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
