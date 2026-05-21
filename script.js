const tracks = [
  { name: "Drift Protocol", artist: "Neon Pulse", album: "Synthetic Horizons", dur: "3:47", emoji: "🌌", bg: "linear-gradient(135deg,#1a1a2e,#533483)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Velvet Nights", artist: "Aria Sol", album: "Midnight Sessions", dur: "4:12", emoji: "🌹", bg: "linear-gradient(135deg,#1a0a2e,#c8375a)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Morning Fog", artist: "The Birch Tones", album: "Forest Signal", dur: "3:28", emoji: "🌲", bg: "linear-gradient(135deg,#0a2a1a,#3ab86a)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { name: "Neon Rain", artist: "Callisto", album: "Chrome Dreams", dur: "5:02", emoji: "⚡", bg: "linear-gradient(135deg,#0a0a2e,#3a5bd5)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { name: "Golden Hour", artist: "SOLÁ", album: "Warmth", dur: "3:55", emoji: "🌅", bg: "linear-gradient(135deg,#2a1a00,#e09a20)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { name: "Static Bloom", artist: "Moth Theory", album: "Signal Noise", dur: "4:30", emoji: "🦋", bg: "linear-gradient(135deg,#1a002a,#9a40d5)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { name: "Deep Current", artist: "Neon Pulse", album: "Synthetic Horizons", dur: "6:14", emoji: "🌊", bg: "linear-gradient(135deg,#002a2a,#1abcbc)", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
];

let currentTrack = 0;
let playing = false;
let liked = [];
const audio = new Audio();

function renderTracks() {
  const list = document.getElementById('track-list');
  list.innerHTML = tracks.map((t, i) => `
    <div class="track-row ${i === currentTrack ? 'playing' : ''}" onclick="selectTrack(${i})">
      <div class="track-num">
        ${i === currentTrack && playing
          ? '<i class="ti ti-volume-2" style="font-size:14px;color:var(--accent)"></i>'
          : (i + 1)}
      </div>
      <div class="track-thumb" style="background:${t.bg}">${t.emoji}</div>
      <div class="track-info">
        <div class="track-name">${t.name}</div>
        <div class="track-artist">${t.artist}</div>
      </div>
      <div class="track-dur">${t.dur}</div>
      <i class="ti ti-heart track-like ${liked.includes(i) ? 'liked' : ''}"
         onclick="toggleLike(${i}, event)"></i>
    </div>
  `).join('');
}

function updatePlayer() {
  const t = tracks[currentTrack];
  document.getElementById('p-thumb').style.background = t.bg;
  document.getElementById('p-thumb').textContent = t.emoji;
  document.getElementById('p-name').textContent = t.name;
  document.getElementById('p-artist').textContent = t.artist;
  document.getElementById('p-like').className =
    'ti ti-heart player-like' + (liked.includes(currentTrack) ? ' liked' : '');
}

function updatePlayIcon() {
  const icon = document.getElementById('play-icon');
  icon.className = playing ? 'ti ti-player-pause-filled' : 'ti ti-player-play-filled';
}

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
  if (playing) {
    audio.pause();
    playing = false;
  } else {
    audio.play();
    playing = true;
  }
  updatePlayIcon();
  renderTracks();
}

function nextTrack() { selectTrack((currentTrack + 1) % tracks.length); }
function prevTrack() { selectTrack((currentTrack - 1 + tracks.length) % tracks.length); }

function toggleLike(i, e) {
  if (e) e.stopPropagation();
  liked.includes(i) ? liked.splice(liked.indexOf(i), 1) : liked.push(i);
  updatePlayer();
  renderTracks();
}

function seekTo(e) {
  const bar = document.getElementById('prog-bar');
  const pct = Math.min(1, Math.max(0, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
  audio.currentTime = pct * audio.duration;
}

// Update progress bar from real audio
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

audio.addEventListener('ended', () => nextTrack());

// Search
document.querySelector('.search-bar input').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const filtered = tracks.filter(t =>
    t.name.toLowerCase().includes(query) ||
    t.artist.toLowerCase().includes(query) ||
    t.album.toLowerCase().includes(query)
  );
  const list = document.getElementById('track-list');
  if (filtered.length === 0) {
    list.innerHTML = `<div style="padding:20px;color:var(--muted);text-align:center">No results for "${this.value}"</div>`;
    return;
  }
  list.innerHTML = filtered.map((t, i) => {
    const realIndex = tracks.indexOf(t);
    return `
      <div class="track-row ${realIndex === currentTrack ? 'playing' : ''}" onclick="selectTrack(${realIndex})">
        <div class="track-num">${realIndex === currentTrack && playing
          ? '<i class="ti ti-volume-2" style="font-size:14px;color:var(--accent)"></i>'
          : (i + 1)}</div>
        <div class="track-thumb" style="background:${t.bg}">${t.emoji}</div>
        <div class="track-info">
          <div class="track-name">${t.name}</div>
          <div class="track-artist">${t.artist}</div>
        </div>
        <div class="track-dur">${t.dur}</div>
        <i class="ti ti-heart track-like ${liked.includes(realIndex) ? 'liked' : ''}"
           onclick="toggleLike(${realIndex}, event)"></i>
    </div>`;
  }).join('');
});
// Last.fm API
const API_KEY = '01e7e4efabcb098c79a0cc81c9ff9995';

async function fetchArtwork(track, artist, imgElement) {
  try {
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`);
    const data = await res.json();
    const image = data?.track?.album?.image;
    if (image && image.length) {
      const url = image[image.length - 1]['#text'];
      if (url) imgElement.style.backgroundImage = `url(${url})`;
    }
  } catch(e) {}
}

async function loadArtwork() {
  const thumbs = document.querySelectorAll('.track-thumb');
  tracks.forEach((t, i) => {
    if (thumbs[i]) {
      thumbs[i].textContent = '';
      fetchArtwork(t.name, t.artist, thumbs[i]);
    }
  });
}
// Init
renderTracks();
updatePlayer();
loadArtwork();

// Search
document.querySelector('.search-bar input').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const filtered = tracks.filter(t =>
    t.name.toLowerCase().includes(query) ||
    t.artist.toLowerCase().includes(query) ||
    t.album.toLowerCase().includes(query)
  );
  const list = document.getElementById('track-list');
  if (filtered.length === 0) {
    list.innerHTML = `<div style="padding:20px;color:var(--muted);text-align:center">No results for "${this.value}"</div>`;
    return;
  }
  list.innerHTML = filtered.map((t, i) => {
    const realIndex = tracks.indexOf(t);
    return `
      <div class="track-row ${realIndex === currentTrack ? 'playing' : ''}" onclick="selectTrack(${realIndex})">
        <div class="track-num">${realIndex === currentTrack && playing
          ? '<i class="ti ti-volume-2" style="font-size:14px;color:var(--accent)"></i>'
          : (i + 1)}</div>
        <div class="track-thumb" style="background:${t.bg}">${t.emoji}</div>
        <div class="track-info">
          <div class="track-name">${t.name}</div>
          <div class="track-artist">${t.artist}</div>
        </div>
        <div class="track-dur">${t.dur}</div>
        <i class="ti ti-heart track-like ${liked.includes(realIndex) ? 'liked' : ''}"
           onclick="toggleLike(${realIndex}, event)"></i>
      </div>`;
  }).join('');
});