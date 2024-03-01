import { codeToHotkey } from "./hotkeyAndCode";

export function evtIsHotkey(evt: KeyboardEvent, hotkeyStr: string) {
  return evtToStandardString(evt) === toStandardString(hotkeyStr);
}

export function evtToStandardString(evt: KeyboardEvent) {
  return hotkeyInfoToStandardString(evtToHotkeyInfo(evt));
}

export function evtIsLikelyInput(evt: KeyboardEvent) {
  return (
    !evt.metaKey && !evt.ctrlKey && !evt.altKey && 
    evt.key.length === 1);
}

// Order: cmd/ctrl/alt/shift
function toStandardString(hotkeyStr: string): string {
  const strs = hotkeyStr.split(' ');
  const endKey = strs[strs.length - 1];
  const hotkeyInfo = new HotkeyInfo(endKey);
  const set = new Set(strs);
  if (set.has('cmd')) {
    // Mac OS
    hotkeyInfo.metaKey = true;
  }
  if (set.has('ctrl')) {
    // Mac OS
    hotkeyInfo.ctrlKey = true;
  }
  if (set.has('shift')) {
    hotkeyInfo.shiftKey = true;
  }
  if (set.has('alt')) {
    hotkeyInfo.altKey = true;
  }
  return hotkeyInfoToStandardString(hotkeyInfo);
}

class HotkeyInfo {
  constructor(
    public endKey = '',
    public metaKey = false,
    public ctrlKey = false,
    public shiftKey = false,
    public altKey = false,
  ) {}
}

function evtToHotkeyInfo(evt: KeyboardEvent) {
  const info = new HotkeyInfo();
  const possHotkey = codeToHotkey.get(evt.code);
  if (!possHotkey) {
    throw new Error(`(Unknown evt code. Please add this to hotKeyUtil mapping: ${evt.code}`);
  }
  info.endKey = possHotkey;
  info.metaKey = evt.metaKey;
  info.ctrlKey = evt.ctrlKey;
  info.shiftKey = evt.shiftKey;
  info.altKey = evt.altKey;
  return info;
}

function hotkeyInfoToStandardString(info: HotkeyInfo): string {
  const strs = [];
  if (info.metaKey) { strs.push('cmd'); }
  if (info.ctrlKey) { strs.push('ctrl'); }
  if (info.altKey) { strs.push('alt');}
  if (info.shiftKey) { strs.push('shift'); }
  strs.push(info.endKey);
  return strs.join(' ');
}
