const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "9d7d25f6b40146db8a5a78b054fd34fa";
const redirectUri = "spotipix://callback";
const scopes = "user-read-currently-playing user-read-playback-state user-modify-playback-state";

// Start login flow
function loginWithSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}`;
  window.open(authUrl, "_blank");
}

// Handle callback after login
async function handleAuthRedirect() {
  const codeMatch = window.location.href.match(/code=([^&]*)/);
  if (codeMatch) {
    const code = codeMatch[1];
    console.log("🎧 Got Spotify code:", code);

    // Exchange code for access + refresh token
    const tokenData = await getSpotifyTokens(code);
    if (tokenData) {
      localStorage.setItem("spotify_access_token", tokenData.access_token);
      localStorage.setItem("spotify_refresh_token", tokenData.refresh_token);
      localStorage.setItem("spotify_token_expiry", Date.now() + tokenData.expires_in * 1000);
      console.log("✅ Tokens saved!");
    }

    window.location.hash = "";
  }
}

async function getCurrentSong() {
  const token = localStorage.getItem("spotify_token");
  if (!token) return console.log("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Error fetching track:", res.status);
    return;
  }

  const data = await res.json();
  if (data && data.item) {
    document.getElementById("songTitle").textContent = data.item.name;
    document.getElementById("artistName").textContent = data.item.artists[0].name;
    document.getElementById("albumCover").src = data.item.album.images[0].url;
  }
}

async function refreshSpotifyToken() {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  if (!refreshToken) return;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        btoa(
          import.meta.env.VITE_SPOTIFY_CLIENT_ID +
            ":" +
            import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
        ),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem("spotify_token_expiry", Date.now() + data.expires_in * 1000);
    console.log("🔄 Token refreshed!");
  }
}

// Refresh automatically if token expired
async function ensureValidToken() {
  const expiry = localStorage.getItem("spotify_token_expiry");
  if (!expiry || Date.now() > expiry) {
    await refreshSpotifyToken();
  }
}

await ensureValidToken();



document.getElementById("playPauseBtn").addEventListener("click", () => {
  alert("Play/Pause clicked 🎵");
});

document.getElementById("nextbtn").addEventListener("click", () => {
  alert("Next Song ⏭️");
});

document.getElementById("prevBtn").addEventListener("click", () => {
  alert("Previous Song ⏮️");
});

import { loginToSpotify, getAccessTokenFromUrl } from "./spotifyAuth";

const token = getAccessTokenFromUrl();
if (!token) {
  loginToSpotify();
} else {
  console.log("Spotify access token:", token);
}