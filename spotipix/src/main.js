// --- Spotify Configuration ---
const clientId = "9d7d25f6b40146db8a5a78b054fd34fa";
const redirectUri = "spotipix://callback";
const scopes =
  "user-read-currently-playing user-read-playback-state user-modify-playback-state";

// --- Login Flow ---
function loginWithSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}`;
  window.open(authUrl, "_blank");
}

// --- Exchange code for tokens via Tauri backend ---
async function getSpotifyTokens(code) {
  try {
    const { invoke } = window.__TAURI__.tauri;
    const tokenData = await invoke("get_spotify_tokens", { code });
    return tokenData;
  } catch (err) {
    console.error("Error getting Spotify tokens:", err);
  }
}

// --- Handle callback redirect ---
async function handleAuthRedirect() {
  const codeMatch = window.location.href.match(/code=([^&]*)/);
  if (codeMatch) {
    const code = codeMatch[1];
    console.log("🎧 Got Spotify code:", code);

    const tokenData = await getSpotifyTokens(code);
    if (tokenData) {
      localStorage.setItem("spotify_access_token", tokenData.access_token);
      if (tokenData.refresh_token)
        localStorage.setItem("spotify_refresh_token", tokenData.refresh_token);
      localStorage.setItem(
        "spotify_token_expiry",
        Date.now() + tokenData.expires_in * 1000
      );
      console.log("✅ Tokens saved!");
    }

    window.location.hash = "";
  }
}

// --- Fetch Current Song ---
async function getCurrentSong() {
  const token = localStorage.getItem("spotify_access_token");
  if (!token) {
    console.warn("No Spotify token available.");
    return;
  }

  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    console.error("Error fetching track:", res.status);
    return;
  }

  const data = await res.json();
  if (data && data.item) {
    document.getElementById("songTitle").textContent = data.item.name;
    document.getElementById("artistName").textContent =
      data.item.artists[0].name;
    document.getElementById("albumCover").src = data.item.album.images[0].url;
  }
}

// --- Refresh token ---
async function refreshSpotifyToken() {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  if (!refreshToken) return;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        btoa(`${clientId}:${"eb92c935ab194d5894bd68af09e98bf8"}`),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem(
      "spotify_token_expiry",
      Date.now() + data.expires_in * 1000
    );
    console.log("🔄 Token refreshed!");
  }
}

// --- Auto refresh ---
async function ensureValidToken() {
  const expiry = localStorage.getItem("spotify_token_expiry");
  if (!expiry || Date.now() > expiry) {
    await refreshSpotifyToken();
  }
}

// --- Control buttons ---
document.getElementById("playPauseBtn").addEventListener("click", () => {
  alert("Play/Pause clicked 🎵");
});

document.getElementById("nextBtn").addEventListener("click", () => {
  alert("Next Song ⏭️");
});

document.getElementById("prevBtn").addEventListener("click", () => {
  alert("Previous Song ⏮️");
});

// --- Startup ---
handleAuthRedirect();
ensureValidToken();
