const audio = document.getElementById('audio');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverEl = document.getElementById('cover');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const dropdown = document.getElementById('menuList');

let currentIndex = 0;
let isPlaying = false;

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
  { name: "I Think I Like You Better When You're Gone", artist: "Reneé Rapp", src: "assets/I think i like u better when youre gone/I Think I Like You Better When You’re Gone.mp3", image: "assets/I think i like u better when youre gone/reneee.jpg"},
  { name: "Soda Pop", artist: "Saja Boys", src: "", image: ""  },
  { name: "Welcome To New York", artist: "Taylor Swift", src: "", image: ""},
  { name: "Golden", artist: "HUNTR/X", src: "", image: ""},
  { name: "So American", artist: "Olivia Rodrigo", src: "", image: ""},
  { name: "Emails I Can't Send", artist: "Sabrina Carpenter", src:"", image:""},
  { name: "Hurt", artist: "NewJeans / NJZ", src: "", image: ""},
  { name: "Never Goodbye", artist: "NCT Dream", src: "", image: ""},
  { name: "DARARI", artist: "Treasure", src: "", image: ""}
];


tracks.forEach((t, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = `${t.name} — ${t.artist}`;
  dropdown.appendChild(opt);
});

function loadTrack(i) {
  currentIndex = i;
  const t = tracks[currentIndex];
  audio.src = t.src;
  titleEl.textContent = t.name;
  artistEl.textContent = t.artist;
  coverEl.src = t.image;
  dropdown.value = currentIndex;
}

function togglePlay() {
  if (!audio.src) loadTrack(0);
  if (isPlaying) {
    audio.pause();
    playBtn.textContent = '▶️';
  } else {
    audio.play();
    playBtn.textContent = '⏸️';
  }
  isPlaying = !isPlaying;
}

function nextTrack() {
  loadTrack((currentIndex + 1) % tracks.length);
  if (isPlaying) audio.play();
}
function prevTrack() {
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
  if (isPlaying) audio.play();
}

dropdown.addEventListener('change', e => {
  loadTrack(parseInt(e.target.value));
  if (isPlaying) audio.play();
});

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

playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

loadTrack(0);