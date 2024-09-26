// Copyright (C) 2022 Han
// SPDX-License-Identifier: FSL-1.1-Apache-2.0

use std::sync::{Arc, Mutex};
use windows::{
  core::PCWSTR,
  w,
  Win32::{
    Foundation::{BOOL, HWND, LPARAM, LRESULT, WPARAM},
    UI::WindowsAndMessaging::*,
  },
};

const WM_SPAWN_WORKER: u32 = 0x052c;

pub type SharedPreparedDeskbtm = Arc<Mutex<PreparedDeskbtm>>;

pub fn prepared_deskbtm() -> &'static SharedPreparedDeskbtm {
  use once_cell::sync::Lazy;
  /// Get singleton PREPARED_DESKBTM instance
  static PREPARED_DESKBTM: Lazy<SharedPreparedDeskbtm> =
    Lazy::new(|| Arc::new(Mutex::new(PreparedDeskbtm::new())));

  &PREPARED_DESKBTM
}

#[derive(Debug, Clone, Copy)]
pub struct PreparedDeskbtm {
  pub view: HWND,
  pub folder_view: HWND,
  pub program_view: HWND,
}

impl Default for PreparedDeskbtm {
  fn default() -> Self {
    Self {
      /// Deskbtm view
      view: HWND(0),
      folder_view: HWND(0),
      program_view: HWND(0),
    }
  }
}

// The second param is the PreparedDeskbtm reference that is passed from EnumWindows.
unsafe extern "system" fn enum_window_proc(window: HWND, param: LPARAM) -> BOOL {
  let deskbtm = param.0 as *mut PreparedDeskbtm;
  let tmp = FindWindowExW(window, HWND(0), w!("SHELLDLL_DefView\0"), PCWSTR::null());

  if HWND::default() != tmp {
    let tmp_folder_view = FindWindowExW(tmp, HWND(0), w!("SysListView32\0"), PCWSTR::null());
    let deskbtm_view = FindWindowExW(GetDesktopWindow(), window, w!("WorkerW\0"), PCWSTR::null());

    (*deskbtm).folder_view = tmp_folder_view;

    if deskbtm_view != HWND::default() {
      (*deskbtm).view = deskbtm_view;

      return BOOL(0);
    }
  }

  BOOL(1)
}

impl PreparedDeskbtm {
  /// To prepare the plugkit windows running layer.
  /// Using [`prepared_deskbtm`] to get the singleton instance.
  pub fn new() -> Self {
    let progman_view = unsafe { FindWindowW(w!("Progman\0"), PCWSTR::null()) };
    let mut default = Self::default();

    default.program_view = progman_view;
    Self::create_deskbtm(&progman_view);

    unsafe {
      EnumWindows(
        Some(enum_window_proc),
        LPARAM(&mut default as *mut _ as isize),
      );
    }

    default
  }

  /// Send 0x052c to spawn a WorkerW behind the desktop icons. And this WorkerW is named deskbtm.
  pub(crate) fn create_deskbtm(progman: &HWND) -> bool {
    let result = 0 as *mut usize;

    let r = unsafe {
      SendMessageTimeoutW(
        *progman,
        WM_SPAWN_WORKER,
        WPARAM(0xD),
        LPARAM(0x1),
        SMTO_NORMAL,
        1000,
        result,
      )
    };

    r != LRESULT(0)
  }

  pub fn clear(&self) {
    let r = unsafe { SendMessageW(self.view, WM_CLOSE, WPARAM(0), LPARAM(0)) };

    dbg!(r);

    if r == LRESULT(0) {
      // PREPARED_DESKBTM.set(Self::new()).ok();
    }
  }
}

#[derive(Debug)]
pub struct DeskbtmWindow {
  z_index: i32,
}

impl DeskbtmWindow {
  /// Return
  #[cfg(windows)]
  pub fn hwnd() {}
}

pub struct DeskbtmManager {}

impl DeskbtmManager {
  /// Is foreground desktop.
  pub fn is_desktop() -> bool {
    let deskbtm = prepared_deskbtm().lock().unwrap();
    let hwnd = unsafe { GetForegroundWindow() };

    hwnd == deskbtm.program_view || hwnd == deskbtm.view
  }

  pub fn flush() {}

  pub fn clean_deskbtm() {}
}

#[derive(Debug)]
pub struct DeskbtmWindowManager {
  pub(self) prepared_deskbtm: &'static PreparedDeskbtm,
}

impl DeskbtmWindowManager {
  pub fn new() -> Self {
    Self {
      prepared_deskbtm: prepared_deskbtm(),
    }
  }

  pub fn is_desktop() -> bool {
    let _hwnd = unsafe {
      GetForegroundWindow();
    };
    true
  }

  pub fn set_background(self, target: HWND) {
    unsafe {
      SetParent(target, self.prepared_deskbtm.view);
    }
  }

  pub fn set_index(_target: HWND, _index: i32) {}

  pub fn insert_before() {
    todo!()
  }

  pub fn insert_after() {
    todo!()
  }
}
