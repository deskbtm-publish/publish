use std::path::PathBuf;

#[cfg(desktop)]
use jscall::window_snap::show_snap_overlay;
use tauri::{AppHandle, Manager};

mod jscall;
// mod tray;

// fn handle_file_associations(app: AppHandle, files: Vec<PathBuf>) {
//   // -- Scope handling start --

//   // You can remove this block if you only want to know about the paths, but not actually "use" them in the frontend.

//   // This requires the `fs` tauri plugin and is required to make the plugin's frontend work:
//   // use tauri_plugin_fs::FsExt;
//   // let fs_scope = app.fs_scope();

//   // This is for the `asset:` protocol to work:
//   let asset_protocol_scope = app.asset_protocol_scope();

//   for file in &files {
//     // This requires the `fs` plugin:
//     // let _ = fs_scope.allow_file(file);

//     // This is for the `asset:` protocol:
//     let _ = asset_protocol_scope.allow_file(file);
//   }

//   // -- Scope handling end --

//   let files = files
//     .into_iter()
//     .map(|f| {
//       let file = f.to_string_lossy().replace("\\", "\\\\"); // escape backslash
//       format!("\"{file}\"",) // wrap in quotes for JS array
//     })
//     .collect::<Vec<_>>()
//     .join(",");

//   tauri::WebviewWindowBuilder::new(&app, "main", Default::default())
//     .initialization_script(&format!("window.openedFiles = [{files}]"))
//     .build()
//     .unwrap();
// }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  #[warn(unused_mut)]
  let mut builder = tauri::Builder::default()
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_http::init());

  #[cfg(all(desktop))]
  {
    builder = builder.invoke_handler(tauri::generate_handler![show_snap_overlay]);
  }

  builder
    .setup(|app: &mut tauri::App| {
      // #[cfg(desktop)]
      // {
      //   let handle = app.handle();
      //   tray::create_tray(handle)?;
      //   app
      //     .handle()
      //     .plugin(tauri_plugin_updater::Builder::new().build())?;
      // }
      let main_window = app.get_webview_window("main").unwrap();
      main_window.open_devtools();
      // main_window.with_webview(|webview| unsafe {
      //   // let webview2 = webview.controller().CoreWebView2().unwrap();
      // });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

  // .invoke_handler(tauri::generate_handler![show_snap_overlay])
  // .setup(|app: &mut tauri::App| {
  //   // #[cfg(all(desktop))]
  //   // {
  //   //   let handle = app.handle();
  //   //   tray::create_tray(handle)?;
  //   //   app
  //   //     .handle()
  //   //     .plugin(tauri_plugin_updater::Builder::new().build())?;
  //   // }
  //   let main_window = app.get_webview_window("main").unwrap();
  //   main_window.open_devtools();
  //   // main_window.with_webview(|webview| unsafe {
  //   //   // let webview2 = webview.controller().CoreWebView2().unwrap();
  //   // });

  //   Ok(())
  // })
  // .run(tauri::generate_context!())
  // .expect("error while running tauri application");
}
