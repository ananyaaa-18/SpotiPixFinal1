const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "9d7d25f6b40146db8a5a78b054fd34fa";
const redirectUri = "spotipix://callback";
const scopes = [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-modify-playback-state"
].at.join(" ");