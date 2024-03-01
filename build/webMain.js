(function () {
    'use strict';

    const codeToHotkey = new Map([
        ["Escape", "esc"],
        ["CapsLock", "caps"],
        ["Backspace", "backspace"],
        ["Tab", "tab"],
        ["ArrowLeft", "left"],
        ["ArrowRight", "right"],
        ["ArrowDown", "down"],
        ["ArrowUp", "up"],
        ["Enter", "enter"],
        ["MetaLeft", "cmd"],
        ["MetaRight", "cmd"],
        ["ControlLeft", "ctrl"],
        ["ControlRight", "ctrl"],
        ["AltLeft", "alt"],
        ["AltRight", "alt"],
        ["ShiftLeft", "shift"],
        ["ShiftRight", "shift"],
        ["Home", "home"],
        ["End", "end"],
        ["PageUp", "pageup"],
        ["PageDown", "pagedown"],
        ["Space", "space"],
        ["Backslash", '\\'],
        // Numeric
        ["Digit1", "1"],
        [
            "Digit2",
            "2"
        ],
        [
            "Digit3",
            "3"
        ],
        [
            "Digit4",
            "4"
        ],
        [
            "Digit5",
            "5"
        ],
        [
            "Digit6",
            "6"
        ],
        [
            "Digit7",
            "7"
        ],
        [
            "Digit8",
            "8"
        ],
        [
            "Digit9",
            "9"
        ],
        [
            "Digit0",
            "0"
        ],
        // Symbols
        [
            "Backquote",
            "`"
        ],
        [
            "Minus",
            "-"
        ],
        [
            "Equal",
            "="
        ],
        // Letters
        [
            "KeyA",
            "a"
        ],
        [
            "KeyB",
            "b"
        ],
        [
            "KeyC",
            "c"
        ],
        [
            "KeyD",
            "d"
        ],
        [
            "KeyE",
            "e"
        ],
        [
            "KeyF",
            "f"
        ],
        [
            "KeyG",
            "g"
        ],
        [
            "KeyH",
            "h"
        ],
        [
            "KeyI",
            "i"
        ],
        [
            "KeyJ",
            "j"
        ],
        [
            "KeyK",
            "k"
        ],
        [
            "KeyL",
            "l"
        ],
        [
            "KeyM",
            "m"
        ],
        [
            "KeyN",
            "n"
        ],
        [
            "KeyO",
            "o"
        ],
        [
            "KeyP",
            "p"
        ],
        [
            "KeyQ",
            "q"
        ],
        [
            "KeyR",
            "r"
        ],
        [
            "KeyS",
            "s"
        ],
        [
            "KeyT",
            "t"
        ],
        [
            "KeyU",
            "u"
        ],
        [
            "KeyV",
            "v"
        ],
        [
            "KeyW",
            "w"
        ],
        [
            "KeyX",
            "x"
        ],
        [
            "KeyY",
            "y"
        ],
        ["KeyZ", "z"],
        ['Comma', ','],
        ['Semicolon', ';'],
        ['Period', '.'],
        ['Slash', '/'],
        ['Quote', `'`],
        ['BracketLeft', `[`],
        ['BracketRight', `]`],
        ['Delete', 'delete'],
    ]);
    // 0x001C	"Enter"	"Enter"
    // 0x001D	"ControlLeft"	"ControlLeft"
    // 0x0029	"Backquote"	"Backquote"
    // 0x0037	"NumpadMultiply"	"NumpadMultiply"
    // 0x0038	"AltLeft"	"AltLeft"
    // 0x003A	"CapsLock"	"CapsLock"

    class KeyboardShortcuts {
        constructor(recordingEditor, enabled = true) {
            this.recordingEditor = recordingEditor;
            this.enabled = enabled;
            if (this.enabled) {
                window.onkeydown = (evt) => {
                    const hotkeyStr = codeToHotkey.get(evt.code);
                    if (hotkeyStr === 'enter') {
                        this.recordingEditor.reset();
                    }
                    else if (hotkeyStr === 'backspace') {
                        this.recordingEditor.deleteCurrentAndReset();
                    }
                    else ;
                };
            }
        }
    }

    class Recording {
        constructor(midiEvts = [], title = 'untitled', notes = '') {
            this.midiEvts = midiEvts;
            this.title = title;
            this.notes = notes;
        }
        serialize() {
            return JSON.stringify(this);
        }
    }

    class RecordingEditor {
        constructor(recording = new Recording, path = '', enabled = true) {
            this.recording = recording;
            this.path = path;
            this.enabled = enabled;
        }
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
        record(evt) {
            if (this.enabled) {
                this.recording.midiEvts.push(evt);
            }
        }
    }

    var MidiEvtType;
    (function (MidiEvtType) {
        MidiEvtType[MidiEvtType["NoteOn"] = 0] = "NoteOn";
        MidiEvtType[MidiEvtType["NoteOff"] = 1] = "NoteOff";
    })(MidiEvtType || (MidiEvtType = {}));
    class NoteOnEvt {
        constructor(noteNum, velocity, channelNum, time, type = MidiEvtType.NoteOn) {
            this.noteNum = noteNum;
            this.velocity = velocity;
            this.channelNum = channelNum;
            this.time = time;
            this.type = type;
        }
    }
    class NoteOffEvt {
        constructor(noteNum, channelNum, time, type = MidiEvtType.NoteOff) {
            this.noteNum = noteNum;
            this.channelNum = channelNum;
            this.time = time;
            this.type = type;
        }
    }

    class MidiInput {
        constructor(midiEvtHandler, midiAccess) {
            this.midiEvtHandler = midiEvtHandler;
            this.midiAccess = midiAccess;
        }
        onMidiEvt(midiEvtHandler) {
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
        async requestAccess() {
            try {
                this.midiAccess = await navigator.requestMIDIAccess();
                console.log('Gained access to MIDI input');
            }
            catch (err) {
                console.error(`Failed to get access to MIDI input - ${err}`);
            }
        }
        resetPublishingToHandler() {
            if (!this.midiAccess) {
                return;
            }
            this.midiAccess.inputs.forEach((entry) => {
                // @ts-ignore: VSCode has the incorrect signature for onmidimessage
                entry.onmidimessage = (event) => {
                    let str = `MIDI message received`;
                    const midiEvt = convertToMidiEvent(event, Date.now());
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
    function convertToMidiEvent(message, time) {
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
            message.data[1];
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

    // import "./tsModules/textarea-spreadsheet/tsUi"
    // import "./tsModules/music-spreadsheet/msUi"
    function main(url) {
        const mainDiv = document.getElementById('main');
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
        for (let idx = 0; idx < localStorage.length; idx++) {
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

    main();

})();
//# sourceMappingURL=webMain.js.map
