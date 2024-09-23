use enigo::Direction;
use enigo::Enigo;
use enigo::Key;
use enigo::Keyboard;
use enigo::Settings;
use tauri::{command, AppHandle, Runtime};

use crate::models::*;

fn create(settings: Option<SiumSettings>) -> Enigo {
    let settings = settings.unwrap_or_default();
    let options = Settings {
        mac_delay: settings.mac_delay,
        linux_delay: settings.linux_delay,
        x11_display: settings.x11_display,
        wayland_display: settings.wayland_display,
        windows_dw_extra_info: settings.windows_dw_extra_info,
        event_source_user_data: settings.event_source_user_data,
        release_keys_when_dropped: settings.release_keys_when_dropped,
    };

    let enigo = Enigo::new(&options).unwrap();

    enigo
}

#[command]
pub(crate) async fn key<R: Runtime>(app: AppHandle<R>, settings: Option<SiumSettings>) -> () {
    let mut enigo = self::create(settings);


    // if action == "key" {
    //     enigo.key(Key::Unicode('a'), Direction::Press).unwrap();
    // }
}
