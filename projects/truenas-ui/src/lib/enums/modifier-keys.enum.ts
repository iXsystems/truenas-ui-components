export enum ModifierKeys {
  COMMAND = '⌘',
  CMD = '⌘',
  CTRL = 'Ctrl',
  CONTROL = 'Ctrl',
  ALT = '⌥',
  OPTION = '⌥',
  OPT = '⌥',
  SHIFT = '⇧',
  META = '⌘',
  SUPER = '⌘',
}

export enum WindowsModifierKeys {
  CTRL = 'Ctrl',
  CONTROL = 'Ctrl',
  ALT = 'Alt',
  SHIFT = 'Shift',
  WIN = 'Win',
  WINDOWS = 'Win',
}

export enum LinuxModifierKeys {
  CTRL = 'Ctrl',
  CONTROL = 'Ctrl',
  ALT = 'Alt',
  SHIFT = 'Shift',
  SUPER = 'Super',
  META = 'Meta',
}

export type PlatformType = 'mac' | 'windows' | 'linux' | 'auto';