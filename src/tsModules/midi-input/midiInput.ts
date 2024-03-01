import { MidiEvt, NoteOffEvt, NoteOnEvt } from "../midi-data/midiEvt";

export class MidiInput {
  constructor(
    public midiEvtHandler?: (evt: MidiEvt) => void,
    private midiAccess?: MIDIAccess,
  ) {}

  onMidiEvt(midiEvtHandler: (evt: MidiEvt) => void) {
    this.midiEvtHandler = midiEvtHandler;
  }

  async setup() {
    await this.requestAccess();
    if (!this.midiAccess) {
      return;
    }
    this.resetPublishingToHandler();
    // Reset if someone plugs in a new instrument after setup finished running.
    this.midiAccess.onstatechange = _ => {
      // console.log(event.port.name, event.port.manufacturer, event.port.state);
      this.resetPublishingToHandler();
    };
  }
  
  private async requestAccess() {
    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      console.log('Gained access to MIDI input');
    } catch (err) {
      console.error(`Failed to get access to MIDI input - ${err}`);
    }
  }
  private resetPublishingToHandler() {
    if (!this.midiAccess) {
      return;
    }
    this.midiAccess.inputs.forEach((entry) => {
      // @ts-ignore: VSCode has the incorrect signature for onmidimessage
      entry.onmidimessage = (event: MIDIMessageEvent) => {
        let str = `MIDI message received`;
        const midiEvt = convertToMidiEvent(event, Date.now())
        console.log(str, midiEvt);
        if (this.midiEvtHandler && midiEvt) {
          this.midiEvtHandler(midiEvt);
        }
      };
    });
  }
}

/** Impl */
// http://fmslogo.sourceforge.net/manual/midi-table.html
const NUM_CHANNELS = 16;
const NOTE_OFF_CHANNEL_0 = 128;
const NOTE_ON_CHANNEL_0 = 144;
const CONTROL_CHANGE_CHANNEL_0 = 176;
const PROGRAM_CHANGE_CHANNEL_0 = 192;
// const DAMPER_PEDAL_DATA_BYTE = 64;

function convertToMidiEvent(message: MIDIMessageEvent, time: number): MidiEvt | undefined {
  const statusByte = message.data[0];
  if (NOTE_OFF_CHANNEL_0 <= statusByte && statusByte < NOTE_OFF_CHANNEL_0 + NUM_CHANNELS) {
    const channelNum = statusByte - NOTE_OFF_CHANNEL_0;
    const noteNum = message.data[1];
    return new NoteOffEvt(noteNum, channelNum, time);
  }
  if (NOTE_ON_CHANNEL_0 <= statusByte && statusByte < NOTE_ON_CHANNEL_0 + NUM_CHANNELS) {
    const channelNum = statusByte - NOTE_ON_CHANNEL_0;
    const noteNum = message.data[1];
    const velocity = message.data[2];
    return new NoteOnEvt(noteNum, velocity, channelNum, time);
  }
  if (CONTROL_CHANGE_CHANNEL_0 <= statusByte && statusByte < CONTROL_CHANGE_CHANNEL_0 + NUM_CHANNELS) {
    const channelNum = statusByte - CONTROL_CHANGE_CHANNEL_0;
    const dataByte1 = message.data[1];
    // if (dataByte1 == DAMPER_PEDAL_DATA_BYTE) {
    //   const magnitude = message.data[2];
    //   return {time: time, magnitude: magnitude, channelNum: channelNum, type: 'pedal'};
    // }
    // console.log('Discarding midi control change message', message);
    return;
  }
  if (PROGRAM_CHANGE_CHANNEL_0 <= statusByte && statusByte < PROGRAM_CHANGE_CHANNEL_0 + NUM_CHANNELS) {
    // console.log('Discarding midi program change message', message);
    return;
  }
  // console.warn("Unknown midi message: ", message);
}