const audio = document.getElementById('audio');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const toggleWaveBtn = document.getElementById('toggleWave');
const waveContainer = document.getElementById('waveContainer');
const waveform = document.getElementById('waveform');
const hearts = document.querySelectorAll('.heart');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

let tracks = [];
let currentIndex = parseInt(localStorage.getItem('lastTrack') || '0', 10) || 0;
let isPlaying = false;
let ctx = null;
let analyser = null;
let sourceNode = null;
let rafId = null;
let staticWaveformData = null;

// Load tracks.json
async function loadTracks() {
  try {
    const res = await fetch('songs.json');
    tracks = await res.json();
  } catch (e) {
    console.error('Could not load songs.json', e);
    tracks = [];
  }
}

// Format time mm:ss
function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Load given track index
async function loadTrack(i) {
  if (!tracks.length) return;
  currentIndex = ((i % tracks.length) + tracks.length) % tracks.length;
  const t = tracks[currentIndex];
  titleEl.textContent = t.name || 'Unknown';
  artistEl.textContent = t.artist || '';
  coverEl.src = t.image || 'assets/default-cover.gif';
  audio.src = t.src;
  localStorage.setItem('lastTrack', currentIndex);

  // prepare static waveform (downsampled)
  prepareStaticWaveform(t.src);
}

// Prepare precomputed static waveform for nicer frozen look
async function prepareStaticWaveform(url) {
  staticWaveformData = null;
  if (!window.AudioContext && !window.webkitAudioContext) return;
  try {
    const arr = await (await fetch(url)).arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = await audioCtx.decodeAudioData(arr.slice(0));
    const ch = buffer.getChannelData(0);
    const sampleCount = 2000; // similar to Lua sampleCount
    const step = Math.max(1, Math.floor(ch.length / sampleCount));
    staticWaveformData = new Float32Array(sampleCount);
    for (let s = 0; s < sampleCount; s++) staticWaveformData[s] = ch[s * step] || 0;
    audioCtx.close();
    drawStaticWaveform(staticWaveformData);
  } catch (e) {
    console.warn('static waveform error', e);
    staticWaveformData = null;
  }
}

// Draw static waveform (Catmull-Rom-like smoothing)
function drawStaticWaveform(data) {
  if (!data || !waveform) return;
  const dpi = devicePixelRatio || 1;
  const w = waveform.clientWidth * dpi;
  const h = waveform.clientHeight * dpi;
  waveform.width = w;
  waveform.height = h;
  const ctx2 = waveform.getContext('2d');
  ctx2.clearRect(0, 0, w, h);
  ctx2.lineWidth = 2 * dpi;
  ctx2.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--flamingo') || '#EFB';
  ctx2.beginPath();

  function catmullRom(p0,p1,p2,p3,t){
    const t2=t*t, t3=t2*t;
    return 0.5*((2*p1)+(-p0+p2)*t + (2*p0-5*p1+4*p2-p3)*t2 + (-p0+3*p1-3*p2+p3)*t3);
  }

  const mid = h/2;
  const zoom = h/2 * 0.9;
  const len = data.length;
  let moved=false;
  for (let i=0;i<len-1;i++){
    const x1 = (i/len)*w;
    const x2 = ((i+1)/len)*w;
    const s0 = data[(i-1+len)%len];
    const s1 = data[i];
    const s2 = data[(i+1)%len];
    const s3 = data[(i+2)%len];

    for (let t=0;t<=1;t+=0.25){
      const x = x1 + (x2-x1)*t;
      const yS = catmullRom(s0,s1,s2,s3,t);
      const y = mid - yS * zoom;
      if (!moved){ ctx2.moveTo(x,y); moved=true; } else ctx2.lineTo(x,y);
    }
  }
  ctx2.stroke();
}

// Real-time visualization using WebAudio analyser (runs when playing and waveform toggled)
function startRealtime() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  try {
    if (sourceNode) sourceNode.disconnect();
    sourceNode = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect(analyser);
    analyser.connect(ctx.destination);
  } catch (e) {
    // Might throw if audio source already connected in some browsers
  }
  renderLoop();
}
function stopRealtime() {
  if (rafId) cancelAnimationFrame(rafId);
  // optionally disconnect nodes
}

function renderLoop() {
  if (!analyser) return;
  const bufferLength = analyser.fftSize;
  const data = new Float32Array(bufferLength);
  analyser.getFloatTimeDomainData(data);
  // draw to canvas
  const dpi = devicePixelRatio || 1;
  const w = waveform.clientWidth * dpi;
  const h = waveform.clientHeight * dpi;
  waveform.width = w; waveform.height = h;
  const g = waveform.getContext('2d');
  g.clearRect(0,0,w,h);
  g.lineWidth = 2 * dpi;
  g.strokeStyle = 'rgba(200,120,180,0.95)';
  g.beginPath();
  const slice = w / bufferLength;
  let x = 0;
  for (let i=0;i<bufferLength;i++){
    const v = data[i]*0.9;
    const y = (h/2) + v * (h/2);
    if (i===0) g.moveTo(x,y); else g.lineTo(x,y);
    x += slice;
  }
  g.stroke();
  rafId = requestAnimationFrame(renderLoop);
}

// Playback controls
function play() {
  audio.play();
  isPlaying = true;
  playBtn.textContent = '⏸️';
  // resume audio context if suspended
  if (ctx && ctx.state === 'suspended') ctx.resume();
  // if waveform is visible, start realtime
  if (!waveContainer.classList.contains('hidden')) startRealtime();
}
function pause() {
  audio.pause();
  isPlaying = false;
  playBtn.textContent = '▶️';
  stopRealtime();
}
function togglePlay() { isPlaying ? pause() : play(); }

function nextTrack() {
  const next = (currentIndex + 1) % tracks.length;
  loadTrack(next);
  if (isPlaying) play();
}
function prevTrack() {
  const prev = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(prev);
  if (isPlaying) play();
}

// Update progress UI
audio.addEventListener('timeupdate', () => {
  if (!audio.duration || isNaN(audio.duration)) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.left = pct + '%';
  currentTimeEl.textContent = fmtTime(audio.currentTime);
});

// metadata loaded
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = fmtTime(audio.duration);
  // position thumb if saved or if src has position
});

// ended
audio.addEventListener('ended', () => { nextTrack(); });

// Drag progress thumb (mouse/touch)
let dragging = false;
function seekAtClientX(clientX) {
  const rect = progressBar.getBoundingClientRect();
  const x = Math.max(rect.left, Math.min(clientX, rect.right));
  const pct = ((x - rect.left) / rect.width) * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.left = pct + '%';
  if (audio.duration && !isNaN(audio.duration)) audio.currentTime = (pct/100) * audio.duration;
}
progressThumb.addEventListener('pointerdown', (e) => {
  dragging = true;
  progressThumb.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  seekAtClientX(e.clientX);
});
document.addEventListener('pointerup', (e) => {
  if (dragging) {
    dragging = false;
    try { progressThumb.releasePointerCapture(e.pointerId); } catch {}
  }
});
progressBar.addEventListener('click', (e) => seekAtClientX(e.clientX));

// Hearts volume
hearts.forEach(h => {
  h.addEventListener('click', () => {
    const v = parseFloat(h.dataset.vol) || 0.3;
    audio.volume = v;
    // visual cue
    hearts.forEach(x => x.style.opacity = x === h ? '1' : '0.5');
  });
});

// Wheel buttons
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Waveform toggle
toggleWaveBtn.addEventListener('click', () => {
  if (waveContainer.classList.contains('hidden')) {
    waveContainer.classList.remove('hidden');
    // draw static once
    if (staticWaveformData) drawStaticWaveform(staticWaveformData);
    // start realtime if playing
    if (isPlaying) startRealtime();
  } else {
    waveContainer.classList.add('hidden');
    stopRealtime();
    // redraw static nothing
  }
});

// Init
(async function init() {
  await loadTracks();
  if (!tracks.length) {
    titleEl.textContent = 'No tracks found — check songs.json';
    return;
  }
  loadTrack(currentIndex);
  audio.volume = 0.3;

  // ensure audio context resume on first interaction (browsers may require)
  document.addEventListener('click', function once() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
    document.removeEventListener('click', once);
  });
})();
