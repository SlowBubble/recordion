import { Recording } from "./recording";
import { MidiEvt } from "./tsModules/midi-data/midiEvt";

export class RecordingEditor {
  constructor(public recording = new Recording, public path: string = '', public enabled: boolean = true) {}

  reset() {
    this.recording = new Recording;
    const date = new Date;
    const dateStr = date.toLocaleString().replaceAll('/', '-').replaceAll(',', '');
    this.recording.title = dateStr;
    // TODO set the correct dir once we allow changing it.
    this.path = `/temp_recordings/${dateStr}`;
  }
  save() {
    if (this.recording.midiEvts.length === 0) {
      return;
    }
    localStorage.setItem(this.path, this.recording.serialize());
    console.log('saved');
  }
  deleteCurrentAndReset() {
    localStorage.removeItem(this.path);
    this.reset();
  }
  record(evt: MidiEvt) {
    if (this.enabled) {
      this.recording.midiEvts.push(evt);
    }
  }
}