const audio = document.getElementById('audio');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');

const menuBtn = document.getElementById('menu');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const wheel = document.querySelector('.wheel');
const menuScreen = document.getElementById('menuScreen');
const trackListEl = document.getElementById('trackList');

let tracks = [];
let currentIndex = 0;
let isPlaying = false;
let inMenu = false;
let selectedIndex = 0;

// Load your songs (example)
tracks = [
  { name: "Touch", artist: "Katseye ft. Yeonjun", src: "assets/touch/Touch - KATSEYE.mp3", image: "assets/touch/katseye.jpg" },
  { name: "Supernatural", artist: "Ariana Grande", src: "assets/Supernatural/wwd.mp3juice.blog - Ariana Grande - supernatural (320 KBps).mp3", image: "assets/Supernatural/ariana.jpg" },
  { name: "Party 4 u", artist: "Charli xcx", src: "assets/party4u/Charli XCX - party 4 u [Official Audio].mp3", image: "assets/party4u/charli.jpg" },
];

// Load track
function loadTrack(i) {
  currentIndex = ((i % tracks.length) + tracks.length) % tracks.length;
  const t = tracks[currentIndex];
  titleEl.textContent = t.name;
  artistEl.textContent = t.artist;
  coverEl.src = t.image;
  audio.src = t.src;
  highlightMenu(currentIndex);
}

// Play/pause toggle
function togglePlay() {
  if (!audio.src) loadTrack(currentIndex);
  if (isPlaying) {
    audio.pause();
    playBtn.textContent = "▶️";
  } else {
    audio.play();
    playBtn.textContent = "⏸️";
  }
  isPlaying = !isPlaying;
}

// Track navigation
function nextTrack() {
  loadTrack(currentIndex + 1);
  if (isPlaying) audio.play();
}
function prevTrack() {
  loadTrack(currentIndex - 1);
  if (isPlaying) audio.play();
}

// Progress bar updates
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  currentTimeEl.textContent = fmtTime(audio.currentTime);
  durationEl.textContent = fmtTime(audio.duration);
});
audio.addEventListener('ended', nextTrack);

function fmtTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Menu
function toggleMenu() {
  inMenu = !inMenu;
  menuScreen.classList.toggle('hidden', !inMenu);
  document.getElementById('playerScreen').classList.toggle('hidden', inMenu);
}
menuBtn.addEventListener('click', toggleMenu);

// Build track list
tracks.forEach((t, i) => {
  const li = document.createElement('li');
  li.textContent = `${t.name} — ${t.artist}`;
  li.addEventListener('click', () => {
    loadTrack(i);
    toggleMenu();
    audio.play();
    isPlaying = true;
    playBtn.textContent = "⏸️";
  });
  trackListEl.appendChild(li);
});

function highlightMenu(i) {
  [...trackListEl.children].forEach((li, idx) => {
    li.classList.toggle('selected', idx === i);
  });
}

// Scroll wheel rotation detection
let lastAngle = null;
let isDraggingWheel = false;

function getAngle(x, y, centerX, centerY) {
  const dx = x - centerX;
  const dy = y - centerY;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function onWheelMove(e) {
  if (!inMenu || !isDraggingWheel) return;
  const rect = wheel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  const angle = getAngle(x, y, centerX, centerY);

  if (lastAngle !== null) {
    let delta = angle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const threshold = 10;

    if (delta > threshold) {
      selectedIndex = (selectedIndex + 1) % tracks.length;
      highlightMenu(selectedIndex);
      wheel.classList.add('rotating');
    } else if (delta < -threshold) {
      selectedIndex = (selectedIndex - 1 + tracks.length) % tracks.length;
      highlightMenu(selectedIndex);
      wheel.classList.add('rotating');
    }
  }
  lastAngle = angle;
  clearTimeout(wheel._rotTimeout);
  wheel._rotTimeout = setTimeout(() => wheel.classList.remove('rotating'), 120);
}

function endWheel() {
  isDraggingWheel = false;
  lastAngle = null;
}

wheel.addEventListener('mousedown', (e) => { if (inMenu) isDraggingWheel = true; });
wheel.addEventListener('mousemove', onWheelMove);
wheel.addEventListener('mouseup', endWheel);
wheel.addEventListener('mouseleave', endWheel);
wheel.addEventListener('touchstart', (e) => { if (inMenu) isDraggingWheel = true; });
wheel.addEventListener('touchmove', onWheelMove);
wheel.addEventListener('touchend', endWheel);

// Wheel buttons
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

// Init
loadTrack(0);
highlightMenu(0);
