export type MidiEvt = NoteOnEvt | NoteOffEvt;

export enum MidiEvtType {
  NoteOn,
  NoteOff,
}

export class NoteOnEvt {
  constructor(
    public noteNum: number,
    public velocity: number,
    public channelNum: number,
    public time: number,
    public type: MidiEvtType = MidiEvtType.NoteOn
  ) { }
}

export class NoteOffEvt {
  constructor(
    public noteNum: number,
    public channelNum: number,
    public time: number,
    public type: MidiEvtType = MidiEvtType.NoteOff
  ) { }
}

export function serializeEvts(evts: Array<MidiEvt>) {
  return JSON.stringify(evts);
}
