'use strict';

const SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const RX = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const TX = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const $ = id => document.getElementById(id);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const pwm = percent => Math.round(clamp(Number(percent), 0, 100) * 255 / 100);
const percentFromPwm = value => Math.round(clamp(Number(value), 0, 255) * 100 / 255);
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
    pageNavigation:'หน้าแอป', mainPageTab:'ตั้งค่าบอร์ด', labPageTab:'ห้องทดลอง',
    mainPageTitle:'ค่าที่มีคำสั่งบันทึก', apkSupported:'ตาม APK',
    mainPageHint:'การตั้งค่าด้านล่างมีคำสั่ง CFG และ SAVE ใน APK ส่วนพรีวิวไฟด้านบนเป็นการทดลองชั่วคราว การส่งคำสั่งสำเร็จยังไม่ยืนยันว่าบอร์ดจำค่า ต้องอ่านกลับหรือทดสอบเปิดเครื่องใหม่',
    labPageTitle:'ห้องทดลองพรีวิว', labPageHint:'ฟีเจอร์หน้านี้ไม่บันทึกลงบอร์ด ค่าบางอย่างจำได้เฉพาะในเบราว์เซอร์และต้องเปิดเว็บเพื่อเล่นพรีวิว ค่าที่เลือกทดลองจะไม่เปลี่ยนค่าหน้าตั้งค่าบอร์ด',
    selectThenSave:'เลือกแล้วกดบันทึก', turnSaveTitle:'ค่า DIM และ FADE ของ DRL',
    oppositeSaveHint:'ค่านี้คือความสว่างจริงของ DRL อีกฝั่งขณะเลี้ยว (ไม่ใช่เปอร์เซ็นต์ที่หรี่จากค่า DRL) บันทึกด้วย CFG,DIM; ต้องอ่านกลับและลองปิดเปิดบอร์ด',
    welcomeSaveTitle:'Welcome ที่มีคำสั่งบันทึก', welcomeSaveHint:'เลือกแบบ 1–3 แล้วกดบันทึกลงบอร์ด',
    previewSettings:'ค่าพรีวิว', profileAdjustTitle:'ปรับโปรไฟล์ทดลอง',
    profileAdjustHint:'ปรับค่าพรีวิวในห้องทดลองได้ โดยไม่เปลี่ยนค่าที่จะบันทึกในหน้าตั้งค่าบอร์ด',
    labWelcomeHint:'รูปแบบหน้านี้ทดลองได้ขณะเชื่อมต่อ แต่ไม่มีคำสั่งบันทึกให้เล่นเองตอนเปิดเครื่อง',
    visualSimulation:'ภาพจำลองไฟ • ไม่ใช่สถานะจริงจากบอร์ด',
    myProfiles:'โปรไฟล์ไฟส่วนตัว', profilesLocal:'เก็บในเบราว์เซอร์นี้',
    profilesHint:'แตะทดลองเพื่อโหลดค่าและดูไฟ DRL ทันที ปรับค่าด้านล่างแล้วบันทึกทับโปรไฟล์ได้',
    profileDay:'ขี่กลางวัน', profileNight:'ขี่กลางคืน', profileRain:'ขี่ฝนตก',
    previewProfile:'▶ ทดลอง', saveProfile:'เก็บค่าปัจจุบัน',
    profileDeviceHint:'แตะทดลองเพื่อส่งค่าพรีวิวไปบอร์ดเมื่อเชื่อมต่อ หากยังไม่เชื่อมต่อจะจำลองบนจอเท่านั้น โปรไฟล์นี้เก็บในเบราว์เซอร์ ไม่บันทึกลงบอร์ด',
    profileSummary:(drl, turn, welcome) => `DRL ${drl}% · เลี้ยว ${turn}% · ${welcome}`,
    profileSaved:'เก็บโปรไฟล์ในเบราว์เซอร์แล้ว', profilePreview:'กำลังทดลองโปรไฟล์',
    profileSaveFailed:'เบราว์เซอร์นี้ไม่อนุญาตให้เก็บโปรไฟล์',
    livePreview:'พรีวิวไฟ', previewHint:'เลือกโหมดเพื่อทดลองไฟทันที',
    drl:'DRL', left:'ซ้าย', right:'ขวา', hazard:'ฉุกเฉิน', animation:'Welcome',
    leftLight:'ไฟซ้าย', rightLight:'ไฟขวา', liveChanges:'Live Preview เปิด/ปิด',
    liveChangesHint:'เปิดแล้วเลือกโหมดหรือเลื่อนสไลเดอร์จะส่งไปบอร์ดทันที',
    lightingSettings:'ตั้งค่าไฟ', chooseSection:'ตามโหมดที่เลือกด้านบน',
    turn:'ไฟเลี้ยว', welcome:'Welcome', drlSettings:'ตั้งค่า DRL',
    drlBrightness:'ความสว่าง DRL', fadeDuration:'ระยะเวลาเฟด DRL',
    fadeExplanation:'บันทึกด้วย CFG,FADE (0.1–5 วินาที) ตาม APK ต้องทดสอบกับบอร์ดว่าเฟดมีผลช่วงไหน และค่ายังคงอยู่หลังเปิดเครื่องใหม่หรือไม่',
    quickPresets:'ค่าความสว่างสำเร็จรูป', previewOnly:'พรีวิวเท่านั้น',
    night:'กลางคืน', daylight:'กลางวัน', balanced:'สมดุล', off:'ปิด',
    turnSettings:'ตั้งค่าไฟเลี้ยว', turnBrightness:'ความสว่างไฟเลี้ยว',
    turnPreviewOnly:'ค่านี้ใช้กับพรีวิวเท่านั้น แอปเดิมไม่มีคำสั่งบันทึกค่านี้แยกต่างหาก',
    oppositeBrightness:'DRL ฝั่งตรงข้าม',
    oppositeHint:'ความสว่างของอีกฝั่งขณะเปิดไฟเลี้ยวซ้ายหรือขวา',
    welcomeSettings:'ไฟต้อนรับตอนเปิดเครื่อง',
    welcomeHint:'แตะรูปแบบเพื่อทดลองกับบอร์ดที่เชื่อมต่อ แบบ 1–3 บันทึกได้ ส่วนแบบอื่นทดลองได้ขณะเชื่อมต่อ',
    fadeIn:'ค่อย ๆ สว่าง', fadeInHint:'สว่างขึ้นอย่างนุ่มนวล',
    pulse:'เต้นเป็นจังหวะ', pulseHint:'สว่างและหรี่เป็นจังหวะ',
    flash:'กะพริบ', flashHint:'กะพริบก่อนสว่างค้าง',
    custom:'กำหนดเอง', customHint:'วาดกราฟความสว่าง',
    softWave:'คลื่นนุ่ม', softWaveHint:'สว่างขึ้นสองระลอก',
    doubleFlash:'แฟลชคู่', doubleFlashHint:'กะพริบสองครั้งแล้วค่อยสว่าง',
    sideChase:'วิ่งสลับซ้ายขวา', sideChaseHint:'ไฟไล่ทีละข้างแล้วสว่างพร้อมกัน',
    crossfade:'สลับละมุน', crossfadeHint:'สองข้างสว่างสลับกันอย่างนุ่มนวล',
    staggered:'เปิดทีละข้าง', staggeredHint:'ซ้ายก่อน ขวาตาม แล้วสว่างค้าง',
    curveTitle:'กราฟความสว่าง', curveAxes:seconds => `เวลา 0–${seconds} วินาที · ความสว่าง 0–100%`,
    welcomeDuration:'ระยะเวลากราฟ',
    pointBrightness:'ความสว่างที่จุด', curveHow:'แตะจุดบนกราฟแล้วลากขึ้นลง หรือใช้สไลเดอร์ด้านล่าง',
    resetCurve:'คืนค่ากราฟเริ่มต้น',
    customLimit:'กราฟ 5–20 วินาทีพรีวิวบนบอร์ดได้ขณะเชื่อมต่อ แต่ APK ที่ตรวจไม่ส่งคำสั่งบันทึกจุดกราฟหรือระยะเวลา จึงยังบันทึกให้เล่นเองตอนเปิดเครื่องจากเว็บนี้ไม่ได้ ต้องตรวจเฟิร์มแวร์หรือทดสอบบอร์ดว่ามีคำสั่งอื่นหรือไม่',
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
    saveChecking:'ส่งคำสั่ง SAVE แล้ว กำลังรอบอร์ดบันทึกและอ่านค่า DIM กลับ',
    dimReadbackMatch:value => `บอร์ดอ่านค่า DIM กลับได้ ${value}% ตรงกับที่ส่ง แต่ต้องลองปิดเปิดบอร์ดและทดสอบไฟเลี้ยวจริง`,
    dimReadbackMismatch:(wanted, got) => `ค่า DIM ไม่ตรง: ส่ง ${wanted}% แต่อ่านจากบอร์ดได้ ${got}% กรุณาคัดลอกบันทึกคำสั่ง`,
    dimReadbackMissing:'ยังไม่ได้ค่า DIM กลับจากบอร์ด จึงยืนยันการบันทึกไม่ได้ กรุณาคัดลอกบันทึกคำสั่ง',
    resetConfirm:'คืนค่าโรงงาน? คำสั่ง RESET อาจลบค่า DRL และ DIM ที่บันทึกไว้ ห้ามกดระหว่างทดสอบว่าค่ายังคงอยู่หลังเปิดเครื่องใหม่',
    resetAgain:'ยืนยันว่าจะส่ง RESET ไปยังบอร์ดและยกเลิกการตั้งค่าที่บันทึกไว้',
    logCopied:'คัดลอกบันทึกแล้ว', copyFailed:'คัดลอกบันทึกไม่ได้',
    noDevice:'ยังไม่ต่อบอร์ด แสดงภาพจำลองบนจอเท่านั้น',
    liveNeedsDevice:'ต่อบอร์ดก่อนเปิด Live Preview',
    liveEnabled:'เปิด Live Preview แล้ว', liveDisabled:'ปิด Live Preview แล้ว',
    graphCannotSave:'รูปแบบนี้พรีวิวได้ แต่ยังไม่พบคำสั่งบันทึกให้เล่นเองตอนเปิดเครื่องใน APK ที่ตรวจ',
    selfTestTitle:'ตรวจไฟทั้งคันใน 30 วินาที',
    selfTestHint:'เชื่อมต่อบอร์ดก่อน แล้วดูไฟจริงทีละขั้น: DRL → ซ้าย → ขวา → ฉุกเฉิน → Welcome ขั้นละ 6 วินาที ที่ความสว่างทดสอบ 70% แตะสิ่งที่เห็นเพื่อเก็บผล',
    startSelfTest:'▶ เริ่มตรวจไฟ', stopTest:'■ หยุด', testReady:'พร้อมตรวจไฟ',
    selfTestObserve:'ไฟจริงออกฝั่งไหน?', observedLeft:'ซ้าย', observedRight:'ขวา', observedBoth:'ทั้งสองฝั่ง', observedNone:'ไม่ติด',
    observedMissing:'ไม่ได้บันทึกผล', testStep:(step, total, name, seconds) => `ขั้น ${step}/${total} · ${name} · เหลือ ${seconds} วินาที`,
    testComplete:'ตรวจครบแล้ว · ดูผลด้านล่าง', testStopped:'หยุดการตรวจไฟแล้ว', testSendFailed:'ส่งคำสั่งไม่สำเร็จ ตรวจการเชื่อมต่อ', stopSendFailed:'ส่งคำสั่งหยุดไม่สำเร็จ ตรวจไฟที่รถ',
    testResult:(name, result) => `${name}: ${result}`, testMismatch:' · ไม่ตรงกับที่คาด',
    testSwapped:'ไฟซ้ายกับขวาดูเหมือนสลับกันตามผลที่คุณบันทึก', testUnlit:'มีขั้นที่คุณบันทึกว่าไฟไม่ติด ตรวจสายไฟและบันทึกคำสั่ง',
    testIncomplete:'ตรวจครบแล้ว แต่มีขั้นที่ยังไม่ได้บันทึกผล', testMatched:'ผลที่บันทึกตรงกับฝั่งที่คาดทุกขั้น', testDifferent:'บางขั้นออกไม่ตรงฝั่งที่คาด ดูรายละเอียดด้านบน',
    selfTestCaution:'ผลนี้มาจากสิ่งที่คุณเห็น คำสั่ง BLE ส่งสำเร็จไม่ได้ยืนยันว่าไฟติดจริง และ Welcome ขั้นนี้เป็นพรีวิวจากเว็บ ไม่ใช่การทดสอบเปิดเครื่องใหม่',
    rhythmTitle:'ไฟจังหวะ · ปรับ BPM', rhythmHint:'ลองลายไฟซ้าย–ขวาตามจังหวะสูงสุดครั้งละ 30 วินาที คำสั่งที่พบยังแยกไฟหน้ากับหลังไม่ได้ จังหวะจริงขึ้นกับการตอบสนองของบอร์ด โหมดนี้ไม่บันทึกลงบอร์ด',
    rhythmSpeed:'ความเร็ว', rhythmPatterns:'รูปแบบจังหวะ', rhythmDouble:'ซ้ายซ้าย · ขวาขวา', rhythmAlternate:'สลับซ้ายขวา', rhythmSyncopated:'จังหวะเล่นหาง',
    startRhythm:'▶ เล่นจังหวะ', stopRhythm:'■ หยุด', rhythmOffline:'จำลองบนจอจนกว่าจะเชื่อมต่อบอร์ด',
    rhythmLive:'กำลังส่งจังหวะไปบอร์ด · เวลาอาจคลาดเคลื่อนตาม Bluetooth', rhythmScreen:'กำลังจำลองจังหวะบนจอ', rhythmStopped:'หยุดเล่นจังหวะแล้ว', rhythmTimedOut:'ครบ 30 วินาทีแล้ว · กดเล่นเพื่อเริ่มใหม่',
    sideInitialLeft:'ซ', sideInitialRight:'ข'
  },
  en: {
    language:'Language', motorcycleLights:'Simulated motorcycle front lights', curveAccessible:'Editable brightness curve',
    pageNavigation:'App pages', mainPageTab:'Board settings', labPageTab:'Experiments',
    mainPageTitle:'Settings with save commands', apkSupported:'From the APK',
    mainPageHint:'The settings below have CFG and SAVE commands in the APK. The lighting preview above is temporary. A successful write does not prove the board stored settings; read them back or power-cycle the board.',
    labPageTitle:'Preview experiments', labPageHint:'Features here are not saved to the board. Some values are kept only in this browser, and previews require the website to be open. Experiment choices do not change the Board settings values.',
    selectThenSave:'Select, then save', turnSaveTitle:'DRL DIM and FADE settings',
    oppositeSaveHint:'This is the other DRL side’s actual brightness during a turn, not a percentage reduction from DRL. Saved with CFG,DIM; read it back and power-cycle the board.',
    welcomeSaveTitle:'Welcome with save commands', welcomeSaveHint:'Choose pattern 1–3, then save to the board.',
    previewSettings:'Preview settings', profileAdjustTitle:'Adjust experimental profile',
    profileAdjustHint:'Adjust preview values in Experiments without changing what Board settings will save.',
    labWelcomeHint:'Patterns on this page can preview while connected, but there is no known command to save them for startup.',
    visualSimulation:'Light simulation • not live board status',
    myProfiles:'My lighting profiles', profilesLocal:'Saved in this browser',
    profilesHint:'Tap Preview to load the settings and see DRL immediately. Adjust settings below, then save them to a profile.',
    profileDay:'Day ride', profileNight:'Night ride', profileRain:'Rain ride',
    previewProfile:'▶ Preview', saveProfile:'Save current settings',
    profileDeviceHint:'Tap Preview to send temporary values when connected. Without a board, only the screen simulation runs. This profile is stored in your browser, not on the board.',
    profileSummary:(drl, turn, welcome) => `DRL ${drl}% · Turn ${turn}% · ${welcome}`,
    profileSaved:'Profile saved in this browser', profilePreview:'Previewing profile',
    profileSaveFailed:'This browser could not save the profile',
    livePreview:'Live lighting preview', previewHint:'Choose a mode to preview the lights',
    drl:'DRL', left:'Left', right:'Right', hazard:'Hazard', animation:'Welcome',
    leftLight:'Left light', rightLight:'Right light', liveChanges:'Live Preview on/off',
    liveChangesHint:'When on, mode and slider changes are sent to the board',
    lightingSettings:'Lighting settings', chooseSection:'Follows the mode selected above',
    turn:'Turn signal', welcome:'Welcome', drlSettings:'DRL settings',
    drlBrightness:'DRL brightness', fadeDuration:'DRL fade duration',
    fadeExplanation:'Saved with CFG,FADE (0.1–5 s), as in the APK. Test the board to confirm when the fade applies and whether it persists after a power cycle.',
    quickPresets:'Quick brightness presets', previewOnly:'Preview only',
    night:'Night', daylight:'Daylight', balanced:'Balanced', off:'Off',
    turnSettings:'Turn-signal settings', turnBrightness:'Turn brightness',
    turnPreviewOnly:'This value is for preview only. The original app has no separate command to save it.',
    oppositeBrightness:'Opposite-side DRL',
    oppositeHint:'Brightness of the other side during a left or right turn signal',
    welcomeSettings:'Startup Welcome animation',
    welcomeHint:'Tap a pattern to preview on a connected board. Modes 1–3 can be saved; the others run only while connected.',
    fadeIn:'Fade in', fadeInHint:'Gradually brightens',
    pulse:'Pulse', pulseHint:'Brightens and dims in a rhythm',
    flash:'Flash', flashHint:'Flashes, then stays on',
    custom:'Custom', customHint:'Draw a brightness curve',
    softWave:'Soft wave', softWaveHint:'Two smooth waves of light',
    doubleFlash:'Double flash', doubleFlashHint:'Two flashes, then a gentle rise',
    sideChase:'Side chase', sideChaseHint:'Lights alternate sides, then glow together',
    crossfade:'Soft crossfade', crossfadeHint:'Sides gently trade brightness',
    staggered:'Staggered rise', staggeredHint:'Left rises, then right joins and stays on',
    curveTitle:'Brightness curve', curveAxes:seconds => `Time 0–${seconds} s · Brightness 0–100%`,
    welcomeDuration:'Curve duration',
    pointBrightness:'Brightness at', curveHow:'Drag a point up or down, or use the slider below',
    resetCurve:'Reset curve',
    customLimit:'The 5–20 second curve can preview on a connected board. The inspected APK does not send a command to save its points or duration, so this site cannot yet store it for startup. Firmware inspection or a board test may reveal another command.',
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
    saveChecking:'SAVE sent. Waiting for the board to store settings, then reading DIM back.',
    dimReadbackMatch:value => `Board readback reports DIM ${value}%, matching the request. Power-cycle the board and test the real turn signal.`,
    dimReadbackMismatch:(wanted, got) => `DIM mismatch: sent ${wanted}%, board reports ${got}%. Please copy the command log.`,
    dimReadbackMissing:'No DIM readback received, so saving is unverified. Please copy the command log.',
    resetConfirm:'Restore factory defaults? RESET may erase saved DRL and DIM values. Do not use it while testing persistence after a power cycle.',
    resetAgain:'Confirm sending RESET to the board and discarding saved settings.',
    logCopied:'Log copied', copyFailed:'Could not copy log',
    noDevice:'No board connected; showing the on-screen simulation only',
    liveNeedsDevice:'Connect the board before enabling Live Preview',
    liveEnabled:'Live Preview enabled', liveDisabled:'Live Preview disabled',
    graphCannotSave:'This pattern can preview while connected, but no startup-save command was found in the inspected APK',
    selfTestTitle:'Check every light in 30 seconds',
    selfTestHint:'Connect the board, then watch the real lights: DRL → Left → Right → Hazard → Welcome. Each step lasts 6 seconds at 70% test brightness. Tap what you see to record the result.',
    startSelfTest:'▶ Start light check', stopTest:'■ Stop', testReady:'Ready to check lights',
    selfTestObserve:'Which real lights are on?', observedLeft:'Left', observedRight:'Right', observedBoth:'Both sides', observedNone:'No light',
    observedMissing:'No result recorded', testStep:(step, total, name, seconds) => `Step ${step}/${total} · ${name} · ${seconds} s left`,
    testComplete:'Light check complete · See results below', testStopped:'Light check stopped', testSendFailed:'Command failed. Check the connection.', stopSendFailed:'Stop command failed. Check the vehicle lights.',
    testResult:(name, result) => `${name}: ${result}`, testMismatch:' · unexpected side',
    testSwapped:'Your recorded results suggest that left and right are swapped', testUnlit:'You recorded a step with no light. Check wiring and the command log.',
    testIncomplete:'The check finished, but some steps have no recorded result', testMatched:'Every recorded result matches the expected side', testDifferent:'Some results differ from the expected side. See the list above.',
    selfTestCaution:'Results are based on what you observe. A successful BLE write does not prove a lamp lit. The Welcome step previews from the website; it does not test a fresh power-on.',
    rhythmTitle:'Rhythm lights · adjustable BPM', rhythmHint:'Play left/right patterns for up to 30 seconds at a time. The known commands cannot address front and rear separately. Actual timing depends on the board response. This preview is not saved.',
    rhythmSpeed:'Speed', rhythmPatterns:'Rhythm patterns', rhythmDouble:'Left left · right right', rhythmAlternate:'Alternate sides', rhythmSyncopated:'Syncopated chase',
    startRhythm:'▶ Play rhythm', stopRhythm:'■ Stop', rhythmOffline:'On-screen simulation until a board is connected',
    rhythmLive:'Sending rhythm to the board · Bluetooth timing may vary', rhythmScreen:'Simulating the rhythm on screen', rhythmStopped:'Rhythm stopped', rhythmTimedOut:'30 seconds complete · Press Play to start again',
    sideInitialLeft:'L', sideInitialRight:'R'
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
    welcome:['fade-in','pulse','flash','soft-wave','double-flash','side-chase','crossfade','staggered','custom'].includes(raw.welcome) ? raw.welcome : fallback.welcome,
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
  page:'main', mainSnapshot:null, mode: 'DRL', setting: 'drl', welcome: 'fade-in', lastSavableWelcome:'fade-in', curve: storedCurve(),
  welcomeDuration: storedWelcomeDuration(), lastLevels:[50,50], returnFromTurn:null,
  selectedPoint: 0, previewTimer: null, welcomeRun: 0, visualTimer: null, blinkOn: true,
  profiles: storedProfiles(), activeProfile: null, config: null,
  pendingDimReadback: null, rxJsonBuffer: ''
};
const testSteps = [
  {name:'drl', mode:'DRL', expected:'both'},
  {name:'left', mode:'LEFT', expected:'left'},
  {name:'right', mode:'RIGHT', expected:'right'},
  {name:'hazard', mode:'HAZARD', expected:'both'},
  {name:'animation', mode:'WELCOME', expected:'both'}
];
const rhythmSequences = {
  double:['LEFT','LEFT','RIGHT','RIGHT'],
  alternating:['LEFT','RIGHT'],
  syncopated:['LEFT','LEFT','RIGHT','RIGHT','LEFT','LEFT','RIGHT','LEFT','RIGHT','RIGHT']
};
const toolState = {kind:null, run:0, step:-1, completed:0, remaining:6, results:[], bpm:80, rhythm:'double', beat:0, rhythmOnBoard:false, testStatus:'testReady', rhythmStatus:'rhythmOffline'};
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
  renderToolText();
  try { localStorage.setItem('piskraft-language', state.language); } catch {}
}

function stopWelcome() { state.welcomeRun++; }
function disconnected() {
  const wasConnected = state.connected;
  if (state.pendingDimReadback) {
    clearTimeout(state.pendingDimReadback.timer);
    state.pendingDimReadback = null;
    $('saveStatus').textContent = tr('dimReadbackMissing');
  }
  state.rxJsonBuffer = '';
  stopActiveTool(false);
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
    await send('REQ');
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
  if (state.rxJsonBuffer) state.rxJsonBuffer += message;
  else if (message.startsWith('{')) state.rxJsonBuffer = message;
  else return;
  try {
    const config = JSON.parse(state.rxJsonBuffer);
    state.rxJsonBuffer = '';
    state.config = config;
    if (applyConfig(config)) toast(tr('configLoaded'));
    else toast(tr('configReceived'));
    checkDimReadback(config);
  } catch {
    if (state.rxJsonBuffer.length > 8192) state.rxJsonBuffer = '';
  }
}
function checkDimReadback(raw) {
  const pending = state.pendingDimReadback;
  if (!pending) return;
  const config = raw.config && typeof raw.config === 'object' ? raw.config : raw;
  const flat = config.dim != null;
  const reportedValue = flat ? config.dim : config.turnSignal?.oppositeSideBrightness;
  if (reportedValue == null) return;
  const value = Number(reportedValue);
  if (!Number.isFinite(value) || value < 0 || value > (flat ? 255 : 100)) return;
  clearTimeout(pending.timer);
  state.pendingDimReadback = null;
  const reported = flat ? percentFromPwm(value) : Math.round(value);
  const matches = flat ? Math.abs(value - pending.expectedPwm) <= 1 : Math.abs(value - pending.expected) <= 1;
  const message = matches
    ? tr('dimReadbackMatch')(reported)
    : tr('dimReadbackMismatch')(pending.expected, reported);
  $('saveStatus').textContent = message;
  log('DIM readback: requested ' + pending.expected + '% (PWM ' + pending.expectedPwm + '), board reported ' + reported + '%' + (flat ? ' (PWM ' + value + ')' : ''));
  toast(message);
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
  if (config.drl != null && typeof config.drl !== 'object' && Number.isFinite(Number(config.drl))) setPercent('drl', percentFromPwm(config.drl));
  if (config.dim != null && Number.isFinite(Number(config.dim))) setPercent('opposite', percentFromPwm(config.dim));
  if (config.drl?.fadeDurationMs != null && Number.isFinite(Number(config.drl.fadeDurationMs))) {
    $('fadeDuration').value = String(clamp(Math.round(Number(config.drl.fadeDurationMs) / 100) * 100, 100, 5000));
    loaded = true;
  }
  if (config.fade != null && Number.isFinite(Number(config.fade))) {
    $('fadeDuration').value = String(clamp(Math.round(Number(config.fade) / 100) * 100, 100, 5000));
    loaded = true;
  }
  const pattern = config.startupAnimation?.pattern || ({0:'fade-in', 1:'pulse', 2:'flash'})[config.anim];
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
function previewCommand(mode, brightness, oppositeBrightness) {
  const physicalToBoard = {LEFT:'RIGHT', RIGHT:'LEFT'};
  const boardMode = physicalToBoard[mode] || mode;
  const level = brightness == null
    ? (['LEFT','RIGHT','HAZARD'].includes(mode) ? Number($('turnBrightness').value) : Number($('drl').value))
    : brightness;
  const base = 'PREVIEW,' + boardMode + ',' + Math.round(level);
  const opposite = oppositeBrightness == null ? Number($('opposite').value) : oppositeBrightness;
  return ['LEFT','RIGHT'].includes(mode) ? base + ',' + Math.round(clamp(opposite, 0, 100)) : base;
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
  stopActiveTool(false);
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
  stopActiveTool();
  state.returnFromTurn = mode === 'DRL'
    ? (state.mode === 'LEFT' ? [0,state.lastLevels[1]]
      : state.mode === 'RIGHT' ? [state.lastLevels[0],0]
      : state.mode === 'HAZARD' ? [0,0] : null)
    : null;
  clearInterval(state.visualTimer);
  state.visualTimer = null;
  stopWelcome();
  state.mode = mode;
  if (['LEFT','RIGHT','HAZARD'].includes(mode)) selectSetting('turn');
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
  $('turnPanel').classList.toggle('hidden', setting !== 'turn');
  $('welcomePanel').classList.toggle('hidden', setting !== 'welcome');
}
function showPage(page) {
  const nextPage = page === 'lab' ? 'lab' : 'main';
  if (nextPage === 'lab' && state.page === 'main') {
    state.mainSnapshot = {
      drl:$('drl').value, opposite:$('opposite').value,
      fade:$('fadeDuration').value, welcome:state.lastSavableWelcome
    };
  }
  if (nextPage === 'main' && state.page === 'lab') {
    cancelPreview();
    if (state.mainSnapshot) {
      $('drl').value = state.mainSnapshot.drl;
      $('opposite').value = state.mainSnapshot.opposite;
      $('fadeDuration').value = state.mainSnapshot.fade;
      selectWelcome(state.mainSnapshot.welcome);
      updateValues();
    }
    selectMode('DRL', false);
  }
  state.page = nextPage;
  $('mainPage').classList.toggle('hidden', nextPage !== 'main');
  $('labPage').classList.toggle('hidden', nextPage !== 'lab');
  document.querySelectorAll('[data-page-link]').forEach(link => {
    if (link.dataset.pageLink === nextPage) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (nextPage === 'lab') selectSetting(state.setting);
  window.scrollTo(0, 0);
}
function selectWelcome(welcome) {
  stopWelcome();
  state.welcome = welcome;
  if (['fade-in','pulse','flash'].includes(welcome)) state.lastSavableWelcome = welcome;
  document.querySelectorAll('[data-welcome]').forEach(button => {
    const selected = button.dataset.welcome === welcome;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $('curveEditor').classList.toggle('hidden', welcome !== 'custom');
}
function updateLights(left, right, signalOverride = null) {
  const drl = Number($('drl').value);
  const turn = Number($('turnBrightness').value);
  const other = Number($('opposite').value);
  const levels = {
    DRL:[drl,drl], LEFT:[state.blinkOn ? turn : 0,other], RIGHT:[other,state.blinkOn ? turn : 0],
    HAZARD:[state.blinkOn ? turn : 0,state.blinkOn ? turn : 0], ANIMATION:[drl,drl]
  };
  [left,right] = left == null ? levels[state.mode] : [left,right];
  state.lastLevels = [left,right];
  for (const [id, value] of [['leftLight',left],['rightLight',right]]) {
    $(id + 'Value').textContent = Math.round(value) + '%';
    $(id).querySelectorAll('i').forEach((segment, index) => segment.classList.toggle('on', index < Math.round(value * 12 / 100)));
  }
  for (const [id, side, value, signal] of [
    ['leftBeam','left',left,signalOverride === null ? ['LEFT','HAZARD'].includes(state.mode) : ['left','both'].includes(signalOverride)],
    ['rightBeam','right',right,signalOverride === null ? ['RIGHT','HAZARD'].includes(state.mode) : ['right','both'].includes(signalOverride)]
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
  } else updateLights();
}
function updateValues() {
  $('drlNumber').textContent = $('drl').value + '%';
  $('turnNumber').textContent = $('turnBrightness').value + '%';
  $('oppositeNumber').textContent = $('opposite').value + '%';
  $('fadeNumber').textContent = (Number($('fadeDuration').value) / 1000).toFixed(1) + ' s';
  $('labDrl').value = $('drl').value;
  $('labOpposite').value = $('opposite').value;
  $('labFade').value = $('fadeDuration').value;
  $('labDrlNumber').textContent = $('drlNumber').textContent;
  $('labOppositeNumber').textContent = $('oppositeNumber').textContent;
  $('labFadeNumber').textContent = $('fadeNumber').textContent;
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
function welcomeLevels(time) {
  const full = Number($('drl').value);
  if (state.welcome === 'side-chase') {
    if (time >= 3.2) { const level = full * Math.min(1, (time - 3.2) / 0.9); return [level, level]; }
    return Math.floor(time / 0.4) % 2 === 0 ? [full, 0] : [0, full];
  }
  if (state.welcome === 'crossfade') {
    if (time >= 4.2) {
      const blend = Math.min(1, (time - 4.2) / 0.8);
      const lastWave = (1 + Math.sin(4.2 * Math.PI)) / 2;
      return [full * (lastWave + (1 - lastWave) * blend), full * (1 - lastWave + lastWave * blend)];
    }
    const wave = (1 + Math.sin(time * Math.PI)) / 2;
    return [full * wave, full * (1 - wave)];
  }
  if (state.welcome === 'staggered') {
    const left = full * samplePattern([[0,0],[0.4,0],[1.3,1],[5,1]], time);
    const right = full * samplePattern([[0,0],[1.4,0],[2.3,1],[5,1]], time);
    return [left, right];
  }
  let level;
  if (state.welcome === 'custom') level = curveValue(time);
  else if (state.welcome === 'fade-in') level = full * Math.min(1, time / 2);
  else if (state.welcome === 'pulse') level = time >= 4.5 ? full : full * (0.25 + 0.75 * (1 - Math.cos(Math.PI * 2 * time / 1.5)) / 2);
  else if (state.welcome === 'soft-wave') level = full * samplePattern([[0,0],[0.9,0.85],[1.7,0.25],[2.9,1],[3.7,0.5],[5,1]], time);
  else if (state.welcome === 'double-flash') level = full * samplePattern([[0,0],[0.15,1],[0.4,0],[0.65,1],[0.95,0],[3.2,1],[5,1]], time);
  else level = time < 2.5 && Math.floor(time * 3) % 2 ? full : time < 2.5 ? 0 : full;
  return [level, level];
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
    const [left, right] = welcomeLevels(elapsed).map(value => clamp(Math.round(value), 0, 100));
    const side = left > right ? 'left' : right > left ? 'right' : '';
    updateLights(left, right, side);
    const command = side ? previewCommand(side.toUpperCase(), side === 'left' ? left : right, side === 'left' ? right : left) : previewCommand('DRL', left);
    if (sendToBoard && !await send(command)) return false;
    if (elapsed >= duration) break;
    await delay(sendToBoard ? 160 : 50);
  }
  return true;
}
function pauseForTool() {
  clearTimeout(state.previewTimer);
  clearInterval(state.visualTimer);
  state.visualTimer = null;
  stopWelcome();
  $('live').checked = false;
}
function stopActiveTool(sendCancel = true) {
  if (!toolState.kind) return Promise.resolve(true);
  const kind = toolState.kind;
  toolState.kind = null;
  toolState.run++;
  if (kind === 'test') toolState.testStatus = 'testStopped';
  else toolState.rhythmStatus = 'rhythmStopped';
  updateLights(0, 0, '');
  renderToolText();
  return sendCancel && state.connected
    ? send('CANCEL').then(sent => { if (!sent) toast(tr('stopSendFailed')); return sent; })
    : Promise.resolve(true);
}
function renderTestResults() {
  const list = $('testResults');
  const diagnosis = $('testDiagnosis');
  list.replaceChildren();
  for (let index = 0; index < toolState.completed; index++) {
    const step = testSteps[index];
    const observed = toolState.results[index];
    const item = document.createElement('li');
    item.textContent = tr('testResult')(tr(step.name), observed ? tr('observed' + observed[0].toUpperCase() + observed.slice(1)) : tr('observedMissing'));
    if (observed && observed !== step.expected) item.textContent += tr('testMismatch');
    item.className = observed === step.expected ? 'good' : 'mismatch';
    list.appendChild(item);
  }
  diagnosis.classList.toggle('hidden', toolState.completed !== testSteps.length);
  if (toolState.completed === testSteps.length) {
    const result = toolState.results;
    const key = result[1] === 'right' && result[2] === 'left' ? 'testSwapped'
      : result.includes('none') ? 'testUnlit'
      : result.includes(null) ? 'testIncomplete'
      : testSteps.every((step, index) => result[index] === step.expected) ? 'testMatched' : 'testDifferent';
    diagnosis.textContent = tr(key);
  }
}
function renderRhythmBeats() {
  const beats = $('rhythmBeats');
  beats.replaceChildren();
  rhythmSequences[toolState.rhythm].forEach((side, index) => {
    const chip = document.createElement('span');
    chip.textContent = tr(side === 'LEFT' ? 'sideInitialLeft' : 'sideInitialRight');
    chip.classList.toggle('active', toolState.kind === 'rhythm' && toolState.beat % rhythmSequences[toolState.rhythm].length === index);
    beats.appendChild(chip);
  });
}
function renderToolText() {
  const testing = toolState.kind === 'test';
  const rhythmic = toolState.kind === 'rhythm';
  $('startSelfTest').disabled = testing;
  $('stopSelfTest').disabled = !testing;
  $('startRhythm').disabled = rhythmic;
  $('stopRhythm').disabled = !rhythmic;
  $('testStatus').textContent = testing
    ? tr('testStep')(toolState.step + 1, testSteps.length, tr(testSteps[toolState.step].name), toolState.remaining)
    : tr(toolState.testStatus);
  $('rhythmStatus').textContent = rhythmic ? tr(toolState.rhythmOnBoard ? 'rhythmLive' : 'rhythmScreen') : tr(toolState.rhythmStatus);
  $('rhythmBpmValue').textContent = toolState.bpm + ' BPM';
  $('rhythmBpm').value = String(toolState.bpm);
  $('testProgressBar').style.width = (testing ? (toolState.step * 6 + (6 - toolState.remaining)) / 30 * 100 : toolState.completed / testSteps.length * 100) + '%';
  document.querySelectorAll('[data-observed]').forEach(button => {
    button.disabled = !testing;
    button.classList.toggle('active', testing && toolState.results[toolState.step] === button.dataset.observed);
  });
  document.querySelectorAll('[data-bpm]').forEach(button => {
    const selected = Number(button.dataset.bpm) === toolState.bpm;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-rhythm]').forEach(button => {
    const selected = button.dataset.rhythm === toolState.rhythm;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  renderTestResults();
  renderRhythmBeats();
}
function diagnosticFrame(step, seconds) {
  const blink = Math.floor(seconds / 0.46) % 2 === 0;
  if (step.mode === 'DRL') updateLights(70, 70, '');
  else if (step.mode === 'LEFT') updateLights(blink ? 70 : 0, 0, 'left');
  else if (step.mode === 'RIGHT') updateLights(0, blink ? 70 : 0, 'right');
  else if (step.mode === 'HAZARD') updateLights(blink ? 70 : 0, blink ? 70 : 0, 'both');
  else {
    const level = Math.round(70 * Math.min(1, seconds / 3));
    updateLights(level, level, '');
    return level;
  }
  return null;
}
async function runSelfTest() {
  if (!state.connected) { toolState.testStatus = 'connectFirst'; renderToolText(); toast(tr('connectFirst')); return; }
  await stopActiveTool();
  pauseForTool();
  const run = ++toolState.run;
  toolState.kind = 'test';
  toolState.results = Array(testSteps.length).fill(null);
  toolState.completed = 0;
  toolState.step = 0;
  toolState.remaining = 6;
  renderToolText();
  for (let index = 0; index < testSteps.length && run === toolState.run; index++) {
    const step = testSteps[index];
    toolState.step = index;
    toolState.remaining = 6;
    renderToolText();
    if (step.mode !== 'WELCOME' && !await send(previewCommand(step.mode, 70, 0))) {
      if (run === toolState.run) { stopActiveTool(); toolState.testStatus = 'testSendFailed'; renderToolText(); toast(tr('testSendFailed')); }
      return;
    }
    if (run !== toolState.run) return;
    const started = performance.now();
    while (run === toolState.run) {
      const seconds = Math.min(6, (performance.now() - started) / 1000);
      toolState.remaining = Math.max(0, Math.ceil(6 - seconds));
      const level = diagnosticFrame(step, seconds);
      renderToolText();
      if (step.mode === 'WELCOME' && !await send(previewCommand('DRL', level))) {
        if (run === toolState.run) { stopActiveTool(); toolState.testStatus = 'testSendFailed'; renderToolText(); toast(tr('testSendFailed')); }
        return;
      }
      if (seconds >= 6) break;
      await delay(step.mode === 'WELCOME' ? 170 : 90);
    }
    if (run !== toolState.run) return;
    toolState.completed = index + 1;
    renderTestResults();
  }
  if (run !== toolState.run) return;
  await stopActiveTool();
  toolState.testStatus = 'testComplete';
  renderToolText();
}
async function runRhythm() {
  await stopActiveTool();
  pauseForTool();
  const run = ++toolState.run;
  toolState.kind = 'rhythm';
  toolState.beat = 0;
  toolState.rhythmOnBoard = state.connected;
  const started = performance.now();
  renderToolText();
  while (run === toolState.run && performance.now() - started < 30000) {
    const sequence = rhythmSequences[toolState.rhythm];
    const side = sequence[toolState.beat % sequence.length];
    const halfBeat = 30000 / toolState.bpm;
    updateLights(side === 'LEFT' ? 70 : 0, side === 'RIGHT' ? 70 : 0, side.toLowerCase());
    renderRhythmBeats();
    if (toolState.rhythmOnBoard && !await send(previewCommand(side, 70, 0))) {
      if (run === toolState.run) { stopActiveTool(); toast(tr('testSendFailed')); }
      return;
    }
    await delay(halfBeat);
    if (run !== toolState.run) return;
    updateLights(0, 0, '');
    if (toolState.rhythmOnBoard && !await send(previewCommand('DRL', 0))) {
      if (run === toolState.run) { stopActiveTool(); toast(tr('testSendFailed')); }
      return;
    }
    await delay(halfBeat);
    toolState.beat++;
  }
  if (run !== toolState.run) return;
  await stopActiveTool();
  toolState.rhythmStatus = 'rhythmTimedOut';
  renderToolText();
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
    const welcomeName = tr({ 'fade-in':'fadeIn', pulse:'pulse', flash:'flash', 'soft-wave':'softWave', 'double-flash':'doubleFlash', 'side-chase':'sideChase', crossfade:'crossfade', staggered:'staggered', custom:'custom' }[profile.welcome]);
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
document.querySelectorAll('[data-welcome]').forEach(button => button.addEventListener('click', () => {
  selectWelcome(button.dataset.welcome);
  markProfileEdited();
  if (state.page === 'lab') selectMode('ANIMATION', true);
  else selectMode('ANIMATION', $('live').checked);
}));
for (const id of ['drl','turnBrightness','opposite','fadeDuration']) {
  $(id).addEventListener('input', () => { markProfileEdited(); updateValues(); if (id !== 'fadeDuration') schedulePreview(); });
}
for (const [labId, mainId] of [['labDrl','drl'],['labOpposite','opposite'],['labFade','fadeDuration']]) {
  $(labId).addEventListener('input', event => {
    $(mainId).value = event.target.value;
    markProfileEdited();
    updateValues();
    if (mainId !== 'fadeDuration') schedulePreview();
  });
}
document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
  $('drl').value = button.dataset.preset;
  markProfileEdited();
  updateValues();
  selectMode('DRL', $('live').checked);
}));
$('startSelfTest').addEventListener('click', runSelfTest);
$('stopSelfTest').addEventListener('click', () => stopActiveTool());
document.querySelectorAll('[data-observed]').forEach(button => button.addEventListener('click', () => {
  if (toolState.kind !== 'test') return;
  toolState.results[toolState.step] = button.dataset.observed;
  renderToolText();
}));
$('startRhythm').addEventListener('click', runRhythm);
$('stopRhythm').addEventListener('click', () => stopActiveTool());
$('rhythmBpm').addEventListener('input', event => { toolState.bpm = Number(event.target.value); renderToolText(); });
document.querySelectorAll('[data-bpm]').forEach(button => button.addEventListener('click', () => {
  toolState.bpm = Number(button.dataset.bpm);
  renderToolText();
}));
document.querySelectorAll('[data-rhythm]').forEach(button => button.addEventListener('click', () => {
  toolState.rhythm = button.dataset.rhythm;
  renderToolText();
}));
for (const [id, kind] of [['selfTestDetails','test'],['rhythmDetails','rhythm']]) {
  $(id).addEventListener('toggle', event => { if (!event.target.open && toolState.kind === kind) stopActiveTool(); });
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
window.addEventListener('hashchange', () => showPage(location.hash === '#lab' ? 'lab' : 'main'));
$('connectBtn').addEventListener('click', connect);
$('previewWelcomeBtn').addEventListener('click', () => selectMode('ANIMATION', true));
$('readBtn').addEventListener('click', async () => {
  if (!state.connected) { toast(tr('connectFirst')); $('saveStatus').textContent = tr('connectFirst'); return; }
  await stopActiveTool();
  if (await send('REQ')) { toast(tr('readSent')); $('saveStatus').textContent = tr('readSent'); }
});
$('reqBtn').addEventListener('click', () => send('REQ'));
$('pingBtn').addEventListener('click', () => send('PING'));
$('saveBtn').addEventListener('click', async () => {
  if (!state.connected) { toast(tr('connectFirst')); $('saveStatus').textContent = tr('connectFirst'); return; }
  await stopActiveTool();
  if (!['fade-in','pulse','flash'].includes(state.welcome)) { toast(tr('graphCannotSave')); $('saveStatus').textContent = tr('graphCannotSave'); return; }
  clearTimeout(state.previewTimer);
  stopWelcome();
  const animation = {'fade-in':0, pulse:1, flash:2}[state.welcome];
  const expected = Number($('opposite').value);
  const commands = [
    'CFG,DRL,' + pwm($('drl').value),
    'CFG,DIM,' + pwm(expected),
    'CFG,FADE,' + $('fadeDuration').value,
    'CFG,ANIM,' + animation,
    'SAVE'
  ];
  if (!confirm(tr('saveConfirm') + commands.join('\n') + tr('saveConfirmEnd'))) return;
  if (state.pendingDimReadback) clearTimeout(state.pendingDimReadback.timer);
  state.pendingDimReadback = null;
  if (!await enqueue(commands, 200)) { toast(tr('saveFailed')); return; }
  $('saveStatus').textContent = tr('saveChecking');
  await delay(400);
  if (!state.connected) { $('saveStatus').textContent = tr('dimReadbackMissing'); return; }
  const timer = setTimeout(() => {
    if (state.pendingDimReadback?.timer !== timer) return;
    state.pendingDimReadback = null;
    $('saveStatus').textContent = tr('dimReadbackMissing');
    toast(tr('dimReadbackMissing'));
  }, 5000);
  state.pendingDimReadback = {expected, expectedPwm:pwm(expected), timer};
  if (!await send('REQ')) {
    clearTimeout(timer);
    state.pendingDimReadback = null;
    $('saveStatus').textContent = tr('dimReadbackMissing');
  }
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
showPage(location.hash === '#lab' ? 'lab' : 'main');
log('Ready. Connect to PISKRAFT_DIM.');
