// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::api::shell;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_url(url: &str) -> Result<(), String> {
    shell::open(&shell::Scope::default(), url.to_string(), None)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, open_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
