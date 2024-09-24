use enigo::Keyboard;
use tauri::{
  plugin::{Builder, TauriPlugin},
  Runtime,
};

#[tauri::command]
pub async fn show_snap_overlay() {
  #[cfg(target_os = "windows")]
  {
    use enigo::{Direction, Enigo, Key, Settings};
    // press win + z using enigo
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.key(Key::Meta, Direction::Press).unwrap();
    enigo.key(Key::Z, Direction::Click).unwrap();
    enigo.key(Key::Meta, Direction::Release).unwrap();
    // Wait 50 ms
    std::thread::sleep(std::time::Duration::from_millis(50));
    // Press Alt to hide the ugly numbers
    enigo.key(Key::Alt, Direction::Click).unwrap();
  }
}
