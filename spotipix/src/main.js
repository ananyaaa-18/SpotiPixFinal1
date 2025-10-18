const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '9d7d25f6b40146db8a5a78b054fd34fa';
const redirectUri = "spotipix://callback";
const scopes = "user-read-currently-playing user-read-playback-state";

function loginWithSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;

  window.open(authUrl, "_blank");
}

function handleAuthRedirect() {
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const token = new URLSearchParams(hash.substring(1)).get("access_token");
    localStorage.setItem("spotify_token", token);
    window.location.hash = "";
    console.log("✅ Spotify token saved: ", token);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  handleAuthRedirect();

  const loginButton = document.createElement("button");
  loginButton.textContent = "Login with Spotify 🎧";
  loginButton.classList.add("login-btn");
  loginButton.onlick = loginWithSpotify;

  document.body.appendChild(loginButton);
});

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