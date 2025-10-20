const audio = document.getElementById('audio');
const clickSound = document.getElementById('clickSound');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const dropdown = document.getElementById('menuList');
const wheel = document.querySelector('.wheel');

let currentIndex = 0;
let isPlaying = false;
let isDragging = false; 

tracks = [
  { name: "Touch", artist: "Katseye ft. Yeonjun", src: "assets/touch/Touch.mp3", image: "assets/touch/katseye.jpg" },
  { name: "Supernatural", artist: "Ariana Grande", src: "assets/Supernatural/supernatural.mp3", image: "assets/Supernatural/ariana.jpg" },
  { name: "Party 4 u", artist: "Charli xcx", src: "assets/party4u/party4usong.mp3", image: "assets/party4u/charli.jpg" },
  { name: "Eyes Closed", artist: "Jisoo & Zayn", src: "assets/eyes_closed/eyes-closed.mp3", image: "assets/eyes_closed/jisoo-zayn.jpg"},
  { name: "Blue", artist: "Yung Kai", src: "assets/blue/Blue-Yung-Kai.mp3", image: "assets/blue/yung-kai.jpg"},
  { name: "About You", artist: "The 1975", src: "assets/About_You/about-you.mp3", image: "assets/About_You/1975.jpg"},
  { name: "2 hands", artist: "Tate Mcrae", src: "assets/2_hands/tate-mcrae-2-hands.mp3", image: "assets/2_hands/tate.jpg"},
  { name: "If I Say, I Love You", artist: "Boynextdoor", src: "assets/if_I_say_I_love_you/ifisayiloveyou.mp3", image: "assets/if_I_say_I_love_you/boynextdoor.jpg"},
  { name: "Kiss Kiss", artist: "MGK", src: "assets/kiss_kiss/kiss-kiss.mp3", image: "assets/kiss_kiss/mgk.jpg"},
  { name: "GO!", artist: "Cortis", src: "assets/GO!/GO!.mp3", image: "assets/GO!/cortis.jpg"},
  { name: "luther", artist: "Kendrick & Sza", src: "assets/luther/luthersong.mp3", image: "assets/luther/sza&kendrick.jpg"},
  { name: "playboy shit", artist: "Blackbear ft. Lil Aaron", src: "assets/playboy_shit/playboy-shit.mp3", image: "assets/playboy_shit/blackbearr.jpg"},
  { name: "I Love You, I'm Sorry", artist: "Gracie Abrams", src: "assets/i_love_you_im_sorry/ilyis.mp3", image: "assets/i_love_you_im_sorry/gracie.jpg"},
  { name: "Jellyous", artist: "ILLIT", src: "assets/jellyous/jellyous.mp3", image: "assets/jellyous/illit.jpg"},
  { name: "Fall In Love Again", artist: "P1harmony", src: "assets/fall_in_love_again/fall-in-love-again.mp3", image: "assets/fall_in_love_again/p1h.jpg"},
  { name: "I Think I Like You Better When You're Gone", artist: "Reneé Rapp", src: "assets/better-gone/i_think_i_like_you_bette.mp3", image: "assets/better-gone/reneee.jpg"},
  { name: "Soda Pop", artist: "Saja Boys", src: "assets/soda/soda-pop.mp3", image: "assets/soda/saja.jpg"  },
  { name: "Welcome To New York", artist: "Taylor Swift", src: "assets/wlcm/wlcmtoNYC.mp3", image: "assets/wlcm/taylor.jpg"},
  { name: "Golden", artist: "HUNTR/X", src: "assets/golden/Golden.mp3", image: "assets/golden/huntrix.jpg"},
  { name: "So American", artist: "Olivia Rodrigo", src: "assets/american/so-american.mp3", image: "assets/american/olivia.jpg"},
  { name: "Emails I Can't Send", artist: "Sabrina Carpenter", src:"assets/emails/emails-i-can't-send.mp3", image:"assets/emails/sabrina.jpg"},
  { name: "Hurt", artist: "NewJeans / NJZ", src: "assets/hurt/Hurt.mp3", image: "assets/hurt/njz.jpg"},
  { name: "Never Goodbye", artist: "NCT Dream", src: "assets/never_goodbye/never-goodbye.mp3", image: "assets/never_goodbye/nct.jpg"},
  { name: "DARARI", artist: "Treasure", src: "assets/darari/DARARI.mp3", image: "assets/darari/treasure.jpg"}
];


function playClick() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }
}

function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function loadTrack(i) {
  currentIndex = ((i % tracks.length) + tracks.length) % tracks.length;
  const t = tracks[currentIndex];
  titleEl.textContent = t.name;
  artistEl.textContent = t.artist;
  coverEl.src = t.image;
  audio.src = t.src;
  dropdown.value = currentIndex;
}

async function safePlay() {
  try {
    await audio.play();
    isPlaying = true;
    wheel.classList.add('playing');
  } catch (err) {
    console.warn('Playback blocked:', err);
    alert('Click again to allow playback 🎵');
  }
}

function togglePlay() {
  playClick();
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    wheel.classList.remove('playing');
  } else {
    safePlay();
  }
}

function nextTrack() {
  playClick();
  loadTrack((currentIndex + 1) % tracks.length);
  if (isPlaying) safePlay();
}

function prevTrack() {
  playClick();
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
  if (isPlaying) safePlay();
}

tracks.forEach((t, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = `${t.name} — ${t.artist}`;
  dropdown.appendChild(opt);
});

dropdown.addEventListener('change', e => {
  const val = parseInt(e.target.value);
  if (!isNaN(val)) {
    loadTrack(val);
    if (isPlaying) safePlay();
  }
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration || isDragging) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  currentTimeEl.textContent = fmtTime(audio.currentTime);
  durationEl.textContent = fmtTime(audio.duration);
});

audio.addEventListener('ended', nextTrack);

function seekTo(e) {
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  audio.currentTime = pct * audio.duration;
  progressFill.style.width = (pct * 100) + '%';
  currentTimeEl.textContent = fmtTime(audio.currentTime);
}

progressBar.addEventListener('mousedown', e => {
  if (!audio.duration) return;
  isDragging = true;
  seekTo(e);
});

window.addEventListener('mousemove', e => {
  if (isDragging) seekTo(e);
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    if (isPlaying) safePlay();
  }
});

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlay();
  } else if (e.code === 'ArrowRight') nextTrack();
  else if (e.code === 'ArrowLeft') prevTrack();
});

loadTrack(0);
dropdown.value = 0;
