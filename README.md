# PISKRAFT DRL web controller

Mobile-first Web Bluetooth controller for the PISKRAFT DRL ESP32 board.

## Use

- Host the files over HTTPS and open the site in a browser with Web Bluetooth support.
- Connect to `PISKRAFT_DIM` while the motorcycle is parked.
- The page is a single scrollable view. DRL, turn-signal, and Welcome settings are grouped below the live preview.
- Choose Thai or English from the language selector. The choice is saved in this browser.

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

`fadeDurationMs` belongs to the APK's `drl` configuration, so the website places it in the DRL section. The APK includes turn brightness and DRL fade-start brightness in its configuration model, but its BLE save path does not send separate commands for those values. Turn brightness on this page is preview only.

Welcome presets 1–3 use the APK's save commands. A successful BLE write only shows that the commands were sent. Confirm persistence by reading the board response and power cycling the board. The website does not claim that the firmware stored the selection without that test.

The APK's custom Welcome curve is previewed by sending repeated `PREVIEW,CUSTOM,<brightness>` values. Its save path maps `custom` to animation value `0` and sends no keyframes. The web page therefore keeps an edited curve in browser storage for preview and blocks board Save while Custom is selected.

The original `PREVIEW,DRL,100` command was tested on the board. Other modes, persistent save, and factory reset still require physical-device verification.

## UUIDs

- Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- Write/RX: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
- Notify/TX: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
