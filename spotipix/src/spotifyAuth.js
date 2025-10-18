const clientId = "9d7d25f6b40146db8a5a78b054fd34fa";
const redirectUri = "spotipix://callback";

export function loginToSpotify() {
  const scopes =
    "user-read-currently-playing user-read-playback-state user-modify-playback-state";
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}`;
  window.location.href = authUrl;
}

export function getAccessTokenFromUrl() {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substring(1));
  return params.get("access_token");
}
