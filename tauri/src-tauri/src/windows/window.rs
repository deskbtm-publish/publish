use std::{process, thread, time};

use tauri::{api::path::desktop_dir, AppHandle};
use windows::{
  core::PCWSTR,
  w,
  Win32::{
    Foundation::{BOOL, HWND, LPARAM, WPARAM},
    System::Com::{CoCreateInstance, CLSCTX_ALL},
    UI::{
      Shell::{DesktopWallpaper, IDesktopWallpaper},
      WindowsAndMessaging::*,
    },
  },
};

fn is_main_window(handle: HWND) -> bool {
  unsafe { GetWindow(handle, GW_OWNER) == HWND(0) }
}

/// Get the tuple that includes the main window and child windows from pid.
///
fn get_windows_from_pid(pid: u32) -> (Option<HWND>, Vec<HWND>) {
  let mut handles: Vec<HWND> = Vec::new();
  let mut main_window: Option<HWND> = None;
  let mut window = HWND(0);
  let mut t_pid: u32 = 0;

  unsafe {
    loop {
      window = FindWindowExW(HWND(0), window, PCWSTR::null(), PCWSTR::null());

      GetWindowThreadProcessId(window, &mut t_pid);

      if t_pid == pid {
        handles.push(window);

        if is_main_window(window) {
          main_window = Some(window);
        }
      }

      if window == HWND(0) {
        break;
      }
    }

    (main_window, handles)
  }
}

fn maximize(window: HWND) {
  let flags = SWP_NOZORDER | SWP_NOMOVE | SWP_NOSIZE | SWP_FRAMECHANGED;

  unsafe {
    SetWindowPos(
      window,
      HWND::default(),
      0,
      0,
      GetSystemMetrics(SM_CXSCREEN),
      GetSystemMetrics(SM_CXSCREEN),
      flags,
    );
    SendMessageW(
      window,
      WM_SYSCOMMAND,
      WPARAM(SC_MAXIMIZE as usize),
      LPARAM(0),
    );
  }
}

fn get_main_window_from_pid() {
  // GetWindow(handle, GW_OWNER) == HWND(0) && IsWindowVisible(handle);
}

fn remove_window_edge(handle: HWND) {
  unsafe {
    let win = GetWindowLongW(handle, GWL_STYLE) as u32;
    let (mut style, _ex_style) = (WINDOW_STYLE(win), WINDOW_EX_STYLE(win));

    style &= !(WS_CAPTION | WS_THICKFRAME | WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU);

    // ex_style &= !(WS_EX_DLGMODALFRAME | WS_EX_CLIENTEDGE | WS_EX_STATICEDGE | WS_EX_ACCEPTFILES);

    SetWindowLongW(handle, GWL_STYLE, style.0 as i32);
    // SetWindowLongW(handle, GWL_EXSTYLE, ex_style.0 as i32);
  }
}

fn exec_planet(_app_handle: AppHandle) {
  let mut desktop = desktop_dir().unwrap();

  desktop.push("875477924/Planet.exe");

  if let Some(path) = desktop.to_str() {
    let child = process::Command::new(path).spawn().unwrap();
    dbg!(child.id());
    let ten_millis = time::Duration::from_secs(2);
    let _now = time::Instant::now();
    thread::sleep(ten_millis);

    let (target_main_window, handles) = get_windows_from_pid(child.id());

    dbg!(&target_main_window, &handles);

    unsafe {
      let _progman_window: HWND = FindWindowW(w!("Progman\0"), PCWSTR::null());

      if let Some(target_main_window) = target_main_window {
        thread::sleep(time::Duration::from_secs(3));
        dbg!(IsWindowVisible(target_main_window).as_bool());
        remove_window_edge(target_main_window);

        maximize(target_main_window);
      }
    }
    // for win in &handles {
    //   remove_window_edge(*win);
    //   dbg!(win, "==========");
    // }
  }
}

extern "system" fn mouse_proc(window: HWND, _: LPARAM) -> BOOL {
  unsafe {
    let tmp_shell_window = FindWindowExW(window, HWND(0), w!("SHELLDLL_DefView\0"), PCWSTR::null());
    let _tmp_sys_list_window = FindWindowExW(
      tmp_shell_window,
      HWND(0),
      w!("SysListView32\0"),
      PCWSTR::null(),
    );

    if HWND::default() != tmp_shell_window {
      let _tmp_deepest_point = FindWindowExW(HWND(0), window, w!("WorkerW\0"), PCWSTR::null());
      // shell_window = tmp_shell_window;
      // sys_list_window = tmp_sys_list_window;
      // if tmp_deepest_point != HWND::default() {
      //   deepest_point = tmp_deepest_point;
      // }
    }

    BOOL(1)
  }
}

fn set_sys_wallpaper() -> ::windows::core::Result<()> {
  let wallpaper: IDesktopWallpaper;
  unsafe {
    wallpaper = CoCreateInstance(&DesktopWallpaper, None, CLSCTX_ALL)?;
  };

  Ok(())
}
