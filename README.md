# DRL

Mobile-first Bluetooth Low Energy web controller for the PISKRAFT DRL ESP32 board.

## Files

- `index.html` — mobile page structure
- `style.css` — responsive dark UI styling
- `app.js` — Bluetooth connection and light control logic
- `README.md` — setup and protocol notes

## Usage

- Open `index.html` from a secure HTTPS web host.
- On Android, use a browser that supports Web Bluetooth, such as Chrome.
- On iOS, use a compatible Web Bluetooth browser such as Bluefy; Safari does not directly provide Web Bluetooth.
- Tap **Connect**, select `PISKRAFT_DIM`, then use the preview controls while the motorcycle is safely parked.

## Notes

- The `PREVIEW,DRL,100` command was tested successfully on the board.
- Other preview modes, persistent configuration (`SAVE`), and factory reset (`RESET`) are based on decompilation of the original Android APK and require further physical-device verification.
- Factory reset requires two confirmations in the UI. Do not use while riding.

## BLE protocol

- Service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- Write/RX: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`
- Notify/TX: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`
