const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '9d7d25f6b40146db8a5a78b054fd34fa';
const redirectUri = "spotipix://callback";
const scopes = "user-read-currently-playing user-read-playback-state";

function loginWithSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

  window.open(authUrl, "_blank");
}


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