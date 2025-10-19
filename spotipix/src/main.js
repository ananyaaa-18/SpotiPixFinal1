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

tracks = [
  { name: "Touch", artist: "Katseye ft. Yeonjun", src: "assets/touch/Touch - KATSEYE.mp3", image: "assets/touch/katseye.jpg" },
  { name: "Supernatural", artist: "Ariana Grande", src: "assets/Supernatural/wwd.mp3juice.blog - Ariana Grande - supernatural (320 KBps).mp3", image: "assets/Supernatural/ariana.jpg" },
  { name: "Party 4 u", artist: "Charli xcx", src: "assets/party4u/Charli XCX - party 4 u [Official Audio].mp3", image: "assets/party4u/charli.jpg" },
  { name: "Eyes Closed", artist: "Jisoo & Zayn", src: "assets/eyes closed/EYES CLOSED.mp3", image: "assets/eyes closed/jisoo-zayn.jpg"},
  { name: "Blue", artist: "Yung Kai", src: "assets/blue/Blue-Yung-Kai.mp3", image: "assets/blue/yung kai.jpg"},
  { name: "About You", artist: "The 1975", src: "assets/About You/The 1975 - About You (Official) - nabila.mp3", image: "assets/About You/1975.jpg"},
  { name: "2 hands", artist: "Tate Mcrae", src: "assets/2 hands/tate-mcrae-2-hands.mp3", image: "assets/2 hands/tate.jpg"},
  { name: "If I Say, I Love You", artist: "Boynextdoor", src: "assets/if I say I love you/IF I SAY, I LOVE YOU.mp3", image: "assets/if I say I love you/boynextdoor.jpg"},
  { name: "Kiss Kiss", artist: "MGK", src: "assets/kiss kiss/Kiss Kiss.mp3", image: "assets/kiss kiss/mgk.jpg"},
  { name: "GO!", artist: "Cortis", src: "assets/GO!/GO!.mp3", image: "assets/GO!/cortis.jpg"},
  { name: "luther", artist: "Kendrick & Sza", src: "assets/luther/Luther by Kendrick Lamar and Sza.mp3", image: "assets/luther/sza&kendrick.jpg"},
  { name: "playboy shit", artist: "Blackbear ft. Lil Aaron", src: "assets/playboy shit/playboyshit-blackbear.mp3", image: "assets/playboy shit/blackbearr.jpg"},
  { name: "I Love You, I'm Sorry", artist: "Gracie Abrams", src: "assets/i love you im sorry/I Love You, I'm Sorry.mp3", image: "assets/i love you im sorry/gracie.jpg"},
  { name: "Jellyous", artist: "ILLIT", src: "assets/jellyous/jellyous.mp3", image: "assets/jellyous/illit.jpg"},
  { name: "Fall In Love Again", artist: "P1harmony", src: "assets/fall in love again/Fall In Love Again.mp3", image: "assets/fall in love again/p1h.jpg"},
  { name: "I Think I Like You Better When You're Gone", artist: "Reneé Rapp", src: "assets/I think i like u better when youre gone/I Think I Like You Better When You’re Gone.mp3", image: "assets/I think i like u better when youre gone/reneee.jpg"}
];


function loadTrack(i) {
  currentIndex = ((i % tracks.length) + tracks.length) % tracks.length;
  const t = tracks[currentIndex];
  titleEl.textContent = t.name;
  artistEl.textContent = t.artist;
  coverEl.src = t.image;
  audio.src = t.src;
  highlightMenu(currentIndex);
}


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


function nextTrack() {
  loadTrack(currentIndex + 1);
  if (isPlaying) audio.play();
}
function prevTrack() {
  loadTrack(currentIndex - 1);
  if (isPlaying) audio.play();
}


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


function toggleMenu() {
  inMenu = !inMenu;
  menuScreen.classList.toggle('hidden', !inMenu);
  document.getElementById('playerScreen').classList.toggle('hidden', inMenu);
}
menuBtn.addEventListener('click', toggleMenu);


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


playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);


loadTrack(0);
highlightMenu(0);
