let fft, soundFile, spectrum;
let canvas;
let msg = 'Drop MP3 on Kirby, then click to play';
let msgAlpha = 255;
let msgTimer = 0;

const MSG_DISPLAY_FRAMES = 240; 
const MSG_FADE_SPEED = 1;

const BASE_R = 95;
let kirbyScale = 1.4;
const baseKirbyScale = 1.4;

let audioFileName = '';

// --- Disco background controls ---
const BG = {
  idleColor: '#b3ddfc',   // color when NOT playing
  hue: 200,               // starting hue (0..360)
  satBase: 70,            // base saturation while playing (0..100)
  bri: 95,                // brightness while playing (0..100)
  hueDrift: 0.8,          // slow drift each frame while playing
  beatKick: 18,           // extra hue speed added on beat
  damping: 0.9            // how fast beat kick decays
};
let bgHueVel = 0;         // current extra hue velocity from beats

// Motion tuning
const MOTION = {
  powerMax: 0.9,
  baseSpeed: 0.10,
  side: 4,
  bob: 2,
  squish: 0.04,
  tilt: 4,
  arm: 8,
  foot: 3,
  scaleBass: 0.08
};

let beatCutoff = 0,
    beatHoldFrames = 12,
    beatDecayRate = 0.93;
let framesSinceBeat = 999, wigglePower = 0, wigglePhase = 0, wiggleSpeed = 0;

let ampLevel = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);

  canvas = select('canvas');
  canvas.drop(gotFile);
  canvas.mouseClicked(togglePlay);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  const cx = width/2, cy = height/2;

  // Audio
  let bass = 0, mid = 0, high = 0, playing = false;
  if (soundFile) {
    analyseSound();
    bass = getNewSoundDataValue('bass');
    mid  = getNewSoundDataValue('mid');
    high = getNewSoundDataValue('highMid');
    playing = soundFile.isPlaying();
  }
  ampLevel = lerp(ampLevel, playing ? bass : 0, 0.25);
  if (playing) detectBeat(bass);

  // --- BACKGROUND ---
  if (playing) {
    // decay the beat kick and advance hue
    bgHueVel *= BG.damping;
    BG.hue = (BG.hue + BG.hueDrift + bgHueVel + high * 1.5) % 360;

    // use HSB for easy color cycling, then restore RGB
    colorMode(HSB, 360, 100, 100, 255);
    // slightly pump saturation with bass so kicks feel punchier
    const sat = constrain(BG.satBase + bass * 25, 0, 100);
    background(BG.hue, sat, BG.bri);
    colorMode(RGB, 255);
  } else {
    background(BG.idleColor);
  }

  const r0 = min(width, height) * 0.35;
  const rMax = min(width, height) * 0.60;

  // Wiggle
  wigglePower *= 0.92;
  wiggleSpeed  = lerp(wiggleSpeed, MOTION.baseSpeed, 0.08);
  wigglePhase += wiggleSpeed * (0.6 + wigglePower);

  const targetScale = baseKirbyScale * (playing ? (1 + bass * MOTION.scaleBass) : 1);
  kirbyScale = lerp(kirbyScale, targetScale, 0.12);

  const sideStep   = sin(wigglePhase * 2.0) * MOTION.side * wigglePower;
  const bob        = sin(wigglePhase * 2.6) * MOTION.bob  * wigglePower;
  const bodySquish = 1 + MOTION.squish * wigglePower * sin(wigglePhase * 2.2);
  const headTilt   = MOTION.tilt * wigglePower * sin(wigglePhase * 2.0);
  const armSwing   = MOTION.arm  * wigglePower * sin(wigglePhase * 3.0);
  const footTap    = MOTION.foot * wigglePower * sin(wigglePhase * 3.2);
  const blushPulse = 1 + 0.35 * (playing ? high : 0);

  // Visualizer
  if (playing) drawRadialVisualizer(cx, cy, spectrum, { bass, mid, high }, r0, rMax);

  // Shadow
  fill(0, 0, 0, 40);
  ellipse(cx + sideStep, cy + 55 * kirbyScale + bob, 140 * kirbyScale, 26 * kirbyScale);

  // Kirby
  push();
  translate(cx + sideStep, cy + bob);
  scale(kirbyScale * bodySquish, kirbyScale / bodySquish);
  drawKirby(0, 0, { headTilt, armSwing, footTap, blushPulse, headphones: playing, ampLevel });
  pop();

  // Hover ring
  if (isMouseOverKirby(mouseX, mouseY, cx, cy)) {
    noFill(); stroke(255, 180); strokeWeight(2);
    circle(cx, cy, BASE_R * 2 + 6); noStroke();
  }

  // Status msg (black text)
  if (msgAlpha > 0) {
    fill(0, msgAlpha);
    textSize(14);
    text(msg, width/2, 40);

    if (msgTimer < MSG_DISPLAY_FRAMES) msgTimer++;
    else msgAlpha = max(0, msgAlpha - MSG_FADE_SPEED);
  }

  // Audio file name at bottom (black)
  if (audioFileName) {
    fill(0);
    textSize(14);
    text(audioFileName, width / 2, height - 20);
  }
}

/* Visualizer */
function drawRadialVisualizer(cx, cy, spec, bands, r0, rMax) {
  if (!spec || !spec.length) return;
  const bars = 84, step = floor(spec.length / bars) || 1;

  push(); translate(cx, cy); blendMode(ADD);
  for (let i = 0; i < bars; i++) {
    const idx = i * step, val = spec[idx] || 0;
    const amp = map(val, 0, 255, 0, 1);
    const len = lerp(0, rMax - r0, amp);
    const a = (TWO_PI * i) / bars;

    const hue = (i * 5 + frameCount * 0.9 + (bands.high || 0) * 140) % 360;
    const alpha = 0.35 + amp * 0.65;

    push(); rotate(a);
    noStroke(); fill(color(`hsla(${hue},95%,60%,${alpha})`));
    const w = 6;
    rect(r0, -w/2, max(1, len), w, w/2);
    fill(`rgba(255,255,255,${0.22 + amp * 0.5})`);
    circle(r0 + len, 0, w * (0.9 + amp * 0.55));
    pop();
  }
  blendMode(BLEND); pop();
}

/* Beat detection */
function detectBeat(level) {
  const MIN_BEAT = 0.32;
  if (level > beatCutoff && level > MIN_BEAT) {
    onBeat(level); beatCutoff = level * 1.15; framesSinceBeat = 0;
  } else {
    if (framesSinceBeat <= beatHoldFrames) framesSinceBeat++;
    else beatCutoff = max(MIN_BEAT, beatCutoff * beatDecayRate);
  }
}

function onBeat(level) {
  const bump = map(level, 0.35, 1.0, 0.25, 0.7, true);
  wigglePower = min(MOTION.powerMax, wigglePower + bump);
  wiggleSpeed = 0.18 + level * 0.25;

  // kick the disco hue velocity on beats
  bgHueVel += BG.beatKick * constrain(level, 0, 1);
}

/* Kirby drawing */
function drawKirby(cx, cy, opts) {
  const { headTilt=0, armSwing=0, footTap=0, blushPulse=1, headphones=false, ampLevel=0 } = opts || {};
  const pink = color(255,182,193), pinkLight = color(255,205,215);
  const red = color(210,60,70), dark = color(40), shine = color(220,240,255), blush = color(255,130,160);

  if (headphones) {
    stroke(40); strokeWeight(10); noFill();
    arc(cx, cy - 55, 150, 80, PI, 0);
    noStroke(); fill(70);
    ellipse(cx - 70, cy - 25, 35, 50);
    ellipse(cx + 70, cy - 25, 35, 50);
    fill(70);
    ellipse(cx - 70, cy - 25, 25, 40);
    ellipse(cx + 70, cy - 25, 25, 40);
  }

  fill(red);
  push(); translate(cx - 40, cy + 42 + footTap); ellipse(0,0,55,35); pop();
  push(); translate(cx + 40, cy + 42 - footTap); ellipse(0,0,55,35); pop();

  fill(pinkLight);
  push(); translate(cx - 70, cy - 5); rotate(radians(armSwing)); ellipse(0,0,35,28); pop();
  push(); translate(cx + 70, cy - 5); rotate(radians(-armSwing)); ellipse(0,0,35,28); pop();

  fill(pink); ellipse(cx, cy, 130, 120);

  push(); translate(cx, cy); rotate(radians(headTilt));
  const eyeH = headphones ? max(20, 30 - ampLevel * 10) : 30, eyeW = 16;
  fill(dark); ellipse(-20, -10, eyeW, eyeH); ellipse(20, -10, eyeW, eyeH);

  fill(shine); ellipse(-24, -18, 6, 10); ellipse(16, -18, 6, 10);

  fill(blush);
  push(); translate(-42, 10); scale(blushPulse); ellipse(0,0,22,14); pop();
  push(); translate(42, 10); scale(blushPulse); ellipse(0,0,22,14); pop();

  if (headphones) {
    const lift = ampLevel * 3, w = 30 + ampLevel * 14, h = 14 + ampLevel * 18;
    noStroke(); fill(35); arc(0, 20 - lift, w, h, 0, PI, CHORD);
    noFill(); stroke(35); strokeWeight(4); strokeCap(ROUND);
    arc(0, 20 - lift, w, h, 0, PI / 1.02); noStroke();
  } else {
    noFill(); stroke(35); strokeWeight(4); strokeCap(ROUND);
    arc(0, 20, 26, 12, 0, PI / 1.1); noStroke();
  }
  pop();
}

/* Helpers */
function gotFile(file) {
  if (file.type === 'audio') {
    if (!isMouseOverKirby(mouseX, mouseY, width/2, height/2)) { flashMsg('Drop on Kirby 🫶'); return; }
    loadSound(file.data,
      (snd) => { 
        try { if (soundFile) soundFile.stop(); } catch (e) {} 
        soundFile = snd; 
        audioFileName = file.name || ''; // store name for bottom display
        initSound(); 
        flashMsg('Loaded! Click to play/pause'); 
      },
      () => flashMsg('Could not load that audio file')
    );
  } else { 
    flashMsg('That is not an audio file'); 
  }
}

function initSound(){ fft = new p5.FFT(0.4, 1024); soundFile.amp(0.8); }
function togglePlay(){
  if (!soundFile) { flashMsg('Drop an MP3 on Kirby first'); return; }
  if (soundFile.isPlaying()) { soundFile.pause(); flashMsg('Paused'); }
  else { soundFile.loop(); flashMsg('Playing…'); }
}
function analyseSound(){ spectrum = fft.analyze(); }
function getNewSoundDataValue(freqType){ return map(fft.getEnergy(freqType),0,255,0,1); }
function isMouseOverKirby(mx,my,cx,cy){ return dist(mx,my,cx,cy) <= BASE_R + 8; }
function flashMsg(s){ msg=s; msgAlpha=255; msgTimer=0; }
