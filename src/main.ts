// import "./tsModules/textarea-spreadsheet/tsUi"
// import "./tsModules/music-spreadsheet/msUi"

import { KeyboardShortcuts } from "./keyboardShortcuts";
import { RecordingEditor } from "./recordingEditor";
import { MidiInput } from "./tsModules/midi-input/midiInput";

export function main(url: string) {
  const mainDiv = document.getElementById('main') as HTMLDivElement;
  mainDiv.innerHTML = '';

  const recordingEditor = new RecordingEditor();
  recordingEditor.reset();
  // TODO move this auto-save logic into RecordingEditor, but need to clearInterval on reset.
  // or do something smarter.
  window.setInterval(() => {
    recordingEditor.save();
  }, 2000);

  const midiInput = new MidiInput;
  midiInput.setup();
  midiInput.onMidiEvt(evt => recordingEditor.record(evt));

  new KeyboardShortcuts(recordingEditor);
  const titleList = document.createElement('ol');
  for (let idx = 0; idx <localStorage.length; idx++) {  
    const key = localStorage.key(idx);
    // TODO set the correct dir once we allow changing it.
    if (!key || !key.startsWith('/temp_recordings/')) {
      continue;
    }
    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href='#${key}'>${key}</a>`;
    titleList.appendChild(listItem);
    console.log(localStorage.getItem(key));
  }
  mainDiv.appendChild(titleList);
}
