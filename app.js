'use strict';

const SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const $ = id => document.getElementById(id);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const pwm = percent => Math.round(clamp(Number(percent), 0, 100) * 255 / 100);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const defaultCurve = [0, 100, 25, 85, 20, 100];
const defaultProfiles = {
  day: {drl:100, turn:100, opposite:50, fade:5000, welcome:'fade-in', duration:5, curve:defaultCurve},
  night: {drl:25, turn:100, opposite:25, fade:5000, welcome:'pulse', duration:5, curve:defaultCurve},
  rain: {drl:60, turn:100, opposite:40, fade:5000, welcome:'flash', duration:5, curve:defaultCurve}
};

const translations = {
  th: {
    language:'ภาษา', motorcycleLights:'ภาพจำลองไฟหน้ารถจักรยานยนต์', curveAccessible:'กราฟความสว่างที่แก้ไขได้',
    visualSimulation:'ภาพจำลองไฟ • ไม่ใช่สถานะจริงจากบอร์ด',
    myProfiles:'โปรไฟล์ไฟส่วนตัว', profilesLocal:'เก็บในเบราว์เซอร์นี้',
    profilesHint:'แตะทดลองเพื่อโหลดค่าและดูไฟ DRL ทันที ปรับค่าด้านล่างแล้วบันทึกทับโปรไฟล์ได้',
    profileDay:'ขี่กลางวัน', profileNight:'ขี่กลางคืน', profileRain:'ขี่ฝนตก',
    previewProfile:'▶ ทดลอง', saveProfile:'เก็บค่าปัจจุบัน',
    profileDeviceHint:'แตะทดลองเพื่อส่งค่าพรีวิวไปบอร์ดเมื่อเชื่อมต่อ หากยังไม่เชื่อมต่อจะจำลองบนจอเท่านั้น การบันทึกลงบอร์ดใช้ปุ่มด้านล่าง',
    profileSummary:(drl, turn, welcome) => `DRL ${drl}% · เลี้ยว ${turn}% · ${welcome}`,
    profileSaved:'เก็บโปรไฟล์ในเบราว์เซอร์แล้ว', profilePreview:'กำลังทดลองโปรไฟล์',
    profileSaveFailed:'เบราว์เซอร์นี้ไม่อนุญาตให้เก็บโปรไฟล์',
    livePreview:'พรีวิวไฟ', previewHint:'เลือกโหมดเพื่อทดลองไฟทันที',
    drl:'DRL', left:'ซ้าย', right:'ขวา', hazard:'ฉุกเฉิน', fade:'เฟด', animation:'Welcome',
    leftLight:'ไฟซ้าย', rightLight:'ไฟขวา', liveChanges:'Live Preview เปิด/ปิด',
    liveChangesHint:'เปิดแล้วเลือกโหมดหรือเลื่อนสไลเดอร์จะส่งไปบอร์ดทันที', previewSelected:'▶ พรีวิวที่เลือก',
    stopPreview:'■ หยุดพรีวิว', lightingSettings:'ตั้งค่าไฟ', chooseSection:'เลือกหมวดด้านล่าง',
    turn:'ไฟเลี้ยว', welcome:'Welcome', drlSettings:'ตั้งค่า DRL',
    drlBrightness:'ความสว่าง DRL', fadeDuration:'เวลา DRL ค่อย ๆ กลับหลังปิดไฟเลี้ยว',
    fadeExplanation:'ภาพจำลองจะค่อย ๆ กลับเป็น DRL ในเวลาที่เลือก สูงสุด 5 วินาที เว็บส่ง CFG,FADE ไปบอร์ดเมื่อบันทึก แต่ผลจริงหลังปิดไฟเลี้ยวยังต้องทดสอบกับบอร์ด',
    quickPresets:'ค่าความสว่างสำเร็จรูป', previewOnly:'พรีวิวเท่านั้น',
    night:'กลางคืน', daylight:'กลางวัน', balanced:'สมดุล', off:'ปิด',
    turnSettings:'ตั้งค่าไฟเลี้ยว', turnBrightness:'ความสว่างไฟเลี้ยว',
    turnPreviewOnly:'ค่านี้ใช้กับพรีวิวเท่านั้น แอปเดิมไม่มีคำสั่งบันทึกค่านี้แยกต่างหาก',
    oppositeBrightness:'DRL ฝั่งตรงข้าม',
    oppositeHint:'ความสว่างของอีกฝั่งขณะเปิดไฟเลี้ยวซ้ายหรือขวา',
    previewLeft:'⇦ ทดลองซ้าย', previewRight:'ทดลองขวา ⇨', previewHazard:'⚠ ฉุกเฉิน',
    welcomeSettings:'ไฟต้อนรับตอนเปิดเครื่อง',
    welcomeHint:'แตะรูปแบบเพื่อทดลองกับบอร์ดที่เชื่อมต่อ แบบ 1–3 มีคำสั่งบันทึก; กราฟและแบบ 5–6 ทดลองขณะเชื่อมต่อเท่านั้น',
    fadeIn:'ค่อย ๆ สว่าง', fadeInHint:'สว่างขึ้นอย่างนุ่มนวล',
    pulse:'เต้นเป็นจังหวะ', pulseHint:'สว่างและหรี่เป็นจังหวะ',
    flash:'กะพริบ', flashHint:'กะพริบก่อนสว่างค้าง',
    custom:'กำหนดเอง', customHint:'วาดกราฟความสว่าง',
    softWave:'คลื่นนุ่ม', softWaveHint:'สว่างขึ้นสองระลอก',
    doubleFlash:'แฟลชคู่', doubleFlashHint:'กะพริบสองครั้งแล้วค่อยสว่าง',
    curveTitle:'กราฟความสว่าง', curveAxes:seconds => `เวลา 0–${seconds} วินาที · ความสว่าง 0–100%`,
    welcomeDuration:'ระยะเวลากราฟ',
    pointBrightness:'ความสว่างที่จุด', curveHow:'แตะจุดบนกราฟแล้วลากขึ้นลง หรือใช้สไลเดอร์ด้านล่าง',
    resetCurve:'คืนค่ากราฟเริ่มต้น',
    customLimit:'กราฟ 5–20 วินาทีส่งค่าพรีวิวไปบอร์ดขณะเชื่อมต่อได้ แต่ APK ไม่มีคำสั่งบันทึกจุดกราฟหรือระยะเวลาลงบอร์ด แบบนี้จึงยังทำงานเองตอนเปิดเครื่องไม่ได้หากไม่แก้เฟิร์มแวร์',
    previewWelcome:'▶ ทดลอง Welcome', readDevice:'↻ อ่านค่าจากบอร์ด',
    saveDevice:'⬆ บันทึกลงบอร์ด',
    saveWarning:'บอร์ดต้องตอบกลับหรือทดสอบเปิดเครื่องใหม่ จึงจะยืนยันว่าบันทึกสำเร็จ',
    diagnostics:'การเชื่อมต่อและบันทึกคำสั่ง', requestConfig:'ขอค่าปัจจุบัน',
    copyLog:'คัดลอกบันทึก', browserHelp:'ใช้เบราว์เซอร์ที่รองรับ Web Bluetooth ผ่าน HTTPS และตั้งค่าไฟขณะจอดรถเท่านั้น',
    factoryReset:'คืนค่าโรงงาน', footer:'PISKRAFT BLE LAB · ตั้งค่าไฟขณะจอดรถเท่านั้น',
    notConnected:'ยังไม่เชื่อมต่ออุปกรณ์', bluetoothRequired:'ต้องเชื่อมต่อ Bluetooth',
    connectedDetails:'ESP32 · เชื่อมต่อ Bluetooth แล้ว', connect:'เชื่อมต่อ', disconnect:'ตัดการเชื่อมต่อ',
    connected:'เชื่อมต่อแล้ว', offline:'ออฟไลน์',
    connectFirst:'เชื่อมต่อ PISKRAFT ก่อน', unavailable:'เบราว์เซอร์นี้ไม่รองรับ Web Bluetooth',
    disconnected:'อุปกรณ์ตัดการเชื่อมต่อ', connectedToast:'เชื่อมต่อกับ ',
    presetPreview:'พรีวิว DRL ', readSent:'ส่งคำสั่งอ่านค่าแล้ว ดูข้อมูลในบันทึกคำสั่ง',
    configLoaded:'อ่านค่าที่รู้จักจากบอร์ดมาแสดงแล้ว', configReceived:'ได้รับค่าจากบอร์ด ดูข้อมูลในบันทึกคำสั่ง',
    customCannotSave:'แบบกำหนดเองบันทึกลงบอร์ดไม่ได้: APK ไม่มีคำสั่งบันทึกกราฟ กรุณาเลือกแบบ 1–3',
    saveConfirm:'ส่งค่าต่อไปนี้ไปยังบอร์ดหรือไม่?\n\n',
    saveConfirmEnd:'\n\nตั้งค่าขณะจอดรถเท่านั้น การส่งคำสั่งยังไม่ยืนยันว่าบอร์ดบันทึกสำเร็จ',
    saveFailed:'หยุดการบันทึกเพราะส่งคำสั่งไม่สำเร็จ',
    saveSent:'ส่งคำสั่งบันทึกแล้ว กำลังขอค่าอ่านกลับ; โปรดทดสอบเปิดเครื่องใหม่',
    resetConfirm:'คืนค่าโรงงาน? การตั้งค่าปัจจุบันอาจถูกลบ',
    resetAgain:'ยืนยันอีกครั้งว่าจะส่ง RESET ไปยังบอร์ด',
    logCopied:'คัดลอกบันทึกแล้ว', copyFailed:'คัดลอกบันทึกไม่ได้',
    noDevice:'ยังไม่ต่อบอร์ด แสดงภาพจำลองบนจอเท่านั้น',
    liveNeedsDevice:'ต่อบอร์ดก่อนเปิด Live Preview',
    liveEnabled:'เปิด Live Preview แล้ว', liveDisabled:'ปิด Live Preview แล้ว',
    graphCannotSave:'รูปแบบนี้เล่นบนบอร์ดขณะเชื่อมต่อได้ แต่บอร์ดยังไม่มีคำสั่งบันทึกให้เล่นเองตอนเปิดเครื่อง'
  },
  en: {
    language:'Language', motorcycleLights:'Simulated motorcycle front lights', curveAccessible:'Editable brightness curve',
    visualSimulation:'Light simulation • not live board status',
    myProfiles:'My lighting profiles', profilesLocal:'Saved in this browser',
    profilesHint:'Tap Preview to load the settings and see DRL immediately. Adjust settings below, then save them to a profile.',
    profileDay:'Day ride', profileNight:'Night ride', profileRain:'Rain ride',
    previewProfile:'▶ Preview', saveProfile:'Save current settings',
    profileDeviceHint:'Tap Preview to send temporary values when connected. Without a board, only the screen simulation runs. Use Save to device below to store supported settings.',
    profileSummary:(drl, turn, welcome) => `DRL ${drl}% · Turn ${turn}% · ${welcome}`,
    profileSaved:'Profile saved in this browser', profilePreview:'Previewing profile',
    profileSaveFailed:'This browser could not save the profile',
    livePreview:'Live lighting preview', previewHint:'Choose a mode to preview the lights',
    drl:'DRL', left:'Left', right:'Right', hazard:'Hazard', fade:'Fade', animation:'Welcome',
    leftLight:'Left light', rightLight:'Right light', liveChanges:'Live Preview on/off',
    liveChangesHint:'When on, mode and slider changes are sent to the board', previewSelected:'▶ Preview selected',
    stopPreview:'■ Stop preview', lightingSettings:'Lighting settings', chooseSection:'Choose a section below',
    turn:'Turn signal', welcome:'Welcome', drlSettings:'DRL settings',
    drlBrightness:'DRL brightness', fadeDuration:'DRL return fade after turn signal',
    fadeExplanation:'The simulation fades back to DRL over up to 5 seconds. Save sends CFG,FADE to the board, but its physical turn-off behavior still needs a board test.',
    quickPresets:'Quick brightness presets', previewOnly:'Preview only',
    night:'Night', daylight:'Daylight', balanced:'Balanced', off:'Off',
    turnSettings:'Turn-signal settings', turnBrightness:'Turn brightness',
    turnPreviewOnly:'This value is for preview only. The original app has no separate command to save it.',
    oppositeBrightness:'Opposite-side DRL',
    oppositeHint:'Brightness of the other side during a left or right turn signal',
    previewLeft:'⇦ Preview left', previewRight:'Preview right ⇨', previewHazard:'⚠ Hazard',
    welcomeSettings:'Startup Welcome animation',
    welcomeHint:'Tap a pattern to preview on a connected board. Modes 1–3 have save commands; the graph and modes 5–6 run only while connected.',
    fadeIn:'Fade in', fadeInHint:'Gradually brightens',
    pulse:'Pulse', pulseHint:'Brightens and dims in a rhythm',
    flash:'Flash', flashHint:'Flashes, then stays on',
    custom:'Custom', customHint:'Draw a brightness curve',
    softWave:'Soft wave', softWaveHint:'Two smooth waves of light',
    doubleFlash:'Double flash', doubleFlashHint:'Two flashes, then a gentle rise',
    curveTitle:'Brightness curve', curveAxes:seconds => `Time 0–${seconds} s · Brightness 0–100%`,
    welcomeDuration:'Curve duration',
    pointBrightness:'Brightness at', curveHow:'Drag a point up or down, or use the slider below',
    resetCurve:'Reset curve',
    customLimit:'The 5–20 second curve can stream a live preview to a connected board. The APK has no command to save keyframes or duration, so it cannot run at startup without firmware changes.',
    previewWelcome:'▶ Preview Welcome', readDevice:'↻ Read from device',
    saveDevice:'⬆ Save to device',
    saveWarning:'A board response or power-cycle test is needed to confirm the settings were saved.',
    diagnostics:'Connection and command log', requestConfig:'Request config',
    copyLog:'Copy log', browserHelp:'Use a Web Bluetooth browser over HTTPS. Configure the lights only while parked.',
    factoryReset:'Factory reset', footer:'PISKRAFT BLE LAB · Configure only while parked',
    notConnected:'Device not connected', bluetoothRequired:'Bluetooth connection required',
    connectedDetails:'ESP32 · Bluetooth connected', connect:'Connect', disconnect:'Disconnect',
    connected:'Connected', offline:'Offline',
    connectFirst:'Connect to PISKRAFT first', unavailable:'Web Bluetooth is unavailable in this browser',
    disconnected:'Device disconnected', connectedToast:'Connected to ',
    presetPreview:'DRL preview ', readSent:'Read request sent. Check the command log.',
    configLoaded:'Recognized device settings loaded into the form', configReceived:'Config received. Check the command log.',
    customCannotSave:'Custom cannot be saved to the board: the APK has no curve-save command. Choose mode 1–3.',
    saveConfirm:'Send these settings to the board?\n\n',
    saveConfirmEnd:'\n\nConfigure only while parked. Sending commands does not confirm they were stored.',
    saveFailed:'Save stopped because a command failed',
    saveSent:'Save commands sent. Requesting readback; power-cycle the board to verify.',
    resetConfirm:'Restore factory defaults? Current settings may be erased.',
    resetAgain:'Final confirmation: send RESET to the board?',
    logCopied:'Log copied', copyFailed:'Could not copy log',
    noDevice:'No board connected; showing the on-screen simulation only',
    liveNeedsDevice:'Connect the board before enabling Live Preview',
    liveEnabled:'Live Preview enabled', liveDisabled:'Live Preview disabled',
    graphCannotSave:'This pattern can run while connected, but the board has no known command to store it for startup'
  }
};

function storedLanguage() {
  try { return localStorage.getItem('piskraft-language') === 'en' ? 'en' : 'th'; }
  catch { return 'th'; }
}
function storedCurve() {
  try {
    const parsed = JSON.parse(localStorage.getItem('piskraft-curve'));
    if (Array.isArray(parsed) && parsed.length === 6 && parsed.every(v => Number.isFinite(v) && v >= 0 && v <= 100)) return parsed;
  } catch {}
  return defaultCurve.slice();
}
function storedWelcomeDuration() {
  try {
    const value = Number(localStorage.getItem('piskraft-welcome-duration'));
    if (Number.isInteger(value) && value >= 5 && value <= 20) return value;
  } catch {}
  return 5;
}
function validProfile(raw, fallback) {
  if (!raw || typeof raw !== 'object') return {...fallback, curve:fallback.curve.slice()};
  const percent = key => Number.isFinite(raw[key]) && raw[key] >= 0 && raw[key] <= 100 ? Math.round(raw[key]) : fallback[key];
  return {
    drl:percent('drl'), turn:percent('turn'), opposite:percent('opposite'),
    fade:Number.isFinite(raw.fade) && raw.fade >= 100 && raw.fade <= 5000 ? Math.round(raw.fade / 100) * 100 : fallback.fade,
    welcome:['fade-in','pulse','flash','custom','soft-wave','double-flash'].includes(raw.welcome) ? raw.welcome : fallback.welcome,
    duration:Number.isInteger(raw.duration) && raw.duration >= 5 && raw.duration <= 20 ? raw.duration : fallback.duration,
    curve:Array.isArray(raw.curve) && raw.curve.length === 6 && raw.curve.every(value => Number.isFinite(value) && value >= 0 && value <= 100)
      ? raw.curve.slice() : fallback.curve.slice()
  };
}
function storedProfiles() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('piskraft-profiles')) || {}; } catch {}
  return Object.fromEntries(Object.entries(defaultProfiles).map(([key, fallback]) => [key, validProfile(saved[key], fallback)]));
}

const state = {
  language: storedLanguage(), device: null, server: null, rx: null, tx: null,
  connected: false, connecting: false, queue: Promise.resolve(), epoch: 0,
  mode: 'DRL', setting: 'drl', welcome: 'fade-in', curve: storedCurve(),
  welcomeDuration: storedWelcomeDuration(), lastLevels:[50,50], returnFromTurn:null,
  selectedPoint: 0, previewTimer: null, welcomeRun: 0, visualTimer: null, blinkOn: true,
  profiles: storedProfiles(), activeProfile: null, config: null
};
const logLines = [];
const tr = key => translations[state.language][key] || key;
function log(message) {
  const now = new Date().toLocaleTimeString(state.language === 'th' ? 'th-TH' : 'en-GB', {hour12:false});
  logLines.push('[' + now + '] ' + message);
  if (logLines.length > 150) logLines.shift();
  $('log').textContent = logLines.join('\n');
  $('log').scrollTop = $('log').scrollHeight;
}
let toastTimer;
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3600);
}
function connectionUI() {
  $('topState').textContent = tr(state.connected ? 'connected' : 'offline');
  $('deviceName').textContent = state.connected ? (state.device.name || 'PISKRAFT') : tr('notConnected');
  $('deviceDetails').textContent = tr(state.connected ? 'connectedDetails' : 'bluetoothRequired');
  $('connectBtn').textContent = tr(state.connected ? 'disconnect' : 'connect');
  $('connectBtn').disabled = state.connecting;
  if (!state.connected) $('live').checked = false;
}
function setLanguage(language) {
  state.language = language === 'en' ? 'en' : 'th';
  document.documentElement.lang = state.language;
  $('language').value = state.language;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', tr(el.dataset.i18nAria)); });
  connectionUI();
  renderProfiles();
  updateCurveLabels();
  try { localStorage.setItem('piskraft-language', state.language); } catch {}
}

function stopWelcome() { state.welcomeRun++; }
function disconnected() {
  const wasConnected = state.connected;
  stopWelcome();
  clearTimeout(state.previewTimer);
  state.connected = false;
  state.connecting = false;
  state.server = null;
  state.rx = null;
  state.tx = null;
  state.epoch++;
  connectionUI();
  if (wasConnected) { log('Disconnected'); toast(tr('disconnected')); }
}
async function connect() {
  if (state.connecting) return;
  if (state.connected) {
    state.device?.gatt?.disconnect();
    disconnected();
    return;
  }
  if (!navigator.bluetooth) { toast(tr('unavailable')); log('Web Bluetooth unavailable'); return; }
  state.connecting = true;
  connectionUI();
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{services:[SERVICE]}, {namePrefix:'PISKRAFT'}], optionalServices:[SERVICE]
    });
    if (state.device && state.device !== device) state.device.removeEventListener('gattserverdisconnected', disconnected);
    state.device = device;
    device.addEventListener('gattserverdisconnected', disconnected);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE);
    const rx = await service.getCharacteristic(RX);
    const tx = await service.getCharacteristic(TX);
    await tx.startNotifications();
    tx.addEventListener('characteristicvaluechanged', onNotification);
    state.server = server;
    state.rx = rx;
    state.tx = tx;
    state.connected = true;
    state.epoch++;
    state.queue = Promise.resolve();
    log('Connected to ' + (device.name || 'PISKRAFT'));
    $('saveStatus').textContent = tr('saveWarning');
    toast(tr('connectedToast') + (device.name || 'PISKRAFT'));
  } catch (error) {
    log('Connect failed: ' + error.message);
    toast(error.message || tr('unavailable'));
    state.device?.gatt?.disconnect();
    disconnected();
  } finally {
    state.connecting = false;
    connectionUI();
  }
}
function onNotification(event) {
  const view = event.target.value;
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const message = new TextDecoder().decode(bytes).trim();
  log('RX ← ' + message);
  if (!message.startsWith('{')) return;
  try {
    const config = JSON.parse(message);
    state.config = config;
    if (applyConfig(config)) toast(tr('configLoaded'));
    else toast(tr('configReceived'));
  } catch { /* A partial or non-JSON notification is still visible in the log. */ }
}
function applyConfig(raw) {
  const config = raw.config && typeof raw.config === 'object' ? raw.config : raw;
  let loaded = false;
  const setPercent = (id, value) => {
    if (!Number.isFinite(Number(value))) return;
    $(id).value = String(clamp(Math.round(Number(value)), 0, 100));
    loaded = true;
  };
  if (config.drl?.brightness != null) setPercent('drl', config.drl.brightness);
  if (config.turnSignal?.brightness != null) setPercent('turnBrightness', config.turnSignal.brightness);
  if (config.turnSignal?.oppositeSideBrightness != null) setPercent('opposite', config.turnSignal.oppositeSideBrightness);
  if (config.drl?.fadeDurationMs != null && Number.isFinite(Number(config.drl.fadeDurationMs))) {
    $('fadeDuration').value = String(clamp(Math.round(Number(config.drl.fadeDurationMs) / 100) * 100, 100, 5000));
    loaded = true;
  }
  const pattern = config.startupAnimation?.pattern;
  if (['fade-in','pulse','flash'].includes(pattern)) { selectWelcome(pattern); loaded = true; }
  updateValues();
  return loaded;
}
async function transmit(command, epoch) {
  if (!state.connected || !state.rx || epoch !== state.epoch) return false;
  try {
    const bytes = new TextEncoder().encode(command);
    if (state.rx.properties.writeWithoutResponse && state.rx.writeValueWithoutResponse) await state.rx.writeValueWithoutResponse(bytes);
    else if (state.rx.properties.write && state.rx.writeValueWithResponse) await state.rx.writeValueWithResponse(bytes);
    else throw Error('RX characteristic does not support writes');
    log('TX → ' + command);
    return true;
  } catch (error) {
    log('Write failed: ' + error.message);
    toast('BLE: ' + error.message);
    return false;
  }
}
function enqueue(commands, gap = 0) {
  if (!state.connected || !state.rx) { toast(tr('connectFirst')); return Promise.resolve(false); }
  const epoch = state.epoch;
  const job = async () => {
    for (let i = 0; i < commands.length; i++) {
      if (!await transmit(commands[i], epoch)) return false;
      if (gap && i < commands.length - 1) await delay(gap);
    }
    return true;
  };
  state.queue = state.queue.catch(() => false).then(job);
  return state.queue;
}
const send = command => enqueue([command]);
function previewCommand(mode, brightness) {
  const physicalToBoard = {LEFT:'RIGHT', RIGHT:'LEFT'};
  const boardMode = physicalToBoard[mode] || mode;
  const level = brightness == null
    ? (['LEFT','RIGHT','HAZARD'].includes(mode) ? Number($('turnBrightness').value) : Number($('drl').value))
    : brightness;
  const base = 'PREVIEW,' + boardMode + ',' + Math.round(level);
  return ['LEFT','RIGHT'].includes(mode) ? base + ',' + $('opposite').value : base;
}
function preview(sendToBoard = true) {
  if (state.mode === 'ANIMATION') return previewWelcome(sendToBoard);
  stopWelcome();
  startVisualMode();
  if (!sendToBoard) return Promise.resolve(true);
  if (!state.connected) { toast(tr('noDevice')); return Promise.resolve(false); }
  return send(previewCommand(state.mode));
}
function schedulePreview() {
  if (!$('live').checked || !state.connected) return;
  clearTimeout(state.previewTimer);
  state.previewTimer = setTimeout(() => { if (state.connected && $('live').checked) preview(true); }, 200);
}
function cancelPreview() {
  clearTimeout(state.previewTimer);
  stopWelcome();
  clearInterval(state.visualTimer);
  state.visualTimer = null;
  $('live').checked = false;
  if (['LEFT','RIGHT','HAZARD'].includes(state.mode)) selectMode('DRL', false);
  else updateLights(0, 0);
  return state.connected ? send('CANCEL') : Promise.resolve(true);
}
function selectMode(mode, shouldPreview = $('live').checked) {
  state.returnFromTurn = mode === 'DRL'
    ? (state.mode === 'LEFT' ? [0,state.lastLevels[1]]
      : state.mode === 'RIGHT' ? [state.lastLevels[0],0]
      : state.mode === 'HAZARD' ? [0,0] : null)
    : null;
  clearInterval(state.visualTimer);
  state.visualTimer = null;
  stopWelcome();
  state.mode = mode;
  if (['LEFT','RIGHT','HAZARD','FADE'].includes(mode)) selectSetting('turn');
  else if (mode === 'ANIMATION') selectSetting('welcome');
  else selectSetting('drl');
  document.querySelectorAll('[data-mode]').forEach(button => {
    const selected = button.dataset.mode === mode;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  preview(shouldPreview);
}
function selectSetting(setting) {
  state.setting = setting;
  document.querySelectorAll('[data-setting]').forEach(button => {
    const selected = button.dataset.setting === setting;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  ['drl','turn','welcome'].forEach(name => $(name + 'Panel').classList.toggle('hidden', name !== setting));
}
function selectWelcome(welcome) {
  stopWelcome();
  state.welcome = welcome;
  document.querySelectorAll('[data-welcome]').forEach(button => {
    const selected = button.dataset.welcome === welcome;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('curveEditor').classList.toggle('hidden', welcome !== 'custom');
}
function updateLights(left, right) {
  const drl = Number($('drl').value);
  const turn = Number($('turnBrightness').value);
  const other = Number($('opposite').value);
  const levels = {
    DRL:[drl,drl], LEFT:[state.blinkOn ? turn : 0,other], RIGHT:[other,state.blinkOn ? turn : 0],
    HAZARD:[state.blinkOn ? turn : 0,state.blinkOn ? turn : 0], FADE:[drl,drl], ANIMATION:[drl,drl]
  };
  [left,right] = left == null ? levels[state.mode] : [left,right];
  state.lastLevels = [left,right];
  for (const [id, value] of [['leftLight',left],['rightLight',right]]) {
    $(id + 'Value').textContent = Math.round(value) + '%';
    $(id).querySelectorAll('i').forEach((segment, index) => segment.classList.toggle('on', index < Math.round(value * 12 / 100)));
  }
  for (const [id, side, value, signal] of [
    ['leftBeam','left',left,['LEFT','HAZARD'].includes(state.mode)],
    ['rightBeam','right',right,['RIGHT','HAZARD'].includes(state.mode)]
  ]) {
    for (const beam of [$(id), ...document.querySelectorAll(`[data-beam="${side}"]`)]) {
      beam.style.opacity = String(0.06 + clamp(value, 0, 100) * 0.0094);
      beam.style.fill = signal ? '#ff9d22' : '#f7f3e7';
      beam.style.filter = signal ? 'drop-shadow(0 0 12px #ff982b)' : 'drop-shadow(0 0 12px #fff6d5)';
    }
  }
}
function startVisualMode() {
  clearInterval(state.visualTimer);
  state.visualTimer = null;
  state.blinkOn = true;
  const returnFromTurn = state.returnFromTurn;
  state.returnFromTurn = null;
  if (returnFromTurn && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const started = performance.now();
    const duration = Number($('fadeDuration').value);
    const target = Number($('drl').value);
    updateLights(...returnFromTurn);
    state.visualTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / duration);
      updateLights(
        returnFromTurn[0] + (target - returnFromTurn[0]) * progress,
        returnFromTurn[1] + (target - returnFromTurn[1]) * progress
      );
      if (progress === 1) { clearInterval(state.visualTimer); state.visualTimer = null; }
    }, 50);
    return;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { updateLights(); return; }
  if (['LEFT','RIGHT','HAZARD'].includes(state.mode)) {
    updateLights();
    state.visualTimer = setInterval(() => { state.blinkOn = !state.blinkOn; updateLights(); }, 460);
  } else if (state.mode === 'FADE') {
    const started = performance.now();
    const duration = Number($('fadeDuration').value);
    updateLights(0, 0);
    state.visualTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - started) / duration);
      const level = Number($('drl').value) * progress;
      updateLights(level, level);
      if (progress === 1) { clearInterval(state.visualTimer); state.visualTimer = null; }
    }, 50);
  } else updateLights();
}
function updateValues() {
  $('drlNumber').textContent = $('drl').value + '%';
  $('turnNumber').textContent = $('turnBrightness').value + '%';
  $('oppositeNumber').textContent = $('opposite').value + '%';
  $('fadeNumber').textContent = (Number($('fadeDuration').value) / 1000).toFixed(1) + ' s';
  updateLights();
}
function curveValue(time) {
  const position = time * 5 / state.welcomeDuration;
  const before = Math.floor(position);
  if (before >= 5) return state.curve[5];
  const fraction = position - before;
  return state.curve[before] + (state.curve[before + 1] - state.curve[before]) * fraction;
}
function samplePattern(points, time) {
  for (let index = 1; index < points.length; index++) {
    if (time <= points[index][0]) {
      const [startTime, startValue] = points[index - 1];
      const [endTime, endValue] = points[index];
      return startValue + (endValue - startValue) * (time - startTime) / (endTime - startTime);
    }
  }
  return points.at(-1)[1];
}
function welcomeValue(time) {
  const full = Number($('drl').value);
  if (state.welcome === 'custom') return curveValue(time);
  if (state.welcome === 'fade-in') return full * Math.min(1, time / 2);
  if (state.welcome === 'pulse') return time >= 4.5 ? full : full * (0.25 + 0.75 * (1 - Math.cos(Math.PI * 2 * time / 1.5)) / 2);
  if (state.welcome === 'soft-wave') return full * samplePattern([[0,0],[0.9,0.85],[1.7,0.25],[2.9,1],[3.7,0.5],[5,1]], time);
  if (state.welcome === 'double-flash') return full * samplePattern([[0,0],[0.15,1],[0.4,0],[0.65,1],[0.95,0],[3.2,1],[5,1]], time);
  if (time < 2.5) return Math.floor(time * 3) % 2 ? full : 0;
  return full;
}
async function previewWelcome(sendToBoard = true) {
  clearTimeout(state.previewTimer);
  clearInterval(state.visualTimer);
  state.visualTimer = null;
  const run = ++state.welcomeRun;
  if (sendToBoard && !state.connected) { toast(tr('noDevice')); sendToBoard = false; }
  const duration = state.welcome === 'custom' ? state.welcomeDuration : 5;
  const start = performance.now();
  while (run === state.welcomeRun) {
    const elapsed = Math.min(duration, (performance.now() - start) / 1000);
    const brightness = clamp(Math.round(welcomeValue(elapsed)), 0, 100);
    updateLights(brightness, brightness);
    if (sendToBoard && !await send(previewCommand('DRL', brightness))) return false;
    if (elapsed >= duration) break;
    await delay(sendToBoard ? 160 : 50);
  }
  return true;
}
function saveCurveLocally() {
  try { localStorage.setItem('piskraft-curve', JSON.stringify(state.curve)); } catch {}
}
function updateCurveLabels() {
  const seconds = state.welcomeDuration;
  $('welcomeDuration').value = seconds;
  $('welcomeDurationNumber').textContent = seconds + ' s';
  $('curveAxes').textContent = tr('curveAxes')(seconds);
  $('curveEndLabel').textContent = seconds + 's';
  $('pointTime').textContent = Number((state.selectedPoint * seconds / 5).toFixed(1)) + 's';
}
function drawCurve() {
  const points = state.curve.map((value, index) => (30 + 59 * index) + ',' + (167 - value * 1.52)).join(' ');
  $('curveLine').setAttribute('points', points);
  const group = $('curvePoints');
  group.replaceChildren();
  state.curve.forEach((value, index) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', String(30 + 59 * index));
    circle.setAttribute('cy', String(167 - value * 1.52));
    circle.setAttribute('r', index === state.selectedPoint ? '7' : '6');
    circle.setAttribute('class', 'curve-point' + (index === state.selectedPoint ? ' active' : ''));
    circle.dataset.index = String(index);
    group.appendChild(circle);
  });
  updateCurveLabels();
  $('pointValue').value = String(state.curve[state.selectedPoint]);
  $('pointNumber').textContent = state.curve[state.selectedPoint] + '%';
}
function movePoint(event) {
  const svg = $('curveSvg');
  const transform = svg.getScreenCTM();
  if (!transform) return;
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const local = point.matrixTransform(transform.inverse());
  state.curve[state.selectedPoint] = clamp(Math.round((167 - local.y) / 1.52), 0, 100);
  drawCurve();
  saveCurveLocally();
  markProfileEdited();
}
function renderProfiles() {
  for (const [key, profile] of Object.entries(state.profiles)) {
    const welcomeName = tr({ 'fade-in':'fadeIn', pulse:'pulse', flash:'flash', custom:'custom', 'soft-wave':'softWave', 'double-flash':'doubleFlash' }[profile.welcome]);
    $(key + 'ProfileSummary').textContent = tr('profileSummary')(profile.drl, profile.turn, welcomeName);
    document.querySelector(`[data-profile="${key}"]`).classList.toggle('active', key === state.activeProfile);
  }
}
function markProfileEdited() {
  state.activeProfile = null;
  renderProfiles();
}
function currentProfile() {
  return {
    drl:Number($('drl').value), turn:Number($('turnBrightness').value), opposite:Number($('opposite').value),
    fade:Number($('fadeDuration').value), welcome:state.welcome,
    duration:state.welcomeDuration, curve:state.curve.slice()
  };
}
function previewProfile(key) {
  const profile = state.profiles[key];
  if (!profile) return;
  $('drl').value = profile.drl;
  $('turnBrightness').value = profile.turn;
  $('opposite').value = profile.opposite;
  $('fadeDuration').value = profile.fade;
  state.curve = profile.curve.slice();
  state.welcomeDuration = profile.duration;
  selectWelcome(profile.welcome);
  drawCurve();
  updateValues();
  state.activeProfile = key;
  renderProfiles();
  selectMode('DRL', state.connected);
  $('previewTitle').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
  toast((state.connected ? tr('profilePreview') : tr('noDevice')) + ': ' + tr({day:'profileDay', night:'profileNight', rain:'profileRain'}[key]));
}
function saveProfile(key) {
  if (!state.profiles[key]) return;
  const previous = state.profiles[key];
  state.profiles[key] = currentProfile();
  try { localStorage.setItem('piskraft-profiles', JSON.stringify(state.profiles)); }
  catch { state.profiles[key] = previous; toast(tr('profileSaveFailed')); return; }
  state.activeProfile = key;
  renderProfiles();
  toast(tr('profileSaved') + ': ' + tr({day:'profileDay', night:'profileNight', rain:'profileRain'}[key]));
}

document.querySelectorAll('.segments').forEach(container => {
  for (let i = 0; i < 12; i++) container.appendChild(document.createElement('i'));
});
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => selectMode(button.dataset.mode)));
document.querySelectorAll('[data-profile-preview]').forEach(button => button.addEventListener('click', () => previewProfile(button.dataset.profilePreview)));
document.querySelectorAll('[data-profile-save]').forEach(button => button.addEventListener('click', () => saveProfile(button.dataset.profileSave)));
document.querySelectorAll('[data-setting]').forEach(button => button.addEventListener('click', () => selectSetting(button.dataset.setting)));
document.querySelectorAll('[data-welcome]').forEach(button => button.addEventListener('click', () => {
  selectWelcome(button.dataset.welcome);
  markProfileEdited();
  selectMode('ANIMATION', true);
}));
for (const id of ['drl','turnBrightness','opposite','fadeDuration']) {
  $(id).addEventListener('input', () => { markProfileEdited(); updateValues(); if (id !== 'fadeDuration') schedulePreview(); });
}
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  $('drl').value = button.dataset.preset;
  markProfileEdited();
  updateValues();
  selectMode('DRL', true);
}));
for (const [id, mode] of [['leftPreviewBtn','LEFT'],['rightPreviewBtn','RIGHT'],['hazardPreviewBtn','HAZARD']]) {
  $(id).addEventListener('click', () => selectMode(mode, true));
}
$('live').addEventListener('change', event => {
  if (event.target.checked) {
    if (!state.connected) { event.target.checked = false; toast(tr('liveNeedsDevice')); return; }
    toast(tr('liveEnabled'));
    preview(true);
  } else {
    cancelPreview();
    toast(tr('liveDisabled'));
  }
});
$('language').addEventListener('change', event => setLanguage(event.target.value));
$('connectBtn').addEventListener('click', connect);
$('previewBtn').addEventListener('click', () => preview(true));
$('cancelBtn').addEventListener('click', cancelPreview);
$('previewWelcomeBtn').addEventListener('click', () => selectMode('ANIMATION', true));
$('readBtn').addEventListener('click', async () => {
  if (!state.connected) { toast(tr('connectFirst')); $('saveStatus').textContent = tr('connectFirst'); return; }
  if (await send('REQ')) { toast(tr('readSent')); $('saveStatus').textContent = tr('readSent'); }
});
$('reqBtn').addEventListener('click', () => send('REQ'));
$('pingBtn').addEventListener('click', () => send('PING'));
$('saveBtn').addEventListener('click', async () => {
  if (!state.connected) { toast(tr('connectFirst')); return; }
  if (!['fade-in','pulse','flash'].includes(state.welcome)) { toast(tr('graphCannotSave')); $('saveStatus').textContent = tr('graphCannotSave'); return; }
  clearTimeout(state.previewTimer);
  stopWelcome();
  const animation = {'fade-in':0, pulse:1, flash:2}[state.welcome];
  const commands = [
    'CFG,DRL,' + pwm($('drl').value),
    'CFG,DIM,' + pwm($('opposite').value),
    'CFG,FADE,' + $('fadeDuration').value,
    'CFG,ANIM,' + animation,
    'SAVE'
  ];
  if (!confirm(tr('saveConfirm') + commands.join('\n') + tr('saveConfirmEnd'))) return;
  if (!await enqueue(commands, 95)) { toast(tr('saveFailed')); return; }
  $('saveStatus').textContent = tr('saveSent');
  toast(tr('saveSent'));
  await send('REQ');
});
$('resetBtn').addEventListener('click', async () => {
  if (!state.connected) { toast(tr('connectFirst')); return; }
  if (!confirm(tr('resetConfirm')) || !confirm(tr('resetAgain'))) return;
  await send('RESET');
});
$('copyLogBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(logLines.join('\n')); toast(tr('logCopied')); }
  catch { toast(tr('copyFailed')); }
});
$('curvePoints').addEventListener('pointerdown', event => {
  const index = event.target.dataset.index;
  if (index == null) return;
  state.selectedPoint = Number(index);
  $('curveSvg').setPointerCapture(event.pointerId);
  movePoint(event);
});
$('curveSvg').addEventListener('pointermove', event => {
  if ($('curveSvg').hasPointerCapture(event.pointerId)) movePoint(event);
});
$('pointValue').addEventListener('input', event => {
  state.curve[state.selectedPoint] = Number(event.target.value);
  drawCurve();
  saveCurveLocally();
  markProfileEdited();
});
$('welcomeDuration').addEventListener('input', event => {
  state.welcomeDuration = Number(event.target.value);
  updateCurveLabels();
  markProfileEdited();
  try { localStorage.setItem('piskraft-welcome-duration', String(state.welcomeDuration)); } catch {}
  if (state.mode === 'ANIMATION' && state.welcome === 'custom') previewWelcome(state.connected && $('live').checked);
});
$('resetCurveBtn').addEventListener('click', () => {
  state.curve = defaultCurve.slice();
  drawCurve();
  saveCurveLocally();
  markProfileEdited();
});
drawCurve();
updateValues();
setLanguage(state.language);
log('Ready. Connect to PISKRAFT_DIM.');
