#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::env;
use tauri::Manager;
use tiny_http::{Response, Server};
use reqwest::Client;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: u64,
    refresh_token: Option<String>,
    scope: Option<String>,
}

#[tokio::main]
async fn main() {
    dotenv::dotenv().ok();
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                start_local_server(handle).await;
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_spotify_profile])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}

async fn start_local_server(app_handle: tauri::AppHandle) {
    let server = Server::http("127.0.0.1:1420").expect("Failed to start local server");

    println!("🚀 Listening on http://127.0.0.1:1420");

    for request in server.incoming_requests() {
        let url = request.url().to_string();

        if url.starts_with("/callback?code=") {
            let code = url.trim_start_matches("/callback?code=").to_string();

            let _ = request.respond(Response::from_string(
                "<h2>✅ Spotify login successful! You can close this window.</h2>",
            ));

            if let Ok(tokens) = exchange_code_for_token(code).await {
                println!("✅ Tokens received: {:?}", tokens);
                let _ = app_handle.emit_all("spotify_tokens_received", tokens);
            }
        } else {
            let _ = request.respond(Response::from_string("404 - Not found"));
        }
    }
}

async fn exchange_code_for_token(code: String) -> Result<TokenResponse, String> {
    let client_id = env::var("SPOTIFY_CLIENT_ID").unwrap_or_default();
    let client_secret = env::var("SPOTIFY_CLIENT_SECRET").unwrap_or_default();
    let redirect_uri = "http://127.0.0.1:1420/callback";

    let params = [
        ("grant_type", "authorization_code"),
        ("code", &code),
        ("redirect_uri", redirect_uri),
        ("client_id", &client_id),
        ("client_secret", &client_secret),
    ];

    let client = Client::new();
    let res = client
        .post("https://accounts.spotify.com/api/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Spotify token request failed: {}", res.status()));
    }

    let tokens: TokenResponse = res.json().await.map_err(|e| e.to_string())?;
    Ok(tokens)
}

#[tauri::command]
async fn get_spotify_profile(access_token: String) -> Result<serde_json::Value, String> {
    let client = Client::new();
    let res = client
        .get("https://api.spotify.com/v1/me")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let json = res.json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())?;
        Ok(json)
    } else {
        Err(format!("Spotify API error: {}", res.status()))
    }
}
