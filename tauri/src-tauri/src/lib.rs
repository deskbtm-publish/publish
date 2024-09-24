use self::plugins::window_snap;
use tauri::Manager;

mod plugins;

// #[cfg(desktop)]
// mod tray;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_http::init())
    .plugin(window_snap::init())
    .setup(|app| {
      #[cfg(all(desktop))]
      {
        let _handle = app.handle();
        // tray::create_tray(handle)?;
        app
          .handle()
          .plugin(tauri_plugin_updater::Builder::new().build())?;

        // handle.plugin(menu_plugin::init())?;
      }
      let main_window = app.get_webview_window("main").unwrap();
      main_window.open_devtools();
      // main_window.with_webview(|webview| unsafe {
      //   // let webview2 = webview.controller().CoreWebView2().unwrap();
      // });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
