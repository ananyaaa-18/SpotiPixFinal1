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