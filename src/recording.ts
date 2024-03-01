import { MidiEvt } from "./tsModules/midi-data/midiEvt";

export class Recording {
  constructor(public midiEvts: MidiEvt[] = [], public title: string = 'untitled', public notes: string = '') {}

  serialize() {
    return JSON.stringify(this);
  }
}