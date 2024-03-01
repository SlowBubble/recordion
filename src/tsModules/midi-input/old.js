export class MidiInput {
  constructor(midiEvtPub) {
    this.enabled = true;
    this._midiEvtPub = midiEvtPub;

    // Disable handling midi input events if the window is not in focus.
    window.addEventListener('blur', _ => {
      this.enabled = false;
    });
    window.addEventListener('focus', _ => {
      this.enabled = true;
    });
  
    if (!navigator.requestMIDIAccess) {
      console.log('WebMIDI is not supported in this browser.');
      return;
    }
    navigator.requestMIDIAccess().then(
      midiAccess => this._onMIDISuccess(midiAccess),
      err => console.warn('requestMIDIAccess failed with: ', err),
    );
  }

  _onMIDISuccess(midiAccess) {
    this._setupMidiInputs(midiAccess);
  
    midiAccess.onstatechange = evt => {
      // console.log(event.port.name, event.port.manufacturer, event.port.state);
      this._setupMidiInputs(midiAccess);
    };
  }
  
  _setupMidiInputs(midiAccess) {
    for (let input of midiAccess.inputs.values()) {
      input.onmidimessage = message => {
        if (!this.enabled) {
          return;
        }
        const midiEvt = convertToMidiEvent(message, Date.now());
        if (midiEvt) {
          this._midiEvtPub(midiEvt);
        }
      }
    }
  }
}


/** Impl */
// http://fmslogo.sourceforge.net/manual/midi-table.html
const NUM_CHANNELS = 16;
const NOTE_OFF_CHANNEL_0 = 128;
const NOTE_ON_CHANNEL_0 = 144;
const CONTROL_CHANGE_CHANNEL_0 = 176;
const PROGRAM_CHANGE_CHANNEL_0 = 192;
const DAMPER_PEDAL_DATA_BYTE = 64;

function convertToMidiEvent(message, time) {
  const statusByte = message.data[0];
  if (NOTE_OFF_CHANNEL_0 <= statusByte && statusByte < NOTE_OFF_CHANNEL_0 + NUM_CHANNELS) {
    const channelNum = statusByte - NOTE_OFF_CHANNEL_0;
    const noteNum = message.data[1];
    return new midiEvent.NoteOffEvt({time: time, noteNum: noteNum, channelNum: channelNum})
  }
  if (NOTE_ON_CHANNEL_0 <= statusByte && statusByte < NOTE_ON_CHANNEL_0 + NUM_CHANNELS) {
    const channelNum = statusByte - NOTE_ON_CHANNEL_0;
    const noteNum = message.data[1];
    const velocity = message.data[2];
    return new midiEvent.NoteOnEvt({time: time, noteNum: noteNum, velocity: velocity, channelNum: channelNum})
  }
  if (CONTROL_CHANGE_CHANNEL_0 <= statusByte && statusByte < CONTROL_CHANGE_CHANNEL_0 + NUM_CHANNELS) {
    const channelNum = statusByte - CONTROL_CHANGE_CHANNEL_0;
    const dataByte1 = message.data[1];
    if (dataByte1 == DAMPER_PEDAL_DATA_BYTE) {
      const magnitude = message.data[2];
      return midiEvent.makeDamperPedal(time, magnitude, channelNum);
    }
    // console.log('Discarding midi control change message', message);
    return;
  }
  if (PROGRAM_CHANGE_CHANNEL_0 <= statusByte && statusByte < PROGRAM_CHANGE_CHANNEL_0 + NUM_CHANNELS) {
    // console.log('Discarding midi program change message', message);
    return;
  }
  // console.warn("Unknown midi message: ", message);
}
