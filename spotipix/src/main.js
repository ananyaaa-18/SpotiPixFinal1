const CLIENT_ID = "9d7d25f6b40146db8a5a78b054fd34fa";
const REDIRECT_URI = "http://127.0.0.1:1420/callback";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-modify-playback-state"
].join(" ");

window.loginWithSpotify = function () {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
  window.open(authUrl, "_blank");
};

const { invoke } = window.__TAURI__.tauri;

async function fetchProfile() {
  const token = localStorage.getItem("spotify_access_token");
  if (!token) {
    alert("Please login to Spotify first 🎧");
    return;
  }

  try {
    const profile = await invoke("get_spotify_profile", { access_token: token });
    console.log("Spotify Profile:", profile);
    alert(`Logged in as: ${profile.display_name} ✅`);
  } catch (err) {
    console.error("Error fetching profile:", err);
    alert("Failed to fetch profile ❌");
  }
}

window.__TAURI__.event.listen("spotify_tokens_received", async () => {
  await fetchProfile();
});
