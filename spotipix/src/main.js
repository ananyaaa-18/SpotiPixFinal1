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
const dropdown = document.getElementById('menuList') || document.getElementById('menuList'); // keep compatibility

if (!audio) console.error('Audio element #audio not found');
if (!playBtn) console.error('Play button #play not found');
if (!nextBtn) console.error('Next button #next not found');
if (!prevBtn) console.error('Prev button #prev not found');
if (!progressFill) console.error('Progress fill #progressFill not found');

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
  { name: "I Think I Like You Better When You're Gone", artist: "Reneé Rapp", src: "assets/I_think_i_like_u_better_when_youre_gone/i-think-i-like-u-better.mp3", image: "assets/I_think_i_like_ u_better_when_youre_gone/reneee.jpg"},
  { name: "Soda Pop", artist: "Saja Boys", src: "assets/soda/soda-pop.mp3", image: "assets/soda/saja.jpg"  },
  { name: "Welcome To New York", artist: "Taylor Swift", src: "assets/wlcm/wlcmtoNYC.mp3", image: "assets/wlcm/taylor.jpg"},
  { name: "Golden", artist: "HUNTR/X", src: "assets/golden/Golden.mp3", image: "assets/golden/huntrix.jpg"},
  { name: "So American", artist: "Olivia Rodrigo", src: "assets/american/so-american.mp3", image: "assets/american/olivia.jpg"},
  { name: "Emails I Can't Send", artist: "Sabrina Carpenter", src:"assets/emails/emails-i-can't-send.mp3", image:"assets/emails/sabrina.jpg"},
  { name: "Hurt", artist: "NewJeans / NJZ", src: "assets/hurt/Hurt.mp3", image: "assets/hurt/njz.jpg"},
  { name: "Never Goodbye", artist: "NCT Dream", src: "assets/never_goodbye/never-goodbye.mp3", image: "assets/never_goodbye/nct.jpg"},
  { name: "DARARI", artist: "Treasure", src: "assets/darari/DARARI.mp3", image: "assets/darari/treasure.jpg"}
];


let currentIndex = 0;
let isPlaying = false;

// populate dropdown safely
if (dropdown) {
  tracks.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${t.name} — ${t.artist}`;
    dropdown.appendChild(opt);
  });
} else {
  console.warn('Dropdown menu element not found; skipping population');
}

// helper: format mm:ss
function fmtTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Load a track index and update UI (no play)
function loadTrack(i) {
  if (!tracks || !tracks.length) {
    console.warn('No tracks available');
    return;
  }
  currentIndex = ((i % tracks.length) + tracks.length) % tracks.length;
  const t = tracks[currentIndex];
  titleEl && (titleEl.textContent = t.name || 'Unknown');
  artistEl && (artistEl.textContent = t.artist || '');
  coverEl && (coverEl.src = t.image || 'assets/default-cover.gif');

  // set audio src and ensure metadata loads
  if (audio) {
    audio.src = t.src || '';
    try { audio.load(); } catch (e) { console.warn('audio.load() error', e); }
  }

  // sync dropdown
  if (dropdown) dropdown.value = currentIndex;
}

// Safe play helper with promise handling (autoplay policy)
async function safePlay() {
  if (!audio) return false;
  if (!audio.src) {
    loadTrack(currentIndex || 0);
  }
  try {
    const playPromise = audio.play();
    if (playPromise !== undefined) await playPromise;
    isPlaying = true;
    if (playBtn) playBtn.textContent = '⏸️';
    return true;
  } catch (err) {
    console.warn('Playback blocked or failed, user gesture required:', err);
    alert('Playback blocked by browser. Please click the play button again or interact with the app to allow sound.');
    isPlaying = false;
    if (playBtn) playBtn.textContent = '▶️';
    return false;
  }
}

// toggle play/pause
async function togglePlay() {
  if (!audio) return;
  if (!audio.src) loadTrack(currentIndex || 0);

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '▶️';
  } else {
    // explicitly unlock audio first
    await primeAudioContext();
    const played = await safePlay();
    if (!played) {
      console.warn('User gesture needed for playback');
    }
  }
}


// next / prev functions
async function nextTrack() {
  loadTrack((currentIndex + 1) % tracks.length);
  if (isPlaying) await safePlay();
}
async function prevTrack() {
  loadTrack((currentIndex - 1 + tracks.length) % tracks.length);
  if (isPlaying) await safePlay();
}

// dropdown change
if (dropdown) {
  dropdown.addEventListener('change', async (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isInteger(val)) {
      loadTrack(val);
      if (isPlaying) await safePlay();
    }
  });
}

// progress updates
if (audio) {
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (currentTimeEl) currentTimeEl.textContent = fmtTime(audio.currentTime);
    if (durationEl) durationEl.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    // automatically advance
    nextTrack();
  });

  audio.addEventListener('loadedmetadata', () => {
    // Update duration right away
    if (durationEl && audio.duration) durationEl.textContent = fmtTime(audio.duration);
  });

  audio.addEventListener('error', (e) => {
    console.error('Audio element error:', e);
    alert('Error loading audio file. Check that the file paths in the tracks array are correct.');
  });
}

// UI listeners (guarded)
if (playBtn) playBtn.addEventListener('click', togglePlay);
if (nextBtn) nextBtn.addEventListener('click', nextTrack);
if (prevBtn) prevBtn.addEventListener('click', prevTrack);

// keyboard shortcuts (optional — space toggles)
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    togglePlay();
  } else if (e.code === 'ArrowRight') {
    nextTrack();
  } else if (e.code === 'ArrowLeft') {
    prevTrack();
  }
});



async function primeAudioContext() {
  try {
    if (window.AudioContext || window.webkitAudioContext) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0, ctx.currentTime);
      o.start();
      o.stop();
      await ctx.close();
    }
  } catch (e) {
    console.warn('Audio unlock failed', e);
  }
}

window.addEventListener('pointerdown', primeAudioContext, { once: true });
window.addEventListener('touchstart', primeAudioContext, { once: true });


// initialize
loadTrack(0);
if (dropdown) dropdown.value = 0;
if (playBtn) playBtn.textContent = '▶️';