const tracks = [
  { name: "Blinding Lights", artist: "The Weeknd", album: "After Hours", dur: "3:20", emoji: "🌌", bg: "linear-gradient(135deg,#1a1a2e,#533483)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Shape of You", artist: "Ed Sheeran", album: "Divide", dur: "3:54", emoji: "🌹", bg: "linear-gradient(135deg,#1a0a2e,#c8375a)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", dur: "3:23", emoji: "🌲", bg: "linear-gradient(135deg,#0a2a1a,#3ab86a)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { name: "Stay", artist: "The Kid LAROI", album: "F*CK LOVE", dur: "2:21", emoji: "⚡", bg: "linear-gradient(135deg,#0a0a2e,#3a5bd5)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { name: "Peaches", artist: "Justin Bieber", album: "Justice", dur: "3:18", emoji: "🌅", bg: "linear-gradient(135deg,#2a1a00,#e09a20)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { name: "good 4 u", artist: "Olivia Rodrigo", album: "SOUR", dur: "2:58", emoji: "🦋", bg: "linear-gradient(135deg,#1a002a,#9a40d5)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { name: "Montero", artist: "Lil Nas X", album: "Montero", dur: "2:17", emoji: "🌊", bg: "linear-gradient(135deg,#002a2a,#1abcbc)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
];

let currentTrack = 0;
let playing = false;
let liked = [];
let shuffle = false;
let repeat = false;
const audio = new Audio();
audio.volume = 0.7;

// ---- RENDER ----
function renderTracks(list = tracks, containerId = 'track-list') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = list.map((t, i) => {
    const realIndex = tracks.indexOf(t);
    return `
    <div class="track-row ${realIndex === currentTrack ? 'playing' : ''}" onclick="selectTrack(${realIndex})">
      <div class="track-num">
        ${realIndex === currentTrack && playing
          ? '<i class="ti ti-volume-2" style="font-size:14px;color:var(--accent)"></i>'
          : (i + 1)}
      </div>
      <div class="track-thumb" id="thumb-${realIndex}" style="background:${t.bg}">${t.emoji}</div>
      <div class="track-info">
        <div class="track-name">${t.name}</div>
        <div class="track-artist">${t.artist}</div>
      </div>
      <div class="track-dur">${t.dur}</div>
      <i class="ti ti-heart track-like ${liked.includes(realIndex) ? 'liked' : ''}"
         onclick="toggleLike(${realIndex}, event)"></i>
    </div>`;
  }).join('');
  loadArtwork();
}

function updatePlayer() {
  const t = tracks[currentTrack];
  const thumb = document.getElementById('p-thumb');
  thumb.style.background = t.bg;
  thumb.style.backgroundImage = '';
  thumb.textContent = t.emoji;
  document.getElementById('p-name').textContent = t.name;
  document.getElementById('p-artist').textContent = t.artist;
  document.getElementById('p-like').className =
    'ti ti-heart player-like' + (liked.includes(currentTrack) ? ' liked' : '');
  // fetch player artwork
  fetchArtwork(t.name, t.artist, thumb);
}

function updatePlayIcon() {
  document.getElementById('play-icon').className =
    playing ? 'ti ti-player-pause-filled' : 'ti ti-player-play-filled';
}

// ---- PLAYBACK ----
function selectTrack(i) {
  currentTrack = i;
  playing = true;
  audio.src = tracks[i].src;
  audio.play();
  updatePlayIcon();
  updatePlayer();
  renderTracks();
}

function togglePlay() {
  if (playing) { audio.pause(); playing = false; }
  else { audio.play(); playing = true; }
  updatePlayIcon();
  renderTracks();
}

function nextTrack() {
  if (shuffle) {
    let r;
    do { r = Math.floor(Math.random() * tracks.length); } while (r === currentTrack);
    selectTrack(r);
  } else {
    selectTrack((currentTrack + 1) % tracks.length);
  }
}

function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  selectTrack((currentTrack - 1 + tracks.length) % tracks.length);
}

function toggleShuffle() {
  shuffle = !shuffle;
  document.getElementById('shuffle-btn').classList.toggle('on', shuffle);
}

function toggleRepeat() {
  repeat = !repeat;
  document.getElementById('repeat-btn').classList.toggle('on', repeat);
}

function toggleLike(i, e) {
  if (e) e.stopPropagation();
  const idx = i < 0 ? currentTrack : i;
  liked.includes(idx) ? liked.splice(liked.indexOf(idx), 1) : liked.push(idx);
  updatePlayer();
  renderTracks();
  if (document.getElementById('library-page').style.display !== 'none') renderLibrary();
}

function seekTo(e) {
  const bar = document.getElementById('prog-bar');
  const pct = Math.min(1, Math.max(0, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
  if (audio.duration) audio.currentTime = pct * audio.duration;
}

function setVolume(e) {
  const bar = document.querySelector('.vol-bar');
  const pct = Math.min(1, Math.max(0, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
  audio.volume = pct;
  document.getElementById('vol-fill').style.width = (pct * 100) + '%';
}

// ---- AUDIO EVENTS ----
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = audio.currentTime / audio.duration;
  document.getElementById('prog-fill').style.width = (pct * 100) + '%';
  const m = Math.floor(audio.currentTime / 60);
  const s = Math.floor(audio.currentTime % 60);
  document.getElementById('elapsed').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
  const tm = Math.floor(audio.duration / 60);
  const ts = Math.floor(audio.duration % 60);
  document.getElementById('total').textContent = `${tm}:${ts < 10 ? '0' : ''}${ts}`;
});

audio.addEventListener('ended', () => {
  if (repeat) { audio.currentTime = 0; audio.play(); }
  else nextTrack();
});

// ---- ARTWORK ----
async function fetchArtwork(track, artist, el) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + ' ' + track)}&media=music&limit=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const url = data.results[0].artworkUrl100.replace('100x100', '300x300');
      el.style.backgroundImage = `url(${url})`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    }
  } catch(e) {}
}

function loadArtwork() {
  tracks.forEach((t, i) => {
    const el = document.getElementById(`thumb-${i}`);
    if (el) fetchArtwork(t.name, t.artist, el);
  });
}

// ---- SEARCH ----
document.getElementById('search-input').addEventListener('input', function () {
  const query = this.value.toLowerCase().trim();
  if (!query) { renderTracks(); return; }
  const filtered = tracks.filter(t =>
    t.name.toLowerCase().includes(query) ||
    t.artist.toLowerCase().includes(query) ||
    t.album.toLowerCase().includes(query)
  );
  const list = document.getElementById('track-list');
  if (!list) return;
  if (filtered.length === 0) {
    list.innerHTML = `<div style="padding:40px;color:var(--muted);text-align:center;font-size:14px">No results for "<b>${this.value}</b>"</div>`;
    return;
  }
  renderTracks(filtered, 'track-list');
});

// ---- PAGES ----
function showPage(page) {
  const pages = ['home', 'search', 'library', 'charts', 'settings'];
  pages.forEach(p => {
    const el = document.getElementById(`${p}-page`);
    if (el) el.style.display = p === page ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navMap = { home: 0, search: 1, library: 2, charts: 3, settings: 4 };
  const navItems = document.querySelectorAll('.nav-item');
  if (navMap[page] !== undefined && navItems[navMap[page]]) {
    navItems[navMap[page]].classList.add('active');
  }
  if (page === 'library') renderLibrary();
  if (page === 'charts') renderCharts();
}

// ---- LIBRARY ----
function renderLibrary() {
  const list = document.getElementById('liked-list');
  if (liked.length === 0) {
    list.innerHTML = `<div style="padding:40px;color:var(--muted);text-align:center;font-size:14px">No liked songs yet.<br>Hit the ♥ on any track!</div>`;
    return;
  }
  renderTracks(liked.map(i => tracks[i]), 'liked-list');
}

// ---- CHARTS ----
function renderCharts() {
  const shuffled = [...tracks].sort(() => Math.random() - 0.5);
  renderTracks(shuffled, 'charts-list');
}

// ---- CATEGORY FILTER ----
function filterCategory(cat) {
  const results = document.getElementById('search-results');
  results.innerHTML = `<div class="section-header" style="margin-bottom:12px"><div class="section-title">${cat}</div></div>`;
  const div = document.createElement('div');
  div.id = 'cat-results';
  results.appendChild(div);
  renderTracks(tracks, 'cat-results');
}

// ---- INIT ----
renderTracks();
updatePlayer();