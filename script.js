const tracks = [
  { name: "Drift Protocol", artist: "Neon Pulse", album: "Synthetic Horizons", dur: "3:47", emoji: "🌌", bg: "linear-gradient(135deg,#1a1a2e,#533483)" },
  { name: "Velvet Nights", artist: "Aria Sol", album: "Midnight Sessions", dur: "4:12", emoji: "🌹", bg: "linear-gradient(135deg,#1a0a2e,#c8375a)" },
  { name: "Morning Fog", artist: "The Birch Tones", album: "Forest Signal", dur: "3:28", emoji: "🌲", bg: "linear-gradient(135deg,#0a2a1a,#3ab86a)" },
  { name: "Neon Rain", artist: "Callisto", album: "Chrome Dreams", dur: "5:02", emoji: "⚡", bg: "linear-gradient(135deg,#0a0a2e,#3a5bd5)" },
  { name: "Golden Hour", artist: "SOLÁ", album: "Warmth", dur: "3:55", emoji: "🌅", bg: "linear-gradient(135deg,#2a1a00,#e09a20)" },
  { name: "Static Bloom", artist: "Moth Theory", album: "Signal Noise", dur: "4:30", emoji: "🦋", bg: "linear-gradient(135deg,#1a002a,#9a40d5)" },
  { name: "Deep Current", artist: "Neon Pulse", album: "Synthetic Horizons", dur: "6:14", emoji: "🌊", bg: "linear-gradient(135deg,#002a2a,#1abcbc)" },
];

let currentTrack = 0;
let playing = false;
let liked = [];
let progressInterval = null;
let currentPct = 0;

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
  document.getElementById('total').textContent = t.dur;
  document.getElementById('p-like').className =
    'ti ti-heart player-like' + (liked.includes(currentTrack) ? ' liked' : '');
}

function updatePlayIcon() {
  const icon = document.getElementById('play-icon');
  icon.className = playing ? 'ti ti-player-pause-filled' : 'ti ti-player-play-filled';
}

function getDurSeconds(dur) {
  const [m, s] = dur.split(':').map(Number);
  return m * 60 + s;
}

function startProgress() {
  clearInterval(progressInterval);
  const total = getDurSeconds(tracks[currentTrack].dur);
  progressInterval = setInterval(() => {
    if (!playing) return;
    currentPct += 1 / total;
    if (currentPct >= 1) {
      currentPct = 0;
      nextTrack();
      return;
    }
    const elapsed = Math.round(currentPct * total);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById('elapsed').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
    document.getElementById('prog-fill').style.width = (currentPct * 100) + '%';
  }, 1000);
}

function selectTrack(i) {
  currentTrack = i;
  currentPct = 0;
  playing = true;
  updatePlayIcon();
  updatePlayer();
  renderTracks();
  startProgress();
}

function togglePlay() {
  playing = !playing;
  updatePlayIcon();
  renderTracks();
  if (playing) startProgress();
}

function nextTrack() {
  selectTrack((currentTrack + 1) % tracks.length);
}

function prevTrack() {
  selectTrack((currentTrack - 1 + tracks.length) % tracks.length);
}

function toggleLike(i, e) {
  if (e) e.stopPropagation();
  const idx = i < 0 ? currentTrack : i;
  if (liked.includes(idx)) {
    liked.splice(liked.indexOf(idx), 1);
  } else {
    liked.push(idx);
  }
  updatePlayer();
  renderTracks();
}

function seekTo(e) {
  const bar = document.getElementById('prog-bar');
  const pct = Math.min(1, Math.max(0, (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth));
  currentPct = pct;
  const total = getDurSeconds(tracks[currentTrack].dur);
  const elapsed = Math.round(pct * total);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  document.getElementById('elapsed').textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
  document.getElementById('prog-fill').style.width = (pct * 100) + '%';
}

// Init
renderTracks();
updatePlayer();

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