import { RecordingEditor } from "./recordingEditor";
import { codeToHotkey } from "./tsModules/hotkey-util/hotkeyAndCode"

export class KeyboardShortcuts {
  constructor(private recordingEditor: RecordingEditor, public enabled: boolean = true) {
    if (this.enabled) {
      window.onkeydown = (evt: KeyboardEvent) {
        const hotkeyStr = codeToHotkey.get(evt.code);
        if (hotkeyStr === 'enter') {
          this.recordingEditor.reset();
        } else if (hotkeyStr === 'backspace') {
          this.recordingEditor.deleteCurrentAndReset();
        } else if (hotkeyStr === 'space') {
        // TODO When space key is press: replay the recording.
        }
      }
    }
  }

}