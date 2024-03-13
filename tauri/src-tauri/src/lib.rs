use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_http::init())
    .setup(|app| {
      let main_window = app.get_webview_window("main").unwrap();

      main_window.with_webview(|webview| unsafe {
        // let webview2 = webview.controller().CoreWebView2()
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
