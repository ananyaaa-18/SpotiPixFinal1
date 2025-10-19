const CLIENT_ID = "9d7d25f6b40146db8a5a78b054fd34fa";
const REDIRECT_URI = "http://127.0.0.1:1420/callback";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-modify-playback-state"
].join(" ");

function loginWithSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;

  window.open(authUrl, "_blank");
}

window.__TAURI__.event.listen("spotify_tokens_received", (event) => {
  const tokens = event.payload;
  console.log("✅ Received tokens:", tokens);
  localStorage.setItem("spotify_access_token", tokens.access_token);
  localStorage.setItem("spotify_refresh_token", tokens.refresh_token || "");
  alert("Spotify login successful! 🌿");
});

document.getElementById("playPauseBtn").addEventListener("click", () => {
  alert("Play/Pause clicked 🎵");
});

document.getElementById("nextBtn").addEventListener("click", () => {
  alert("Next ⏭️");
});

document.getElementById("prevBtn").addEventListener("click", () => {
  alert("Previous ⏮️");
});

document.getElementById("loginBtn").addEventListener("click", loginWithSpotify);
