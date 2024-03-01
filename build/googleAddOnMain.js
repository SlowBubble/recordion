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

    function evtIsHotkey(evt, hotkeyStr) {
        return evtToStandardString(evt) === toStandardString(hotkeyStr);
    }
    function evtToStandardString(evt) {
        return hotkeyInfoToStandardString(evtToHotkeyInfo(evt));
    }
    function evtIsLikelyInput(evt) {
        return (!evt.metaKey && !evt.ctrlKey && !evt.altKey &&
            evt.key.length === 1);
    }
    // Order: cmd/ctrl/alt/shift
    function toStandardString(hotkeyStr) {
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
        constructor(endKey = '', metaKey = false, ctrlKey = false, shiftKey = false, altKey = false) {
            this.endKey = endKey;
            this.metaKey = metaKey;
            this.ctrlKey = ctrlKey;
            this.shiftKey = shiftKey;
            this.altKey = altKey;
        }
    }
    function evtToHotkeyInfo(evt) {
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
    function hotkeyInfoToStandardString(info) {
        const strs = [];
        if (info.metaKey) {
            strs.push('cmd');
        }
        if (info.ctrlKey) {
            strs.push('ctrl');
        }
        if (info.altKey) {
            strs.push('alt');
        }
        if (info.shiftKey) {
            strs.push('shift');
        }
        strs.push(info.endKey);
        return strs.join(' ');
    }

    class UndoMgr {
        constructor(currState, equalFunc) {
            this.currState = currState;
            this.equalFunc = equalFunc;
            this.statesForUndo = [];
            this.statesForRedo = [];
        }
        recordCurrState(newCurrState) {
            if (this.equalFunc(this.currState, newCurrState)) {
                return;
            }
            this.statesForUndo.push(this.currState);
            this.currState = newCurrState;
            this.statesForRedo = [];
        }
        undo() {
            const previousState = this.statesForUndo.pop();
            if (!previousState) {
                return;
            }
            this.statesForRedo.push(this.currState);
            this.currState = previousState;
            return this.currState;
        }
        redo() {
            const nextState = this.statesForRedo.pop();
            if (!nextState) {
                return;
            }
            this.statesForUndo.push(this.currState);
            this.currState = nextState;
            return this.currState;
        }
    }

    let Cell$1 = class Cell {
        constructor(text = '') {
            this.text = text;
        }
        isEmpty() {
            return this.text.trim() === '';
        }
    };

    class CopyState {
        constructor(text = '', isAnEntireLine = false) {
            this.text = text;
            this.isAnEntireLine = isAnEntireLine;
        }
    }

    const COLUMN_DELIMITER = ' | ';
    const ROW_DELIMITER = '\n';
    class TextTable {
        constructor(cells = [[new Cell$1()]], columnDelimiter = COLUMN_DELIMITER) {
            this.cells = cells;
            this.columnDelimiter = columnDelimiter;
        }
        static fromString(str, columnDelimiter = COLUMN_DELIMITER) {
            return new TextTable(stringToCells(str), columnDelimiter);
        }
        toString(trim = false) {
            return this.cells
                .map(row => row.map(cell => trim ? cell.text.trim() : cell.text)
                .join(this.columnDelimiter))
                .join(ROW_DELIMITER);
        }
        getCellsInArray() {
            return this.cells.flatMap(row => row);
        }
        // Only trim the ends in non-text mode or there will be some weird behavior when typing spaces.
        applyLint(skipCol = -1) {
            this.cells.forEach((row, i) => {
                row.forEach((cell, j) => {
                    if (j === skipCol) {
                        return;
                    }
                    cell.text = cell.text.trim();
                });
            });
            // if (trimEnds) {
            //   this.getCellsInArray().forEach(cell => cell.text = cell.text.trim());
            // }
            // Make each column have the same number of spaces
            const rowDimensions = this.cells.map(row => row.length);
            const tranposedCells = getTransposedCells(this.cells);
            const paddedCells = getTransposedCells(tranposedCells.map(colOfCells => genColOfPaddedCells(colOfCells)));
            this.cells = getSubCells(paddedCells, rowDimensions);
        }
        getCellAndInsertIfAbsent(row, col) {
            if (!this.isWithinBound(row, col)) {
                this.insertEmptyCellIfAbsent(row, col);
            }
            return this.cells[row][col];
        }
        insertEmptyCellIfAbsent(row, col) {
            while (row >= this.cells.length) {
                this.cells.push([]);
            }
            while (col >= this.cells[row].length) {
                this.cells[row].push(new Cell$1());
            }
        }
        isWithinBound(row, col) {
            if (row < 0 || row >= this.cells.length) {
                return false;
            }
            if (col < 0 || col >= this.cells[row].length) {
                return false;
            }
            return true;
        }
    }
    ////// Functional functions (i.e. no mutation)
    function getSubCells(cells, rowDimensions) {
        return cells.map((row, i) => rowDimensions[i] > 0 ? row.slice(0, rowDimensions[i]) : []);
    }
    // Take into account that each row may have a different number of columns
    // by filling in empty cells with empty strings (which will change the overall dims)
    function getTransposedCells(cells) {
        const transposedCells = [];
        const numOfColsByRow = cells.map(row => row.length);
        const maxNumOfCols = Math.max(...numOfColsByRow);
        for (let i = 0; i < maxNumOfCols; i++) {
            transposedCells.push(getColumnsOfCells(cells, i));
        }
        return transposedCells;
    }
    function stringToCells(str, columnDelimiter = COLUMN_DELIMITER) {
        return str.split(ROW_DELIMITER).map(row => row.split(columnDelimiter).map(text => new Cell$1(text)));
    }
    function getColumnsOfCells(cells, columnIdx) {
        return cells.map(row => columnIdx < row.length ? row[columnIdx] : new Cell$1(''));
    }
    function genColOfPaddedCells(colsOfCells) {
        const maxWidth = Math.max(...colsOfCells.map(c => c.text.length));
        return colsOfCells
            .map(c => c.text + ' '.repeat(maxWidth - c.text.length))
            .map(text => new Cell$1(text));
    }

    class TsCursor {
        constructor(rowIdx = 0, colIdx = 0, inTextMode = false, 
        // Relevant only in text mode
        textIdx = 0, inTextSelectionMode = false, 
        // Relevant only in text selection mode
        textEndIdx = 0) {
            this.rowIdx = rowIdx;
            this.colIdx = colIdx;
            this.inTextMode = inTextMode;
            this.textIdx = textIdx;
            this.inTextSelectionMode = inTextSelectionMode;
            this.textEndIdx = textEndIdx;
        }
        // Note that the cursor is not aware of being out-of-bound.
        // It's the responsibility of the editor to ensure that.
        moveToRightCell() {
            this.colIdx++;
            this.inTextMode = false;
        }
        moveToLeftCell() {
            this.colIdx--;
            if (this.colIdx < 0) {
                this.colIdx = 0;
            }
            this.inTextMode = false;
        }
        moveToBelowCell() {
            this.rowIdx++;
            this.inTextMode = false;
        }
        moveToAboveCell() {
            this.rowIdx--;
            if (this.rowIdx < 0) {
                this.rowIdx = 0;
            }
            this.inTextMode = false;
        }
        serialize() {
            return JSON.stringify(this);
        }
        static deserialize(str) {
            const json = JSON.parse(str);
            return new TsCursor(json.rowIdx, json.colIdx, json.inTextMode, json.textIdx, json.inTextSelectionMode, json.textEndIdx);
        }
    }

    function shouldRerenderAndPreventDefault() {
        return {
            rerender: true,
            applyBrowserDefault: false,
        };
    }
    function shouldApplyBrowserDefaultWithoutRerendering() {
        return {
            rerender: false,
            applyBrowserDefault: true,
        };
    }
    function shouldPreventDefaultWithoutRerendering() {
        return {
            rerender: false,
            applyBrowserDefault: false,
        };
    }
    class State {
        constructor(tableStr = (new TextTable().toString()), cursorStr = (new TsCursor().serialize())) {
            this.tableStr = tableStr;
            this.cursorStr = cursorStr;
        }
        static equal(a, b) {
            return a.tableStr === b.tableStr;
        }
    }
    class TsEditor {
        constructor(
        // I/O
        textarea, 
        // Model; public to allow for the lowest-level operations
        textTable = new TextTable(), cursor = new TsCursor(), keydownHandler = undefined, onRenderHandler = undefined) {
            this.textarea = textarea;
            this.textTable = textTable;
            this.cursor = cursor;
            this.keydownHandler = keydownHandler;
            this.onRenderHandler = onRenderHandler;
            // Not private because MsEditor will implement a custom paste.
            this.copyState = new CopyState();
            this.undoMgr = new UndoMgr(new State(), State.equal);
            // TODO migrate from handleTexareaKeydown to this.
            this.hotkeyToAction = new Map();
            this.textarea.onkeydown = evt => this.handleTextareaKeydown(evt);
            this.textarea.onclick = _ => this.updateCursorOnClick();
            this.textarea.ondblclick = _ => this.updateCursorOnDoubleClick();
            // For text input like shift+enter or alt+i, keydownEvt.preventDefault() does not work
            // so I have to intercept them here and revert the changes by running render().
            this.textarea.oninput = evt => {
                console.log('Reverting this input evt', evt);
                this.render();
            };
            this.textarea.onpaste = evt => this.paste(evt);
        }
        updateCursorOnClick() {
            // single click
            if (this.textarea.selectionStart === this.textarea.selectionEnd) {
                this.cursor = this.inferCursorInTextMode(this.textarea.selectionStart);
            }
            this.render();
        }
        updateCursorOnDoubleClick() {
            this.cursor = this.inferCursorInTextMode(this.textarea.selectionStart);
            this.cursor.inTextMode = false;
            this.render();
        }
        onRender(onRenderHandler) {
            this.onRenderHandler = onRenderHandler;
        }
        render() {
            // const shouldTrimEnds = !this.cursor.inTextMode;
            // this.textTable.applyLint(shouldTrimEnds);
            this.textTable.applyLint(this.cursor.colIdx);
            this.textarea.value = this.textTable.toString();
            this.updateTextareaSelectionFromCursors();
            // Must be done after all states have been updates.
            this.undoMgr.recordCurrState(this.getCurrState());
            if (this.onRenderHandler) {
                this.onRenderHandler();
            }
            console.log('rendered========');
        }
        undo() {
            const state = this.undoMgr.undo();
            if (state) {
                this.loadState(state);
            }
        }
        redo() {
            const state = this.undoMgr.redo();
            if (state) {
                this.loadState(state);
            }
        }
        getCurrState() {
            return new State(this.textTable.toString(), this.cursor.serialize());
        }
        loadState(state) {
            this.textTable = TextTable.fromString(state.tableStr);
            this.cursor = TsCursor.deserialize(state.cursorStr);
        }
        updateTextareaSelectionFromCursors() {
            this.textarea.selectionStart = this.inferSelectionStart();
            this.textarea.selectionEnd = this.inferSelectionEnd();
        }
        //// Event processing  ////
        // Allow client to specify custom keydown handler.
        onKeydown(handler) {
            this.keydownHandler = handler;
        }
        handleTextareaKeydown(evt) {
            const endKey = codeToHotkey.get(evt.code);
            if (endKey && endKeysToIgnore.has(endKey)) {
                return;
            }
            const handleKeyDown = (evt) => {
                if (this.keydownHandler) {
                    return this.keydownHandler(evt);
                }
                return this.defaultKeydownHandler(evt);
            };
            const handlerOutput = handleKeyDown(evt);
            if (!handlerOutput.applyBrowserDefault) {
                evt.preventDefault();
            }
            if (handlerOutput.rerender) {
                this.render();
            }
        }
        handleCut() {
            this.handleCopy();
            this.textTable.cells.splice(this.cursor.rowIdx, 1);
            return shouldRerenderAndPreventDefault();
        }
        handleCopy() {
            // For now, just copy an entire line, since that's my only need.
            const selectedText = this.textTable.toString().split('\n')[this.cursor.rowIdx];
            // TODO use cursor to detect this instead
            // let selectedText = this.textTable.toString();
            // if (this.textarea.selectionStart === this.textarea.selectionEnd) {
            //   selectedText = this.textTable.toString().split('\n')[this.cursor.rowIdx];
            // } else {
            //   // TODO
            // }
            navigator.clipboard.writeText(selectedText);
            // If external text and inApp text is the same use the inApp copy state for additional info.
            // Needed for pasting within the app
            this.copyState = new CopyState(selectedText, true);
            return shouldRerenderAndPreventDefault();
        }
        handleEsc() {
            this.cursor.inTextMode = false;
            return shouldRerenderAndPreventDefault();
        }
        handleTextInput(str) {
            const currCell = this.getCurrCell();
            if (!this.cursor.inTextMode) {
                currCell.text = str;
                this.cursor.inTextMode = true;
                this.cursor.textIdx = str.length;
                return shouldRerenderAndPreventDefault();
            }
            if (!this.cursor.inTextSelectionMode) {
                // TODO splice based on textIdx
                const oldText = currCell.text;
                currCell.text = oldText.slice(0, this.cursor.textIdx) + str + oldText.slice(this.cursor.textIdx);
                this.cursor.textIdx += str.length;
                return shouldRerenderAndPreventDefault();
            }
            // TODO: handle textSelectionMode
            return shouldRerenderAndPreventDefault();
        }
        defaultKeydownHandler(evt) {
            if (evtIsLikelyInput(evt)) {
                return this.handleTextInput(evt.key);
            }
            if (evtIsHotkey(evt, 'tab')) {
                this.moveToRightCell();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'shift tab')) {
                this.moveLeftOrUpAndRight();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'enter')) {
                if (!this.cursor.inTextMode) {
                    this.enterTextMode();
                    return shouldRerenderAndPreventDefault();
                }
                this.moveDownToLeftmostColumn();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'left')) {
                this.moveLeft();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'right')) {
                this.moveRight();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'up')) {
                this.moveUp();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'down')) {
                this.moveDown();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'backspace')) {
                const hasChanged = this.removeTextOrMoveBack();
                if (!hasChanged) {
                    this.moveLeftOrUpAndRight();
                }
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'cmd backspace')) {
                const hasChanged = this.removeTextOrMoveBack(true);
                if (!hasChanged) {
                    this.moveLeftOrUpAndRight();
                }
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'cmd z')) {
                this.undo();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'cmd shift z')) {
                this.redo();
                return shouldRerenderAndPreventDefault();
            }
            if (evtIsHotkey(evt, 'cmd x')) {
                return this.handleCut();
            }
            if (evtIsHotkey(evt, 'cmd c')) {
                return this.handleCopy();
            }
            if (evtIsHotkey(evt, 'esc')) {
                return this.handleEsc();
            }
            return shouldApplyBrowserDefaultWithoutRerendering();
        }
        // Must be triggered from cmd+v due to browser security.
        paste(evt) {
            evt.preventDefault();
            if (!evt.clipboardData) {
                return;
            }
            const clipboardText = evt.clipboardData.getData("text");
            if (this.textarea.value.trim().length === 0 || this.textarea.value.length === this.textarea.selectionEnd - this.textarea.selectionStart) {
                this.textTable = TextTable.fromString(clipboardText);
                this.render();
            }
            if (clipboardText === this.copyState.text) {
                // Handle paste from the app
                if (this.copyState.isAnEntireLine) {
                    const lines = this.textTable.toString().split('\n');
                    lines.splice(this.cursor.rowIdx, 0, this.copyState.text);
                    this.textTable = TextTable.fromString(lines.join('\n'));
                    this.cursor.colIdx = 0;
                    this.cursor.inTextMode = false;
                    this.render();
                }
                // TODO handle paste that is not an entire line.
                return;
            }
            // Handle paste from external sources.
        }
        handleClearAll() {
            this.textTable = new TextTable();
            this.cursor = new TsCursor();
            return shouldRerenderAndPreventDefault();
        }
        handleAddRowAbove() {
            this.textTable.cells.splice(this.cursor.rowIdx, 0, [new Cell$1()]);
            this.cursor.colIdx = 0;
            return shouldRerenderAndPreventDefault();
        }
        //removeEntireWord: removes until a space is encountered.
        // Returns whether or not there is anything removed.
        removeTextOrMoveBack(removeEntireWord = false) {
            const currCell = this.getCurrCell();
            if (this.cursor.inTextMode) {
                if (this.cursor.textIdx === 0) {
                    return false;
                }
                if (!removeEntireWord) {
                    currCell.text = currCell.text.slice(0, this.cursor.textIdx - 1) + currCell.text.slice(this.cursor.textIdx);
                    this.cursor.textIdx -= 1;
                    return true;
                }
                const tokens = currCell.text.slice(0, this.cursor.textIdx).trimEnd().split(/(\s+)/);
                const resultingSubstr = tokens.slice(0, tokens.length - 1).join('');
                currCell.text = resultingSubstr + currCell.text.slice(this.cursor.textIdx);
                this.cursor.textIdx = resultingSubstr.length;
                return true;
            }
            if (!currCell.isEmpty()) {
                currCell.text = '';
                return true;
            }
            return false;
        }
        moveLeftOrUpAndRight(removeCurrCellIfNoCellToRight = false) {
            // TODO remove the current cell there is if no more cell to the right.
            // TODO If at left boundary, move up to right most cell
            this.moveToLeftCell();
        }
        getCurrCell() {
            return this.textTable.getCellAndInsertIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
        }
        moveRight() {
            if (this.cursor.inTextMode && this.cursor.textIdx < this.getCurrCell().text.trimEnd().length) {
                this.cursor.textIdx += 1;
                return;
            }
            this.moveToRightCell();
        }
        moveToRightCell() {
            this.cursor.moveToRightCell();
            this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
        }
        moveLeft() {
            if (this.cursor.inTextMode && this.cursor.textIdx > 0) {
                this.cursor.textIdx -= 1;
                return;
            }
            this.moveToLeftCell();
        }
        moveToLeftCell() {
            this.cursor.moveToLeftCell();
            this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
        }
        moveUp() {
            this.cursor.moveToAboveCell();
            this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
        }
        moveDown() {
            this.cursor.moveToBelowCell();
            this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
        }
        moveDownToLeftmostColumn() {
            this.cursor.moveToBelowCell();
            this.cursor.colIdx = 0;
            this.textTable.insertEmptyCellIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
        }
        enterTextMode() {
            this.cursor.inTextMode = true;
            const currCell = this.textTable.getCellAndInsertIfAbsent(this.cursor.rowIdx, this.cursor.colIdx);
            this.cursor.textIdx = currCell.text.trimEnd().length;
        }
        // Helpers
        inferSelectionStart() {
            let idx = 0;
            const text = this.textarea.value;
            text.split(ROW_DELIMITER).forEach((line, i) => {
                if (i > this.cursor.rowIdx) {
                    return;
                }
                if (i === this.cursor.rowIdx) {
                    const row = line.split(COLUMN_DELIMITER);
                    row.forEach((cellText, j) => {
                        if (j > this.cursor.colIdx) {
                            return;
                        }
                        if (j === this.cursor.colIdx) {
                            if (this.cursor.inTextMode) {
                                idx += this.cursor.textIdx;
                            }
                            return;
                        }
                        idx += cellText.length;
                        if (j < row.length - 1) {
                            idx += COLUMN_DELIMITER.length;
                        }
                    });
                    return;
                }
                idx += line.length + ROW_DELIMITER.length;
            });
            return idx;
        }
        inferSelectionEnd() {
            let idx = this.inferSelectionStart();
            if (this.cursor.inTextMode) {
                if (this.cursor.inTextSelectionMode) {
                    return idx + this.cursor.textEndIdx;
                }
                return idx;
            }
            if (!this.textTable.isWithinBound(this.cursor.rowIdx, this.cursor.colIdx)) {
                return idx;
            }
            const currCell = this.textTable.cells[this.cursor.rowIdx][this.cursor.colIdx];
            // add one so that for zero length text, user can still see the cell selected.
            const textLength = currCell.text.trimEnd().length;
            if (textLength === 0) {
                return idx + 1;
            }
            return idx + textLength;
        }
        inferCursorInTextMode(selectionStart) {
            let rowIdx = 0;
            let colIdx = 0;
            let textIdx = 0;
            let accumulatedTextLength = 0;
            this.textTable.cells.forEach((row, i) => {
                row.forEach((cell, j) => {
                    // console.log(i, j, accumulatedTextLength, selectionStart);
                    const cellTextLength = cell.text.length;
                    // COLUMN_DELIMITER.length must be 3 for this hack to work.
                    // - 1 because we want to include the case where the click happens near the right of " | ".
                    if (accumulatedTextLength <= selectionStart || (accumulatedTextLength - 1 === selectionStart && j > 0)) {
                        rowIdx = i;
                        colIdx = j;
                        // COLUMN_DELIMITER.length must be 3 for this hack to work.
                        // Can exceed cellTextLength if clicking near the left of " | ".
                        // Can drop to -1 if near the right of " | ".
                        textIdx = Math.min(Math.max(0, selectionStart - accumulatedTextLength), cell.text.trimEnd().length);
                    }
                    accumulatedTextLength += cellTextLength;
                    if (j < row.length - 1) {
                        accumulatedTextLength += COLUMN_DELIMITER.length;
                    }
                });
                accumulatedTextLength += ROW_DELIMITER.length;
            });
            return new TsCursor(rowIdx, colIdx, true, textIdx);
        }
    }
    const endKeysToIgnore = new Set(['shift', 'alt', 'cmd', 'ctrl', 'meta']);

    class TsUi extends HTMLElement {
        constructor(tsEditor) {
            super();
            this.tsEditor = tsEditor;
        }
        connectedCallback() {
            const shadowRoot = this.attachShadow({ mode: 'open' });
            const textarea = document.createElement('textarea');
            textarea.id = 'editing-textarea';
            textarea.style.width = '100%';
            textarea.style.fontSize = '16px';
            textarea.rows = 10;
            textarea.spellcheck = false;
            textarea.autofocus = true;
            shadowRoot.appendChild(textarea);
            this.tsEditor = new TsEditor(textarea);
        }
    }
    customElements.define('textarea-spreadsheet-ui', TsUi);

    // NOTE: this library only works for source url that doesn't have any query param
    // i.e. ?a=b. Instead it should use #a=b
    // If you have to use ?, such as for local file, then?
    // Pure functions
    function addKeyValToUrl(startingUrl, key, val) {
        const url = toInternalUrl(startingUrl);
        if (val !== undefined) {
            url.searchParams.set(key, val);
        }
        else {
            url.searchParams.delete(key);
        }
        return toExternalUrlStr(url);
    }
    function toInternalUrl(externalUrlStr) {
        if (externalUrlStr.includes('?')) {
            // throw `URL should not contain ?: ${externalUrlStr}`;
            console.warn(`URL should not contain ?: ${externalUrlStr}`);
            externalUrlStr = externalUrlStr.replace('?', '');
        }
        return new URL(externalUrlStr.replace('#', '?'));
    }
    function toExternalUrlStr(internalUrl) {
        internalUrl.searchParams.sort();
        return internalUrl.href.replace('?', '#');
    }
    function getUrlParamsMapFromString(urlStr) {
        const keyVals = new Map();
        if (!urlStr) {
            return keyVals;
        }
        const url = toInternalUrl(urlStr);
        url.searchParams.forEach(function (value, key) {
            keyVals.set(key, value);
        });
        return keyVals;
    }
    // Impure functions based on the document url and can mutate the document.
    function setUrlParam(key, val) {
        const externalUrlStr = addKeyValToUrl(document.URL, key, val);
        window.location.hash = externalUrlStr.includes('#') ? externalUrlStr.split('#')[1] : '';
    }

    // The text index will be on the right of any spaces
    function getTextIdxOnTheLeft(text, currTextIdx) {
        const tokenInfos = getTokenInfos(text);
        const idx = getTokenInfosContainingCurrTextIdx(tokenInfos, currTextIdx);
        if (idx <= 0) {
            return 0;
        }
        return tokenInfos[idx].startIdx;
    }
    // The text index will be on the right of any spaces
    function getTextIdxOnTheRight(text, currTextIdx) {
        const tokenInfos = getTokenInfos(text);
        const idx = getTokenInfosContainingCurrTextIdx(tokenInfos, currTextIdx);
        if (tokenInfos.length === 0) {
            return 0;
        }
        return tokenInfos[idx + 1].endIdx;
    }
    function getTokenInfos(text) {
        let idx = 0;
        // Split so that 'A B C ' becomes ['A ', 'B ', 'C ']
        return text.split(/(?!\s+)/).map(token => {
            const oldIdx = idx;
            idx += token.length;
            return {
                string: token,
                startIdx: oldIdx,
                endIdx: idx,
            };
        });
    }
    // (---](--](--x--] --> tokenInfosIdxContainingCurrTextIdx is 2
    function getTokenInfosContainingCurrTextIdx(tokenInfos, currTextIdx) {
        for (let tokenInfoIdx = 0; tokenInfoIdx < tokenInfos.length; tokenInfoIdx++) {
            const tokenStartingIdx = tokenInfos[tokenInfoIdx].startIdx;
            if (currTextIdx <= tokenStartingIdx) {
                return tokenInfoIdx - 1;
            }
        }
        return tokenInfos.length - 1;
    }

    function rowHasChord(row) {
        return row.some(cell => cell.text.includes('Chord:'));
    }
    function rowHasVoice(row) {
        if (row.every(cell => !cell.text.includes(':'))) {
            return true;
        }
        return row.some(cell => cell.text.includes('Voice:'));
    }
    function cleanup(row) {
        return row.map(cell => cell.text.replace(/;/g, '|').replace(/.*:/g, '').trim());
    }
    function getVoiceRows(rows) {
        const res = rows.filter(rowHasVoice);
        if (res.length === 0) {
            return [['', '_']];
        }
        return res.map(row => cleanup(row));
    }
    function getChordRows(rows) {
        const res = rows.filter(rowHasChord);
        if (res.length === 0) {
            return [['', '_']];
        }
        return res.map(row => cleanup(row));
    }
    function rowHasTitle(row) {
        return row.some(cell => cell.text.includes('Title:'));
    }
    function getInitialHeaders(rows) {
        const res = [];
        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            const row = rows[rowIdx];
            if (rowHasChord(row) || rowHasVoice(row)) {
                return res;
            }
            if (rowHasTitle(row)) {
                continue;
            }
            res.push(row.map(cell => cell.text));
        }
        return res;
    }

    function genMidiChordSheetLink(textTable) {
        const json = textTableToGridData(textTable);
        const jsonStr = JSON.stringify(json);
        return jsonStringToLink(jsonStr, getTitle(textTable));
    }
    function textTableToGridData(textTable) {
        const res = [
            ['', 'Key: C'],
            ['', 'Tempo: 180'],
        ];
        res.push(...getInitialHeaders(textTable.cells));
        res.push(['', 'Part: A']);
        res.push(...getChordRows(textTable.cells));
        res.push(['', 'Voice: A']);
        res.push(...getVoiceRows(textTable.cells));
        return res;
    }
    function jsonStringToLink(jsonStr, title) {
        const baseLink = 'https://slowbubble.github.io/MidiChordSheet/';
        return `${baseLink}#displayNotes=1&title=${title}&data=${encodeURIComponent(jsonStr)}`;
    }
    function getTitle(textTable) {
        const cell = getTitleCell(textTable);
        return cell ? cell.text.replace('Title:', '').trim() : 'Untitled';
    }
    function getTitleCell(textTable) {
        let resCell = null;
        textTable.getCellsInArray().forEach(cell => {
            if (cell.text.startsWith('Title:')) {
                resCell = cell;
            }
        });
        return resCell;
    }

    const keyToNoteNum = new Map([
        ["'", 41],
        ['/', 42],
        [';', 43],
        ['.', 44],
        ['l', 45],
        [',', 46],
        ['k', 47],
        ['j', 48],
        ['n', 49],
        ['h', 50],
        ['b', 51],
        ['g', 52],
        ['f', 53],
        ['c', 54],
        ['d', 55],
        ['x', 56],
        ['s', 57],
        ['z', 58],
        ['a', 59],
        ['1', 60],
        ['q', 61],
        ['2', 62],
        ['w', 63],
        ['3', 64],
        ['4', 65],
        ['r', 66],
        ['5', 67],
        ['t', 68],
        ['6', 69],
        ['y', 70],
        ['7', 71],
        ['8', 72],
        ['i', 73],
        ['9', 74],
        ['o', 75],
        ['0', 76],
        ['-', 77],
        ['[', 78],
        ['=', 79],
        [']', 80],
    ]);
    function mapKeyToNoteNum(key) {
        return keyToNoteNum.get(key);
    }

    const modNoteNumToAbc = new Map([
        [0, 'C'],
        [1, 'C#'],
        [2, 'D'],
        [3, 'Eb'],
        [4, 'E'],
        [5, 'F'],
        [6, 'F#'],
        [7, 'G'],
        [8, 'G#'],
        [9, 'A'],
        [10, 'Bb'],
        [11, 'B'],
    ]);
    function noteNumToAbc$1(noteNum) {
        const possibleStr = modNoteNumToAbc.get(mod$2(noteNum, 12));
        if (!possibleStr) {
            throw new Error('Invalid noteNum: ' + noteNum);
        }
        const numOctaveAboveMiddleC = Math.floor((noteNum - 60) / 12);
        if (numOctaveAboveMiddleC < 0) {
            return '/'.repeat(-numOctaveAboveMiddleC) + possibleStr;
        }
        return '\\'.repeat(numOctaveAboveMiddleC) + possibleStr;
    }
    function mod$2(a, b) {
        return (a % b + b) % b;
    }

    class MsEditor {
        constructor(tsEditor) {
            this.tsEditor = tsEditor;
            this.buffer = [];
            this.hotkeyToAction = new Map();
            // The boolean is to signal whether or not to re-render
            this.hotkeyToMagicAction = new Map();
            this.customHotkeyToAction = new Map();
            this.useMagicModeWhenInVoiceCell = true;
            this.numFullBarsPerRow = 4;
            this.magicDelayMs = 100;
            this.tsEditor.onKeydown(evt => this.handleKeyDown(evt));
            this.hotkeyToMagicAction.set('space', _ => this.handleAddProtraction());
            this.hotkeyToMagicAction.set('`', _ => this.handleBacktick());
            this.hotkeyToMagicAction.set('tab', _ => this.handleTab());
            this.hotkeyToAction.set('alt q', _ => this.tsEditor.handleClearAll());
            this.hotkeyToAction.set('up', evt => this.tsEditor.defaultKeydownHandler(evt));
            this.hotkeyToAction.set('down', evt => this.tsEditor.defaultKeydownHandler(evt));
            // TODO impl custom logic
            this.hotkeyToAction.set('shift tab', evt => this.tsEditor.defaultKeydownHandler(evt));
            this.hotkeyToAction.set('cmd shift z', evt => this.tsEditor.defaultKeydownHandler(evt));
            this.hotkeyToAction.set('left', _ => this.handleLeft());
            this.hotkeyToAction.set('right', _ => this.handleRight());
            // this.hotkeyToAction.set('backspace', _ => this.handleBackspace());
            this.hotkeyToAction.set('enter', _ => this.handleEnter());
            this.hotkeyToAction.set('alt c', _ => this.handleAddChordRow(true));
            this.hotkeyToAction.set('alt up', _ => this.handleAddChordRow(true));
            this.hotkeyToAction.set('alt down', _ => this.handleAddChordRow());
            this.hotkeyToAction.set('tab', _ => this.handleTab());
            this.hotkeyToAction.set('alt shift t', _ => this.handleTitleChange());
            this.hotkeyToAction.set('alt d', _ => this.handleDeleteRow());
        }
        isInVoiceCell() {
            const row = this.tsEditor.textTable.cells[this.tsEditor.cursor.rowIdx];
            if (!row) {
                return true;
            }
            return rowHasVoice(row);
        }
        handleTitleChange() {
            const currTitle = getTitle(this.tsEditor.textTable);
            const title = prompt('Enter a title:', currTitle);
            if (!title) {
                return shouldRerenderAndPreventDefault();
            }
            const titleCell = getTitleCell(this.tsEditor.textTable);
            const text = `Title: ${title}`;
            if (titleCell) {
                titleCell.text = text;
            }
            else {
                this.tsEditor.textTable.cells.splice(0, 0, [new Cell$1(), new Cell$1(text)]);
                this.tsEditor.cursor.rowIdx = 0;
                this.tsEditor.cursor.colIdx = 1;
            }
            return shouldRerenderAndPreventDefault();
        }
        handleDeleteRow() {
            const rowIdx = this.tsEditor.cursor.rowIdx;
            if (this.tsEditor.textTable.cells.length <= 1) {
                this.tsEditor.textTable = new TextTable();
            }
            else {
                this.tsEditor.textTable.cells.splice(rowIdx, 1);
            }
            if (this.tsEditor.cursor.rowIdx >= this.tsEditor.textTable.cells.length) {
                this.tsEditor.cursor.rowIdx = this.tsEditor.textTable.cells.length - 1;
            }
            this.tsEditor.cursor.colIdx = 0;
            return shouldRerenderAndPreventDefault();
        }
        handleAddChordRow(aboveInsteadOfBelow = false) {
            const rowIdx = aboveInsteadOfBelow ?
                this.tsEditor.cursor.rowIdx : this.tsEditor.cursor.rowIdx + 1;
            this.tsEditor.textTable.cells.splice(rowIdx, 0, [new Cell$1('Chord:'), new Cell$1()]);
            this.tsEditor.cursor.colIdx = 1;
            if (!aboveInsteadOfBelow) {
                this.tsEditor.cursor.rowIdx++;
            }
            return shouldRerenderAndPreventDefault();
        }
        getMidiChordSheetLink() {
            return genMidiChordSheetLink(this.tsEditor.textTable);
        }
        getMelodocLink() {
            let baseLink = 'https://slowbubble.github.io/melodoc/';
            // Uncomment the line below if you need to test the web app locally from the add-on generated link.
            // baseLink = 'http://localhost:8000/';
            const textContent = this.tsEditor.textTable.toString(true);
            return addKeyValToUrl(baseLink, 'data', textContent);
        }
        handleKeyDown(evt) {
            const evtStandardStr = evtToStandardString(evt);
            console.log('Handling hotkey: ', evtStandardStr);
            // 0. Custom hotkeys.
            const customAction = this.customHotkeyToAction.get(evtStandardStr);
            if (customAction) {
                console.log('0. Custom hotkeys.');
                const output = customAction(evt);
                if (!output || output instanceof Promise) {
                    return shouldPreventDefaultWithoutRerendering();
                }
                return output;
            }
            // 1. Browser default hotkeys.
            if (evtIsHotkey(evt, 'cmd r')) {
                console.log('1. Browser default hotkeys.');
                return shouldApplyBrowserDefaultWithoutRerendering();
            }
            const inMagicMode = this.isInVoiceCell() && this.useMagicModeWhenInVoiceCell && (this.hotkeyToMagicAction.get(evtStandardStr) || isMagicNoteInput(evt));
            // 2. Magic/delayed hotkeys take precedence over non-delayed hotkeys.
            if (inMagicMode) {
                console.log('2. magic action');
                this.buffer.push(evt);
                window.setTimeout(() => this.magicHandle(), this.magicDelayMs);
                // No-op because we will handle it in handleKeyDownAfterReordering.
                return shouldPreventDefaultWithoutRerendering();
            }
            // 3. Non-delayed hotkeys.
            const action = this.hotkeyToAction.get(evtStandardStr);
            if (action) {
                console.log('3. msEditor action');
                return action(evt);
            }
            // 4. Fall-back to tsEditor default.
            // if (!evtIsLikelyInput(evt)) {
            if (!inMagicMode) {
                console.log('4. tsEditor action');
                return this.tsEditor.defaultKeydownHandler(evt);
            }
            // 5. No-op
            console.log('5. No-op');
            return shouldPreventDefaultWithoutRerendering();
        }
        magicHandle() {
            // Special keys should come before other keys
            this.buffer.sort((evt1, evt2) => {
                const isSpecialKey = evtIsHotkey(evt1, 'tab') || evtIsHotkey(evt1, '`');
                const isSpecialKey2 = evtIsHotkey(evt2, 'tab') || evtIsHotkey(evt2, '`');
                if (!isSpecialKey && isSpecialKey2) {
                    return 1;
                }
                return -1;
            });
            let rerender = false;
            this.buffer.forEach(evt => {
                const magicAction = this.hotkeyToMagicAction.get(evtToStandardString(evt));
                if (magicAction) {
                    const output = magicAction(evt);
                    rerender || (rerender = output.rerender);
                }
                const output = this.handleNoteInput(evt);
                rerender || (rerender = output.rerender);
            });
            this.buffer = [];
            if (rerender) {
                this.tsEditor.render();
            }
        }
        // handleBackspace() {
        //   const hasChanged = this.tsEditor.removeTextOrMoveBack(true);
        //   if (!hasChanged) {
        //     this.moveLeftOrUpRightWhereTextExists(true);
        //   };
        //   return shouldRerenderAndPreventDefault();
        // }
        handleEnter() {
            if (!this.tsEditor.cursor.inTextMode) {
                this.tsEditor.enterTextMode();
            }
            else {
                this.handleTab();
            }
            return shouldRerenderAndPreventDefault();
        }
        handleNoteInput(evt) {
            if (evtIsLikelyInput(evt)) {
                const possNoteNum = mapKeyToNoteNum(evt.key);
                if (possNoteNum) {
                    const abc = noteNumToAbc$1(possNoteNum);
                    this.handleTextInputWithPadding(abc);
                    return shouldRerenderAndPreventDefault();
                }
            }
            return shouldPreventDefaultWithoutRerendering();
        }
        handleBacktick() {
            const numDividersInCell = (this.tsEditor.getCurrCell().text.match(/;/g) || []).length;
            // TODO Use meterDenom - 1 instead of 3.
            const hasEnoughDividers = numDividersInCell === 3;
            if (hasEnoughDividers) {
                return this.handleTab();
            }
            return this.handleAddDivider();
        }
        // Move left if there is text in any cells in the left.
        // Otherwise, move up one row to the right-most cell with content
        moveLeftOrUpRightWhereTextExists(removeCurrCellIfNonEssential = false) {
            const oldRowIdx = this.tsEditor.cursor.rowIdx;
            const oldColIdx = this.tsEditor.cursor.colIdx;
            const currRow = this.tsEditor.textTable.cells[oldRowIdx];
            const textExistsInTheLeft = currRow.slice(0, oldColIdx).some(cell => !cell.isEmpty());
            if (oldColIdx > 1 || textExistsInTheLeft) {
                this.tsEditor.moveToLeftCell();
                if (removeCurrCellIfNonEssential) {
                    // Remove the cells to the right of the cursor.
                    const hasThingsToTheRight = currRow.slice(oldColIdx).some(cell => !cell.isEmpty());
                    if (!hasThingsToTheRight) {
                        this.tsEditor.textTable.cells[oldRowIdx] = currRow.slice(0, oldColIdx);
                    }
                }
                return;
            }
            if (this.tsEditor.cursor.rowIdx === 0) {
                return;
            }
            this.tsEditor.cursor.rowIdx -= 1;
            if (removeCurrCellIfNonEssential) {
                // Remove the entire row if nothing is below it.
                const rowsBelow = this.tsEditor.textTable.cells.slice(oldRowIdx);
                const hasStuffBelow = rowsBelow.some(row => row.some(cell => !cell.isEmpty()));
                if (!hasStuffBelow) {
                    this.tsEditor.textTable.cells = this.tsEditor.textTable.cells.slice(0, oldRowIdx);
                }
            }
            this.tsEditor.cursor.colIdx = this.numFullBarsPerRow;
            // const newRow = this.tsEditor.textTable.cells[this.tsEditor.cursor.rowIdx];
            // for (let idx = newRow.length - 1; idx >= 0; idx--) {
            //   if (!newRow[idx].isEmpty()) {
            //     this.tsEditor.cursor.colIdx = idx;
            //     return;
            //   }
            // }
            // this.tsEditor.cursor.colIdx = 0;
        }
        handleLeft() {
            if (this.tsEditor.cursor.inTextMode && this.tsEditor.cursor.textIdx > 0) {
                this.tsEditor.cursor.textIdx = getTextIdxOnTheLeft(this.tsEditor.getCurrCell().text, this.tsEditor.cursor.textIdx);
                return shouldRerenderAndPreventDefault();
            }
            this.tsEditor.moveToLeftCell();
            return shouldRerenderAndPreventDefault();
        }
        handleRight() {
            const text = this.tsEditor.getCurrCell().text;
            if (this.tsEditor.cursor.inTextMode && this.tsEditor.cursor.textIdx < text.length) {
                this.tsEditor.cursor.textIdx = getTextIdxOnTheRight(text, this.tsEditor.cursor.textIdx);
                return shouldRerenderAndPreventDefault();
            }
            if (this.tsEditor.cursor.colIdx === this.numFullBarsPerRow) {
                return shouldRerenderAndPreventDefault();
            }
            this.tsEditor.moveToRightCell();
            return shouldRerenderAndPreventDefault();
        }
        handleTab() {
            if (this.tsEditor.cursor.colIdx < this.numFullBarsPerRow) {
                this.tsEditor.moveToRightCell();
                return shouldRerenderAndPreventDefault();
            }
            this.tsEditor.moveDownToLeftmostColumn();
            // Move right before the left-most cell is the pick-up bar.
            this.tsEditor.moveToRightCell();
            return shouldRerenderAndPreventDefault();
        }
        handleAddDivider() {
            return this.handleTextInputWithPadding(';');
        }
        handleAddProtraction() {
            return this.handleTextInputWithPadding('_');
        }
        handleTextInputWithPadding(text) {
            const cursor = this.tsEditor.cursor;
            let paddedText = ` ${text} `;
            if (!cursor.inTextMode || cursor.textIdx === 0) {
                paddedText = `${text} `;
            }
            else if (this.tsEditor.getCurrCell().text.slice(cursor.textIdx - 1, cursor.textIdx) === ' ') {
                paddedText = `${text} `;
            }
            return this.tsEditor.handleTextInput(paddedText);
        }
    }
    function isMagicNoteInput(evt) {
        if (isPossHotkey(evt)) {
            return false;
        }
        return mapKeyToNoteNum(evt.key) !== undefined;
    }
    function isPossHotkey(evt) {
        return evt.metaKey || evt.ctrlKey || evt.altKey || evt.shiftKey;
    }

    class MsUi extends HTMLElement {
        constructor(msEditor, renderHandler = null) {
            super();
            this.msEditor = msEditor;
            this.renderHandler = renderHandler;
        }
        connectedCallback() {
            const shadowRoot = this.attachShadow({ mode: 'open' });
            const tsUi = document.createElement('textarea-spreadsheet-ui');
            shadowRoot.appendChild(tsUi);
            const div = document.createElement('div');
            div.innerHTML = html$1;
            shadowRoot.appendChild(div);
            const iframe = shadowRoot.getElementById('sheet-music-iframe');
            this.msEditor = new MsEditor(tsUi.tsEditor);
            tsUi.tsEditor.onRender(() => {
                iframe.src = this.msEditor.getMidiChordSheetLink();
                if (this.renderHandler) {
                    this.renderHandler();
                }
            });
        }
        onRender(renderHandler) {
            this.renderHandler = renderHandler;
        }
    }
    const html$1 = `
<iframe id="sheet-music-iframe"
    title="Sheet Music"
    width="100%"
    height="450">
</iframe>
`;
    customElements.define('music-spreadsheet-ui', MsUi);

    function mod$1(x, y) {
      return ((x % y) + y) % y;
    }

    function gcd$1(x, y) {
      x = Math.abs(x);
      y = Math.abs(y);
      while(y) {
        var t = y;
        y = x % y;
        x = t;
      }
      return x;
    }

    /**
     * @fileoverview Description of this file.
     */

    function makeFrac(numer, denom) {
      if (isNaN(denom)) {
        denom = 1;
      }
      return new Frac$1({numer: numer, denom: denom});
    }

    let Frac$1 = class Frac {
      constructor({numer = 0, denom = 1}) {
        if (isNaN(numer)) {
          throw 'numerator is NaN';
        }
        if (isNaN(denom)) {
          throw 'denominator is NaN';
        }
        if (denom == 0) {
          throw new Error("denominator must be non-zero.");
        }
        // Obtaining a unique rep.
        if (denom < 0) {
          numer = -numer;
          denom = -denom;
        }
        const gcd = gcd$1(numer, denom);
        this.numer = numer / gcd;
        this.denom = denom / gcd;
      }

      getDenom() {
        return this.denom;
      }

      getNumer() {
        return this.numer;
      }

      isWhole() {
        return this.denom === 1;
      }

      plus(f2) {
        const f1 = this;
        f2 = typeof f2 === 'number' ? makeFrac(f2) : f2;
        return new Frac({
          numer: f1.numer * f2.denom + f2.numer * f1.denom,
          denom: f1.denom * f2.denom,
        });
      }

      minus(f2) {
        const f1 = this;
        f2 = typeof f2 === 'number' ? makeFrac(f2) : f2;
        return f1.plus(f2.negative());
      }

      times(f2) {
        const f1 = this;
        f2 = typeof f2 === 'number' ? makeFrac(f2) : f2;
        return new Frac({
          numer: f1.numer * f2.numer,
          denom: f1.denom * f2.denom,
        });
      }

      over(f2) {
        const f1 = this;
        f2 = typeof f2 === 'number' ? makeFrac(f2) : f2;
        return new Frac({
          numer: f1.numer * f2.denom,
          denom: f1.denom * f2.numer,
        });
      }

      negative() {
        return new Frac({
          numer: -this.numer,
          denom: this.denom,
        });
      }

      toString() {
        return `${this.numer}/${this.denom}`;
      }

      toFloat() {
        return this.numer / this.denom;
      }

      equals(frac2) {
        frac2 = typeof frac2 === 'number' ? makeFrac(frac2) : frac2;
        return this.numer === frac2.numer && this.denom === frac2.denom;
      }

      lessThan(frac2) {
        // Assumes that denom is > 0 always.
        frac2 = typeof frac2 === 'number' ? makeFrac(frac2) : frac2;
        return this.numer * frac2.denom < frac2.numer * this.denom;
      }
      leq(frac2) {
        return this.lessThan(frac2) || this.equals(frac2);
      }

      geq(frac2) {
        return !this.lessThan(frac2);
      }

      greaterThan(frac2) {
        return !this.leq(frac2);
      }

      weaklyInside(left, right) {
        return left.leq(this) && this.leq(right);
      }

      strictlyInside(left, right) {
        return left.lessThan(this) && this.lessThan(right);
      }

      fractionalPart() {
        return this.minus(this.wholePart());
      }

      wholePart() {
        return Math.floor(this.toFloat());
      }
    };

    const Intervals = Object.freeze({
      P1: 0,
      m2: 1,
      M2: 2,
      m3: 3,
      M3: 4,
      P4: 5,
      s4: 6,
      tritone: 6,
      b5: 6,
      P5: 7,
      s5: 8,
      m6: 8,
      M6: 9,
      m7: 10,
      M7: 11,
      P8: 12,
      octave: 12,
      b9: 13,
      M9: 14,
      s9: 15,
      P11: 17,
      s11: 18,
      b13: 20,
      M13: 21,
    });

    function range$1(start, end, step) {
      step = step || 1;
      const res = [];
      for (let i = start; i < end; i += step) {
        res.push(i);
      }
      return res;
    }

    function chunkArray(arr, isNextChunkFunc) {
      const res = [];
      let currChunk = [];
      arr.forEach((item, idx) => {
        if (isNextChunkFunc(item, currChunk, idx)) {
          if (currChunk.length > 0) {
            res.push(currChunk);
          }
          currChunk = [item];
          return;
        }
        currChunk.push(item);
      });
      if (currChunk.length > 0) {
        res.push(currChunk);
      }
      return res;
    }

    /**
     * Shuffles array in place. ES6 version
     * @param {Array} a items An array containing the items.
     */
    function shuffle$1(a) {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function fromNoteNum$1(num) {
      let mapping = {
        1: makeSpelling('C', 1),
        3: makeSpelling('E', -1),
        6: makeSpelling('F', 1),
        8: makeSpelling('A', -1),
        10: makeSpelling('B', -1),
      };
      mapping = Object.assign(mapping, getNoteNumToNoAccidSpelling$1());
      return fromNoteNumWithMapping$1(num, mapping);
    }
    function fromNoteNumWithFlat$1(num) {
      let mapping = {
        1: makeSpelling('D', -1),
        3: makeSpelling('E', -1),
        6: makeSpelling('G', -1),
        8: makeSpelling('A', -1),
        10: makeSpelling('B', -1),
      };
      mapping = Object.assign(mapping, getNoteNumToNoAccidSpelling$1());

      return fromNoteNumWithMapping$1(num, mapping);
    }

    function fromNoteNumWithSharp$1(num) {
      let mapping = {
        1: makeSpelling('C', 1),
        3: makeSpelling('D', 1),
        6: makeSpelling('F', 1),
        8: makeSpelling('G', 1),
        10: makeSpelling('A', 1),
      };
      mapping = Object.assign(mapping, getNoteNumToNoAccidSpelling$1());

      return fromNoteNumWithMapping$1(num, mapping);
    }

    function fromNoteNumWithChord$1(num, chord) {
      if (!chord) {
        return fromNoteNum$1(num);
      }

      let mappingInC = getStandardMappingInC$1();
      if (chord.isDiminished()) {
        mappingInC = getDiminishedMappingInC$1();
      }
      if (chord.isAugmented()) {
        mappingInC[8] = makeSpelling('G', 1);
      }
      const finalMapping = translateMapping$1(mappingInC, chord);
      return fromNoteNumWithMapping$1(num, finalMapping);
    }


    function makeSpelling(letter, numSharps, hasNatural) {
      return new Spelling$1({letter: letter, numSharps: numSharps, hasNatural: hasNatural})
    }

    let Spelling$1 = class Spelling {
      constructor({letter = 'C', numSharps = 0, hasNatural = false}) {
        this.letter = letter.toUpperCase();
        this.numSharps = numSharps;
        this.hasNatural = hasNatural;
      }

      equals(sp2) {
        return (
          this.letter === sp2.letter
          && this.numSharps === sp2.numSharps
          && this.hasNatural === sp2.hasNatural
        );
      }

      // TODO move it at an ABC-specific module.
      toAbc(octaveNum) {
        const octaveNumRelC4 = octaveNum - 4;
        return [
          this.numSharps > 0 ? '^'.repeat(this.numSharps) : '',
          this.numSharps < 0 ? '_'.repeat(-this.numSharps) : '',
          this.hasNatural ? '=' : '',
          this.letter.toUpperCase(),
          octaveNumRelC4 > 0 ? "'".repeat(octaveNumRelC4) : '',
          octaveNumRelC4 < 0 ? ",".repeat(-octaveNumRelC4) : '',
        ].join('');
      }

      toNoteNum(octaveNum) {
        octaveNum = octaveNum || 0;
        return octaveNum * 12 + letterToBaseNoteNum$1[this.letter] + this.numSharps;
      }

      toString() {
        const accidentals = this.numSharps > 0 ? '#'.repeat(this.numSharps) : 'b'.repeat(-this.numSharps);
        return `${this.letter.toUpperCase()}${accidentals}`;
      }

      // Assuming a major scale.
      // TODO do we need another arg to allow for minor scale?
      toRomanNumeralString(baseMajKey) {
        const charShift = _minus(this.letter, baseMajKey.letter);
        const numeral = {
          0: 'I',
          1: 'II',
          2: 'III',
          3: 'IV',
          4: 'V',
          5: 'VI',
          6: 'VII',
        }[charShift];
        const numSharps = this.numSharpsRelMajKey(baseMajKey);
        const prefix = numSharps > 0 ? range$1(0, numSharps).map(_ => '#').join('') : range$1(0, -numSharps).map(_ => 'b').join('');
        return `${prefix}${numeral}`
      }

      numSharpsRelMajKey(baseMajKey) {
        const charShift = _minus(this.letter, baseMajKey.letter);
        // Assuming a major scale.
        const noteNumShift = {
          0: 0,
          1: 2,
          2: 4,
          3: 5,
          4: 7,
          5: 9,
          6: 11,
        }[charShift];
        const currNoteNum = baseMajKey.toNoteNum() + noteNumShift;
        const wantNoteNum = this.toNoteNum();
        const numSharps = mod$1(wantNoteNum - currNoteNum, 12);
        if (numSharps <= 6) {
          return numSharps;
        }
        return numSharps - 12;
      }

      shift(key1, key2, minimizeNumAccidentals) {
        const noteNumShift = mod$1(key2.toNoteNum() - key1.toNoteNum(), 12);
        const charShift = _minus(key2.letter, key1.letter);
        let newLetter = this.letter;
        range$1(0, charShift).forEach(_ => {
          newLetter = getNextLetter$1(newLetter);
        });
        const targetNoteNum = this.toNoteNum() + noteNumShift;
        const possSpelling = fromNoteNumWithLetter$1(targetNoteNum, newLetter);
        if (minimizeNumAccidentals && possSpelling.toString() === 'Cb') {
          return makeSpelling('B');
        }
        if (minimizeNumAccidentals && possSpelling.toString() === 'Fb') {
          return makeSpelling('E');
        }
        if (minimizeNumAccidentals && possSpelling.toString() === 'B#') {
          return makeSpelling('C');
        }
        if (minimizeNumAccidentals && possSpelling.toString() === 'E#') {
          return makeSpelling('F');
        }
        if (Math.abs(possSpelling.numSharps) < 2) {
          return possSpelling;
        }
        if (possSpelling.numSharps >= 2) {
          return fromNoteNumWithSharp$1(targetNoteNum);
        }
        return fromNoteNumWithFlat$1(targetNoteNum);
      }
    };

    function _minus(letter1, letter2) {
      const numMusicalLetters = 7;
      return mod$1(_asciiNum(letter1) - _asciiNum(letter2), numMusicalLetters);
    }

    function _asciiNum(a) {
      return a.charCodeAt(0);
    }

    const letterToBaseNoteNum$1 = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11,
    };

    function getNoteNumToNoAccidSpelling$1(){
      return {
        0: makeSpelling('C'),
        2: makeSpelling('D'),
        4: makeSpelling('E'),
        5: makeSpelling('F'),
        7: makeSpelling('G'),
        9: makeSpelling('A'),
        11: makeSpelling('B'),
      };
    }

    function fromNoteNumWithLetter$1(num, letter) {
      const numModOctave = mod$1(num, 12);
      for (let numSharps = 0; numSharps <= 2; numSharps++) {
        const try1 = makeSpelling(letter, numSharps);
        if (mod$1(try1.toNoteNum(), 12) == numModOctave) {
          return try1;
        }
        const try2 = makeSpelling(letter, -numSharps);
        if (mod$1(try2.toNoteNum(), 12) == numModOctave) {
          return try2;
        }
      }
      console.warn(
        'Unable to find spelling with les than 3 accidentals from note number for letter.',
        num, letter);
      return fromNoteNum$1(num);
    }

    function fromNoteNumWithMapping$1(num, mapping) {
      const numModOctave = mod$1(num, 12);
      return mapping[numModOctave];
    }

    function getNextLetter$1(letter) {
      return {
        A: 'B',
        B: 'C',
        C: 'D',
        D: 'E',
        E: 'F',
        F: 'G',
        G: 'A',
      }[letter];
    }

    function translateMapping$1(mappingInC, chord) {
      let currLetter = 'C';
      const letterRaises = [];
      range$1(0, 12).forEach(idx => {
        const nextLetter = mappingInC[idx].letter;
        letterRaises.push(nextLetter !== currLetter);
        currLetter = nextLetter;
      });
      const finalMapping = {};
      let currSpelling = chord.root;
      range$1(0, 12).forEach(idx => {
        let letterToUse = currSpelling.letter;
        if (letterRaises[idx]) {
          letterToUse = getNextLetter$1(currSpelling.letter);
        }
        const currNoteNum = mod$1(chord.root.toNoteNum() + idx, 12);
        currSpelling = fromNoteNumWithLetter$1(currNoteNum, letterToUse);
        finalMapping[currNoteNum] = currSpelling;
      });
      return finalMapping;
    }

    function getStandardMappingInC$1() {
      const mappingInC = {
        1: makeSpelling('D', -1),
        3: makeSpelling('E', -1),
        6: makeSpelling('F', 1),
        8: makeSpelling('A', -1),
        10: makeSpelling('B', -1),
      };
      return Object.assign(mappingInC, getNoteNumToNoAccidSpelling$1())
    }

    function getDiminishedMappingInC$1() {
      return {
        0: makeSpelling('C'),
        1: makeSpelling('D', -1),
        2: makeSpelling('D'),
        3: makeSpelling('E', -1),
        4: makeSpelling('F', - 1),
        5: makeSpelling('F'),
        6: makeSpelling('G', -1),
        7: makeSpelling('G'),
        8: makeSpelling('A', -1),
        9: makeSpelling('B', -2),
        10: makeSpelling('B', -1),
        11: makeSpelling('C', -1),
      }
    }

    class Chord {
      constructor({
        bass, root, quality = '', extension,
        suspension, alterations = []}) {
        this.bass = bass ? (bass instanceof Spelling$1 ? bass : new Spelling$1(bass)) : null;
        if (!root) {
          throw 'root is a required argument.'
        }
        this.root = root instanceof Spelling$1 ? root : new Spelling$1(root);
        if (this.bass && this.bass.toNoteNum() == this.root.toNoteNum()) {
          this.bass = null;
        }
        // Some external uses require major quality to be a non-empty string, but internally, we use ''.
        quality = quality || '';
        this.quality = quality == 'maj' ? '' : quality;
        this.suspension = suspension;
        this.extension = extension;
        this.alterations = alterations;
        this._altMap = {};
        alterations.forEach(item => {
          this._altMap[item.extensionNum] = item.numSharps;
        });
      }

      toString() {
        return this._toString();
      }
      toPrettyString() {
        const str = this.toString();
        return abbreviate(str);
      }
      toRomanNumeralString(baseKey) {
        const str = this._toString(baseKey);
        return abbreviateRomanNumeral(str);
      }
      _toString(baseKey) {
        const sus = (this.suspension == 4 ? 'sus' : (
          this.suspension == 2 ? 'sus2' : '')
        );
        const alt = this.alterations.map(item => {
          let prefix = item.numSharps > 0 ? '#' : (item.numSharps < 0 ? 'b' : 'add');
          if (item.extensionNum === 6 && this._toStringForExtension() === '') {
            prefix = '';
          }
          return `${prefix}${item.extensionNum}`
        }).join('');
        let bassStr = '';
        if (this.bass) {
          const bass = baseKey ? this.bass.toRomanNumeralString(baseKey) : this.bass.toString();
          bassStr = `/${bass}`;
        }
        let rootStr = this.root.toString();
        if (baseKey) {
          rootStr = this.root.toRomanNumeralString(baseKey);
          if (this.getThirdInterval() == Intervals.m3) {
            rootStr = rootStr.toLowerCase();
          }
        }
        return `${rootStr}${this.quality}${this._toStringForExtension()}${sus}${alt}${bassStr}`;
      }

      isMajor() {
        return this.getThirdInterval() == Intervals.M3 && this.getSeventhInterval() == Intervals.M7;
      }
      isDominant() {
        return this.getThirdInterval() == Intervals.M3 && this.getSeventhInterval() == Intervals.m7;
      }
      isMinor() {
        return this.getThirdInterval() == Intervals.m3 && this.getFifthInterval() == Intervals.P5;
      }
      hasExtension() {
        return this.extension || this.alterations.length;
      }
      // Both half- and full-diminished
      isDiminished() {
        return this.getThirdInterval() == Intervals.m3 && this.getFifthInterval() == Intervals.tritone;
      }
      isAugmented() {
        return this.getThirdInterval() == Intervals.M3 && this.getFifthInterval() == Intervals.m6;
      }
      isHalfDiminished() {
        return this.getThirdInterval() == Intervals.m3 && this.getFifthInterval() == Intervals.tritone && this. getSeventhInterval() == Intervals.m7;
      }

      getThirdInterval() {
        if (this.suspension == 2) {
          return Intervals.M2;
        }
        if (this.suspension == 4) {
          return Intervals.P4;
        }
        if (this.quality == 'dim' || this.quality == 'm') {
          return Intervals.m3;
        }
        return Intervals.M3;
      }
      getFifthInterval() {
        if (this.quality == 'dim') {
          return Intervals.tritone;
        }
        if (this.quality == 'aug') {
          return Intervals.m6;
        }
        return Intervals.P5 + this.getAlteredAmount(5);
      }
      getSeventhInterval() {
        if (this.quality == 'dim') {
          return Intervals.M6;
        }
        if (this.suspension) {
          return Intervals.m7;
        }
        // Major chord without major 7.
        if (!this.quality && !this.extension) {
          return Intervals.M6;
        }
        if (this.extension && this.extension.isMajor7) {
          return Intervals.M7;
        }
        // minor 6th chord
        if (this.quality == 'm' && this._altMap[6] === 0) {
          return Intervals.M6;
        }
        return Intervals.m7;
      }

      getAlteredAmount(extension) {
        return this._altMap[extension] || 0;
      }

      // In order of importance
      getSpecifiedColorNoteNums(includeAll, keySig) {
        const res = new Set();
        const rootNoteNum = this.root.toNoteNum();
        const isBassNoteNum = noteNum => {
          const bassNoteNum = this.bass ? this.bass.toNoteNum() : rootNoteNum;
          return mod$1(bassNoteNum - noteNum, 12) == 0
        };
        const addToResIfNotBass = noteNum => {
          if (!isBassNoteNum(noteNum)) {
            res.add(mod$1(noteNum, 12));
          }
        };

        addToResIfNotBass(rootNoteNum + this.getThirdInterval());
      
        if (this.extension) {
          addToResIfNotBass(rootNoteNum + this.getSeventhInterval());
          if (this.extension.extensionNum === 9) {
            addToResIfNotBass(rootNoteNum + Intervals.M2);
          }
          if (this.extension.extensionNum === 11) {
            addToResIfNotBass(rootNoteNum + Intervals.P4);
          }
          if (this.extension.extensionNum === 13) {
            addToResIfNotBass(rootNoteNum + Intervals.M6);
          }
        }
        if (this.quality == 'dim' || this.quality == 'aug') {
          addToResIfNotBass(rootNoteNum + this.getFifthInterval());
        }
        Object.entries(this._altMap).forEach(([extNum, numSharps]) => {
          if (extNum === '5') {
            addToResIfNotBass(rootNoteNum + Intervals.P5 + numSharps);
          }
          if (extNum === '9') {
            addToResIfNotBass(rootNoteNum + Intervals.M2 + numSharps);
          }
          if (extNum === '11') {
            addToResIfNotBass(rootNoteNum + Intervals.P4 + numSharps);
          }
          if (extNum === '6' || extNum === '13') {
            addToResIfNotBass(rootNoteNum + Intervals.M6 + numSharps);
          }
        });
        
        if (includeAll || res.size < 2) {
          addToResIfNotBass(this.root.toNoteNum());
        }

        if (includeAll || res.size < 2) {
          addToResIfNotBass(rootNoteNum + this.getFifthInterval());
        }
        if (includeAll) {
          const isLocrian = this.isHalfDiminished();
          const isPhrygian = keySig && (this.quality === 'm' && mod$1(this.root.toNoteNum(), keySig.toNoteNum()) == Intervals.M3);
          if (!isLocrian && !isPhrygian) {
            addToResIfNotBass(rootNoteNum + Intervals.M2);
          }
        }
        if (includeAll) {
          if (this.getThirdInterval() == Intervals.m3) {
            addToResIfNotBass(rootNoteNum + Intervals.P4);
          }
        }
        // if (includeAll) {
        //   if (this.getThirdInterval() == intervals.M3 && this.getFifthInterval() != intervals.m6) {
        //     addToResIfNotBass(rootNoteNum + intervals.M6);
        //   }
        // }
        return [...res];
      }

      _toStringForExtension() {
        const ext = this.extension;
        if (!ext) {
          return '';
        }
        if (!ext.isMajor7) {
          return `${ext.extensionNum}`;
        }
        // Use `maj` when possible because is easier to read than `M`.
        return `${this.quality == '' ? 'maj' : 'M'}${ext.extensionNum}`;
      }

      // TODO Avoid mutation by implementing clone.
      // Mutate.
      shift(key1, key2) {
        this.root = this.root.shift(key1, key2, /*minimizeNumAccidentals=*/true);
        if (this.bass) {
          this.bass = this.bass.shift(key1, key2, /*minimizeNumAccidentals=*/true);
        }
      }
    }

    function abbreviate(str) {
      return str
        .replace('m7b5', 'ø7')
        .replace('dim', '°')
        .replace('maj', 'Δ')
        .replace('M', 'Δ')
        .replace('aug', '+')
        ;
    }

    // Hacks to make Roman Numeral chord more readable
    function abbreviateRomanNumeral(str) {
      return abbreviate(str)
        .replace('m', '-')
        .replace('I7', 'I 7')
        .replace('I9', 'I 9')
        .replace('I1', 'I 1')
        ;
    }

    class ChangesOverTime {
      constructor({
        changes = [],
        defaultVal = undefined,
      }) {
        if (defaultVal !== undefined) {
          this.defaultVal =  this._deserialize(defaultVal);
        }
        this.changes = changes.map(({start8n, val}) => {
          return new Change({start8n: start8n, val: this._deserialize(val)});
        });

        this._sortAndDedupChanges();
      }
      // This should be overriden.
      _deserialize(val) {
        return val;
      }
      // This should be overriden.
      _equal(a, b) {
        return a === b;
      }

      upsert(start8n, val) {
        this.changes.push({start8n: start8n, val: val});
        this._sortAndDedupChanges();
        this._dedupFirstChangeWithDefaultVal();
      }
      getChange(start8n, toTheLeft) {
        let currChange = new Change({start8n: makeFrac(0), val: this.defaultVal});
        for (const change of this.changes) {
          const usePrevChange = toTheLeft ? change.start8n.geq(start8n) : change.start8n.greaterThan(start8n);
          if (usePrevChange) {
            break;
          }
          currChange = change;
        }
        return currChange;
      }
      getChanges() {
        return this.changes;
      }
      // Remove changes if inside [start8n, end8n)
      removeWithinInterval(start8n, end8n) {
        this.changes = this.changes.filter(
          change => !(start8n.leq(change.start8n) && (!end8n || change.start8n.lessThan(end8n))));
        this._dedupFirstChangeWithDefaultVal();
      }

      _getStart8nStrToObj() {
        return _toMap(this.getChanges());
      }
      _sortAndDedupChanges() {
        this.changes.sort((a, b) => a.start8n.minus(b.start8n).toFloat());
        this.changes = this.changes.reduce((accum, currChange, idx) => {
          const prevObj = idx >= 1 ? this.changes[idx - 1].val : this.defaultVal;
          if (prevObj && this._equal(currChange.val, prevObj)) {
            return accum;
          }
          accum.push(currChange);
          return accum;
        }, []);
      }
      _dedupFirstChangeWithDefaultVal() {
        if (this.defaultVal !== undefined && this.changes.length > 0 && this._equal(this.defaultVal, this.changes[0].val)) {
          this.changes.splice(0, 1);
        }
      }
    }

    class Change {
      constructor({
        start8n,
        // This val should already be deserialized.
        val,
      }) {
        this.start8n = new Frac$1(start8n);
        this.val = val;
      }
    }

    function _toMap(changes) {
      const map = {};
      changes.forEach(({start8n, val}) => {
        map[start8n.toString()] = val;
      });
      return map;
    }

    class TimeSig {
      constructor({
        upperNumeral = 4,
        lowerNumeral = 4,
      }) {
        this.upperNumeral = upperNumeral;
        this.lowerNumeral = lowerNumeral;
      }
      equals(other) {
        return (
          this.upperNumeral == other.upperNumeral &&
          this.lowerNumeral == other.lowerNumeral);
      }
      isCompound() {
        return this.upperNumeral >= 6 && this.upperNumeral % 3 === 0;
      }
      toString() {
        return `${this.upperNumeral}/${this.lowerNumeral}`;
      }
      getDurPerMeasure8n() {
        return makeFrac(8 * this.upperNumeral, this.lowerNumeral);
      }
    }


    class TimeSigChanges extends ChangesOverTime {
      constructor({
        defaultVal = {},
        ...rest
      }) {
        super({defaultVal: defaultVal, ...rest});
      }

      _deserialize(val) {
        return new TimeSig(val);
      }
      _equal(a, b) {
        return a.equals(b);
      }
    }

    class Swing {
      constructor({
        ratio = makeFrac(1),
        dur8n = makeFrac(1),
      }) {
        this.ratio = new Frac$1(ratio);
        this.dur8n = new Frac$1(dur8n);
      }
      equals(other) {
        return (
          this.ratio.equals(other.ratio) &&
          this.dur8n.equals(other.dur8n)
        );
      }
    }
    class SwingChanges extends ChangesOverTime {
      constructor({
        defaultVal = new Swing({}),
        ...rest
      }) {
        super({defaultVal: defaultVal, ...rest});
      }
      _deserialize(val) {
        return new Swing(val);
      }
      _equal(a, b) {
        return a.equals(b);
      }
    }

    class MidiNote {
      constructor({noteNum, startTime, endTime, velocity, channelNum, spelling}) {
        this.noteNum = noteNum;
        this.startTime = startTime;
        this.endTime = endTime;
        this.velocity = velocity;
        this.channelNum = channelNum;
        this.spelling = spelling;
      }
    }

    function makeRest(start8n, end8n) {
      return new QuantizedNoteGp({
        start8n: start8n,
        end8n: end8n,
        realEnd8n: end8n,
      });
    }

    class DecoratedNoteGp {
      constructor({
        midiNotes = [],
        isGraceNote = false,
        isRollingUp = false,
        isRollingDown = false,
        isStaccato = false,
      }) {
        this.midiNotes = [];
        this.setMidiNotes(midiNotes.map(midiNote => new MidiNote(midiNote)));

        this.isGraceNote = isGraceNote;
        this.isRollingUp = isRollingUp;
        this.isRollingDown = isRollingDown;
        this.isStaccato = isStaccato;
      }

      get isRest() {
        return this.midiNotes.length == 0;
      }

      addMidiNotes(midiNotes) {
        this.setMidiNotes(this.midiNotes.concat(midiNotes));
      }

      setMidiNotes(midiNotes) {
        this.midiNotes = midiNotes;
        this.midiNotes.sort((n1, n2) => {
          return n1.noteNum - n2.noteNum;
        });
      }

      getLatestStartTime() {
        return this.midiNotes.reduce((accum, note) => {
          return Math.max(accum, note.startTime);
        }, 0);
      }

      getEarliestStartTime() {
        return this.midiNotes.reduce((accum, note) => {
          return Math.min(accum, note.startTime);
        }, Infinity);
      }

      getLatestEndTime() {
        return this.midiNotes.reduce((accum, note) => {
          return Math.max(accum, note.endTime);
        }, 0);
      }
      getEarliestEndTime() {
        return this.midiNotes.reduce((accum, note) => {
          return Math.min(accum, note.endTime);
        }, Infinity);
      }
      getNoteNums() {
        return this.midiNotes.map(note => note.noteNum);
      }
    }

    function makeSimpleQng(start8n, end8n, noteNums, velocity, spellings, channelNum) {
      noteNums = noteNums || [];
      velocity = velocity === undefined ? 120 : velocity;
      return new QuantizedNoteGp({
        start8n: start8n, end8n: end8n, realEnd8n: end8n,
        midiNotes: noteNums.map((noteNum, idx) => new MidiNote({
          noteNum: noteNum, velocity: velocity, channelNum: channelNum || 0,
          spelling: spellings ? spellings[idx] : undefined,
        })),
      });
    }

    class QuantizedNoteGp extends DecoratedNoteGp {
      constructor(obj) {
        super(obj);
        this.start8n = obj.start8n ? new Frac$1(obj.start8n) : null;
        this.end8n = obj.end8n ? new Frac$1(obj.end8n) : null;
        // This is needed for replay to be faithful to recording.
        // It can also be used for end8n after rounding up to the nearest beat.
        this.realEnd8n = obj.realEnd8n ? new Frac$1(obj.realEnd8n) : null;
        this.lyrics = obj.lyrics || '';
      }

      // isGraceNote should only be used before quantizing.
      // Once quantized, this is the definitive way to determine grace note status.
      get isLogicalGraceNote() {
        return (this.start8n && this.end8n && this.start8n.equals(this.end8n));
      }
    }

    const instruments = Object.freeze({
      electric_grand_piano: 'electric_grand_piano',
      acoustic_grand_piano: 'acoustic_grand_piano',
      electric_guitar_clean: 'electric_guitar_clean',
      // A softer but more sustained sound
      electric_piano_1: 'electric_piano_1',
      // A more electric and sustained sound
      electric_piano_2: 'electric_piano_2',
      // A percussive sound used to set the tempo
      synth_drum: 'synth_drum',
    });

    // Load more if needed later.
    [
      instruments.electric_grand_piano,
      instruments.acoustic_grand_piano,
      instruments.electric_piano_1,
      instruments.electric_piano_2,
      instruments.electric_guitar_clean,
      instruments.synth_drum,
    ];

    class VoiceSettings {
      constructor({
        volumePercent = 100,
        hide = false,
        instrument = instruments.acoustic_grand_piano,
        name = '',
      }) {
        this.volumePercent = volumePercent;
        this.hide = hide;
        this.instrument = instrument;
        this.name = name;
      }
      equals(other) {
        return (
          this.volumePercent === other.volumePercent &&
          this.instrument === other.instrument);
      }
    }

    class SettingsChanges extends ChangesOverTime {
      constructor({
        defaultVal = new VoiceSettings({}),
        ...rest
      }) {
        super({defaultVal: defaultVal, ...rest});
      }

      _deserialize(val) {
        return new VoiceSettings(val);
      }

      _equal(a, b) {
        return a.equals(b);
      }
    }

    const clefType = Object.freeze({
      Treble: 'Treble',
      Bass: 'Bass',
    });

    let Voice$1 = class Voice {
      constructor({
        noteGps = [],
        lyricsTokens = [],
        clef = clefType.Treble,
        // settings = {},
        settingsChanges = {},
      }) {
        this.noteGps = noteGps.map(ng => new QuantizedNoteGp(ng));
        this.lyricsTokens = lyricsTokens;
        this.clef = clef;
        this.settingsChanges = new SettingsChanges(settingsChanges);
        // TODO: migrate away from the settings argument so we don't need to process it.
        // if (Object.keys(settings).length) {
        //   this.settingsChanges.defaultVal = new VoiceSettings(settings);
        // }
      }

      get settings() {
        return this.settingsChanges.defaultVal;
      }

      sanitizeNoteGps(pickup8n) {
        // 1. Make sure there are no gaps; give warning if there are overlaps.
        // Not worth fixing overlap, because we don't know the root cause.
        this.noteGps = this.noteGps.reduce((accum, noteGp, idx) => {
          if (idx == 0 && !pickup8n) {
            accum.push(noteGp);
            return accum;
          }

          const prevEnd8n = idx == 0 ? pickup8n : this.noteGps[idx - 1].end8n;
          if (prevEnd8n.lessThan(noteGp.start8n)) {
            accum.push(makeRest(prevEnd8n, noteGp.start8n));
          } else if (prevEnd8n.greaterThan(noteGp.start8n)) {
            console.warn('NoteGp has smaller start8n than expected (got, want): ', noteGp, prevEnd8n);
          }
          accum.push(noteGp);
          return accum;
        }, []);

        // 2. merge rests.
        this.noteGps = this.noteGps.reduce((accum, noteGp) => {
          if (!noteGp.isRest || accum.length == 0 || !accum[accum.length - 1].isRest) {
            accum.push(noteGp);
            return accum;
          }
          accum[accum.length - 1].end8n = noteGp.end8n;
          accum[accum.length - 1].realEnd8n = noteGp.end8n;
          return accum;
        }, []);
      }

      getAbcLyricsString() {
        return this.lyricsTokens.map(token => token.endsWith('-') ? token : token + ' ').join('');
      }
      fromAbcLyricsString(abcLyrics) {
        this.lyricsTokens = toLyricsTokens$1(abcLyrics);
      }
      insertAbcLyricsString(abcLyrics, idx) {
        const tokens = toLyricsTokens$1(abcLyrics);
        if (tokens.length == 0) {
          if (idx >= this.lyricsTokens.length) {
            return 0;
          }
          // When there are no tokens, we still need to splice if idx < this.lyricsTokens.length.
        }
        if (tokens.length > 0) {
          while (this.lyricsTokens.length < idx) {
            this.lyricsTokens.push('*');
          }
        }
        this.lyricsTokens.splice(idx, 1, ...tokens);
        return tokens.length;
      }
      getLyricsTokensWithCursor(cursorLyricsIdx) {
        const res = this.lyricsTokens.slice();
        if (cursorLyricsIdx === undefined) {
          return res;
        }
        while (res.length <= cursorLyricsIdx) {
          res.push('*');
        }
        const toBeDecorated = res[cursorLyricsIdx];
        res[cursorLyricsIdx] = toBeDecorated.indexOf(['_', '*']) >= 0 ? '?' : '?' + toBeDecorated;
        return res;
      }

      // The preferred way to add things to noteGps without introducing gaps.
      // pickup8n is needed to handle a possible gap in the left end by filling it with a rest.
      upsert(qngs, cursorStart8n, pickup8n) {
        this._upsertWithoutLeftAlignmentNorMergeRests(qngs, cursorStart8n);
        this.sanitizeNoteGps(pickup8n);
      }

      // mergeRests() {
      //   this.noteGps = this.noteGps.reduce((accum, noteGp) => {
      //     if (!noteGp.isRest || accum.length == 0 || !accum[accum.length - 1].isRest) {
      //       accum.push(noteGp);
      //       return accum;
      //     }
      //     accum[accum.length - 1].end8n = noteGp.end8n;
      //     accum[accum.length - 1].realEnd8n = noteGp.end8n;
      //     return accum;
      //   }, []);
      // }

      _upsertWithoutLeftAlignmentNorMergeRests(qngs, cursorStart8n) {
        if (qngs.length == 0) {
          return;
        }

        const earliestTime = qngs[0].start8n.plus(cursorStart8n);
        const latestTime = qngs[qngs.length - 1].end8n.plus(cursorStart8n);

        /** 0.   prev
         *     |------|
         *        |+++++++++|    */
        // Before branching into different cases, truncate prev.
        const prevIdx = this.noteGps.findIndex(noteGp => noteGp.end8n.greaterThan(earliestTime));
        if (prevIdx >= 0) {
          // If the earliestTime also cuts into the note before splice start, truncate the note.
          const prev = this.noteGps[prevIdx];
          if (prev.end8n.greaterThan(earliestTime)) {
            prev.end8n = earliestTime;
            if (prev.realEnd8n.greaterThan(earliestTime)) {
              prev.realEnd8n = earliestTime;
            }
          }
        }

        const translatedQngs = qngs.map(qng => new QuantizedNoteGp({
          ...qng,
          start8n: qng.start8n.plus(cursorStart8n),
          end8n: qng.end8n.plus(cursorStart8n),
          realEnd8n: qng.realEnd8n.plus(cursorStart8n),
        }));

        // Grace notes at the earliestTime wil be removed/spliced as well.
        // TODO if we more fine-grained control, pass in noteGpIdx
        const spliceStartIdx = this.noteGps.findIndex(noteGp => noteGp.start8n.geq(earliestTime));

        // 1. No overlap: ----|++++
        if (spliceStartIdx === -1) {
          // 2. Has gap: ----|    ++++
          if (this.noteGps.length > 0 && this.noteGps[this.noteGps.length - 1].end8n.lessThan(earliestTime)) {
            this.noteGps.push(makeRest(this.noteGps[this.noteGps.length - 1].end8n, earliestTime));
          }
          this.noteGps.push(...translatedQngs);
          return;
        }
        
        /** 3. prev  spliceStart   spliceEnd
         *     -----|------------|------
         *       ++++++| possGap |    */
        // 3a. deal with possGap
        let spliceEndIdx = this.noteGps.findIndex(noteGp => noteGp.start8n.geq(latestTime));
        spliceEndIdx = spliceEndIdx === -1 ? this.noteGps.length : spliceEndIdx;
        const spliceEnd = this.noteGps[spliceEndIdx];
        if (spliceEnd && spliceEnd.start8n.greaterThan(latestTime)) {
          translatedQngs[translatedQngs.length - 1].end8n = spliceEnd.start8n;
          translatedQngs[translatedQngs.length - 1].realEnd8n = spliceEnd.start8n;
        }
        // 3b. splice from spliceStartIdx to spliceEndIdx - 1.
        this.noteGps.splice(spliceStartIdx, spliceEndIdx - spliceStartIdx, ...translatedQngs);
      }
    };

    /* E.g.
    [K:C] G   A c   f    e   G   G  A      c   d   c
    w:   when-e-ver you need me, * I~will be there _ 

    tokens:
    ['when-', 'e-', 'ver', 'you', 'need', 'me', '', 'I~will', 'be', 'there', '']

    ['when-ever'] => 'when\-ever'.
    */
    function toLyricsTokens$1(lyricsString) {
      const asianRegexStr = '[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]';
      // 'abc  def' => ['abc', 'def']
      return lyricsString.split(/[\s]+/)
        // 'abc_def' => ['abc', '_', 'def']
        .flatMap(phrase => splitAndIncludeDelimiter(phrase, '_'))
        // 'abc*def' => ['abc', '*', 'def']
        .flatMap(phrase => splitAndIncludeDelimiter(phrase, '*'))
        // 'ab-cd' => ['ab-', 'cd']
        .flatMap(phrase => splitAfter$1(phrase, '-'))
        // '天如' => ['天', '如']
        // Not using splitAfter here because we want:
        // '天?' => ['天?']
        .flatMap(phrase => splitBefore$2(phrase, asianRegexStr))
        .filter(phrase => phrase !== '');
    }

    function splitAndIncludeDelimiter(phrase, delimiter) {
      const tokens = phrase.split(delimiter);
      return tokens.flatMap((token, idx) => {
        if (idx >= tokens.length - 1) {
          return [token];
        }
        return [token, delimiter];
      });
    }

    function splitBefore$2(phrase, delimiterSubregexString) {
      // use positive look-ahead so that the split doesn't remove the delimiter.
      return phrase.split(new RegExp(`(?=${delimiterSubregexString})`));
    }

    function splitAfter$1(phrase, delimiterSubregexString) {
      // use positive look-behind so that the split doesn't remove the delimiter.
      return phrase.split(new RegExp(`(?<=${delimiterSubregexString})`));
    }

    class ChordChanges extends ChangesOverTime {
      _deserialize(chord) {
        return new Chord(chord);
      }
      _equal(a, b) {
        return false;
        // return a.toString() === b.toString();
      }
    }

    const KeySig = Spelling$1;

    class KeySigChanges extends ChangesOverTime {
      constructor({
        defaultVal = new KeySig({letter: 'C'}),
        ...rest
      }) {
        super({defaultVal: defaultVal, ...rest});
      }

      _deserialize(val) {
        return new KeySig(val);
      }

      _equal(a, b) {
        return a.equals(b);
      }
    }

    function getPrettyDateStr(dateMs) {
      const date = new Date(dateMs);
      const currDateMs = Date.now();
      const isSameWeek = currDateMs >= dateMs && currDateMs - dateMs < 1000 * 3600 * 6;
      const moreThanOneWeekOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      const sameWeekOptions = {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
      };
      const options = isSameWeek ? sameWeekOptions : moreThanOneWeekOptions;
      const formatter = new Intl.DateTimeFormat('en-US', options);
      return formatter.format(date);
    }

    const Scales = {
      chord_tones: ' arppeg.',
      pentatonic: ' penta.',
      minor_pentatonic: 'm penta.',
      // major: 'major',
      // lydian: 'lydian',
      // minor: 'minor', // natural
      // dorian: 'dorian',
      diminished: ' dim.',
      half_diminished: ' half dim.',
      diatonic: ' diatonic', // Catch-all to describe the church mode scales.
    };


    // function makeScale(name, intervals) {
    //   return new ScaleInfo({name: name, intervals: intervals});
    // }

    // class ScaleInfo {
    //   constructor({name, intervals}) {
    //     this.name = name;
    //     this.intervals = intervals;
    //   }

    //   getNoteSpellings(root, chord) {

    //   }
    // }

    // const ScaleInfos = {
    //   chord_tones: makeScale('arppeg.', [
    //     0,
    //     ch => ch.getThirdInterval(),
    //     ch => ch.getFifthInterval(),
    //     ch => ch.getSeventhInterval(),
    //   ]),
    //   pentatonic: makeScale('penta.', [0, 2, 4, 7, 9]),
    //   minor_pentatonic: makeScale('min penta.', [0, 3, 5, 7, 10]),
    //   // How do we make spelling correct?
    //   diminished: 'dim. scale',
    //   half_diminished: 'half dim. scale',
    //   diatonic: 'diatonic', // Catch-all to describe the church mode scales.
    // };

    const solfegeToSpelling = {
      de: makeSpelling('C', -1),
      do: makeSpelling('C', 0),
      du: makeSpelling('C', 1),
      ri: makeSpelling('D', -2),
      ra: makeSpelling('D', -1),
      re: makeSpelling('D', 0),
      ro: makeSpelling('D', 1),
      ru: makeSpelling('D', 2),
      mo: makeSpelling('E', -2),
      mu: makeSpelling('E', -1),
      mi: makeSpelling('E', 0),
      ma: makeSpelling('E', 1),
      faw: makeSpelling('F', 2),
      fi: makeSpelling('F', -1),
      fa: makeSpelling('F', 0),
      fe: makeSpelling('F', 1),
      fo: makeSpelling('F', 2),
      sa: makeSpelling('G', -2),
      se: makeSpelling('G', -1),
      so: makeSpelling('G', 0),
      su: makeSpelling('G', 1),
      si: makeSpelling('G', 2),
      lu: makeSpelling('A', -2),
      li: makeSpelling('A', -1),
      la: makeSpelling('A', 0),
      le: makeSpelling('A', 1),
      lo: makeSpelling('A', 2),
      to: makeSpelling('B', -2),
      tu: makeSpelling('B', -1),
      ti: makeSpelling('B', 0),
      ta: makeSpelling('B', 1),
    };

    let spellingToSolfege;

    function toSpelling(str) {
      const res = solfegeToSpelling[str.toLowerCase()];
      // Cloning in case the caller modifies it.
      return new Spelling$1(res);
    }

    function toSolfege(spellingStr) {
      if (!spellingToSolfege) {
        spellingToSolfege = new Map(Object.keys(solfegeToSpelling).map(solfege => {
          return [solfegeToSpelling[solfege].toString(), solfege];
        }));
      }
      const res = spellingToSolfege.get(spellingStr);
      if (!res) {
        return '';
      }
      return capitalize(res);
    }

    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    class Tactic {
      constructor({scale, root, chord, targetNote, addChromaticism = false}) {
        this.scale = scale;
        this.root = root;
        this.chord = chord;
        this.targetNote = targetNote;
        this.addChromaticism = addChromaticism;
      }

      toString() {
        const scale = capitalizeFirstLetter(this.scale == Scales.chord_tones ? this.scale : `${this.root}${this.scale}`);
        if (!this.targetNote) {
          return scale;
        }
        
        return `${scale} (${toSolfege(this.targetNote.toString())})`
      }
    }

    class TacticChanges extends ChangesOverTime {
      _deserialize(tactic) {
        return new Tactic(tactic);
      }
      _equal(a, b) {
        return a.toString === b.toString();
      }
    }

    function makeTactic(scale, root, chord) {
      const targetNote = randomizeRoot(
        chord,
        [chord.getThirdInterval(), chord.getFifthInterval(), chord.getSeventhInterval()],
        [0.45, 0.2, 0.3]);
      return new Tactic({
        scale: scale, root: root, chord: chord, targetNote: targetNote,
      });
    }

    function randomizeRoot(chord, allowedIntervals, pmf) {
      const observation = Math.random();
      let cumProb = 0;
      for (let idx = 0; idx < allowedIntervals.length; idx++) {
        cumProb += pmf[idx];
        if (observation < cumProb) {
          return fromNoteNumWithChord$1(chord.root.toNoteNum() + allowedIntervals[idx], chord);
        }
      }
      return chord.root;
    }

    function toTactic(chord, {level = 0, /*key, prevChord, nextChord*/}) {
      const beyondSimple = Math.random() < 2 * level;
      if (!beyondSimple) {
        return makeTactic(Scales.chord_tones, chord.root, chord);
      }
      if (chord.isMajor()) {
        const usePenta = Math.random() > level;
        if (usePenta) {
          return makeTactic(Scales.pentatonic, randomizeRoot(chord, [Intervals.M2, Intervals.P5], [0.2, 0.5]), chord);
        }
      }
      if (chord.isMinor()) {
        const usePenta = Math.random() > level;
        if (usePenta) {
          return makeTactic(Scales.minor_pentatonic, randomizeRoot(chord, [Intervals.M2, Intervals.P5], [0.2, 0.5]), chord);
        }
      }
      if (chord.isDominant() || chord.isAugmented()){
        if (Math.random() < 0.5) {
          return makeTactic(Scales.pentatonic, randomizeRoot(chord, [Intervals.P4, Intervals.m7, Intervals.tritone], [0.4, 0.4, 0.1]), chord);
        } else if (Math.random() < 0.8) {
          return makeTactic(Scales.minor_pentatonic, randomizeRoot(chord, [Intervals.P4, Intervals.m7], [0.4, 0.4]), chord);
        }
      }
      // TODO for Bm7b5 or Bdim, treat it like G7.
      if (chord.isHalfDiminished()) {
        if (Math.random() < 0.8) {
          return makeTactic(Scales.minor_pentatonic, randomizeRoot(chord, [Intervals.P4, Intervals.m7, Intervals.m2, Intervals.m3, Intervals.tritone], [0.15, 0.15, 0.15, 0.15, 0.15]), chord);
        }
        // return makeTactic(Scales.half_diminished, chord.root, chord);
      } else if (chord.isDiminished()) {
        if (Math.random() < 0.8) {
          return makeTactic(Scales.minor_pentatonic, randomizeRoot(chord, [Intervals.P4, Intervals.m7, Intervals.m2, Intervals.m3, Intervals.tritone], [0.15, 0.15, 0.15, 0.15, 0.15]), chord);
        }
        return makeTactic(Scales.diminished, chord.root, chord);
        // TODO add harmonic minor (e.g. for Bdim7 use C harm. min.)
      }
      return makeTactic(Scales.diatonic, chord.root, chord);
    }

    function capitalizeFirstLetter(string) {
      return string.replace(/\b\w/g, l => l.toUpperCase());
    }

    class Song {
      constructor({
        title = getPrettyDateStr(Date.now()),
        chordChanges = {},
        pickup8n = makeFrac(0),
        voices = [{}],
        keySigChanges = {},
        timeSigChanges = {},
        tempo8nPerMinChanges = {defaultVal: 180},
        swingChanges = {},
        tacticChanges = {},
      }) {
        this.title = title;
        this.voices = voices.map(voice => new Voice$1(voice));
        this.pickup8n = new Frac$1(pickup8n);
        this.chordChanges = new ChordChanges(chordChanges);
        this.keySigChanges = new KeySigChanges(keySigChanges);
        this.timeSigChanges = new TimeSigChanges(timeSigChanges);
        this.tempo8nPerMinChanges = new ChangesOverTime(tempo8nPerMinChanges);
        this.swingChanges = new SwingChanges(swingChanges);
        this.tacticChanges = new TacticChanges(tacticChanges);
      }

      addVoice(voice, idx) {
        if (idx === undefined) {
          this.voices.push(voice);
          return;
        }
        this.voices.splice(idx, 0, voice);
      }
      getVoice(idx) {
        return this.voices[idx];
      }
      getSoundingVoices() {
        return this.voices.filter(voice => voice.settings.volumePercent != 0)
      }
      getVisibleVoices() {
        return this.voices.filter(voice => !voice.settings.hide)
      }
      getStart8n() {
        return this.pickup8n;
      }
      getEnd8n() {
        return this.voices.reduce((accum, voice) => {
          if (voice.noteGps.length == 0) {
            return accum;
          }
          const end8n = voice.noteGps[voice.noteGps.length - 1].end8n;
          return end8n.leq(accum) ? accum : end8n;
        }, this.getStart8n());
      }
      getFinalChordTime8n() {
        const changes = this.chordChanges.getChanges();
        if (changes.length === 0) {
          return makeFrac(0);
        }
        const lastChange = changes.slice(changes.length - 1)[0];
        return lastChange.start8n;
      }
      // // [Frac].
      // _getBarsInTime8n() {
      //   const res = [];
      //   let currTime8n = makeFrac(0);
      //   let currBarDur8n = this.timeSigChanges.defaultVal.getDurPerMeasure8n();
      //   const end8n = this.getStart8n();
      //   while (currTime8n.lessThan(end8n)) {
      //     res.push(currTime8n);
      //     currTime8n = currTime8n.plus(currBarDur8n);
      //   }
      //   res.push(end8n);
      //   return res;
      // }
      getChordChangesAcrossBars(skipProbability) {
        skipProbability = skipProbability || 0;
        const durPerMeasure8n = this.timeSigChanges.defaultVal.getDurPerMeasure8n();
        const changes = this.chordChanges.changes;
        return changes.flatMap((change, idx) => {
          // For endings, we don't the chord to be repeated.
          if (idx + 1 === changes.length) {
            return [change];
          }
          const nextChange = changes[idx + 1];
          const changeDur8n = nextChange.start8n.minus(change.start8n);
          if (changeDur8n.leq(durPerMeasure8n)) {
            return [change];
          }
          const measureNum = change.start8n.over(durPerMeasure8n).wholePart();
          const nextMeasureNum = nextChange.start8n.over(durPerMeasure8n).wholePart();
          const res = [change];
          // Don't skip 2 in a row.
          let skipped = false;
          for (let idx = measureNum + 1; idx < nextMeasureNum; idx++) {
            if (skipped || Math.random() >= skipProbability) {
              res.push({val: change.val, start8n: durPerMeasure8n.times(idx)});
              skipped = false;
            } else {
              skipped = true;
            }
          }
          return res;
        });
      }
    }
    // function bpmToSecPer8n(bpm, num8nPerBeat) {
    //   const bps = bpm / 60;
    //   const num8nPerSec = bps * num8nPerBeat;
    //   return 1 / num8nPerSec;
    // }

    const num8nPerBeat = 2;
    const skipProbability = 0.25;

    // TODO we will need to add structural info, such as whether this part is copied from
    // another part, so that we can render a shorter version in the future.
    class SongPart {
      constructor({
        song = {}, // Song, which can have a melody or rest. Comping will be added in SongForm.
        turnaroundStart8n = undefined, // Frac, time after which chord changes should be discarded when used as the final part.
        compingStyle = CompingStyle.default,
        syncopationPct = 20,
        densityPct = 20,
        transpose = 0,
      }) {
        this.song = new Song(song);
        this.turnaroundStart8n = turnaroundStart8n;
        this.compingStyle = compingStyle;
        this.syncopationFactor = syncopationPct / 100;
        this.densityFactor = densityPct / 100;
        this.transpose = transpose;
      }

      updateTacticChanges() {
        this.song.tacticChanges = new TacticChanges({});
        const changes = this.song.getChordChangesAcrossBars(skipProbability);
        changes.forEach(change => {
          this.song.tacticChanges.upsert(change.start8n, toTactic(change.val, {level: 0.3}));
        });
      }

      // TODO remove
      updateComping() {
        const changes = this.song.getChordChangesAcrossBars(skipProbability);
        const bassQngs = [];
        const trebleQngs = [];

        const durFor4Beats = 4 * num8nPerBeat;
        const durFor3Beats = 3 * num8nPerBeat;
        const durFor2Beats = 2 * num8nPerBeat;
        const maxBass = 56;
        const minBass = 40;
        const maxTreble = 76;
        let prevBassNoteNum = 50;
        let prevTrebleNoteNums = [66];
        let isDenseBass = false;
        changes.forEach((change, idx) => {
          const isFinalNote = idx + 1 === changes.length;
          if (idx === 0 && this.song.pickup8n.lessThan(change.start8n)) {
            bassQngs.push(makeSimpleQng(this.song.pickup8n, change.start8n, []));
            trebleQngs.push(makeSimpleQng(this.song.pickup8n, change.start8n, []));
          }
          // Bass
          const end8n = isFinalNote ? this.song.getEnd8n() : changes[idx + 1].start8n;
          const chord = change.val;
          const bass = chord.bass || chord.root;
          const bassNoteNum = genNearestNums([bass.toNoteNum()], [prevBassNoteNum], minBass, maxBass);
          const dur8n = end8n.minus(change.start8n);
          let quickBass = false;
          if (dur8n.greaterThan(durFor3Beats) || dur8n.lessThan(durFor2Beats)) {
            isDenseBass = false;
          } else {
            if (isDenseBass) {
              isDenseBass = Math.random() < this.densityFactor * 4;
            } else {
              isDenseBass = Math.random() < this.densityFactor * 1.5;
            }
          }
          let isDenseBaseForLongDur =  (dur8n.greaterThan(durFor3Beats) && Math.random() < this.densityFactor * 3);
          if (dur8n.greaterThan(durFor4Beats)) {
            isDenseBaseForLongDur = true;
          }
          // Make this higher than bassNoteNum unless it's higher than maxBass
          let bassNoteNum2 = chord.root.toNoteNum(4);
          if (chord.bass) {
            if (bassNoteNum2 > maxBass) {
              bassNoteNum2 -= 12;
            }
          } else {
            bassNoteNum2 = chord.root.toNoteNum(3) + chord.getFifthInterval();
            if (bassNoteNum2 < bassNoteNum && bassNoteNum2 + 12 < maxBass) {
              bassNoteNum2 += 12;
            }
          }
          if ((isDenseBaseForLongDur || isDenseBass) && !isFinalNote) {
            let syncopateBass = dur8n.geq(8) ? Math.random() < this.syncopationFactor : Math.random() < this.syncopationFactor / 1.5;
            if (dur8n.equals(durFor3Beats)) {
              syncopateBass = false;
            }
            const dur8nFromEnd = syncopateBass ? 1 : 2;
            bassQngs.push(makeSimpleQng(change.start8n, end8n.minus(dur8nFromEnd), [bassNoteNum]));
            bassQngs.push(makeSimpleQng(end8n.minus(dur8nFromEnd), end8n, [bassNoteNum2]));
            prevBassNoteNum = bassNoteNum2;
          } else {
            quickBass = dur8n.leq(durFor2Beats) ? Math.random() < this.syncopationFactor * 1.5 : false;
            if (quickBass && !isFinalNote) {
              bassQngs.push(makeSimpleQng(change.start8n, change.start8n.plus(num8nPerBeat - 1), [bassNoteNum]));
              bassQngs.push(makeSimpleQng(change.start8n.plus(num8nPerBeat - 1), end8n, [bassNoteNum2]));
              prevBassNoteNum = bassNoteNum2;
            } else {
              bassQngs.push(makeSimpleQng(change.start8n, end8n, [bassNoteNum]));
              prevBassNoteNum = bassNoteNum;
            }
          }
          
          const minTreble = Math.max(bassNoteNum, bassNoteNum2, 51) + 1;
          // Treble
          const specifiedColorNoteNums = chord.getSpecifiedColorNoteNums();
          const trebleNoteNums = genNearestNums(specifiedColorNoteNums, prevTrebleNoteNums, minTreble, maxTreble);
          // Tuned for the 3/4 meter song, "Someday My Prince Will Come"
          let isDenseTreble = false;
          if (dur8n.greaterThan(durFor4Beats)) {
            isDenseTreble = true;
          } else if (dur8n.geq(durFor4Beats)) {
            isDenseTreble = (isDenseBaseForLongDur ?
              Math.random() < this.densityFactor * 3 :
              Math.random() < this.densityFactor * 4);
          } else if (dur8n.geq(durFor3Beats)) {
            isDenseTreble = (isDenseBaseForLongDur ?
              Math.random() < this.densityFactor :
              Math.random() < this.densityFactor * 2);
          }
          if (isDenseTreble && !isFinalNote) {
            const isSimpleMinorFour = (
              chord.isMinor() && !chord.hasExtension() &&
              Math.abs(chord.root.toNoteNum() - this.song.keySigChanges.defaultVal.toNoteNum()) === Intervals.P4);
            const third = chord.root.toNoteNum() + chord.getThirdInterval();
            const seventh = chord.root.toNoteNum() + chord.getSeventhInterval();
            const fifth = chord.root.toNoteNum() + chord.getFifthInterval();
            const interval9Or11 = chord.isMinor() || chord.isDiminished() ? Intervals.P4 :  Intervals.M2;
            const ninthOr11th = chord.root.toNoteNum() + interval9Or11;
            const interval6Or9Or11 = Math.random() < 0.6 ? Intervals.M6 : (Math.random() < 0.5 ? Intervals.M2 : Intervals.P4);
            const useFifth = Math.random() < 0.6;
            const color = useFifth ? fifth : ninthOr11th;
            const intervalsToUse = isSimpleMinorFour ? [third, fifth, chord.root.toNoteNum() + interval6Or9Or11] : [third, seventh, color];
            let trebleNoteNums2 = genNearestNums(intervalsToUse, trebleNoteNums, minTreble, maxTreble);
            // For this to work, we need to unavoid clusters of 3 notes, in particular, if 11th or 13th is involved,
            // move them up and octave or move the 3 or 5 or 7 down an octave.
            // const colorNoteNums2 = shuffle(
            //   chord.getSpecifiedColorNoteNums(/* includeAll= */true, this.song.keySigChanges.defaultVal)).slice(0, 3);
            // let trebleNoteNums2 = genNearestNums(colorNoteNums2, trebleNoteNums, minTreble, maxTreble);
            const topTrebleNoteNum = Math.max(...trebleNoteNums);
            const topTrebleNoteNum2 = Math.max(...trebleNoteNums2);
            if (topTrebleNoteNum === topTrebleNoteNum2) {
              if (Math.random() < 0.4) {
                trebleNoteNums2 = moveUp(trebleNoteNums2);
                if (Math.random() < 0.6) {
                  trebleNoteNums2 = moveUp(trebleNoteNums2);
                }
              } else {
                trebleNoteNums2 = moveDown(trebleNoteNums2);
              }
            }
            const syncopateFirstBeat = Math.random() < this.syncopationFactor / 2;
            let dur8nFromEnd;
            if (dur8n.equals(durFor3Beats)) {
              dur8nFromEnd = num8nPerBeat;
            } else {
              const syncopateLatterBeat = Math.random() < this.syncopationFactor;
              const delaySyncopation = Math.random() < 0.25;
              const syncAmount = delaySyncopation ? -1 : 1;
              dur8nFromEnd = syncopateLatterBeat ? num8nPerBeat * 2 + syncAmount : num8nPerBeat * 2;
            }
            if (syncopateFirstBeat) {
              trebleQngs.push(makeSimpleQng(change.start8n, change.start8n.plus(num8nPerBeat - 1), []));
              trebleQngs.push(makeSimpleQng(change.start8n.plus(num8nPerBeat - 1), end8n.minus(dur8nFromEnd), trebleNoteNums));
            } else {
              trebleQngs.push(makeSimpleQng(change.start8n, end8n.minus(dur8nFromEnd), trebleNoteNums));
            }
            trebleQngs.push(makeSimpleQng(end8n.minus(dur8nFromEnd), end8n, trebleNoteNums2));
            prevTrebleNoteNums = trebleNoteNums2;
          } else {
            const syncopateFirstBeat = dur8n.leq(durFor2Beats) ? Math.random() < this.syncopationFactor * 1.5 : Math.random() < this.syncopationFactor;
            if (syncopateFirstBeat && !isFinalNote) {
              if (Math.random() < (quickBass ? 0.2 : 0.9) || change.start8n.plus(num8nPerBeat).equals(end8n)) {
                trebleQngs.push(makeSimpleQng(change.start8n, change.start8n.plus(num8nPerBeat - 1), []));
                trebleQngs.push(makeSimpleQng(change.start8n.plus(num8nPerBeat - 1), end8n, trebleNoteNums));
              } else {
                trebleQngs.push(makeSimpleQng(change.start8n, change.start8n.plus(num8nPerBeat), []));
                trebleQngs.push(makeSimpleQng(change.start8n.plus(num8nPerBeat), end8n, trebleNoteNums));
              }
            } else {
              trebleQngs.push(makeSimpleQng(change.start8n, end8n, trebleNoteNums));
            }
            prevTrebleNoteNums = trebleNoteNums;
          }
        });
        const trebleVoice = new Voice$1({
          noteGps: trebleQngs, clef: clefType.Treble,
        });
        const bassVoice = new Voice$1({noteGps: bassQngs, clef: clefType.Bass});
        // // Having just one rest note means we should replace the voices entirely.
        // if (this.song.voices[0].noteGps.length === 1 && this.song.voices[0].noteGps[0].midiNotes.length === 0 ) {
        //   this.song.voices = [trebleVoice, bassVoice];
        // } else {
          trebleVoice.settings.hide = true;
          bassVoice.settings.hide = true;
          this.song.addVoice(trebleVoice);
          this.song.addVoice(bassVoice);
        // }
      }
    }

    function moveUp(noteNums) {
      const bottom = Math.min(...noteNums);
      const res = noteNums.filter(num => num !== bottom);
      res.push(bottom + 12);
      return res;
    }

    function moveDown(noteNums) {
      const top = Math.max(...noteNums);
      const res = noteNums.filter(num => num !== top);
      res.push(top - 12);
      return res;
    }

    function genNearestNums(noteNums, prevNoteNums, min, max) {
      return noteNums.map(noteNum => fixNoteNum(genNearestNum(noteNum, prevNoteNums), min, max));
    }

    function genNearestNum(noteNum, prevNoteNums) {
      let minDist = null;
      let ans = noteNum;
      prevNoteNums.forEach(prevNoteNum => {
        let curr = noteNum;
        while (Math.abs(curr - prevNoteNum) > Math.abs(curr + 12 - prevNoteNum)) {
          curr += 12;
        }
        while (Math.abs(curr - prevNoteNum) > Math.abs(curr - 12 - prevNoteNum)) {
          curr -= 12;
        }
        const dist = Math.abs(curr - prevNoteNum);
        if (minDist === null || dist <= minDist) {
          minDist = dist;
          ans = curr;
        }
      });
      return ans;
    }

    function fixNoteNum(noteNum, min, max) {
      while (noteNum < min) {
        noteNum += 12;
      }
      while (noteNum > max) {
        noteNum -= 12;
      }
      return noteNum;
    }

    // TODO move this to comping.js?
    const CompingStyle = Object.freeze({
      default: 'default',
    });

    // DSL used to denote the items within each pattern.
    const SegmentType = Object.freeze({
      Rest: 'Rest',
      Bass: 'Bass',
      Shell: 'Shell',
      UpperStructure: 'UpperStructure',
      Note: 'Note',
      Sustain: 'Sustain',
    });
    ({
      type: SegmentType.Rest,
    });
    const _ = {
      type: SegmentType.Sustain,
    };
    const bass = {
      type: SegmentType.Bass,
    };
    const bass1 = {
      type: SegmentType.Bass,
      variation: 1,
    };
    const shell = {
      type: SegmentType.Shell,
    };
    ({
      type: SegmentType.UpperStructure,
    });
    const note0 = {
      type: SegmentType.Note,
      variation: 0,
    };
    const note1 = {
      type: SegmentType.Note,
      variation: 1,
    };
    ({
      type: SegmentType.Note,
      variation: 2,
    });
    ({
      type: SegmentType.Note,
      variation: 3,
    });

    [{
      name: '1_of_k',
      bassPattern: [bass],
    }, {
      name: '1_of_k_plus_last_beat',
      bassPattern: [bass],
      // This only work for non-compound meter. Need to use 3 instead of 2 for 6/8 or 9/8.
      addFromRight: {segment: bass, dur8nFromRight: makeFrac(2)},
    }, {
      name: '1_of_k_plus_last_up_beat',
      bassPattern: [bass],
      addFromRight: {segment: bass, dur8nFromRight: makeFrac(1)},
    }, {
      name: '2_of_4',
      bassPattern: [bass, bass1],
      requiredDur8n: makeFrac(8),
    }];

    [{
      name: '1_of_k',
      treblePattern: [shell],
    }, {
      name: '2_of_4',
      treblePattern: [shell, shell],
      requiredDur8n: makeFrac(8),
    }, {
      name: 'transition',
      treblePattern: [shell, _, _, _, shell, _, note0, note1],
      requiredDur8n: makeFrac(8),
    }, {
      name: 'syncopated_transition',
      treblePattern: [shell, _, _, shell, _, note0, note1, _],
      requiredDur8n: makeFrac(8),
    }];

    [{
      name: '1_of_k',
      bassPatternName: '1_of_k',
      treblePatternName: '1_of_k',
    }, {
      name: '2_of_4',
      bassPatternName: '1_of_k',
      treblePatternName: '2_of_4',
      requiredDur8n: makeFrac(8),
    }, {
      name: '2_of_4_var1',
      bassPatternName: '1_of_k_plus_last_beat',
      treblePatternName: '2_of_4',
      requiredDur8n: makeFrac(8),
    }, {
      name: 'transition',
      bassPatternName: '1_of_k',
      treblePatternName: 'transition',
      requiredDur8n: makeFrac(8),
    }, {
      name: 'syncopated_transition',
      bassPatternName: '1_of_k_plus_last_up_beat',
      treblePatternName: 'syncopated_transition',
      requiredDur8n: makeFrac(8),  
    }];

    // Usage:
    // The fallback pattern will be the one without requiredDur8n or
    // if unspecified, the simple full pattern for dur8n.

    // Order by increasing order of importance.
    ({
      basic: [{
        fullPatternName: '2_of_4',
        conditions: {
          requiredDur8n: makeFrac(8),
        },
      }, {
        fullPatternName: '2_of_4_var1',
        conditions: {
          requiredDur8n: makeFrac(8),
          mustBeFollowing: '2_of_4',
        },
      }, {
        name: 'transition',
        fullPatternName: 'transition',
        conditions: {
          requiredDur8n: makeFrac(8),
          isLastChord: true,
          // How do you tell? Dominant, sus, dim or augmented.
          isHalfCadence: true,
        },
      }],
    });

    function orchestrate(songParts, songForm) {
      if (!songParts.length || !songParts[0].song.voices.length) {
        return;
      }
      const numVoices = songParts[0].song.voices.length;
      const hasMel = numVoices >= 3;
      const melodyIdx = hasMel ? 0 : null;
      const voiceIndices = [...Array(numVoices).keys()];
      // const compingIdx = numVoices - 2;
      const bassIdx = numVoices - 1;
      const repeatPartIndices = songForm.getRepeatPartIndices();
      const repeatPartIndicesSet = new Set(repeatPartIndices);
      shuffle$1(compingSettings);
      let voiceIdxToSettingsIdx = {};
      voiceIndices.forEach(idx => {
        voiceIdxToSettingsIdx[idx] = mod$1(idx, compingSettings.length);
      });
      // Why + 2?
      let numChannelUsed = bassIdx + 2;
      let muteMelody = false;
      songParts.forEach((part, partIdx) => {
        part.song.voices.forEach((voice, voiceIdx) => {
          // Mute the melody for a repeated part.
          if (voiceIdx === melodyIdx) {
            if (repeatPartIndicesSet.has(partIdx) && partIdx > 0 && numChannelUsed < 16) {
              muteMelody = true;
            }
            if (muteMelody) {
              voice.settings.instrument = compingSettings[voiceIdxToSettingsIdx[voiceIdx]].instrument;
              voice.settings.volumePercent = 0;
              return;
            }
          }
          if (repeatPartIndicesSet.has(partIdx)  && partIdx > 0 && voiceIdx !== melodyIdx && numChannelUsed < 16) {
            const incr = repeatPartIndices.length > 1 && repeatPartIndices[1] === partIdx ? -1 : 1;
            voiceIdxToSettingsIdx[voiceIdx] = mod$1((voiceIdxToSettingsIdx[voiceIdx] || 0) + incr, compingSettings.length);
            numChannelUsed++;
          }
          const setting = compingSettings[voiceIdxToSettingsIdx[voiceIdx]];
          voice.settings.instrument = setting.instrument;
          let relVolPct = 75;
          if (voiceIdx === bassIdx) {
            relVolPct = 90;
          } else if (voiceIdx === melodyIdx) {
            relVolPct = 100;
          }
          voice.settings.volumePercent = relVolPct * setting.volumePercent / 100;
        });
      });
    }

    const instrumentSettings = {
      acoustic_grand_piano: {
        instrument: instruments.acoustic_grand_piano,
        volumePercent: 65,
      },
      electric_piano_2: {
        instrument: instruments.electric_piano_2,
        volumePercent: 85,
      },
      electric_guitar_clean: {
        instrument: instruments.electric_guitar_clean,
        volumePercent: 25,
      },
      electric_piano_1: {
        instrument: instruments.electric_piano_1,
        volumePercent: 110,
      },
    };

    const compingSettings = [
      instrumentSettings.electric_piano_1,
      instrumentSettings.acoustic_grand_piano,
      instrumentSettings.electric_piano_2,
      instrumentSettings.electric_guitar_clean,
    ];

    class SongForm {
      constructor({
        title = '',
        // Not yet sequenced (i.e. to be sequenced in getSequencedParts)
        parts = [], // [SongPart]
        intro = '',
        body = [], // [String]
        outro = '',
        numRepeats = 0,
      }) {
        this.title = title;
        this.parts = parts.map(part => new SongPart(part));
        this.intro = intro;
        this.body = body;
        this.outro = outro;
        this.numRepeats = numRepeats;
      }

      // Sequenced via numRepeats and part.transposed
      getSequencedParts() {
        const songParts = this.getClonedParts();
        transposeSongParts(songParts);
        return songParts;
      }

      getParts() {
        return this.parts;
      }
      getClonedParts() {
        const nameToPart = {};
        this.parts.forEach(part => {
          nameToPart[part.song.title] = part;
        });
        const sequence = [];
        if (this.intro) {
          sequence.push(this.intro);
        }
        for (let idx = 0; idx < this.numRepeats + 1; idx++) {
          sequence.push(...this.body);
        }
        if (this.outro) {
          sequence.push(this.outro);
        }
        return sequence.map(name => new SongPart(nameToPart[name]));
      }

      getRepeatPartIndices() {
        const res = [0];
        const sequence = [];
        if (this.intro) {
          sequence.push(this.intro);
        }
        for (let idx = 0; idx < this.numRepeats; idx++) {
          sequence.push(...this.body);
          res.push(sequence.length);
        }
        return res;
      }

      // TODO disable addDrumBeat in songReplay.js and do it here so that we can mute it when we want
      //   (add volumePercent = 0 at time 0 to end of first part)
      toFullyArrangedSong() {
        const parts = this.getSequencedParts();
        if (parts.length === 0) {
          throw 'TODO: Handle no parts gracefully';
        }
      
        parts.forEach((part, idx) => {
          if (idx === parts.length - 1 && part.turnaroundStart8n) {
            part.song.chordChanges.removeWithinInterval(part.turnaroundStart8n);
          }
          part.updateComping();
          part.updateTacticChanges();
        });
        
        // Must be done after comping is done.
        orchestrate(parts, this);
      
        let songRes;
        parts.forEach(part => {
          songRes = appendToSong(songRes, part, this.title);
        });
        return songRes;
      }
    }

    function transposeSongParts(songParts) {
      songParts.forEach(part => {
        const song = part.song;
        const oldKey = song.keySigChanges.defaultVal;
        const newKey = fromNoteNumWithFlat$1(oldKey.toNoteNum() + part.transpose);
        // 1. Chords
        song.chordChanges.getChanges().forEach(change => {
          change.val.shift(oldKey, newKey);
        });
        
        // 2. Voices
        song.voices.forEach(voice => {
          voice.noteGps.forEach(noteGp => {
            noteGp.midiNotes.forEach(note => {
              note.noteNum = note.noteNum + part.transpose;
              if (note.spelling) {
                note.spelling = note.spelling.shift(oldKey, newKey);
              }
            });
          });
        });

        // 3. Key Sig
        song.keySigChanges.defaultVal = newKey;
        song.keySigChanges.changes.forEach(change => {
          change.val = fromNoteNumWithFlat$1(change.val.toNoteNum() + part.transpose);
        });
      });
    }

    function appendToSong(song, part, title) {
      if (!song) {
        song = new Song(part.song);
        song.title = title;
        return song;
      }

      const shift8n = song.getEnd8n();
      song.voices.forEach((voice, idx) => {
        // Currently a later part can have fewer voices than an earlier part.
        if (idx >= part.song.voices.length) {
          return;
        }
        // If the note gp is a rest and it's a pickup, don't upsert it.
        voice.upsert(part.song.voices[idx].noteGps.filter(ng => ng.midiNotes.length > 0 || ng.start8n.geq(0)), shift8n);
        // Take pickup notes, i.e. start8n of a non-rest noteGp, into account.
        let start8n = shift8n;
        const firstNoteGp = voice.noteGps.find(noteGp => !noteGp.isRest);
        if (firstNoteGp && firstNoteGp.start8n.lessThan(0)) {
          start8n = shift8n.plus(firstNoteGp.start8n);
        }
        voice.settingsChanges.upsert(start8n, part.song.voices[idx].settings);
      });
      part.song.chordChanges.getChanges().forEach(change => {
        song.chordChanges.upsert(change.start8n.plus(shift8n), change.val);
      });
      return song;
    }

    function computeBeatInfo(timeSig, numBeatDivisions) {
      const {upperNumeral, lowerNumeral} = timeSig;
      const periodDur8n = makeFrac(upperNumeral * 8, lowerNumeral);
      let numBeats = timeSig.isCompound() ? upperNumeral / 3 : upperNumeral;
      numBeatDivisions = numBeatDivisions || (timeSig.isCompound() ? 3 : 2);
      return {
        numBeats: numBeats,
        numBeatDivisions: numBeatDivisions,
        durPerDivision8n: periodDur8n.over(numBeats * numBeatDivisions),
        durPerBeat8n: periodDur8n.over(numBeats),
        period8n: periodDur8n,
      };
    }

    function genChunkedLocs(gridData) {
      const chordLocs = parseChordLocations(gridData);
      const headerLocs = parseHeaderLocations(gridData);
      const chordHeaderLocs = combineChordAndHeader(chordLocs, headerLocs, gridData.length);
      const chunkedLocs = chunkLocationsByPart(chordHeaderLocs);
      const chunkedLocsWithPickup = extractPickup(chunkedLocs);

      return chunkedLocsWithPickup;
    }

    function genChordOnlySongForm(chunkedLocsWithPickup, initialHeaders, keyVals) {
      const songParts = genChordOnlySongParts(chunkedLocsWithPickup, initialHeaders);
      const possIntro = songParts.find(part => part.song.title.trim().toLowerCase() === 'intro');
      const possOutro = songParts.find(part => part.song.title.trim().toLowerCase() === 'outro');
      const body = songParts.filter(
        part => ['intro', 'outro'].indexOf(part.song.title.trim().toLowerCase()) < 0
      ).map(part => part.song.title);
      return new SongForm({
        title: keyVals.title, parts: songParts,
        intro: possIntro ? possIntro.song.title : '',
        outro: possOutro ? possOutro.song.title : '',
        body: body,
        numRepeats: initialHeaders[HeaderType.Repeat],
      });
    }

    // InitialHeaders are the headers used by the very first part of the song
    // and is displayed on the sidebar. The values are determined by (in order of importance)
    // 1. url params.
    // 2. header in the first song part.
    // 3. default values if they are required.
    // 4. undefined if not required.
    function createInitialHeaders(chunkedLocsWithPickup, keyVals) {
      const song = new Song({});
      const headers = {};
      headers[HeaderType.Meter] = song.timeSigChanges.defaultVal;
      headers[HeaderType.Tempo] = song.tempo8nPerMinChanges.defaultVal;
      headers[HeaderType.Key] = song.keySigChanges.defaultVal;
      headers[HeaderType.Swing] = song.swingChanges.defaultVal;
      headers[HeaderType.Transpose] = 0;
      headers[HeaderType.Syncopation] = 20;
      headers[HeaderType.Density] = 20;
      headers[HeaderType.Repeat] = 0;

      if (chunkedLocsWithPickup.length > 0 &&
          chunkedLocsWithPickup[0].chordHeaderLocs.length > 0) {
        Object.entries(chunkedLocsWithPickup[0].chordHeaderLocs[0].headers).forEach(([key, val]) => {
          headers[key] = val;
        });
      }
      Object.entries(keyVals).forEach(([key, val]) => {
        if (!HeaderType[key]) {
          return;
        }
        const res = processKeyVal(
          key.trim().toLowerCase(),
          val.trim());
        if (!res) {
          return;
        }
        headers[res.type] = res.value;
      });

      if (!headers[HeaderType.Subdivision]) {
        headers[HeaderType.Subdivision] = computeBeatInfo(headers[HeaderType.Meter]).numBeatDivisions;
      }
      return headers;
    }


    function getInitialTransposedNum(headers) {
      let transposedNum = 0;
      if (headers[HeaderType.TransposedKey] !== undefined) {
        transposedNum += headers[HeaderType.TransposedKey].toNoteNum() - headers[HeaderType.Key].toNoteNum();
        if (transposedNum >= 6) {
          transposedNum -= 12;
        }
      }
      if (headers[HeaderType.TransposedNum] !== undefined) {
        transposedNum += headers[HeaderType.TransposedNum];
      }
      return transposedNum;
    }

    // TODO Separate local and global header, i.e. how they are interpreted and how
    // they can be set; e.g. allowing setting local headers from the UI and url params
    // only if they are never changed later or add some warning about unexpected behavior.

    // Returns [{song: Song, compingStyle: CompingStyle}]
    // TODO implement this spec
    // What belongs in the global header types?
    // Global headers are meant for every part of the song.
    // Should be a relative value in order to be combined with the local header values.
    // E.g. TransposedKey, TransposedNum, Repeat, TempoMultiplier
    // Local header types are those that can changed for each part or even in the middle of a part.
    // Local header are inherited from previous parts. Should be an absolute value.
    // Currently, some local headers are confused as global header because they
    // are usually only set once in the beginning,
    // e.g. Meter, Key, Tempo, Subdivision, Swing
    function genChordOnlySongParts(chunkedLocsWithPickup, initialHeader) {
      const partNameToPart = {};
      const partNameToInitialHeader = {};
      const initialTranposedNum = getInitialTransposedNum(initialHeader);

      let currTimeSig;
      let currTempo;
      let currSwing;
      let currSyncopation;
      let currDensity;

      let prevSong;

      return chunkedLocsWithPickup.map((chunk, idx) => {
        const firstLoc = chunk.chordHeaderLocs[0];
        // Copy the header because we will modify it below.
        const headers = Object.assign({}, firstLoc.headers);

        let song = new Song({});
        const partForCopying = partNameToPart[headers[HeaderType.Copy]];
        if (partForCopying) {
          song = new Song(partForCopying.song);
          const headersForMerging = partNameToInitialHeader[headers[HeaderType.Copy]];
          for (const [key, value] of Object.entries(headersForMerging)) {
            if (!(key in headers)) {
              headers[key] = value;
            }
          }
        } else {
          for (const [key, value] of Object.entries(initialHeader)) {
            // for idx > 0, only apply the global header types.
            if (!(key in headers) && (idx == 0 || GlobalHeaderType.has(key))) {
              headers[key] = value;
            }
          }
        }
        song.title = headers[HeaderType.Part];

        // Pull data from headers or previous headers.
        // Lint(If change): sync with createInitialHeaders
        if (headers[HeaderType.Meter] !== undefined) {
          currTimeSig = headers[HeaderType.Meter];
        }
        song.timeSigChanges.defaultVal = currTimeSig;

        if (headers[HeaderType.Tempo] !== undefined) {
          currTempo = headers[HeaderType.Tempo];
        }
        if (headers[HeaderType.TempoMultiplier] !== undefined) {
          currTempo = headers[HeaderType.TempoMultiplier] / 100 * currTempo;
        }
        
        song.tempo8nPerMinChanges.defaultVal = currTempo;

        let currKeySig = headers[HeaderType.Key];
        if (!currKeySig && prevSong) {
          currKeySig = prevSong.keySigChanges.getChange(prevSong.getEnd8n()).val;
        }
        if (currKeySig) {
          song.keySigChanges.defaultVal = currKeySig;
          // Set the header key because it may need to be inherited by a later part via Copy.
          // TODO think about whether this is the correct thing to do, but only for Key
          // i.e. is Key the only local thing we should explicitly set for Copy? Meter, etc.
          headers[HeaderType.Key] = currKeySig;
        }

        const transpose = (
          headers[HeaderType.Transpose] === undefined ? initialTranposedNum :
          initialTranposedNum + headers[HeaderType.Transpose]
        );

        if (headers[HeaderType.Swing] !== undefined) {
          currSwing = headers[HeaderType.Swing];
        }
        song.swingChanges.defaultVal = currSwing;

        if (headers[HeaderType.Syncopation] !== undefined) {
          currSyncopation = headers[HeaderType.Syncopation];
        }

        if (headers[HeaderType.Density] !== undefined) {
          currDensity = headers[HeaderType.Density];
        }

        // Relative to the current part.
        const idxToTime8n = absoluteIdx => {
          const durPerCell8n = currTimeSig.getDurPerMeasure8n();
          // Flipping because absoluteIdx can be either a Number or Frac.
          const relIdx = firstLoc.fractionalIdx.minus(absoluteIdx).negative();
          return relIdx.times(durPerCell8n);
        };
        if (chunk.pickup.length > 0) {
          song.pickup8n = idxToTime8n(chunk.pickup[0].fractionalIdx);
        }

        chunk.pickup.concat(chunk.chordHeaderLocs).forEach(loc => {
          if (loc.headers) {
            const time8n = idxToTime8n(loc.fractionalIdx);
            if (loc.headers[HeaderType.Key]) {
              song.keySigChanges.upsert(time8n, loc.headers[HeaderType.Key]);
            }
            // TODO process other types of header type.
          }
          if (loc.chordType === ChordInfoType.Slot || loc.chordType === ChordInfoType.TurnAroundStart) {
            return;
          }
          const isFirstChordInCell = loc.fractionalIdx.isWhole();
          if (isFirstChordInCell) {
            // Clear out all the chords in the duration occupied by the cell.
            song.chordChanges.removeWithinInterval(
              idxToTime8n(loc.cellIdx),
              idxToTime8n(loc.cellIdx + 1));
          }

          if (loc.chordType === ChordInfoType.Chord) {
            const time8n = idxToTime8n(loc.fractionalIdx);
            song.chordChanges.upsert(time8n, loc.chord);
          }
        });
        const lastLoc = chunk.chordHeaderLocs[chunk.chordHeaderLocs.length - 1];
        const end8n = idxToTime8n(lastLoc.cellIdx + 1);
        song.chordChanges.removeWithinInterval(end8n);

        // Even though we will not use this voice later. We need it now for
        // getEnd8n to work correctly.
        song.getVoice(0).noteGps = [new QuantizedNoteGp({
          start8n: song.pickup8n,
          end8n: end8n,
          realEnd8n: end8n,
        })];

        const part = new SongPart({
          song: song, syncopationPct: currSyncopation,
          densityPct: currDensity, transpose: transpose,
        });
        const turnAroundLoc = chunk.chordHeaderLocs.find(loc => loc.chordType === ChordInfoType.TurnAroundStart);
        if (turnAroundLoc) {
          part.turnaroundStart8n = idxToTime8n(turnAroundLoc.fractionalIdx);
        }

        partNameToPart[song.title] = part;
        partNameToInitialHeader[song.title] = headers;
        prevSong = song;
        return part;
      });
    }

    const defaultPartName = '::Unnamed::';

    function chunkLocationsByPart(chordHeaderLocs) {
      const zerothLoc = chordHeaderLocs.find(loc => loc.fractionalIdx.equals(0));
      if (!zerothLoc.headers) {
        zerothLoc.headers = {};
      }
      if (!zerothLoc.headers[HeaderType.Part]) {
        // Use colons to avoid name collision.
        zerothLoc.headers[HeaderType.Part] = defaultPartName;
      }
      return chunkArray(chordHeaderLocs, loc => loc.headers && loc.headers[HeaderType.Part]);
    }

    // Returns [{pickup: [chorderHeaderLoc], chordHeaderLocs: [chordHeaderLocs]}]
    function extractPickup(chunkedLocs) {
      // TODO suport pickup in later chunks.
      let chunkedLocsWithPickup;
      if (chunkedLocs[0][0].isPickup) {
        chunkedLocsWithPickup = chunkedLocs.slice(1).map((chunk, idx) => {
          let pickup = [];
          if (idx === 0) {
            // Throw away blank or slot chord type for pickup measure.
            const idx =  chunkedLocs[0].findIndex(loc => loc.chordType === ChordInfoType.Chord);
            if (idx === -1) {
              pickup = [];
            }
            pickup =  chunkedLocs[0].slice(idx);
          }
          return {
            pickup: pickup,
            chordHeaderLocs: chunk,
          };
        });
      } else {
        chunkedLocsWithPickup = chunkedLocs.map(chunk => {
          return {
            pickup: [],
            chordHeaderLocs: chunk,
          };
        });
      }
      return chunkedLocsWithPickup;
    }

    // [{fractionalIdx: Frac, cellIdx: Number, headers: ?{HeaderType: object},
    //   chordType: ChordInfoType, chord: ?Chord, isNewLine: bool, isPickup: bool}]
    function combineChordAndHeader(chordLocs, headerLocs, maxRows) {
      const chordLocByIndices = new Map();
      chordLocs.forEach(chordLoc => {
        chordLocByIndices.set(`${chordLoc.rowIdx},${chordLoc.colIdx}`, chordLoc);
      });
      const headersByCellIdx = new Map();
      headerLocs.forEach(headerLoc => {
        for (let chordRowIdx = headerLoc.rowIdx + 1; chordRowIdx < maxRows; chordRowIdx++) {
          const chordLoc = chordLocByIndices.get(`${chordRowIdx},${headerLoc.colIdx}`);
          if (!chordLoc) {
            continue;
          }

          let headers = headersByCellIdx.get(chordLoc.cellIdx);
          if (!headers) {
            headers = {};
            headersByCellIdx.set(chordLoc.cellIdx, headers);
          }
          headers[headerLoc.type] = headerLoc.value;
          break;
        }
      });
      return chordLocs.map(chordLoc => {
        const isFirstChordInCell = chordLoc.fractionalIdx.isWhole();
        return {
          fractionalIdx: chordLoc.fractionalIdx,
          cellIdx: chordLoc.cellIdx,
          chordType: chordLoc.type,
          chord: chordLoc.chord,
          // TODO See if we need to propagate more info from chordLoc.
          isNewLine: chordLoc.isNewLine,
          isPickup: chordLoc.colIdx < chordLoc.zeroTimeColIdx,
          headers: isFirstChordInCell ? headersByCellIdx.get(chordLoc.cellIdx) : undefined,
        }
      });
    }

    // Returns [{type: HeaderType, value: object, rowIdx: Number, colIdx: Number}]
    function parseHeaderLocations(gridData) {
      return gridData.flatMap((row, rowIdx) => {
        return row.map((cell, colIdx) => {
          const possKeyVal = cell.toString().split(':');
          if (possKeyVal.length !== 2) {
            return;
          }
          const res = processKeyVal(
            possKeyVal[0].trim().toLowerCase(),
            possKeyVal[1].trim(), /* warnError= */ true);
          if (!res) {
            return;
          }
          return {
            type: res.type,
            value: res.value,
            rowIdx: rowIdx,
            colIdx: colIdx,
          };
        }).filter(res => res);
      });
    }

    // LINT If you add fields that are specific to a particular song, make sure to unset them in startNextSong.
    const HeaderType = Object.freeze({
      Key: 'Key',
      Meter: 'Meter',
      Swing: 'Swing',
      Tempo: 'Tempo',
      TempoMultiplier: 'TempoMultiplier',
      Part: 'Part',
      VoicePart: 'VoicePart',
      LyricsPart: 'LyricsPart',
      Copy: 'Copy',
      CompingStyle: 'CompingStyle',
      Syncopation: 'Syncopation',
      Density: 'Density',
      // Shift the entire song to this key, as supposed to `Key` 
      // Should be only be set once at the start.
      TransposedKey: 'TransposedKey',
      // Similar to TransposedKey but using a number instead and will
      // be applied on top of TransposedKey.
      TransposedNum: 'TransposedNum',
      // Shift the song by this number of semi-tones.
      // This can be set locally, and is interpreted relative to `TransposedKey`
      // if it exists, else `Key`.
      Transpose: 'Transpose',
      Repeat: 'Repeat',
      Subdivision: 'Subdivision',
      // TODO add a header for the ending to be dropped off when another part comes after.
    });

    const GlobalHeaderType = new Set([
      HeaderType.TransposedKey,
      HeaderType.TransposedNum,
      HeaderType.Repeat,
      HeaderType.TempoMultiplier,
    ]);

    function processKeyVal(key, valStr, warnError) {
      switch(key) {
        case 'key':
        case 'k':
          // TODO handle error.
          const keyChord = new Chord(Parser.parse(valStr));
          return {
            type: HeaderType.Key,
            value: keyChord.root,
          };
        case 'time':
        case 'meter':
        case 'm':
          const [upper, lower] = valStr.split('/');
          return {
            type: HeaderType.Meter,
            value: new TimeSig({upperNumeral: parseInt(upper), upperNulowerNumeralmeral: parseInt(lower)}),
          };
        case 'swing':
          // Light swing by default.
          let ratio = makeFrac(3, 2);
          valStr = valStr.toLowerCase();
          if (valStr === 'heavy' || valStr === 'hard') {
            ratio = makeFrac(5, 2);
          } else if (valStr === 'medium' || valStr === 'triplet') {
            ratio = makeFrac(2);
          }
          // TODO think of whether user need to control what type of note (8th note, quarter note, etc.) to swing using dur8n.
          return {
            type: HeaderType.Swing,
            value: new Swing({ratio: ratio})
          };
        case 'subdivision':
          return {
            type: HeaderType.Subdivision,
            value: parseInt(valStr),
          }
        case '8th-note-tempo':
        case 'tempo':
        case 'q':
          return {
            type: HeaderType.Tempo,
            value: parseInt(valStr),
          };
        case 'section':
        case 'part':
        case 'p':
          return {
            type: HeaderType.Part,
            value: valStr,
          };
        case 'voice':
        case 'voicepart':
          return {
            type: HeaderType.VoicePart,
            value: {
              name: valStr || defaultPartName,
              index: 0,
            },
          };
        case 'lyrics':
        case 'lyricspart':
          return {
            type: HeaderType.LyricsPart,
            value: {
              name: valStr || defaultPartName,
              index: 0,
            },
          };
        case 'voice1':
          return {
            type: HeaderType.VoicePart,
            value: {
              name: valStr || defaultPartName,
              index: 1,
            },
          };
        case 'lyrics1':
          return {
            type: HeaderType.LyricsPart,
            value: {
              name: valStr || defaultPartName,
              index: 1,
            },
          };
        case 'voice2':
          return {
            type: HeaderType.VoicePart,
            value: {
              name: valStr || defaultPartName,
              index: 2,
            },
          };
        case 'lyrics2':
          return {
            type: HeaderType.LyricsPart,
            value: {
              name: valStr || defaultPartName,
              index: 2,
            },
          };
        case 'repeat':
          return {
            type: HeaderType.Repeat,
            value: parseInt(valStr),
          };
        case 'copy':
          return {
            type: HeaderType.Copy,
            value: valStr,
          };
        case 'style':
          return {
            type: HeaderType.CompingStyle,
            value: CompingStyle[valStr] || CompingStyle.default,
          };
        case 'transpose':
          return {
            type: HeaderType.Transpose,
            value: parseInt(valStr),
          };
        case 'transposednum':
          return {
            type: HeaderType.TransposedNum,
            value: parseInt(valStr),
          };
        case 'transposedkey':
          const chord = new Chord(Parser.parse(valStr));
          return {
            type: HeaderType.TransposedKey,
            value: chord.root,
          };
        case 'tempomultiplier':
          return {
            type: HeaderType.TempoMultiplier,
            value: parseInt(valStr), 
          }
        case 'syncopation':
          return {
            type: HeaderType.Syncopation,
            value: parseInt(valStr),
          };
        case 'density':
          return {
            type: HeaderType.Density,
            value: parseInt(valStr),
          };
        // case 'form':
        //   // E.g. (a-b)-c Makes it possible to extend the song as (a-b)-(a-b)-c
        default:
          if (warnError) {
            console.warn('Unknown header key: ', key);
          }
      }
    }

    const ChordInfoType = Object.freeze({
      Chord: 'Chord',
      // Used for spacing
      Blank: 'Blank',
      // Used for a copied section.
      Slot: 'Slot',
      TurnAroundStart: 'TurnAroundStart',
      Unknown: 'Unknown',
    });

    // Returns [{type: ChordInfoType, chord: ?Chord, cellIdx: Number, fractionalIdx: Frac,
    //    rowIdx: Number, colIdx: Number, zeroTimeColIdx, number, isNewLine: bool}]
    function parseChordLocations(gridData) {
      const res = [];

      // TODO Should we use second row of chords to determin zeroTimeColIdx
      // instead of relying on the existence of key-value cell?
      // Determined fracIdx by looking at the first key-value cell.
      let zeroTimeColIdx = null;
      let currCellIdx = null;
      let isChordMode = true;

      const initCellIdxIfNeeded = colIdx => {
        if (zeroTimeColIdx === null) {
          console.warn('Encountered a chord before any header.');
          zeroTimeColIdx = colIdx;
          currCellIdx = 0;
          return;
        }
        if (currCellIdx === null) {
          currCellIdx = colIdx - zeroTimeColIdx;
        }
      };

      gridData.forEach((row, rowIdx) => {
        let lenientAboutErrors = false;
        let hasPrevErrorInRow = false;
        let isNewLine = true;
        row.forEach((cell, colIdx) => {
          if (hasPrevErrorInRow) {
            return;
          }
          cell = cell.toString().trim();
          if (!cell || cell.toLowerCase() === 'backing track') {
            return;
          }
          // Header.
          if (cell.includes(':')) {
            if (zeroTimeColIdx === null) {
              zeroTimeColIdx = colIdx;
            }
            const key = cell.toLowerCase().split(':')[0];
            if (key === 'part') {
              isChordMode = true;
            } else if (key.endsWith('part') || key.toLowerCase().startsWith('voice') || key.toLowerCase().startsWith('melody')|| key.toLowerCase().startsWith('lyrics')) {
              isChordMode = false;
            }
            return;
          }

          if (!isChordMode) {
            return;
          }
          const chordInfos = parseStringIntoChordInfos(cell);
          const len = chordInfos.filter(info => info.type !== ChordInfoType.TurnAroundStart).length;
          if (len === 0) {
            return;
          }
          hasPrevErrorInRow = chordInfos.some(info => info.type === ChordInfoType.Unknown);
          if (hasPrevErrorInRow && !lenientAboutErrors) {
            return;
          }
          // Be lenient after successfully parsing chords in the first cell.
          lenientAboutErrors = true;
          initCellIdxIfNeeded(colIdx);

          let infoIdx = 0;
          chordInfos.forEach(info => {
            info.cellIdx = currCellIdx;
            info.fractionalIdx = makeFrac(infoIdx, len).plus(currCellIdx);
            info.isNewLine = infoIdx === 0 && isNewLine;
            info.rowIdx = rowIdx;
            info.colIdx = colIdx;
            info.zeroTimeColIdx = zeroTimeColIdx;

            if (info.type !== ChordInfoType.TurnAroundStart) {
              infoIdx++;
            }
          });
          isNewLine = false;
          currCellIdx += 1;
          res.push(...chordInfos);
        });
      });
      return res;
    }

    // Returns [{type: ChordInfoType, chord: ?Chord}]
    function parseStringIntoChordInfos(cell) {
      return cell.split(' ').filter(text => {
        if (!text) {
          return false;
        }
        if (text === '|') {
          return false;
        }
        if (text === ')') {
          return false;
        }
        return true;
      }).map(text => {
        if (text === '(') {
          return {type: ChordInfoType.TurnAroundStart};
        }
        try {
          const chord = new Chord(Parser.parse(text.replaceAll('maj', 'M').replaceAll('-', 'm')));
          return {type: ChordInfoType.Chord, chord: chord}
        } catch (err) {
          if (text === '_') {
            return {type: ChordInfoType.Blank};
          }
          if (text === '-') {
            return {type: ChordInfoType.Slot};
          }
          console.warn('Failed to parse this as a chord: ', text);
          return {type: ChordInfoType.Unknown};
        }
      });
    }

    const scaleNumberToSpelling = {
      1: makeSpelling('C', 0),
      2: makeSpelling('D', 0),
      3: makeSpelling('E', 0),
      4: makeSpelling('F', 0),
      5: makeSpelling('G', 0),
      6: makeSpelling('A', 0),
      7: makeSpelling('B', 0),
    };

    function scaleDegreeToSpelling(scaleDegree) {
      // Need to clone since we are modifying this on the very next line.
      const res = new Spelling$1(scaleNumberToSpelling[scaleDegree.scaleNumber]);
      res.numSharps = scaleDegree.numSharps;
      return res;
    }

    // Deps: nearley (nearley.js), grammar (melodicCell.js)

    // TODO Design how to interface with parse.js.

    // Strip out the Bar and GuideBar in order to populate relDur.
    // For a note type, noteSpelling will be populated.
    // Returns [VoiceToken]
    function parseCell(cell) {
      const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
      parser.feed(cell);
      const tokens = parser.results[0];

      const numDivisions = 1 + tokens.filter(
        token => token.type === TokenType.Bar ||
        token.type === TokenType.GuideBar
      ).length;
      const chunks = chunkArray(tokens, token => token.type === TokenType.Bar);
      const res = chunks.flatMap(chunk => {
        chunk = chunk.filter(token => token.type !== TokenType.Bar);
        const chunkWithoutGuideBars = chunk.filter(token => token.type !== TokenType.GuideBar);
        const numTokens = chunkWithoutGuideBars.length;
        const numGuideBars = chunk.length - chunkWithoutGuideBars.length;
        const numDivisionsInChunk = 1 + numGuideBars;

        return chunkWithoutGuideBars.map(token => {
          return new VoiceToken({
            relDur: makeFrac(numDivisionsInChunk, numDivisions * numTokens),
            type: token.type,
            noteInfo: token.type === TokenType.Note ? new NoteInfo({
              spelling: token.solfege ? toSpelling(token.solfege) : (
                token.spelling ? makeSpelling(token.spelling.letter, token.spelling.numSharps) : null),
              scaleDegree: token.scaleDegree ? token.scaleDegree : null ,
              octave: token.octave + 5, // E.g. mi defaults to E5.
            }) : undefined,
          });
        });
      });
      return res;
    }

    class VoiceToken {
      constructor({relDur, type, noteInfo}) {
        this.relDur = relDur;
        this.type = type;
        this.noteInfo = noteInfo;
      }
    }

    class NoteInfo {
      constructor({spelling, scaleDegree, octave}) {
        this.spelling = spelling;
        this.scaleDegree = scaleDegree;
        this.octave = octave;
      }
      toNoteNum(currTimeSig) {
        return this.getSpelling(currTimeSig).toNoteNum(this.octave);
      }
      getSpelling(currTimeSig) {
        if (this.spelling) {
          return this.spelling;
        }
        return scaleDegreeToSpelling(this.scaleDegree)
          .shift(makeSpelling('C'), currTimeSig);
      }
    }

    const TokenType = {
      Bar: 'Bar',
      GuideBar: 'GuideBar',
      Note: 'Note',
      Blank: 'Blank',
      Slot: 'Slot',
      Rest: 'Rest',
    };

    function parseKeyValsToSongInfo(gridData, keyVals) {
      // 1. Group the cells into header, chord and voice.
      const groupedCells = groupCells(gridData);
      // 2. Attach the headers to the appropriate cell.
      const annotatedCells = combineHeadersWithCells(groupedCells, gridData.length);

      // 3. Chunk the cells into cellsParts.
      const cellsParts = chunkCellsToParts(annotatedCells);

      // TODO replace usages of chunkedLocsWithPickup with cellsParts and remove genChunkedLocs.
      const chunkedLocsWithPickup = genChunkedLocs(gridData);
      const initialHeaders = createInitialHeaders(chunkedLocsWithPickup, keyVals);
      const songForm = genChordOnlySongForm(chunkedLocsWithPickup, initialHeaders, keyVals);

      // 4a. Make it work for voice first.
      genSongPartsWithVoice(cellsParts, songForm);

      return {
        initialHeaders: initialHeaders,
        songForm: songForm,
      };

      // 4b. Migrate chords over.
      // // 4. Initialize the context headers.
      // const contextHeaders = initContextHeaders();
      // overrideFromUrlParams(contextHeaders, keyVals);
      
      // // 5. Use the context headers to interpret each cell, updating the context when encountering a new header.
      // const songParts = convertToSongParts(cellsParts, contextHeaders);
    }

    function genSongPartsWithVoice(cellsParts, songForm) {
      const voiceCellsParts = cellsParts.filter(part => part.type === CellType.Voice);
      const songParts = songForm.getParts();

      addVoicePartsToSongParts(voiceCellsParts, songParts);

      const lyricsCellsParts = cellsParts.filter(part => part.type === CellType.Lyrics);
      addLyricsPartsToSongParts(lyricsCellsParts, songParts);

      return songParts;
    }

    // TODO in the future, if there are multiple voiceCellsParts, do it here;
    // will need to implement muting of repeated voiceCellsPart here (i.e. revert the "supress" changes).
    function addVoicePartsToSongParts(voiceCellsParts, songParts) {
      const numIndices = Math.max(1, ...voiceCellsParts.map(part => part.index + 1));
      songParts.forEach(songPart => {
        const partName = songPart.song.title;
        for (let idx = 0; idx < numIndices; idx++) {
          const voiceCellsPart = voiceCellsParts.find(
            voiceCellsPart => partName === voiceCellsPart.name && idx === voiceCellsPart.index);
          if (!voiceCellsPart) {
            // Insert an empty voice with the correct duration if the voice is not specified
            // for a particular part name.
            addVoiceToSong(null, songPart, null, idx);
            continue;
          }
          let baseSongPart;
          if (voiceCellsPart.cells.length) {
            const partToCopy = voiceCellsPart.cells[0].headerValByType.get(HeaderType.Copy);
            if (partToCopy) {
              baseSongPart = songParts.find(songPart => songPart.song.title === partToCopy);
            }
          }
          addVoiceToSong(voiceCellsPart, songPart, baseSongPart, idx);
        }
      });
    }

    function addLyricsPartsToSongParts(lyricsCellsParts, songParts) {
      songParts.forEach(songPart => {
        const partName = songPart.song.title;
        const lyricsCellsPart = lyricsCellsParts.find(lyricsCellsPart => partName === lyricsCellsPart.name);
        if (!lyricsCellsPart) {
          return;
        }
        let baseLyricsPart;
        if (lyricsCellsPart.cells.length) {
          const partToCopy = lyricsCellsPart.cells[0].headerValByType.get(HeaderType.Copy);
          if (partToCopy) {
            baseLyricsPart = lyricsCellsParts.find(lp => lp.name === partToCopy);
          }
        }
        addLyricsToSong(lyricsCellsPart, songPart, baseLyricsPart);
      });
    }

    function addLyricsToSong(lyricsCellsPart, songPart, baseLyricsPart) {
      const qngs = songPart.song.getVoice(0).noteGps;
      const durPerMeasure8n = songPart.song.timeSigChanges.defaultVal.getDurPerMeasure8n();
      let baseCells = [];
      if (baseLyricsPart) {
        baseCells = baseLyricsPart.pickupCells.concat(baseLyricsPart.cells);
      }
      lyricsCellsPart.pickupCells.concat(lyricsCellsPart.cells).forEach((cell, idxRelPickupCell) => {
        const idx = idxRelPickupCell - lyricsCellsPart.pickupCells.length;
        const barStart8n = durPerMeasure8n.times(idx);
        const barEnd8n = durPerMeasure8n.times(idx + 1);
        const relevantQngs = qngs.filter(
          qng => !qng.isRest && qng.start8n.geq(barStart8n) && qng.start8n.lessThan(barEnd8n));
        if (cell.val === '_') {
          return;
        }

        let lyricsStr = cell.val;
        if (cell.val === '-') {
          if (idxRelPickupCell < baseCells.length) {
            lyricsStr = baseCells[idxRelPickupCell].val;
          }
        }
        const tokens = parseLyricsCell(lyricsStr);
        tokens.forEach((token, tokenIdx) => {
          if (tokenIdx >= relevantQngs.length) {
            return;
          }
          let word = token;
          // Handle the case of '- - - blah blah'.
          if (token === '-') {
            if (idxRelPickupCell < baseCells.length) {
              const baseTokens = parseLyricsCell(baseCells[idxRelPickupCell].val);
              if (tokenIdx < baseTokens.length) {
                word = baseTokens[tokenIdx];
              }
            }
          }
          relevantQngs[tokenIdx].lyrics = word;
        });
      });
    }

    function parseLyricsCell(lyricsString) {
      const asianRegexStr = '[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]';
      // 'abc  def' => ['abc', 'def']
      return lyricsString.split(/[\s]+/)
        // '天如' => ['天', '如']
        // Not using splitAfter here because we want:
        // '天?' => ['天?']
        .flatMap(phrase => splitBefore$1(phrase, asianRegexStr))
        .filter(phrase => phrase !== '');
    }

    function splitBefore$1(phrase, delimiterSubregexString) {
      // use positive look-ahead so that the split doesn't remove the delimiter.
      return phrase.split(new RegExp(`(?=${delimiterSubregexString})`));
    }

    function addVoiceToSong(voiceCellsPart, songPart, baseSongPart, voiceIdx) {
      const isFirst = voiceIdx === 0;
      const durPerMeasure8n = songPart.song.timeSigChanges.defaultVal.getDurPerMeasure8n();
      let seenNonblankToken = false;
      const tokenInfos = voiceCellsPart === null ? [] : voiceCellsPart.pickupCells.concat(voiceCellsPart.cells).flatMap((cell, idx) => {
        idx = idx - voiceCellsPart.pickupCells.length;
        const tokens = parseCell(cell.val.toLowerCase());
        let start8nRelIdx = makeFrac(0);
        return tokens.map(token => {
          const start8n = durPerMeasure8n.times(start8nRelIdx.plus(idx));
          const res = {
            token: token,
            start8n: start8n,
            end8n: durPerMeasure8n.times(start8nRelIdx.plus(token.relDur).plus(idx)),
          };
          start8nRelIdx = start8nRelIdx.plus(token.relDur);
          if (token.type !== TokenType.Blank) {
            seenNonblankToken = true;
          }
          if (!seenNonblankToken && start8n.lessThan(0)) {
            return;
          }
          return res;
        }).filter(info => info);
      });
      if (tokenInfos.length && tokenInfos[0]) {
        songPart.song.pickup8n = tokenInfos[0].start8n;
      }
      const qngInfos = tokenInfos.flatMap(tokenInfo => {
        const start8n = tokenInfo.start8n;
        const end8n = tokenInfo.end8n;
        const token = tokenInfo.token;
        if (token.type === TokenType.Note) {
          const currKeySig = songPart.song.keySigChanges.getChange(start8n).val;
          return [{
            qng: makeSimpleQng(
              start8n, end8n,
              [token.noteInfo.toNoteNum(currKeySig)], 120,
              [token.noteInfo.getSpelling(currKeySig)]),
          }];
        }
        if (token.type === TokenType.Slot) {
          const baseMelody = baseSongPart.song.voices[voiceIdx];
          const relevantBaseNoteGps = baseMelody.noteGps.map(qng => new QuantizedNoteGp(qng)).filter(
            noteGp => noteGp.start8n.geq(start8n) && noteGp.start8n.lessThan(end8n));
          const res = [];
          const baseStart8n = relevantBaseNoteGps.length ? relevantBaseNoteGps[0].start8n : end8n;
          if (start8n.geq(0) && start8n.lessThan(baseStart8n)) {
            res.push({qng: makeSimpleQng(start8n, baseStart8n), extendFromPrev: true});
          }
          // Else if:
          if (start8n.lessThan(0) && makeFrac(0).lessThan(baseStart8n)) {
            res.push({qng: makeSimpleQng(makeFrac(0), baseStart8n), extendFromPrev: true});
          }
          res.push(...relevantBaseNoteGps.map(noteGp => {
            return {qng: new QuantizedNoteGp(noteGp)};
          }));
          const finalInfo = res[res.length - 1];
          finalInfo.qng.end8n = end8n;
          return res;
        }
        // Handle blank or rest tokens.
        return [{qng: makeSimpleQng(start8n, end8n), extendFromPrev: token.type === TokenType.Blank}];
      });
      let latestBaseIdx = 0;
      qngInfos.forEach((info, idx) => {
        if (info.extendFromPrev && idx > 0) {
          qngInfos[latestBaseIdx].qng.end8n = info.qng.end8n;
        } else {
          latestBaseIdx = idx;
        }
      });
      const noteGps = qngInfos
        .filter((info, idx) => !(info.extendFromPrev && idx > 0))
        .map(info => info.qng);
      const end8n = songPart.song.getEnd8n();
      if (noteGps.length) {
        const finalNoteGp = noteGps[noteGps.length - 1];
        if (finalNoteGp.end8n.lessThan(end8n)) {
          noteGps.push(makeSimpleQng(finalNoteGp.end8n, end8n));
        }
      } else {
        // For empty voice, just insert rest for the entire duration.
        noteGps.push(makeSimpleQng(makeFrac(0), end8n));
      }
      const voice = new Voice$1({
        noteGps: noteGps,
      });
      // TODO remove this and do it when joining.
      voice.settingsChanges.defaultVal = new VoiceSettings({instrument: instruments.electric_piano_2});
      if (isFirst) {
        songPart.song.voices = [voice];
      } else {
        songPart.song.voices.push(voice);
      }
    }

    // function convertToSongParts(cellsParts, contextHeaders) {
    // }
    // function overrideFromUrlParams(contextHeaders, keyVals) {
    //   Object.entries(keyVals).forEach(([key, val]) => {
    //     const res = processKeyVal(
    //       key.trim().toLowerCase(),
    //       val.trim());
    //     if (!res) {
    //       return;
    //     }
    //     contextHeaders.set(res.type, res.value);
    //   });
    // }
    // function initContextHeaders() {
    //   const song = new Song({});
    //   const headers = new Map;
    //   headers.set(HeaderType.Meter, song.timeSigChanges.defaultVal);
    //   headers.set(HeaderType.Tempo, song.tempo8nPerMinChanges.defaultVal);
    //   headers.set(HeaderType.Key, song.keySigChanges.defaultVal);
    //   headers.set(HeaderType.Swing, song.swingChanges.defaultVal);
    //   headers.set(HeaderType.Transpose, 0);
    //   headers.set(HeaderType.Syncopation, 20);
    //   headers.set(HeaderType.Density, 20);
    //   headers.set(HeaderType.Repeat, 0);
    //   return headers;
    // }

    function chunkCellsToParts(cells) {
      const firstCellWithHeaders = cells.find(cell => cell.headerValByType.size > 0);
      const zeroTimeColIdx = firstCellWithHeaders ? firstCellWithHeaders.colIdx : 0;
      const chunks = chunkArray(cells, cell => cell.colIdx < zeroTimeColIdx ||
        cell.headerValByType.has(HeaderType.Part) ||
        cell.headerValByType.has(HeaderType.LyricsPart) ||
        cell.headerValByType.has(HeaderType.VoicePart));
      let pickupBuffer = [];
      let cellsPartsOrNull = chunks.map(chunk => {
        const firstCell = chunk[0];
        if (firstCell.colIdx < zeroTimeColIdx) {
          pickupBuffer.push(...chunk);
          return;
        }
        const type = firstCell.type;
        let partName = defaultPartName;
        let partIndex = 0;
        if (firstCell.headerValByType.has(HeaderType.Part)) {
          partName = firstCell.headerValByType.get(HeaderType.Part);
        } else if (firstCell.headerValByType.has(HeaderType.VoicePart)) {
          partName = firstCell.headerValByType.get(HeaderType.VoicePart).name;
          partIndex = firstCell.headerValByType.get(HeaderType.VoicePart).index;
        } else if (firstCell.headerValByType.has(HeaderType.LyricsPart)) {
          partName = firstCell.headerValByType.get(HeaderType.LyricsPart).name;
          partIndex = firstCell.headerValByType.get(HeaderType.LyricsPart).index;
        }
        const res = new CellsPart({cells: chunk, pickupCells: pickupBuffer, type: type, name: partName, index: partIndex});
        pickupBuffer = [];
        return res;
      });
      return cellsPartsOrNull.filter(x => x);
    }

    function groupCells(gridData) {
      let mode = CellType.Chord;
      const groupedCellsOrNull = gridData.flatMap((row, rowIdx) => {
        return row.map((val, colIdx) => {
          val = val.toString().trim();
          if (val === '') {
            return;
          }
          const cell = new Cell({val: val, rowIdx: rowIdx, colIdx: colIdx});
          if (val.split(':').length === 2) {
            const [key, valStr] = val.split(':');
            if (key.toLowerCase() === 'part') {
              mode = CellType.Chord;
            } else if (key.toLowerCase().startsWith('voice') || key.toLowerCase().startsWith('melody')) {
              mode = CellType.Voice;
            } else if (key.toLowerCase().startsWith('lyrics')) {
              mode = CellType.Lyrics;
            }
            cell.type = CellType.Header;
            return cell;
          }
          cell.type = mode;
          return cell;
        });
      });
      return groupedCellsOrNull.filter(cell => cell);
    }

    function combineHeadersWithCells(cells, maxRows) {
      const nonheaders = cells.filter(cell => cell.type !== CellType.Header);
      const headers = cells.filter(cell => cell.type === CellType.Header);
      const nonHeaderCellsByIndices = new Map(nonheaders.map(cell => [cell.getIdxStr(), cell]));
      headers.forEach(header => {
        for (let possNonheaderRowIdx = header.rowIdx + 1; possNonheaderRowIdx < maxRows; possNonheaderRowIdx++) {
          const nonHeaderCell = nonHeaderCellsByIndices.get(getIdxStr(possNonheaderRowIdx, header.colIdx));
          if (!nonHeaderCell) {
            continue;
          }
          const [key, valStr] = header.val.split(':');
          const typeVal = processKeyVal(key.trim().toLowerCase(), valStr.trim());
          if (typeVal) {
            nonHeaderCell.headerValByType.set(typeVal.type, typeVal.value);
            break;
          }
        }
      });
      return nonheaders;
    }

    function getIdxStr(rowIdx, colIdx) {
      return `${rowIdx},${colIdx}`;
    }

    const CellType = {
      Unknown: "Unknown",
      Header: "Header",
      Chord: "Chord",
      Voice: "Voice",
      Lyrics: "Lyrics",
    };

    class Cell {
      constructor({val = '', rowIdx, colIdx, type = CellType.Unknown, headerValByType = new Map}) {
        this.val = val;
        this.rowIdx = rowIdx;
        this.colIdx = colIdx;
        this.type = type;
        this.headerValByType = new Map(headerValByType);
      }
      getIdxStr() {
        return getIdxStr(this.rowIdx, this.colIdx);
      }
    }

    class CellsPart {
      constructor({cells, pickupCells, type, name, index}) {
        this.cells = cells;
        this.pickupCells = pickupCells;
        // Chord or Voice.
        this.type = type;
        this.name = name;
        // A number to distinguish the voices in a multi-voice part.
        this.index = index;
      }
    }

    function mod(x, y) {
      return ((x % y) + y) % y;
    }

    function gcd(x, y) {
      x = Math.abs(x);
      y = Math.abs(y);
      while(y) {
        var t = y;
        y = x % y;
        x = t;
      }
      return x;
    }

    function isPowerOf2(v) {
      return v && !(v & (v - 1));
    }

    function range(start, end, step) {
      step = step || 1;
      const res = [];
      for (let i = start; i < end; i += step) {
        res.push(i);
      }
      return res;
    }

    /**
     * Shuffles array in place. ES6 version
     * @param {Array} a items An array containing the items.
     */
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    /**
     * @fileoverview Description of this file.
     */

    function build(numer, denom) {
      if (isNaN(denom)) {
        denom = 1;
      }
      return new Frac(numer, denom);
    }

    function fromJson$1(json) {
      if (!json) {
        return build(0);
      }
      return new Frac(json.numer, json.denom);
    }

    class Frac {
      constructor(numer, denom) {
        if (isNaN(numer)) {
          throw 'numerator is NaN';
        }
        if (isNaN(denom)) {
          throw 'denominator is NaN';
        }
        if (denom == 0) {
          throw new Error("denominator must be non-zero.");
        }
        // Obtaining a unique rep.
        if (denom < 0) {
          numer = -numer;
          denom = -denom;
        }
        const gcd$1 = gcd(numer, denom);
        this.numer = numer / gcd$1;
        this.denom = denom / gcd$1;
      }

      getDenom() {
        return this.denom;
      }

      getNumer() {
        return this.numer;
      }

      // TODO remove all static methods
      static plus(f1, f2) {
        return new Frac(f1.numer * f2.denom + f2.numer * f1.denom, f1.denom * f2.denom);
      }
      static minus(f1, f2) {
        return Frac.plus(f1, f2.negative());
      }
      static times(f1, f2) {
        return new Frac(f1.numer * f2.numer, f1.denom * f2.denom);
      }
      static divides(f1, f2) {
        return new Frac(f1.numer * f2.denom, f1.denom * f2.numer);
      }

      isWhole() {
        return this.denom === 1;
      }

      plus(f2) {
        const f1 = this;
        if (typeof f2 === 'number') {
          throw 'Not a fraction';
        }
        return new Frac(f1.numer * f2.denom + f2.numer * f1.denom, f1.denom * f2.denom);
      }

      minus(f2) {
        const f1 = this;
        if (typeof f2 === 'number') {
          throw 'Not a fraction';
        }
        return f1.plus(f2.negative());
      }

      times(f2) {
        const f1 = this;
        if (typeof f2 === 'number') {
          throw 'Not a fraction';
        }
        return new Frac(f1.numer * f2.numer, f1.denom * f2.denom);
      }

      over(f2) {
        const f1 = this;
        if (typeof f2 === 'number') {
          throw 'Not a fraction';
        }
        return new Frac(f1.numer * f2.denom, f1.denom * f2.numer);
      }

      negative() {
        return new Frac(-this.numer, this.denom);
      }

      toString() {
        return `${this.numer}/${this.denom}`;
      }

      toFloat() {
        return this.numer / this.denom;
      }

      equals(frac2) {
        return this.numer === frac2.numer && this.denom === frac2.denom;
      }

      lessThan(frac2) {
        // Assumes that denom is > 0 always.
        return this.numer * frac2.denom < frac2.numer * this.denom;
      }
      leq(frac2) {
        return this.lessThan(frac2) || this.equals(frac2);
      }

      geq(frac2) {
        return !this.lessThan(frac2);
      }

      greaterThan(frac2) {
        return !this.leq(frac2);
      }

      weaklyInside(left, right) {
        return left.leq(this) && this.leq(right);
      }

      strictlyInside(left, right) {
        return left.lessThan(this) && this.lessThan(right);
      }

      fractionalPart() {
        return this.minus(this.wholePart());
      }

      wholePart() {
        return build(Math.floor(this.toFloat()));
      }
    }

    let Note$1 = class Note {
      constructor(noteNums, start) {
        this.noteNums = noteNums;
        this.start = start;
      }

      clone() {
        // ... clones the array.
        return buildNote([...this.noteNums], this.start);
      }
    };

    function buildNote(noteNums, start) {
      return new Note$1(noteNums, start);
    }

    // TODO replace 44 with something less arbitrary.
    const bassSeed = 44;

    function getBassNote(chord, seed) {
      seed = seed || bassSeed;
      const bassSpelling = chord.getBassSpelling();
      const noteNum = bassSpelling.toNoteNum(3) < seed ? bassSpelling.toNoteNum(3) : bassSpelling.toNoteNum(2);
      return noteNum;
    }

    function sameAndCloseToPrevBass(slot, prevSlot) {
      return (
        prevSlot && prevSlot.chord &&
        prevSlot.duration.lessThan(build(3, 4)) &&
        prevSlot.chord.getBassSpelling().toString() == slot.chord.getBassSpelling().toString());
    }

    function simpleBassRhythm(note1) {
      return [buildNote([note1], build(0))];
    }

    function simpleBass(slot, prevSlot) {
      const noteNum = getBassNote(slot.chord);
      return simpleBassRhythm(sameAndCloseToPrevBass(slot, prevSlot) ? noteNum + 12 : noteNum);
    }

    function twoBeatBassRhythm(duration, note1, note2) {
      const res = [buildNote([note1], build(0))];
      if (duration.lessThan(build(2, 4))) {
        return res;
      }
      if (duration.equals(build(2, 4))) {
        res.push(buildNote([note2], duration.minus(build(1, 4))));
        return res;
      }
      res.push(buildNote([note2], duration.minus(build(2, 4))));
      return res;
    }

    function twoBeatBass(slot) {
      const chord = slot.chord;
      const bassNoteNum = getBassNote(chord);
      const bassIsRoot = !chord.bass || chord.bass.letter == chord.root.letter;
      const noteNum2 = bassIsRoot ? bassNoteNum + chord.getFifthInterval() : chord.root.toNoteNum(3);
      const notes = [bassNoteNum, noteNum2];
      return twoBeatBassRhythm(slot.duration, ...notes);
    }

    function bossaNovaBassRhythm(duration, note1, note2) {
      const res = [buildNote([note1], build(0))];
      if (duration.leq(build(3, 8))) {
        return res;
      }
      if (Math.random() < 0.6) {
        res.push(buildNote([note2], build(3, 8)));
      }
      if (duration.leq(build(4, 8))) {
        return res;
      }
      res.push(buildNote([note2], build(4, 8)));
      if (duration.leq(build(7, 8))) {
        return res;
      }
      if (Math.random() < 0.6) {
        res.push(buildNote([note1], build(7, 8)));
      }
      return res;
    }

    function bossaNovaBass(slot, prevSlot) {
      const chord = slot.chord;
      const bassNoteNum = getBassNote(chord, 30);
      const bassIsRoot = !chord.bass || chord.bass.letter == chord.root.letter;
      const secondBassNoteNum = bassIsRoot ? bassNoteNum + chord.getFifthInterval() : chord.root.toNoteNum(3);
      const notes = [bassNoteNum, secondBassNoteNum];
      if (sameAndCloseToPrevBass(slot, prevSlot)) {
        notes.reverse();
      }
      return bossaNovaBassRhythm(slot.duration, ...notes);
    }

    const compSeed = 54;

    function bossaNovaCompRhythm(duration, notes) {
      const res = [];
      if (duration.leq(build(1, 4))) {
        return [buildNote(notes, build(0))];
      }
      const rand1 = Math.random();
      if (rand1 < 0.3) {
        res.push(buildNote(notes, build(1, 8)));
      } else if (rand1 < 0.6) {
        res.push(buildNote(notes, build(2, 8)));
      } else if (rand1 < 0.8) {
        res.push(buildNote(notes, build(0)));
      } else {
        res.push(buildNote([null], build(0)));
      }
      if (duration.leq(build(3, 4))) {
        return res;
      }
      if (Math.random() < 0.7) {
        res.push(buildNote(notes, build(5, 8)));
      } else {
        res.push(buildNote(notes, build(6, 8)));
      }
      return res;
    }

    function bossaNovaComp(slot) {
      const below = slot.chord.jazzChordTonesBelow(compSeed);
      return bossaNovaCompRhythm(slot.duration, below.slice(0, 2));
    }

    function nextMeasureTime(currTime, durationPerMeasure) {
      const numMeasure = measureNum(currTime, durationPerMeasure) + 1;
      return durationPerMeasure.times(build(numMeasure));
    }

    function measureNumToTime(measNum, durationPerMeasure, pickup) {
      const res = durationPerMeasure.times(build(measNum));
      if (res.lessThan(pickup.negative())) {
        return pickup.negative();
      }
      return res;
    }

    function computePrevBeat(currTime, step) {
      if (currTime.over(step).isWhole()) {
        return currTime.minus(step);
      }
      return build(Math.floor(currTime.over(step).toFloat())).times(step);
    }

    // First measure should be measure number 0.
    function measureNum(currTime, durationPerMeasure) {
      return Math.floor(currTime.over(durationPerMeasure).toFloat());
    }

    function lineNum(measNum, barsPerLine) {
      return measNum >= 0 ? Math.floor(measNum / barsPerLine) : 0;
    }

    function exec(noteMeas, start, end, timeSigNumer, timeSigDenom, cursorTime) {
      let noteGpArr = noteMeas;
      // TODO remove the mergeTiesAndRests calls when all operations are converted.
      if (cursorTime) {
        noteGpArr = [];
        noteMeas.forEach(noteGp => {
          if (cursorTime.strictlyInside(noteGp.start, noteGp.end)) {
            noteGpArr.push(...noteGp.split(cursorTime));
            return;
          }
          noteGpArr.push(noteGp);
        });
      }
      let chunks = toChunks(noteGpArr);
      chunks = tupletChunking(chunks);
      chunks = _notatableChunking(chunks, start, end, timeSigNumer, timeSigDenom);
      return chunks;
    }

    // [noteGp] -> [noteGp]
    function periodicSplit(noteGpsArr, period) {
      const res = [];
      noteGpsArr.forEach(noteGp => {
        let remainder = noteGp;
        while (true) {
          const nextMeasTime = nextMeasureTime(remainder.start, period);
          if (remainder.end.leq(nextMeasTime)) {
            res.push(remainder);
            return;
          }
          const [left, right] = remainder.split(nextMeasTime);
          res.push(left);
          remainder = right;
        }
      });
      return res;
    }

    // TODO see if this logic can be shared with periodicSplit or locationsToLines.
    // [noteGp] -> [[noteGps]]
    function splitIntoMeasures(noteGpsArr, period) {
      const res = [];
      let meas = [];
      noteGpsArr.forEach(noteGp => {
        let remainder = noteGp;
        while (true) {
          const nextMeasTime = nextMeasureTime(remainder.start, period);
          if (remainder.end.leq(nextMeasTime)) {
            meas.push(remainder);
            if (remainder.end.equals(nextMeasTime)) {
              res.push(meas);
              meas = [];
            }
            return;
          }
          const [left, right] = remainder.split(nextMeasTime);
          meas.push(left);
          remainder = right;
          if (remainder.end.equals(nextMeasTime)) {
            res.push(meas);
            meas = [];
          }
        }
      });
      if (meas.length > 0) {
        res.push(meas);
      }
      return res;
    }

    function isPossibleTuplet(noteGp) {
      return !isPowerOf2(noteGp.start.getDenom()) || !isPowerOf2(noteGp.end.getDenom());
    }

    // noteGpsArr -> chunks
    function toChunks(noteGpsArr) {
      return noteGpsArr.map(noteGp => {
        return new SingletonChunk([noteGp]);
      });
    }

    // A logical unit of note groups that should be rendered together
    class Chunk {
      constructor(noteGpsArr) {
        if (noteGpsArr.length < 1) {
          throw "noteGpsArr must not be empty."
        }
        this.noteGpsArr = noteGpsArr;
      }
      getNoteGps() {
        return this.noteGpsArr;
      }
      getAlteredNoteGps() {
        return this.noteGpsArr;
      }
      getAbcPreamble() {
        return '';
      }
    }

    class SingletonChunk extends Chunk {
      constructor(noteGpsArr) {
        super(noteGpsArr);
        if (noteGpsArr.length > 1) {
          throw "SingletonChunk must have length 1."
        }
      }
    }

    // p = the number of notes to be put into time q
    // q = the time that p notes will be played in
    // r = the number of notes to continue to do this action for.
    class TupletChunk extends Chunk {
      constructor(noteGpsArr) {
        super(noteGpsArr);
        this.altered = noteGpsArr;
        this.computable = false;
        this.computable = this._computePqr();
      }
      _computePqr() {
        let nextStart = null;
        this.altered = this.noteGpsArr.map(noteGp => {
          const clone = noteGp.clone();
          const dur = noteGp.getDuration().times(build(3, 2));
          if (nextStart) {
            clone.start = nextStart;
          }
          clone.end = clone.start.plus(dur);
          nextStart = clone.end;
          return clone;
        });
        this.p = 3;
        this.q = 2;
        this.r = this.getNoteGps().length;
        return true;
      }
      getAlteredNoteGps() {
        return this.altered;
      }
      getDurationMultiplier() {
        return build(this.q, this.p);
      }
      getAbcPreamble() {
        return `(${this.p}:${this.q}:${this.r}`;
      }
    }

    // Returns startingPoint s.t. its denom isPowerOf2 and
    // >= firstNoteGp.start.
    // If not possible, returns null.
    function _computeStartingPoint(firstNoteGp, attempt) {
      let startingPoint = firstNoteGp.end;
      while (true) {
        startingPoint = startingPoint.minus(attempt);
        if (isPowerOf2(startingPoint.getDenom())) {
          return startingPoint;
        }
        if (firstNoteGp.start.greaterThan(startingPoint)) {
          return null;
        }
      }
    }

    // Args: attempt is the unit duration.
    // Returns chunks with at most 2 chunk; the right chunk is a TupletChunk.
    // Returns null if the attempt failed.
    function _tryTupletChunking(noteGpsArr, startIdx, attempt, idxToRemainingNoteGp, skipMerging) {
      // The result of chunking
      const chunks = [];
      // NoteGps for the main tuplet chunk.
      const tupletNoteGps = [];
      const firstNoteGp = idxToRemainingNoteGp[startIdx] || noteGpsArr[startIdx];
      const startingPoint = _computeStartingPoint(firstNoteGp, attempt);
      if (!startingPoint) {
        return null;
      }
      if (firstNoteGp.start.greaterThan(startingPoint)) {
        return null;
      }

      // The leftmost non-tuplet chunk.
      if (firstNoteGp.start.lessThan(startingPoint)) {
        const [left, _] = firstNoteGp.split(startingPoint);
        chunks.push(new SingletonChunk([left]));
      }

      // The rightmost tuplet chunk.
      let nextPoint = startingPoint;
      let currIdx = startIdx;
      while (true) {
        // The start, end and tie of currNoteGp will be reconstructed given
        // all the timing information.
        const currNoteGp = idxToRemainingNoteGp[currIdx] || noteGpsArr[currIdx];
        const unsplitTupletNoteGp = currNoteGp.clone();
        unsplitTupletNoteGp.start = nextPoint;
        nextPoint = nextPoint.plus(attempt);
        const [tupletNoteGp, _] = unsplitTupletNoteGp.split(nextPoint);
        tupletNoteGps.push(tupletNoteGp);
        if (currNoteGp.end.lessThan(nextPoint)) {
          return null;
        }

        if (isPowerOf2(nextPoint.getDenom())) {
          if (currNoteGp.end.greaterThan(nextPoint)) {
            // The remainder will be left for the next
            // call of _tryTupletChunking to process.
            const remainder = currNoteGp.clone();
            remainder.start = nextPoint;
            idxToRemainingNoteGp[currIdx] = remainder;
          } else {
            idxToRemainingNoteGp[currIdx] = null;
          }
          break;
        }
        if (currNoteGp.end.equals(nextPoint)) {
          currIdx += 1;
        }
        if (currIdx >= noteGpsArr.length) {
          console.warn(
            'This should not happen; nextPoint.denom should be ' +
            'power of 2 before noteGpsArr runs out.');
          return null;
        }
      }

      // Test whether merging ties and rests within the tuplet chunk is notatable.
      const mergedTupletChunk = new TupletChunk(mergeTiesAndRests(tupletNoteGps));
      // Special case to reject.
      const noteGps = mergedTupletChunk.getNoteGps();
      if (noteGps.length == 2) {
        if (noteGps[0].getDuration().equals(build(1, 6))) {
          if (noteGps[1].getDuration().equals(build(1, 3))) {
            return null;
          }
        }
      }
      const notatable = mergedTupletChunk.getAlteredNoteGps().every(noteGp => {
        return _isNotatable(noteGp);
      });
      if (notatable && !skipMerging) {
        chunks.push(mergedTupletChunk);
      } else {
        chunks.push(new TupletChunk(tupletNoteGps));
      }

      range(startIdx, currIdx).forEach(idx => {
        idxToRemainingNoteGp[idx] = null;
      });
      return chunks;
    }

    function tupletChunking(singletonChunks, skipMerging) {
      const chunksWithTriplets = [];
      const noteGpsArr = singletonChunks.map(chunk => {
        return chunk.getNoteGps()[0];
      });
      // This lets the next iterations know the noteGpsArr that the current
      // iteration has modified/processed.
      // Null value means the noteGp has been processed completely.
      const idxToRemainingNoteGp = {};
      noteGpsArr.forEach((noteGp, idx) => {
        if (idxToRemainingNoteGp[idx] === null) {
          return;
        }
        noteGp = idxToRemainingNoteGp[idx] || noteGp;
        if (!isPossibleTuplet(noteGp)) {
          chunksWithTriplets.push(new SingletonChunk([noteGp]));
          return;
        }
        // const numer = noteGp.end.getNumer();
        // const baseAttemptNumer = numer > 0 ? Math.pow(2, Math.floor(Math.log2(numer))) : 1;
        let baseDenom = noteGp.end.getDenom();
        while (mod(baseDenom, 2) == 0) {
          baseDenom /= 2;
        }
        const baseAttempt = build(1, baseDenom);
        let possChunks = null;
        for (let exponent = 0; exponent < 10; exponent++) {
          const attempt = baseAttempt.over(build(Math.pow(2, exponent)));
          possChunks = _tryTupletChunking(
            noteGpsArr, idx, attempt, idxToRemainingNoteGp, skipMerging);
          if (possChunks) {
            break;
          }
        }    if (!possChunks) {
          console.warn('tupletChunking failed', noteGpsArr, noteGp);
          chunksWithTriplets.push(new SingletonChunk([noteGp]));
          return;
        }
        chunksWithTriplets.push(...possChunks);
      });
      return chunksWithTriplets;
    }

    function _isNotatable(noteGp) {
      const dur = noteGp.getDuration();
      return dur.getNumer() <= 3;
    }

    // Nice bound will be lenient because more checks come later.
    function _hasNiceBound(noteGp, timeSigDenom) {
      const dur = noteGp.getDuration();
      // Stricter bounds for 1/timeSigDenom to show beat contour clearly
      const beatDur = build(1, timeSigDenom);
      if (dur.equals(beatDur)) {
        const niceStart = mod(dur.getDenom(), noteGp.start.getDenom()) === 0;
        const niceEnd = mod(dur.getDenom(), noteGp.end.getDenom()) === 0;
        return niceStart && niceEnd;
      }

      const niceStart = mod(2 * dur.getDenom(), noteGp.start.getDenom()) === 0;
      const niceEnd = mod(2 * dur.getDenom(), noteGp.end.getDenom()) === 0;
      return niceStart && niceEnd;
    }

    // periodNumer is the timeSigNumer restricted to left and right
    function _computeDemarcations(
      noteGp, decomp, left, right, periodNumer, periodDenom) {
      const dur = noteGp.getDuration();
      // Don't break up long notes that fit perfectly.
      if (noteGp.start.equals(left) && noteGp.end.equals(right)) {
        return [];
      }
      // Don't break up long notes for simple time sig
      if (dur.greaterThan(build(3, 8)) && periodNumer <= 4) {
        return [];
      }
      // Don't break up dotted quarter notes for 2/4 and 3/4 cases.
      if (dur.equals(build(3, 8)) && periodNumer < 4 && periodDenom == 4) {
        return [];
      }
      // Don't break up dotted quarter notes for k/4 for k >= 4.
      const firstDecompInNoteGp = left.plus(decomp[0]).strictlyInside(noteGp.start, noteGp.end);
      if (dur.equals(build(3, 8)) && periodDenom == 4 && !firstDecompInNoteGp) {
        return [];
      }

      const demarcs = [];
      let curr = left;
      while (true) {
        curr = curr.plus(build(1, periodDenom));
         if (curr.geq(right)) {
           break;
         }
         demarcs.push(curr);
      }
      return demarcs
    }

    // Precondition: Demaracations are checked after bounds are checked to be nice.
    function _crossedDemarcations(demarcs, noteGp) {
      const ans = demarcs.some(demarc => {
          return demarc.strictlyInside(noteGp.start, noteGp.end);
        });
      return ans;
    }

    // TODO allow override:
    // const timeSigNumerDecompOverride = {
    //   5: [2, 3],
    // };
    // Precondition: left <= noteGp.start && noteGp.end <= right
    function _decompose(noteGp, left, right, timeSigNumer, timeSigDenom) {
      if (!noteGp) {
        return [];
      }
      if (noteGp.isGraceNote()) {
        return [noteGp];
      }

      const period = right.minus(left);
      if (period.lessThan(build(1, 64))) {
        console.warn('There may be some issue with _decompose', noteGp, left, right);
        return [noteGp];
      }
      // periodDenom is the timeSigDenom unless the period is smaller than 1/timeSigDenom
      let periodNumer = period.getNumer();
      let periodDenom = period.getDenom();
      if (mod(timeSigDenom, periodDenom) === 0) {
        periodNumer = periodNumer * timeSigDenom / periodDenom;
        periodDenom = timeSigDenom;
      }
      // decomp shows duration of the left-most decomp and
      // the second left-most defcomp.
      let decomp = [
        build(1, periodDenom),
        build(periodNumer - 1, periodDenom)];
      if (periodNumer === 1) {
        decomp = [
          build(1, 2 * periodDenom),
          build(1, 2 * periodDenom)];
      }
      if (periodNumer === 4) {
        decomp = [build(2, periodDenom), build(2, periodDenom)];
        // This is for not splitting dotted half note for a note that
        // that goes from e.g. 1/8 to 1/1.
        // (Split to 1/8 to 1/4 and 1/4 to 4/4).
        if (noteGp.start.lessThan(left.plus(build(1, timeSigDenom))) && noteGp.end.equals(right)) {
          decomp = [build(1, periodDenom), build(3, periodDenom)];
        }
        if (noteGp.end.greaterThan(right.minus(build(1, timeSigDenom))) && noteGp.start.equals(left)) {
          decomp = [build(3, periodDenom), build(1, periodDenom)];
        }
      }
      if (periodNumer === 5) {
        decomp = [build(3, periodDenom), build(2, periodDenom)];
      }
      if (periodNumer > 5) {
        decomp = [build(3, periodDenom), build(3, periodDenom)];
      }

      const demarcs = _computeDemarcations(
        noteGp, decomp, left, right, periodNumer, periodDenom);
      // console.log(left, right);
      // console.log(noteGp.start);
      // console.log(noteGp.end);
      // console.log(demarcs);
      if (_isNotatable(noteGp)) {
        // console.log(_hasNiceBound(noteGp, timeSigDenom));
        if (_hasNiceBound(noteGp, timeSigDenom)) {
          const crossedDemarc = _crossedDemarcations(demarcs, noteGp);
          // console.log(crossedDemarc);
          if (!crossedDemarc) {
            return [noteGp];
          }
        }
      }

      const mid = left.plus(decomp[0]);
      if (!mid.strictlyInside(left, right)) {
        console.warn('Unexpected middle', mid, left, right);
        return [noteGp];
      }
      return _splitAndDecompose(noteGp, left, mid, right, timeSigNumer, timeSigDenom);
    }

    function _splitAndDecompose(noteGp, left, mid, right, timeSigNumer, timeSigDenom) {
      const [leftSplit, rightSplit] = noteGp.split(mid);
      return _decompose(leftSplit, left, mid, timeSigNumer, timeSigDenom).concat(
        _decompose(rightSplit, mid, right, timeSigNumer, timeSigDenom));
    }

    // Chunks that are not Tuplet should have noteGp duration 2^n at this point.
    function _notatableChunking(chunks, start, end, timeSigNumer, timeSigDenom) {
      const res = [];
      chunks.forEach(chunk => {
        if (chunk instanceof TupletChunk) {
          res.push(chunk);
          return;
        }
        if (!(chunk instanceof SingletonChunk)) {
          console.warn('Chunk of unknown type', chunk);
          res.push(chunk);
          return;
        }
        const noteGp = chunk.getNoteGps()[0];
        if (!isPowerOf2(noteGp.getDuration().getDenom())) {
          console.warn('noteGp with non-power-of-2 denom', noteGp);
          res.push(chunk);
          return;
        }
        const dNoteGps = _decompose(noteGp, start, end, timeSigNumer, timeSigDenom);
        dNoteGps.forEach(dNoteGp => {
          res.push(new SingletonChunk([dNoteGp]));
        });
      });
      return res;
    }

    // [noteGp] -> [noteGp]
    function mergeTiesAndRests(noteGpsArr) {
      return _mergeRests(_mergeTies(noteGpsArr));
    }

    function _mergeTies(noteGpsArr) {
      const res = [];
      let startingTie = null;
      noteGpsArr.forEach(noteGp => {
        // Case 1: Notes with ties; keep track of starting point
        if (noteGp.tie) {
          if (!startingTie) {
            startingTie = noteGp;
            // TODO remove mergeTiesAndRests when input is tieless.
            // console.log('Has tie notes.')
          }
          return;
        }
        // Case 2: No tied notes before current note.
        if (!startingTie) {
          res.push(noteGp);
          return;
        }
        // Case 3: Process the tied notes before.
        const mergedNoteGp = noteGp.clone();
        mergedNoteGp.start = startingTie.start;
        res.push(mergedNoteGp);
        startingTie = null;
        return;
      });
      // Case 4: Process the tied notes not handled by case 3.
      if (startingTie && noteGpsArr.length > 0) {
        const mergedNoteGp = noteGpsArr[noteGpsArr.length - 1].clone();
        mergedNoteGp.start = startingTie.start;
        res.push(mergedNoteGp);
      }
      return res;
    }

    function _mergeRests(noteGpsArr) {
      const res = [];
      let startingRest = null;
      noteGpsArr.forEach(noteGp => {
        // Case 1: Rests; keep track of starting point
        if (noteGp.isRest()) {
          if (!startingRest) {
            startingRest = noteGp;
            // TODO remove mergeTiesAndRests when input is tieless.
            // console.log('Has split rest notes.')
          }
          return;
        }
        // Case 2: No rests before current note.
        if (!startingRest) {
          res.push(noteGp);
          return;
        }
        // Case 3: Process the rests before the current note.
        const mergedNoteGp = startingRest.clone();
        mergedNoteGp.end = noteGp.start;
        res.push(mergedNoteGp);
        res.push(noteGp);
        startingRest = null;
        return;
      });
      // Case 4: Process the rests not handled by case 3 because the final note is a rest.
      if (startingRest && noteGpsArr.length > 0) {
        const mergedNoteGp = startingRest.clone();
        mergedNoteGp.end = noteGpsArr[noteGpsArr.length - 1].end;
        res.push(mergedNoteGp);
      }
      return res;
    }

    // // chunks -> noteGpsArr
    // export function toNoteGps(chunks) {
    //   return chunks.map(chunk => {
    //     return chunk.getNoteGps();
    //   }).flat();
    // }

    const VERSION = '0-0';

    function isDebug() {
      return (new URL(document.URL)).origin.includes('localhost');
    }

    function version() {
      if (isDebug()) {
        return 'song-debug';
      }
      return 'song-' + VERSION;
    }

    // A special doubly linked list for making local edit operations O(1).
    class List {
      constructor(array, idx) {
        array = array || [];
        idx = idx || 0;
        if (idx < 0 || idx > array.length) {
          // Note that idx <= array.length because RIGHT_END
          // is an extra node that is not in the array.
          console.warn('index, array length: ', idx, array.length);
          throw 'index out of bound';
        }
        this.rightEnd = new _Node("RIGHT_END");
        this.currNode = this.rightEnd;
        array.forEach(item => {
          this.add(item);
        });
        const idxFromRight = array.length - idx;
        range(0, idxFromRight).forEach(_ => {
          this.moveLeft();
        });
      }

      ////// Import/Export
      toArray() {
        let travNode = this.rightEnd;
        const rev = [];
        while (travNode.left) {
          travNode = travNode.left;
          rev.push(travNode.item);
        }
        return [...rev].reverse();
      }

      toArrayStartingFromCurr() {
        let travNode = this.currNode;
        const res = [];
        while (travNode && travNode !== this.rightEnd) {
          res.push(travNode.item);
          travNode = travNode.right;
        }
        return res;
      }

      ////// Access
      getCurr() {
        if (this.atTail()) {
          return null;
        }
        return this.currNode.item;
      }

      // Can return null;
      getLeft() {
        const left = this.currNode.left;
        return left ? left.item : null;
      }

      // Can return null;
      getRight() {
        const right = this.currNode.right;
        if (!right || right === this.rightEnd) {
          return null;
        }
        return right.item;
      }

      atTail() {
        return this.currNode === this.rightEnd;
      }

      atHead() {
        return !this.currNode.left;
      }

      get2ndLast() {
        if (this.rightEnd.left) {
          return this.rightEnd.left.item;
        }
        return null;
      }

      getCurrIdx() {
        let travNode = this.rightEnd;
        let idxFromRight = 0;
        while (true) {
          if (travNode === this.currNode) {
            return this.toArray().length - idxFromRight;
          }
          if (!travNode.left) {
            throw 'unable to find current index';
          }
          travNode = travNode.left;
          idxFromRight += 1;
        }
      }

      ////// Navigation
      moveLeft() {
        if (!this.currNode.left) {
          return false;
        }
        this.currNode = this.currNode.left;
        return true;
      }

      moveRight() {
        if (!this.currNode.right) {
          return false;
        }
        this.currNode = this.currNode.right;
        return true;
      }

      ////// Mutation
      // Add an item to the left of the current item. Current item remains the same item.
      add(item) {
        const newLeftLeft = this.currNode.left;
        const newNode = new _Node(item, newLeftLeft, this.currNode);
        this.currNode.left = newNode;
        if (newLeftLeft) {
          newLeftLeft.right = newNode;
        }
      }

      // Remove the item to the left of the current item.
      remove() {
        const oldLeft = this.currNode.left;
        if (!oldLeft) {
          return;
        }
        this.currNode.left = oldLeft.left;
        if (oldLeft.left) {
          oldLeft.left.right = this.currNode;
        }
      }

    }

    class _Node {
      constructor(item, left, right) {
        this.item = item;
        this.left = left;
        this.right = right;
      }
    }

    function boundedWhile(action, max_iter) {
      let breakCondition = false;
      function breakFunc() {
        breakCondition = true;
      }
      let idx = 0;
      while (!breakCondition) {
        if (idx > max_iter) {
          break;
        }
        action(breakFunc, idx);
        idx++;
      }
    }

    function fromJson(json) {
      if (!json) {
        return null;
      }
      return new Spelling(
        json.letter,
        json.numSharps,
        json.hasNatural);
    }

    function getNoteNumToNoAccidSpelling(){
      return {
        0: new Spelling('C'),
        2: new Spelling('D'),
        4: new Spelling('E'),
        5: new Spelling('F'),
        7: new Spelling('G'),
        9: new Spelling('A'),
        11: new Spelling('B'),
      };
    }

    function fromNoteNumWithLetter(num, letter) {
      const numModOctave = mod(num, 12);
      for (let numSharps = 0; numSharps <= 2; numSharps++) {
        const try1 = new Spelling(letter, numSharps);
        if (mod(try1.toNoteNum(), 12) == numModOctave) {
          return try1;
        }
        const try2 = new Spelling(letter, -numSharps);
        if (mod(try2.toNoteNum(), 12) == numModOctave) {
          return try2;
        }
      }
      console.warn(
        'Unable to find spelling with les than 3 accidentals from note number for letter.',
        num, letter);
      return fromNoteNum(num);
    }

    function fromNoteNumWithMapping(num, mapping) {
      const numModOctave = mod(num, 12);
      return mapping[numModOctave];
    }

    function getNextLetter(letter) {
      return {
        A: 'B',
        B: 'C',
        C: 'D',
        D: 'E',
        E: 'F',
        F: 'G',
        G: 'A',
      }[letter];
    }

    function translateMapping(mappingInC, chord) {
      let currLetter = 'C';
      const letterRaises = [];
      range(0, 12).forEach(idx => {
        const nextLetter = mappingInC[idx].letter;
        letterRaises.push(nextLetter !== currLetter);
        currLetter = nextLetter;
      });
      const finalMapping = {};
      let currSpelling = chord.root;
      range(0, 12).forEach(idx => {
        let letterToUse = currSpelling.letter;
        if (letterRaises[idx]) {
          letterToUse = getNextLetter(currSpelling.letter);
        }
        const currNoteNum = mod(chord.root.toNoteNum() + idx, 12);
        currSpelling = fromNoteNumWithLetter(currNoteNum, letterToUse);
        finalMapping[currNoteNum] = currSpelling;
      });
      return finalMapping;
    }

    function getStandardMappingInC() {
      const mappingInC = {
        1: new Spelling('D', -1),
        3: new Spelling('E', -1),
        6: new Spelling('F', 1),
        8: new Spelling('A', -1),
        10: new Spelling('B', -1),
      };
      return Object.assign(mappingInC, getNoteNumToNoAccidSpelling())
    }

    function getDiminishedMappingInC() {
      return {
        0: new Spelling('C'),
        1: new Spelling('D', -1),
        2: new Spelling('D'),
        3: new Spelling('E', -1),
        4: new Spelling('F', - 1),
        5: new Spelling('F'),
        6: new Spelling('G', -1),
        7: new Spelling('G'),
        8: new Spelling('A', -1),
        9: new Spelling('B', -2),
        10: new Spelling('B', -1),
        11: new Spelling('C', -1),
      }
    }

    function fromNoteNumWithChord(num, chord) {
      if (!chord) {
        return fromNoteNum(num);
      }

      let mappingInC = getStandardMappingInC();
      if (chord.isDiminished()) {
        mappingInC = getDiminishedMappingInC();
      }
      if (chord.isAugmented()) {
        mappingInC[8] = new Spelling('G', 1);
      }
      const finalMapping = translateMapping(mappingInC, chord);
      return fromNoteNumWithMapping(num, finalMapping);
    }

    function fromNoteNum(num) {
      let mapping = {
        1: new Spelling('C', 1),
        3: new Spelling('E', -1),
        6: new Spelling('F', 1),
        8: new Spelling('A', -1),
        10: new Spelling('B', -1),
      };
      mapping = Object.assign(mapping, getNoteNumToNoAccidSpelling());

      return fromNoteNumWithMapping(num, mapping);
    }
    function fromNoteNumWithFlat(num) {
      let mapping = {
        1: new Spelling('D', -1),
        3: new Spelling('E', -1),
        6: new Spelling('G', -1),
        8: new Spelling('A', -1),
        10: new Spelling('B', -1),
      };
      mapping = Object.assign(mapping, getNoteNumToNoAccidSpelling());

      return fromNoteNumWithMapping(num, mapping);
    }

    function fromNoteNumWithSharp(num) {
      let mapping = {
        1: new Spelling('C', 1),
        3: new Spelling('D', 1),
        6: new Spelling('F', 1),
        8: new Spelling('G', 1),
        10: new Spelling('A', 1),
      };
      mapping = Object.assign(mapping, getNoteNumToNoAccidSpelling());

      return fromNoteNumWithMapping(num, mapping);
    }

    class Spelling {
      constructor(letter, numSharps, hasNatural) {
        this.letter = letter || 'C';
        this.letter = this.letter.toUpperCase();
        this.numSharps = numSharps || 0;
        this.hasNatural = hasNatural || false;
      }

      equals(sp2) {
        return (
          this.letter === sp2.letter
          && this.numSharps === sp2.numSharps
          && this.hasNatural === sp2.hasNatural
        );
      }

      toAbc(octaveNum) {
        const octaveNumRelC4 = octaveNum - 4;
        return [
          this.numSharps > 0 ? '^'.repeat(this.numSharps) : '',
          this.numSharps < 0 ? '_'.repeat(-this.numSharps) : '',
          this.hasNatural ? '=' : '',
          this.letter.toUpperCase(),
          octaveNumRelC4 > 0 ? "'".repeat(octaveNumRelC4) : '',
          octaveNumRelC4 < 0 ? ",".repeat(-octaveNumRelC4) : '',
        ].join('');
      }

      toNoteNum(octaveNum) {
        octaveNum = octaveNum || 0;
        return octaveNum * 12 + letterToBaseNoteNum[this.letter] + this.numSharps;
      }

      toString() {
        const accidentals = this.numSharps > 0 ? '#'.repeat(this.numSharps) : 'b'.repeat(-this.numSharps);
        return `${this.letter.toUpperCase()}${accidentals}`;
      }

      shift(key1, key2) {
        const noteNumShift = mod(key2.toNoteNum() - key1.toNoteNum(), 12);
        const charShift = key2.minus(key1);
        let newLetter = this.letter;
        range(0, charShift).forEach(_ => {
          newLetter = getNextLetter(newLetter);
        });
        return fromNoteNumWithLetter(this.toNoteNum() + noteNumShift, newLetter);
      }
      minus(sp2) {
        return mod(_ascii(this.letter) - _ascii(sp2.letter), numLetters);
      }
    }

    function _ascii(a) { return a.charCodeAt(0); }

    const numLetters = 7;

    const letterToBaseNoteNum = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11,
    };

    function getValues(collectionName, docName) {
      const db = firebase.firestore();
      return db.collection(collectionName).doc(docName).get().then(function (doc) {
          if (doc.exists) return doc.data();
          return null;
      });
    }

    async function retrieve(id) {
      const collName = version();
      try {
        const doc = await getValues(collName, id);
        if (doc) {
          return JSON.parse(doc.payload);
        }
      } catch (err) {
        console.warn('Failed to retrieve document.', err);
      }
    }

    const CURSOR = '🐱';

    function renderChordMeas(chordMeas, abcList, abcNoteDuration, measStartTime, measureEndTime) {
      if (chordMeas.length === 0) {
        // TODO possibly remove this if abcJs fixes their bug for tuplet in pickup.
        const dur = measureEndTime.minus(measStartTime);
        const mult = Frac.divides(dur, abcNoteDuration);
        abcList.push(` y${mult.toString()}`);

        return;
      }
      const chordLoc = chordMeas[0];
      if (measStartTime.lessThan(chordLoc.start)) {
        const dur = chordLoc.start.minus(measStartTime);
        const mult = Frac.divides(dur, abcNoteDuration);
        const blankNote = ` x${mult.toString()} `;
        abcList.push(blankNote);
      }
      chordMeas.forEach((chordLoc, idx) => {
        const endTime = (
          idx + 1 < chordMeas.length ? chordMeas[idx + 1].start :
          measureEndTime);
        const dur = endTime.minus(chordLoc.start);
        const mult = Frac.divides(dur, abcNoteDuration);
        const chordString = chordLoc.chord ? chordLoc.chord.toString() : '';
        const cursor = chordLoc.onCursor ? CURSOR : '';
        const chord = ` "${cursor}${chordString}"x${mult.toString()} `;
        abcList.push(chord);
      });
    }

    // chunks is a list of NoteGps.
    // Returns the current proximateChordIdx for the next renderMeas to use.
    function renderMeas(
        chunks, abcList, currNoteGp, keySigSharpMap, timeSigDenom,
        showNotesCursor, showSpelling, abcNoteDuration, chordLocs,
        prevProximateChordIdx, measureEndTime, cursorTime) {
      if (chunks.length === 0) {
        return prevProximateChordIdx;
      }

      // TODO think about moving this block to where chunking happens
      let proximateChordIdx = prevProximateChordIdx;
      let sharpMap = {};
      chunks.forEach((chunk, chunkIdx) => {
        const noteGpsArr = chunk.getNoteGps();
        noteGpsArr.forEach((noteGp, idx) => {
          proximateChordIdx = _getProximateChordIdx(proximateChordIdx, noteGp, chordLocs);
          const proximateChord = chordLocs.length < 1 ? null : chordLocs[proximateChordIdx].chord;

          if (!noteGp.isGraceNote()) {
            // Display cursor at the unique non-grace noteGp that currNoteGp is associated with.
            if (showNotesCursor) {_displayCursor(abcList, noteGp, currNoteGp, cursorTime);}
            if (showSpelling) {_displaySpelling(abcList, noteGp, proximateChord);}
          }

          // TODO think of how to make the grace note rendering cleaner.
          if (noteGp.isGraceNote()) {
            // No need to handle grace note within a tuplet chunk. Not possible currently.
            // Start of grace note in a singleton chunk
            if (chunkIdx - 1 < 0 ||
              !(chunks[chunkIdx - 1] instanceof SingletonChunk) ||
              !chunks[chunkIdx - 1].getNoteGps()[0].isGraceNote()) {
                abcList.push('{');
            }
          }

          const alteredNoteGps = chunk.getAlteredNoteGps()[idx];
          _displayNoteGp(
            abcList, alteredNoteGps, sharpMap, keySigSharpMap, proximateChord,
            abcNoteDuration, timeSigDenom, chunk, idx);

          // TODO think of how to make the grace note rendering cleaner.
          if (noteGp.isGraceNote()) {
            // End of grace note in a singleton chunk
            if (chunkIdx + 1 > chunks.length ||
              !(chunks[chunkIdx + 1] instanceof SingletonChunk) ||
              !chunks[chunkIdx + 1].getNoteGps()[0].isGraceNote()) {
                abcList.push('}');
            }
          }
        });
      });

      _padFinalMeasure(abcList, measureEndTime, chunks, abcNoteDuration);
      return proximateChordIdx;
    }

    // Split the interval between startTime and endTime if it crosses measure boundaries.
    function _split(startTime, endTime, durationPerMeasure) {
      const res = [];
      let currStartTime = startTime;
      while (true) {
        const cutoffTime = nextMeasureTime(currStartTime, durationPerMeasure);
        const currEndTime = cutoffTime.lessThan(endTime) ? cutoffTime : endTime;
        res.push({
          start: currStartTime,
          end: currEndTime
        });
        if (currEndTime.geq(endTime)) {
          break;
        }
        currStartTime = currEndTime;
      }
      return res;
    }

    function _displayCursor(abcList, noteGp, currNoteGp, cursorTime) {
      // Use equality of start because other parts of currNoteGp
      // may have been changed.
      if (!currNoteGp) {
        return;
      }
      if (!cursorTime.equals(noteGp.start)) {
        return;
      }
      abcList.push(`"<${CURSOR}"`);

      if (!currNoteGp.isGraceNote()) {
        return;
      }

      const abcSpelling = fromNoteNum(currNoteGp.getNotes()[0].noteNum);
      // TODO think of better ways show that the cursor is pointing to a grace note.
      abcList.push(`"<${abcSpelling}"`);
    }

    function _displaySpelling(abcList, noteGp, proximateChord) {
      if (noteGp.tie) {
        return;
      }
      noteGp.getNotes().forEach(note => {
        if (!note.noteNum) {
          return;
        }
        const spelling = (
          note.spelling ? note.spelling :
          fromNoteNumWithChord(note.noteNum, proximateChord));
        abcList.push(`">${spelling.toString()}"`);
      });
    }

    function _displayNoteGp(
        abcList, noteGp, sharpMap, keySigSharpMap, proximateChord,
        abcNoteDuration, timeSigDenom, chunk, idx) {
      // Add space to break beams when denom is 4, 2 or 1 for timeSig 3/4 or 4/4, .
      if (idx === 0 && build(timeSigDenom, noteGp.start.denom).isWhole()) {
        abcList.push(' ');
      }
      if (idx === 0 && chunk.getAbcPreamble()) {
        abcList.push(chunk.getAbcPreamble());
      }
      const hasMultNotes = noteGp.getNotes().length > 1;
      if (hasMultNotes) {
        abcList.push('[');
      }
      const dur = noteGp.getDuration();
      // TODO handle tuplets i.e. C'2/3D'2/3E'2/3 -> (3:2C'D'E'
      noteGp.getNotes().forEach(note => {
        // TODO duration being 5/8 is not working.
        let abcNote = noteNumToAbc(note, sharpMap, keySigSharpMap, proximateChord);
        if (noteGp.isGraceNote()) {
          // The grace notes braces are added outside of this function
          // in order to support multiple grace notes.
          abcList.push(`${abcNote}`);
        } else {
          const mult = Frac.divides(dur, abcNoteDuration);
          abcNote += mult.toString();
          abcList.push(abcNote);
        }
      });
      if (hasMultNotes) {
        abcList.push(']');
      }
      if (noteGp.tie) {
        abcList.push("-");
      }
    }

    function _getProximateChordIdx(proximateChordIdx, noteGp, chordLocs) {
      // if (noteGp.start.lessThan(chordLocs[proximateChordIdx].start)) {
        // TODO a good initial chord is the dominant of the starting chord; e.g. C7 -> F.
        // return dominantChordOf(chordLocs[proximateChordIdx]);
      // }

      for (let idx = proximateChordIdx + 1; idx < chordLocs.length; idx++) {
        const chordLoc = chordLocs[idx];
        if (noteGp.start.lessThan(chordLoc.start)) {
          break;
        }
        proximateChordIdx = idx;
      }
      return proximateChordIdx;
    }

    function _padFinalMeasure(abcList, measureEndTime, chunks, abcNoteDuration) {
      const lastNoteGps = chunks[chunks.length - 1].getNoteGps();
      const lastNoteGp = lastNoteGps[lastNoteGps.length - 1];
      const remainingDuration = measureEndTime.minus(lastNoteGp.end);
      if (remainingDuration.toFloat() <= 0) {
        return;
      }
      const mult = Frac.divides(remainingDuration, abcNoteDuration);
      abcList.push('x' + mult.toString());
    }

    function _computeKeySigSharpMap(keySigSp) {
      const sharpMap = {};
      // Case 1: flats
      if (keySigSp.toString() === 'C') {
        return sharpMap;
      }
      if (keySigSp.numSharps < 0 || keySigSp.toString() === 'F') {
        let currNoteNum = keySigSp.toNoteNum();
        while (true) {
          const currFourth = fromNoteNumWithFlat(mod(currNoteNum + 5, 12));
          sharpMap[currFourth.letter] = sharpMap[currFourth.letter] || 0;
          sharpMap[currFourth.letter] -= 1;
          // Go up a fifth for the next iteration; e.g. Bb -> F
          currNoteNum = mod(currNoteNum + 7, 12);
          if (currNoteNum == 0) {
            return sharpMap;
          }
        }
      }
      // Case 2: sharps
      let currNoteNum = keySigSp.toNoteNum();
      while (true) {
        const currSeventh = fromNoteNumWithSharp(mod(currNoteNum + 10, 12));
        sharpMap[currSeventh.letter] = sharpMap[currSeventh.letter] || 0;
        sharpMap[currSeventh.letter] += 1;
        // Go up down a fifth for the next iteration; e.g. D -> G
        currNoteNum = mod(currNoteNum - 7, 12);
        if (currNoteNum == 0) {
          return sharpMap;
        }
      }
    }


    function getOctaveNum(num, spelling) {
      const noteNumDiff = num - spelling.toNoteNum(0);
      if (mod(noteNumDiff, 12) !== 0) {
        console.warn('This spelling does not have the expected note number (mod 12).', spelling, num);
      }
      // Minus 1 because 24 -> C1
      return Math.floor(noteNumDiff / 12) - 1;
    }

    // sharpMap may get mutated. keySigSharpMap will not get mutated.
    const noteNumToAbc = (note, sharpMap, keySigSharpMap, chord) => {
      const num = note.noteNum;
      if (!num) {
        return 'z';
      }
      sharpMap = sharpMap || {};
      // TODO use the chord in the current/next measure to spell this correctly.
      const spelling = note.spelling ? note.spelling : fromNoteNumWithChord(num, chord);
      const octaveNum = getOctaveNum(num, spelling);
      const sharpMapKey = `${spelling.letter}${octaveNum}`;
      const prevNumSharps = (
        sharpMap[sharpMapKey] === undefined ?
        keySigSharpMap[spelling.letter] || 0 : sharpMap[sharpMapKey]);
      sharpMap[sharpMapKey] = spelling.numSharps;

      // Add natural if previous notes have accidentals.
      if (prevNumSharps && spelling.numSharps === 0) {
        spelling.hasNatural = true;
      }

      // Don't add accidentals if previous notes have already done it.
      if (spelling.numSharps === prevNumSharps) {
        spelling.numSharps = 0;
      }
      return spelling.toAbc(octaveNum);
    };

    // A location is an object with start time.
    // A measure consists of the measure number and the content, which is a list of locations.
    // A line is a list of measure content.
    function locationsToLines(locations, durationPerMeasure, barsPerLine, numPickupMeas) {
      // A measure is an array of locations object.
      let currMeas;
      let currMeasNum;
      const measures = [];
      locations.forEach(loc => {
        const measNum = measureNum(loc.start, durationPerMeasure);
        if (measNum === currMeasNum) {
          currMeas.push(loc);
          return;
        }
        currMeas = [loc];
        currMeasNum = measNum;

        // Fill in empty measures if the locations are sparse (e.g. chords or near the end for noteGps).
        while (measNum > measures.length - numPickupMeas) {
          measures.push({content: [], measNum: measures.length - numPickupMeas});
        }

        measures.push({content: currMeas, measNum: measNum});
      });

      // A line is an array of measures
      const lines = [];
      let currLine;
      let currLineNum;
      measures.forEach(meas => {
        const lineNum$1 = lineNum(meas.measNum, barsPerLine);
        if (lineNum$1 === currLineNum) {
          currLine.push(meas.content);
          return;
        }
        currLine = [meas.content];
        currLineNum = lineNum$1;
        lines.push(currLine);
      });
      return lines;
    }

    class Note {
      constructor(noteNum, spelling) {
        // null means rest.
        this.noteNum = noteNum;
        this.spelling = spelling || null;
      }

      static fromJson(json) {
        return new Note(
          json.noteNum,
          fromJson(json.spelling));
      }

      equals(n2) {
        return this.noteNum === n2.noteNum;
      }

      clone() {
        return new Note(
          this.noteNum,
          // TODO clone this.
          this.spelling,
        );
      }
    }

    class NoteGp {
      constructor(notes, start, end, tie, startMillis) {
        if (notes.length > 1) {
          notes.sort((n1, n2) => { return n1.noteNum - n2.noteNum});
        }
        this.notes = notes;
        this.start = start;
        this.end = end;
        this.tie = tie || false;
        this.startMillis = startMillis || 0;
      }

      static fromJson(json) {
        const notes = json.notes.map(jsonNote => {
          return Note.fromJson(jsonNote);
        });
        return new NoteGp(
          notes,
          fromJson$1(json.start),
          fromJson$1(json.end),
          json.tie,
          json.startMillis);
      }

      clone() {
        return new NoteGp(
          this.notes.map(note => {
            return note.clone();
          }),
          this.start,
          this.end,
          this.tie,
          this.startMillis,
        );
      }

      equals(ng2) {
        if (!this.start.equals(ng2.start)) {
          return false;
        }
        if (!this.end.equals(ng2.end)) {
          return false;
        }
        if (this.notes.length !== ng2.notes.length) {
          return false;
        }
        for (let i = 0; i < this.notes.length; i++) {
          if (!this.notes[i].equals(ng2.notes[i])) {
            return false;
          }
        }
        if (this.tie !== ng2.tie) {
          return false;
        }
        return true;
      }

      isRest() {
        return this.notes.length === 1 && this.notes[0].noteNum == null;
      }

      isGraceNote() {
        return this.start.equals(this.end)
      }

      getNotes() {
        return this.notes;
      }

      getDuration() {
        return this.end.minus(this.start);
      }

      setDuration(duration) {
        this.end = this.start.plus(duration);
      }

      weaklyInside(left, right) {
        return (
          this.start.weaklyInside(left, right) &&
          this.end.weaklyInside(left, right));
      }

      // Return 2 notes.
      // [null, this] if start >= middleTime.
      // [this, null] if end <= middleTime.
      split(middleTime) {
        if (this.start.geq(middleTime)) {
          return [null, this];
        }
        if (this.end.leq(middleTime)) {
          return [this, null];
        }
        const left = this.clone();
        left.end = middleTime;
        if (!this.isRest()) {
          left.tie = true;
        }
        const right = this.clone();
        right.start = middleTime;
        return [left, right];
      }
    }

    function fixEnds(noteGpsArray) {
      return noteGpsArray.map((noteGp, idx) => {
        const nextNoteGp = idx + 1 >= noteGpsArray.length ? null : noteGpsArray[idx + 1];
        if (!nextNoteGp) {
          return noteGp;
        }
        if (nextNoteGp.start.equals(noteGp.end)) {
          return noteGp;
        }
        const clone = noteGp.clone();
        clone.end = nextNoteGp.start;
        console.warn('Fixing ends from and to.', noteGp, clone);
        return clone;
      });
    }

    function splitBefore(phrase, delimiterSubregexString) {
      // use positive look-ahead so that the split doesn't remove the delimiter.
      return phrase.split(new RegExp(`(?=${delimiterSubregexString})`));
    }

    function splitAfter(phrase, delimiterSubregexString) {
      // use positive look-behind so that the split doesn't remove the delimiter.
      return phrase.split(new RegExp(`(?<=${delimiterSubregexString})`));
    }

    function toLyricsTokens(lyricsString) {
      const asianRegexStr = '[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]';
      const tokens = lyricsString.split(/[\s]+/).flatMap(phrase => {
        // 'ab-cd' => ['ab-', 'cd']
        return splitAfter(phrase, '-');
      }).flatMap(phrase => {
        // Not using splitAfter here because we want:
        // '天?' => ['天?']
        // '天如' => ['天', '如']
        return splitBefore(phrase, asianRegexStr)
      });
      return tokens;
    }

    function fromLyricsToken(tokens) {
      return tokens.join(' ');
    }

    class Voice {
      constructor(noteGps, clef) {
        this.noteGps = noteGps || new List;
        this.clef = clef || 'treble';
      }

      static fromJson(json) {
        const noteGpsArray = json.noteGps.map(jsonItem => {
          return NoteGp.fromJson(jsonItem)
        });
        return Voice.fromNoteGpsArray(noteGpsArray, json.clef);
      }

      static fromNoteGpsArray(noteGpsArray, clef) {
        const merged = fixEnds(mergeTiesAndRests(noteGpsArray));
        const noteGpsIdx = 0;
        const noteGps = new List(merged, noteGpsIdx);
        return new Voice(noteGps, clef);
      }

      toJson() {
        return {
          noteGps: this.noteGps.toArray(),
          clef: this.clef,
        };
      }

      // TODO move this to a toString method of abc.js
      /**
       * Measures layout (measure -1 is the pickup measure)
       * line 0 : -1 | 0 | 1 | 2 | 3 |
       * line 1:       4 | 5 | 6 | 7 |
       * line 2:       8 | ...
       */
      getAbcStrings(abcNoteDuration, doc, showSpelling, chordLocs,
        displayChords, showNotesCursor, idx, cursorTime) {
        if (doc.displayMelodyOnly && idx !== 0) {
          return;
        }

        const timeSigNumer = doc.timeSigNumer;
        const timeSigDenom = doc.timeSigDenom;
        const pickup = doc.pickup;
        const keySigSp = doc.keySigSp;
        const keySigLocs = doc.keySigLocs;
        const tokens = doc.lyricsTokens;

        const durationPerMeasure = build(timeSigNumer, timeSigDenom);
        const barsPerLine = 4;
        const abcList = [
          `V:${idx} clef=${this.clef}\n`,
        ];

        const numPickupMeas = -measureNum(pickup.negative(), durationPerMeasure);

        const chordLines = locationsToLines(chordLocs, durationPerMeasure, barsPerLine, numPickupMeas);
        const chordLinesToDisplay = displayChords ? chordLines : [];
        chordLocs = chordLines.flat().flat();
        const noteLines = locationsToLines(
          periodicSplit(this.noteGps.toArray(), durationPerMeasure),
          durationPerMeasure, barsPerLine, numPickupMeas);
        const keySigLines = locationsToLines(keySigLocs, durationPerMeasure, barsPerLine, numPickupMeas);

        let keySigSharpMap = _computeKeySigSharpMap(keySigSp);

        // The default key signature must be specified per voice
        // because it can be overriden by a previous voice.
        abcList.push(` [K:${keySigSp.toString()}] `);
        const numLines = Math.max(noteLines.length, chordLinesToDisplay.length);

        // Add cursor after the key sig for the no note lines case.
        if (!noteLines.length) {
          if (showNotesCursor) {
            abcList.push(`"<${CURSOR}"x`);
          }
        }
        if (!numLines) {
          abcList.push('|]\n');
          return abcList;
        }

        let proximateChordIdx = 0;
        let tokenIdx = 0;
        let nextTokenIsBlank = false;
        // These loop variables are needed because it's possible to have an empty noteMeas
        // (because of end of all notes) and an empty chordMeas (because of unchanging chord).
        let measStartTime = pickup.negative();
        let measEndTime = pickup.toFloat() > 0 ? build(0) : durationPerMeasure;

        range(0, numLines).forEach(lineIdx => {
          const noteMeasures = lineIdx < noteLines.length ? noteLines[lineIdx] : [];
          const chordMeasures = lineIdx < chordLinesToDisplay.length ? chordLinesToDisplay[lineIdx] : [];
          const keySigMeasures = lineIdx < keySigLines.length ? keySigLines[lineIdx] : [];
          const numMeas = Math.max(noteMeasures.length, chordMeasures.length);
          const noteGpsArrsForLyricsLine = [];
          range(0, numMeas).forEach(measIdx => {
            const noteMeas = measIdx < noteMeasures.length ? noteMeasures[measIdx] : [];
            const chordMeas = measIdx < chordMeasures.length ? chordMeasures[measIdx] : [];
            const keySigMeas = measIdx < keySigMeasures.length ? keySigMeasures[measIdx] : [];
            if (keySigMeas.length > 0) {
              const keySigLoc = keySigMeas[0];
              abcList.push(` [K:${keySigLoc.keySigSp.toString()}] `);
              keySigSharpMap = _computeKeySigSharpMap(keySigLoc.keySigSp);
            }
            // Pad an empty measure that's sandwiched between non-empty measures.
            if (noteMeas.length == 0 && chordMeas.length == 0) {
              const measDuration = measEndTime.minus(measStartTime);
              const mult = Frac.divides(measDuration, abcNoteDuration);
              abcList.push(` x${mult.toString()}`);
            }

            // startTime is recomputed because we want it to work for pickup measure also
            const chunks = exec(
              noteMeas, measEndTime.minus(durationPerMeasure), measEndTime,
              timeSigNumer, timeSigDenom, showNotesCursor ? cursorTime : null);
            if (doc.displayLyrics && idx === 0 && tokenIdx < tokens.length) {
              noteGpsArrsForLyricsLine.push(chunks.map(chunk => {
                return chunk.getNoteGps();
              }).flat());
            }
            proximateChordIdx = renderMeas(
              chunks,
              abcList, this.noteGps.getCurr(), keySigSharpMap,
              timeSigDenom, showNotesCursor, showSpelling,
              abcNoteDuration, chordLocs, proximateChordIdx, measEndTime, cursorTime);

            // Separate meas and chordMeas as 2 voice parts.
            if (noteMeas.length > 0
              // TODO add this back if renderChordMeas stop using y-spacer for empty chordMeas
              // && chordMeas.length > 0
            ) {
              abcList.push('& ');
            }

            renderChordMeas(
              chordMeas, abcList, abcNoteDuration, measStartTime, measEndTime);

            // Add cursor to the last measure if cursor is at the tail.
            const isFinalNoteMeas = lineIdx === noteLines.length - 1 && measIdx === noteMeasures.length - 1;
            if (isFinalNoteMeas && showNotesCursor && this.noteGps.atTail()) {
              const cursorOnNextMeas = measEndTime.equals(cursorTime);
              if (cursorOnNextMeas) {
                abcList.push(` | `);
              }
              abcList.push(`"<${CURSOR}"x`);
              if (!cursorOnNextMeas) {
                abcList.push(` | `);
              }
            } else {
              const isFinalMeas = lineIdx === numLines - 1 && measIdx === numMeas - 1;
              const barLine = isFinalMeas ? ' |]' : '| ';
              abcList.push(barLine);
            }

            // Update loop variables.
            measStartTime = measEndTime;
            measEndTime = measEndTime.plus(durationPerMeasure);
          });
          abcList.push('\n');

          // Lyrics
          if (noteGpsArrsForLyricsLine.flat().length === 0) {
            return;
          }
          abcList.push('w: ');
          noteGpsArrsForLyricsLine.forEach(noteGpsArr => {
            noteGpsArr.forEach(noteGp => {
              if (noteGp.isRest() || noteGp.isGraceNote()) {
                return;
              }
              const currTokenIsBlank = nextTokenIsBlank;
              nextTokenIsBlank = noteGp.tie;
              if (currTokenIsBlank) {
                abcList.push('* ');
                return;
              }
              if (tokenIdx >= tokens.length) {
                return;
              }
              abcList.push(`${tokens[tokenIdx]} `);
              tokenIdx++;
            });
            abcList.push(' | ');
          });
          abcList.push('\n');
        });
        return abcList;
      }
    }

    class ChordLoc {
      constructor(chord, start, onCursor) {
        // Can be null, for holding a cursor, or the start time of chordless measures.
        this.chord = chord;
        this.start = start;
        // TODO put this field in a wrapper object instead, e.g. ChordRendering.
        // This field is only used during rendering; won't be persisted.
        this.onCursor = onCursor || false;
      }

      static fromJson(json) {
        return new ChordLoc(
          new Chord(json.chord),
          fromJson$1(json.start),
        );
      }

      clone() {
        return new ChordLoc(this.chord, this.start);
      }
    }

    class KeySigLoc {
      constructor(keySigSp, start) {
        this.keySigSp = keySigSp;
        this.start = start;
      }

      static fromJson(json) {
        return new KeySigLoc(
          fromJson(json.keySigSp),
          fromJson$1(json.start),
        );
      }
    }

    class TimeSigLoc {
      constructor(timeSigNumer, timeSigDenom, start) {
        this.timeSigNumer = timeSigNumer;
        this.timeSigDenom = timeSigDenom;
        this.start = start;
      }

      static fromJson(json) {
        return new TimeSigLoc(
          json.timeSigNumer,
          json.timeSigDenom,
          fromJson$1(json.start),
        );
      }
    }

    const NO_TITLE = 'Unnamed';

    class Doc {
      constructor(
        title, timeSigNumer, timeSigDenom, keySigSp, tempo, voices, pickup,
        composer, owner, cloneId, chordLocs, keySigLocs, tempoStr, timeSigLocs,
        lyricsTokens) {
        this.title = title || NO_TITLE;
        this.timeSigNumer = timeSigNumer || 4;
        this.timeSigDenom = timeSigDenom || 4;
        this.keySigSp = keySigSp || new Spelling('C');
        this.tempo = tempo || 80;
        this.voices = voices || [new Voice()];
        this.pickup = pickup || build(0);
        this.composer = composer || '';
        this.owner = owner || '';
        this.cloneId = cloneId || '';
        this.chordLocs = chordLocs ? chordLocs : [];
        this.keySigLocs = keySigLocs || [];
        this.tempoStr = tempoStr || '';
        // TODO make use of this field once we sort out method that require
        // time sig to be constant.
        // Approach 1. Look at all usages of getDurationPerMeasure and location.js
        // Approach 2. Just switch and see what is broken.
        this.timeSigLocs = timeSigLocs || [];
        this.lyricsTokens = lyricsTokens || [];

        this.displayMelodyOnly = false;
        this.displayLyrics = true;
      }

      static fromJson(json) {
        return new Doc(
          json.title,
          json.timeSigNumer,
          json.timeSigDenom,
          fromJson(json.keySigSp),
          json.tempo,
          json.voices.map(voice => { return Voice.fromJson(voice); }),
          fromJson$1(json.pickup),
          json.composer,
          json.owner,
          json.cloneId,
          json.chordLocs ? json.chordLocs.map(loc => { return ChordLoc.fromJson(loc); }) : [],
          json.keySigLocs ? json.keySigLocs.map(loc => { return KeySigLoc.fromJson(loc); }) : [],
          json.tempoStr,
          json.timeSigLocs ? json.timeSigLocs.map(loc => { return TimeSigLoc.fromJson(loc); }) : [],
          json.lyricsTokens,
        );
      }

      toJson() {
        return {
          title: this.title,
          timeSigNumer: this.timeSigNumer,
          timeSigDenom: this.timeSigDenom,
          keySigSp: this.keySigSp,
          tempo: this.tempo,
          voices: this.voices.map(voice => { return voice.toJson(); }),
          pickup: this.pickup,
          composer: this.composer,
          owner: this.owner,
          cloneId: this.cloneId,
          chordLocs: this.chordLocs,
          keySigLocs: this.keySigLocs,
          tempoStr: this.tempoStr,
          timeSigLocs: this.timeSigLocs,
          lyricsTokens: this.lyricsTokens,
        };
      }

      setVoices(voices) {
        this.voices = voices;
      }

      clearChords() {
        this.chordLocs = [];
      }

      shiftToKey(newKeySp, shiftUp) {
        const  shift = mod(newKeySp.toNoteNum() - this.keySigSp.toNoteNum(), 12) + shiftUp * 12;
        // 1. Chords
        this.chordLocs.forEach(chordLoc => {
          chordLoc.chord.root = chordLoc.chord.root.shift(this.keySigSp, newKeySp, shift);
          if (chordLoc.chord.bass) {
            chordLoc.chord.bass = chordLoc.chord.bass.shift(this.keySigSp, newKeySp, shift);
          }
        });

        // 2. Voices
        this.voices.forEach(voice => {
          voice.noteGps.toArray().forEach(noteGp => {
            noteGp.notes.forEach(note => {
              if (!note.noteNum) {
                return;
              }
              note.noteNum = note.noteNum + shift;
            });
          });
        });

        // 3. Key Sig
        this.keySigSp = newKeySp;
      }
    }

    class Editor {
      constructor(step, currVoiceIdx, cursorOnChords, cursorTime) {
        this.step = step || build(1, 4);
        this.currVoiceIdx = currVoiceIdx || 0;
        this.cursorOnChords = cursorOnChords || false;
        this.cursorTime = cursorTime || new build(0);
      }

      static fromJson(json) {
        return new Editor(
          fromJson$1(json.step),
          json.currVoiceIdx,
          json.cursorOnChords,
          fromJson$1(json.cursorTime));
      }

    }

    class Part {
      constructor(id, keySigSp, shiftUp, shiftIn) {
        this.id = id || '';
        this.keySigSp = keySigSp || null;
        this.shiftUp = shiftUp || 0;
        this.shiftIn = shiftIn || false;
      }

      getLink() {
        const url = new URL(document.URL);
        const songUrl = new URL('/fire/music.html', url.origin);
        songUrl.searchParams.set('view', '1');
        songUrl.searchParams.set('id', this.id);
        songUrl.searchParams.set('shiftUp', this.shiftUp.toString());
        songUrl.searchParams.set('shiftIn', this.shiftIn.toString());
            if (this.keySigSp) {
              songUrl.searchParams.set('keySig', this.keySigSp.toString());
            }
        return songUrl.href;
      }

      static fromLink(link) {
        const url = new URL(link);
        const id = url.searchParams.get('id');
        if (!id) {
          throw 'Invalid link due to missing id: ' + link;
        }
        let keySigSp = null;
        const keySigStr = url.searchParams.get('keySig');
        if (keySigStr) {
          const chord = _parseChordStr(keySigStr);
          if (chord) {
            keySigSp = chord.root;
          }
        }
        const shiftUp = parseInt(url.searchParams.get('shiftUp'));
        return this.fromJson({
          id: id,
          link: link,
          keySigSp: keySigSp,
          shiftUp: isNaN(shiftUp) ? 0 : shiftUp,
          // TODO think about whether this belong in the url.
          // If not and this is a useful feature, we will need proper merging.
          shiftIn: url.searchParams.get('shiftIn') == '1',
        });
      }

      static fromJson(json) {
        return new Part(
          json.id,
          fromJson(json.keySigSp),
          json.shiftUp,
          json.shiftIn);
      }
    }

    class StateMgr {
      constructor(ebanner, urlId, shadowRoot, execPub) {
        this.ebanner = ebanner;
        this.urlId = urlId;
        this.shadowRoot = shadowRoot;
        this.execPub = execPub;

        this.doc = new Doc;
        this.editor = new Editor;
        this.parts = [];
        // TODO auto-compute this based on the notes' GCD.
        this.abcNoteDuration = build(1, 8);
        this.showSpelling = false;
        this.noteNumShift = 0;
        this.seed = 54;
        this.isTrumpet = false;
      }

      loadJson(json) {
        this.doc = Doc.fromJson(json.doc);
        this.editor = Editor.fromJson(json.editor);
        this.setCursorTimeSyncPointer(this.getCursorTime());

        this.parts = json.parts ? json.parts.map(pJson => {return Part.fromJson(pJson); }) : [];
        this.loadParts();

        const url = new URL(document.URL);
        const keySigStr = url.searchParams.get('keySig');
        const shiftUp = parseInt(url.searchParams.get('shiftUp'));
        this.shiftToKey(keySigStr, isNaN(shiftUp) ? 0 : shiftUp);

        if (this.doc.cloneId !== '') {
          const cloneAnchor = this.shadowRoot.querySelector('#clone-anchor');
          cloneAnchor.style.display = 'inline';
          cloneAnchor.href = getSongUrl(this.doc.cloneId);
        }
      }

      toJson() {
        return {
          doc: this.doc.toJson(),
          editor: this.editor,
          parts: this.parts,
        };
      }

      setUrlId(urlId) {
        this.urlId = urlId;
      }

      switchInstrumentFingering() {
        this.isTrumpet = !this.isTrumpet;
        this.ebanner.display(`Instrument fingering: ` + (this.isTrumpet ? 'jkl-trumpet' : '12345-piano'));
      }

      quantize() {
        const arr = this.getCurrVoice().noteGps.toArray();
        const durations = arr.map((noteGp, idx) => {
          if (idx + 1 >= arr.length) {
            return null;
          }
          const dur = arr[idx + 1].startMillis - noteGp.startMillis;
          if (dur > 0) {
            return dur;
          }
          return null;
        });
        const maxDur = Math.max(...durations);
        const cleanedDurs = durations.map(dur => {
          return dur === null ? maxDur : dur;
        });
        const minDur = Math.min(...cleanedDurs);
        // const ratios = cleanedDurs.map(dur => {
        //   return dur / minDur;
        // });
        if (minDur <= 0) {
          return;
        }
        const roundedRatios = cleanedDurs.map(dur => {
          return Math.round(dur / minDur);
        });
        let beatDur = build(1, 4);
        if (minDur < 400) {
          beatDur = build(1, 16);
        } else if (minDur < 800) {
          beatDur = build(1, 8);
        }
        const projectedDurs = roundedRatios.map(ratio => {
          return beatDur.times(build(ratio));
        });
        this.navTail();
        while (!this.atHead()) {
          this.shortenPrevNoteGp();
        }
        arr.forEach((noteGp, idx) => {
          this.upsertByDur(
            noteGp.notes.map(note => {return note.noteNum;}),
            projectedDurs[idx],
            noteGp.startMillis);
        });
      }

      serialize() {
        // console.log(JSON.stringify(this.toJson(), null, 2));
        return JSON.stringify(this.toJson());
      }

      // Only support Chinese currently.

      updateLyrics(lyricsString) {
        this.doc.lyricsTokens = toLyricsTokens(lyricsString);
      }

      shiftNoteGpBoundary(goLeft) {
        if (this.isChordMode()) {
          return;
        }
        const noteGps = this.getCurrVoice().noteGps;
        const left = noteGps.getLeft();
        const right = noteGps.getCurr();
        const step = this.editor.step.over(build(2));
        if (this.atHead() && !goLeft && right && right.getDuration().greaterThan(step)) {
          const old = right.start;
          right.start = right.start.plus(step);
          this.addRestInGap(old, right.start);
          return;
        }
        if (!left || !right) {
          return;
        }
        if (left.isGraceNote() || right.isGraceNote()) {
          return;
        }

        const denomToUse = Math.max(step.denom, left.end.denom);
        // TODO what if left.end is a 1/6 instead of 1/8?
        const roundedStep = build(1, denomToUse);
        let boundary = left.end;
        if (goLeft) {
          if (left.getDuration().leq(roundedStep) || isPossibleTuplet(left)) {
            boundary = left.start;
            this.unsafeRemoveFromNoteGps();
          } else {
            boundary = left.end.minus(roundedStep);
          }
        } else {
          if (right.getDuration().leq(roundedStep) || isPossibleTuplet(right)) {
            boundary = right.end;
            this.skipRight();
            this.unsafeRemoveFromNoteGps();
          } else {
            boundary = right.start.plus(roundedStep);
          }
        }
        left.end = boundary;
        right.start = boundary;

        this.setCursorTimeSyncPointer(boundary);
      }

      appendPart(link) {
        this.parts.push(Part.fromLink(link));
        this.loadParts(true);
      }

      insertPart(link, idx) {
        this.parts.splice(idx, 0, Part.fromLink(link));
        this.loadParts(true);
      }

      removePart(idx) {
        this.parts.splice(idx, 1);
        this.loadParts(true);
      }

      async loadParts(loadDocWithParts) {
        const partDocs = [];
        const partTitles = [];
        const partShiftIns = [];
        let failed = false;
        // TODO use promise.all to make each loop run concurrently.
        for (const part of this.parts) {
          const json = await retrieve(part.id);
          if (!json) {
            partTitles.push(part.id);
            failed = true;
            continue;
          }
          partShiftIns.push(part.shiftIn);
          const doc = Doc.fromJson(json.doc);
          partDocs.push(doc);
          partTitles.push(doc.title);
          if (part.keySigSp) {
            doc.shiftToKey(part.keySigSp, part.shiftUp);
          }
        }
        this._updateUi(partTitles);
        if (failed) {
          return;
        }
        if (!loadDocWithParts) {
          return;
        }
        if (partDocs.length === 0) {
          this.doc = new Doc;
        }
        partDocs.forEach((partDoc, idx) => {
          if (loadDocWithParts) {
            if (idx === 0) {
              // Blacklisted fields to not update when reloading.
              // The rest of the fields will be auto-updated
              partDoc.owner = this.doc.owner;
              if (this.doc.cloneId !== '') {
                partDoc.cloneId = this.doc.cloneId;
              }
              if (this.doc.title !== NO_TITLE) {
                partDoc.title = this.doc.title;
              }
              if (this.doc.composer !== '') {
                partDoc.composer = this.doc.composer;
              }

              this.doc = partDoc;
            } else {
              this.appendDoc(partDoc, partShiftIns[idx]);
            }
          }
        });
        this.execPub();
      }

      appendDoc(doc, shiftIn) {
        const maxEndTime = this._getMaxEndTime();
        const durPerMeas = this.getDurationPerMeasure();
        const measNum = measureNum(maxEndTime, durPerMeas);
        const possNextMeasTime = measureNumToTime(
          measNum, durPerMeas, this.doc.pickup);
        const maxEndTimeIsNextMeasTime = possNextMeasTime.equals(maxEndTime);
        const nextMeasTime = (
          maxEndTimeIsNextMeasTime ? maxEndTime :
          measureNumToTime(measNum + 1, durPerMeas, this.doc.pickup));
        const currMeasTime = nextMeasTime.minus(durPerMeas);
        const shiftTime = shiftIn ? currMeasTime : nextMeasTime;
        const docStartTime = (shiftIn ? currMeasTime : nextMeasTime).minus(doc.pickup);
        if (!doc.keySigSp.equals(this.doc.keySigSp)) {
          this.doc.keySigLocs.push(new KeySigLoc(doc.keySigSp, docStartTime));
        }
        // TODO deal with the case where the firs doc does not have lyrics
        // while the second doc has lyrics, by padding with _
        if (doc.lyricsTokens) {
          this.doc.lyricsTokens.push(...doc.lyricsTokens);
        }

        this.disableChordMode();
        // Start appending. Note that if there are fewer voices, the dropped voice's
        // measures will be empty and will only be filled in by future docs with
        // extra voices.
        doc.voices.forEach((voice, idx) => {
          if (idx >= this.doc.voices.length) {
            this.addVoice(new Voice(null, voice.clef));
          }
          this.setVoiceIdx(idx);
          this.navTail();

          const noteGpsForAppend = [];
          let atInitialRest = true;
          let initialRestDuration = build(0);
          const prevDocEndTime = this.getCursorTime();
          voice.noteGps.toArray().forEach(noteGp => {
            if (atInitialRest && noteGp.isRest() && !prevDocEndTime.lessThan(noteGp.end)) {
              initialRestDuration = initialRestDuration.plus(noteGp.getDuration());
              return;
            }
            atInitialRest = false;
            noteGpsForAppend.push(noteGp);
          });
          const actualDocStartTime = docStartTime.plus(initialRestDuration);

          // Pad the current voice of the current doc.
          while (actualDocStartTime.lessThan(this.getCursorTime())) {
            this.shortenPrevNoteGp();
          }
          // TODO When tieless is available, just insert rest
          // with duration docStartTime.minus(this.getCursorTime()).
          while (this.getCursorTime().lessThan(actualDocStartTime)) {
            const currTime = this.getCursorTime();
            const nextMeasTime = nextMeasureTime(currTime, durPerMeas);
            // If currTime to actualDocStartTime spans multiple measures (e.g.
            // previous doc has a missing voice), use nextMeasTime for end of inserted rest.
            const restEnd = nextMeasTime.lessThan(actualDocStartTime) ? nextMeasTime : actualDocStartTime;
            const restDuration = restEnd.minus(currTime);
            this.upsertByDur([null], restDuration);
          }

          // Start appending.
          noteGpsForAppend.forEach(noteGp => {
            noteGp.start = noteGp.start.plus(shiftTime);
            noteGp.end = noteGp.end.plus(shiftTime);
            this.unsafeAddToNoteGps(noteGp);
          });
        });

        this.enableChordMode();
        doc.chordLocs.forEach(chordLoc => {
          chordLoc.start = chordLoc.start.plus(shiftTime);
          this._insertChordLoc(chordLoc);
        });
        this.navHead();
      }

      _updateUi(partTitles) {
        // Clean up UI.
        const partsListDiv = this.shadowRoot.querySelector('#parts-list');
        // TODO this is only here because musicMobileMain relies on stateMgr
        // but doesn't have parts-list.
        if (!partsListDiv) {
          return;
        }
        while (partsListDiv.firstChild) {
          partsListDiv.removeChild(partsListDiv.firstChild);
        }

        partTitles.forEach((title, idx) => {
          const insertButton = document.createElement('button');
          insertButton.textContent = '+';
          insertButton.classList.add('insert-part');
          insertButton.setAttribute('data-idx', idx.toString());
          partsListDiv.appendChild(insertButton);

          const removeButton = document.createElement('button');
          removeButton.textContent = 'X';
          removeButton.classList.add('remove-part');
          removeButton.setAttribute('data-idx', idx.toString());
          partsListDiv.appendChild(removeButton);

          const anchor = document.createElement("a");
          anchor.textContent = title;
          anchor.href = this.parts[idx].getLink();
          const li = document.createElement('li');
          li.appendChild(anchor);
          partsListDiv.appendChild(li);
        });

        // Setup UI event handling.
        this.shadowRoot.querySelectorAll('.remove-part').forEach(button => {
          button.onclick = _ => {
            const idx = parseInt(button.getAttribute('data-idx'));
            if (isNaN(idx)) {
              return;
            }
            this.removePart(idx);
          };
        });
        this.shadowRoot.querySelectorAll('.insert-part').forEach(button => {
          button.onclick = _ => {
            const link = prompt('Enter link of the song.');
            if (!link) {
              return;
            }
            const idx = parseInt(button.getAttribute('data-idx'));
            if (isNaN(idx)) {
              return;
            }
            this.insertPart(link, idx);
          };
        });
      }

      getLyricsString() {
        return fromLyricsToken(this.doc.lyricsTokens);
      }

      getNoteNumShift() {
        return this.noteNumShift;
      }
      incrNoteNumShift() {
        this.noteNumShift += 12;
        return this.getNoteNumShift();
      }

      decrNoteNumShift() {
        this.noteNumShift -= 12;
        return this.getNoteNumShift();
      }

      insertChord(chordStr) {
        if (!this.isChordMode()) {
          return false;
        }
        let chordObj;
        try {
          chordObj = new Chord(Parser.parse(chordStr));
        } catch(err) {
          console.warn('failed to parse chord: ', chordStr, err);
          this.ebanner.display('failed to parse chord: ' + chordStr);
          return false;
        }
        const start = this.getCursorTime();
        const chordLoc = new ChordLoc(chordObj, start);
        this._insertChordLoc(chordLoc);
        return true;
      }

      _insertChordLoc(loc) {
        const upsertInfo = findUpsertIdx(this.doc.chordLocs, loc.start);
        this.doc.chordLocs.splice(upsertInfo.idx, upsertInfo.update ? 1 : 0, loc);
      }

      _insertKeySigLoc(loc) {
        const upsertInfo = findUpsertIdx(this.doc.keySigLocs, loc.start);
        this.doc.keySigLocs.splice(upsertInfo.idx, upsertInfo.update ? 1 : 0, loc);
        // TODO de-duplicate repeating key sigs (A, [A, A, B, B, A]) -> (A, [B, A])
      }

      getSelectedChord() {
        const upsertInfo = findUpsertIdx(this.doc.chordLocs, this.getCursorTime());
        if (!upsertInfo.update) {
          return null;
        }
        return this.doc.chordLocs[upsertInfo.idx].chord;
      }

      removeChord() {
        if (!this.isChordMode()) {
          return;
        }
        const start = this.getCursorTime();
        const upsertInfo = findUpsertIdx(this.doc.chordLocs, start);
        if (!upsertInfo.update) {
          this.navLeft();
          return;
        }
        this.doc.chordLocs.splice(upsertInfo.idx, 1);
      }

      isChordMode() {
        return this.editor.cursorOnChords;
      }

      enableChordMode() {
        const currTime = this.getCursorTime();
        this.editor.cursorOnChords = true;
        this._alignTime(currTime);
      }

      disableChordMode() {
        this.editor.cursorOnChords = false;
      }

      getCurrVoice() {
        if (this.isChordMode()) {
          return;
        }
        return this.doc.voices[this.editor.currVoiceIdx];
      }

      getCursorTime() {
        return this.editor.cursorTime;
      }

      incrSeed() {
        this.seed += 1;
        return this.seed
      }

      decrSeed() {
        this.seed -= 1;
        return this.seed
      }

      getKeySig() {
        return this.doc.keySigSp;
      }

      setKeySigFromStr(chordStr) {
        const chord = _parseChordStr(chordStr, this.ebanner);
        if (!chord) {
          return;
        }
        const currTime = this.getCursorTime();
        if (currTime.equals(this.doc.pickup.negative())) {
          this.doc.keySigSp = chord.root;
          return;
        }
        this._insertKeySigLoc(new KeySigLoc(chord.root, currTime));
      }

      shiftToKey(chordStr, shiftUp) {
        const chord = _parseChordStr(chordStr, this.ebanner);
        if (!chord) {
          return;
        }
        const newKeySp = chord.root;
        this.doc.shiftToKey(newKeySp, shiftUp);

        if (!this.viewMode) {
          // 1. Transpose for write mode should not persist
          // the transpose in the URL.
          return;
        }
        // 2. Transpose for view mode.
        // Persist the transpose to the URL for use in parts aggregation.
        const newUrl = new URL(document.URL);
        newUrl.searchParams.set('keySig', newKeySp.toString());
        newUrl.searchParams.set('shiftUp', shiftUp);
        window.history.pushState({}, '', newUrl.href);
      }

      insertSpace() {
        this.cut();
        this.upsertWithoutDur([null]);
        const cursorTime = this.getCursorTime();
        this.paste();
        this.setCursorTimeSyncPointer(cursorTime, true);
      }

      deleteSpace() {
        this.cut();
        this.shortenPrevNoteGp();
        const cursorTime = this.getCursorTime();
        this.paste();
        this.setCursorTimeSyncPointer(cursorTime, true);
      }

      incrPickup() {
        const change = build(1, this.doc.timeSigDenom);
        this.setPickup(this.doc.pickup.plus(change));
      }

      decrPickup() {
        const change = build(-1, this.doc.timeSigDenom);
        this.setPickup(this.doc.pickup.plus(change));
      }

      setPickupFromBeat(beats) {
        const newPickup = build(beats, this.doc.timeSigDenom);
        this.setPickup(newPickup);
      }

      setPickup(newPickup) {
        if (newPickup.toFloat() < 0) {
          return;
        }
        const oldPickup = this.doc.pickup;
        const change = Frac.minus(newPickup, oldPickup);
        this.doc.pickup = newPickup;

        this.doc.voices.forEach(voice => {
          voice.noteGps.toArray().forEach(noteGp => {
            noteGp.start = Frac.minus(noteGp.start, change);
            noteGp.end = Frac.minus(noteGp.end, change);
          });
        });
        // Sync the time.
        this.navHead();
      }

      deleteDoc() {
        const db = firebase.firestore();
        const collName = version();
        db.collection(collName).doc(this.urlId).delete().then(_ => {
          const homeUrl = new URL('/fire/', (new URL(document.URL)).origin);
          const currUser = firebase.auth().currentUser;
          if (currUser) {
            homeUrl.searchParams.set('owner', currUser.email);
          }
          window.location.href =homeUrl.href;
        }).catch(error => {
          this.ebanner.slowDisplay("Error removing document: " + error.message);
          console.error("Error removing document: ", error);
        });
      }

      toggleShowSpelling() {
        this.showSpelling = !this.showSpelling;
      }

      setTempo(tempo) {
        this.doc.tempo = tempo;
      }

      getTempo() {
        return this.doc.tempo;
      }

      // TODO handle compound time sig.
      incrStep() {
        this.editor.step = this.editor.step.times(build(2));
        return this.editor.step.toString();
      }

      decrStep() {
        this.editor.step = this.editor.step.over(build(2));
        return this.editor.step.toString();
      }

      // Args:
      //   noteNums: [] means lengthen and [null] means add a rest.
      upsertWithoutDur(noteNums, startMillis) {
        const step = this.editor.step.over(build(2));
        let duration = step;

        const currNoteGp = this.getCurrVoice().noteGps.getCurr();

        // For grace note, we need to get rid of the existing grace note first.
        if (currNoteGp && currNoteGp.isGraceNote()) {
          this.navRight();
          this.unsafeRemoveFromNoteGps();
        }

        if (currNoteGp) {
          if (currNoteGp.isRest() && currNoteGp.getDuration().geq(step)) {
            const split = this.tupletSplit(currNoteGp);
            if (split.length > 0) {
              const firstInSplit = split[0];
              // Either tied to a tuplet or is a single tuplet.
              if (split.length > 1 || isPossibleTuplet(firstInSplit)) {
                duration = firstInSplit.end.minus(currNoteGp.start);
              }
            }
          } else {
            duration = currNoteGp.end.minus(currNoteGp.start);
          }
        }
        this.upsertByDur(noteNums, duration, startMillis);
      }

      // Otherwise lengthen it from start to start of notes.
      lengthenPrevBy(dur) {
        this.lengthenPrevNoteGp(this.getCursorTime().plus(dur));
      }

      // Lengthen previous noteGp.end to newEnd.
      // Works even when out-of-sync.
      lengthenPrevNoteGp(newEnd) {
        this._surger();
        const noteGps = this.getCurrVoice().noteGps;

        while (noteGps.getCurr() && noteGps.getCurr().start.lessThan(newEnd)) {
          this.skipRight();
          this.unsafeRemoveFromNoteGps();
        }

        const left = noteGps.getLeft();
        if (left) {
          left.end = newEnd;
          if (noteGps.getCurr() && noteGps.getCurr().start.greaterThan(newEnd)) {
            this.addRestInGap(newEnd, noteGps.getCurr().start);
          }
        } else {
          // If at head, just insert a rest instead of lengthening.
          const restEnd = noteGps.getCurr() ? noteGps.getCurr().start : newEnd;
          this.addRestInGap(this.startTime(), restEnd);
        }
        this.setCursorTimeSyncPointer(newEnd);
      }

      _surger() {
        if (!this._isOutOfSync()) {
          return;
        }
        const noteGps = this.getCurrVoice().noteGps;
        const curr = noteGps.getCurr();
        if (!curr) {
          // This should never happen if out-of-sync.
          return;
        }
        const oldCursorTime = this.getCursorTime();
        const [left, right] = curr.split(oldCursorTime);
        this.skipRight();
        this.unsafeRemoveFromNoteGps();
        this.unsafeAddToNoteGps(left);
        this.unsafeAddToNoteGps(right);
        this.setCursorTimeSyncPointer(oldCursorTime);
      }

      // Lowest level method for adding note group safely.
      // Works even when out-of-sync.
      _upsertNoteGp(noteGp) {
        this._surger();
        const noteGps = this.getCurrVoice().noteGps;
        const newEnd = noteGp.end;

        while (noteGps.getCurr() && noteGps.getCurr().start.lessThan(newEnd)) {
          this.skipRight();
          this.unsafeRemoveFromNoteGps();
        }

        if (!noteGp.isRest()) {
          this.unsafeAddToNoteGps(noteGp);
          if (noteGps.getCurr() && noteGps.getCurr().start.greaterThan(newEnd)) {
            this.addRestInGap(newEnd, noteGps.getCurr().start);
          }
        } else {
          const restEnd = noteGps.getCurr() ? noteGps.getCurr().start : newEnd;
          this.addRestInGap(noteGp.start, restEnd);
        }
        this.setCursorTimeSyncPointer(newEnd);
      }

      toggleDisplayMelodyOnly() {
        this.doc.displayMelodyOnly = !this.doc.displayMelodyOnly;
      }
      toggleDisplayLyrics() {
        this.doc.displayLyrics = !this.doc.displayLyrics;
      }

      insertGraceNote() {
        if (this.isChordMode()) {
          return;
        }
        const noteStartAndEnd = this.getCursorTime();
        this.unsafeAddToNoteGps(new NoteGp([new Note(60)], noteStartAndEnd, noteStartAndEnd));
        this.navLeft();
      }

      // TODO remove hasTie
      upsertByDur(noteNums, duration, startMillis) {
        if (this.isChordMode()) {
          return;
        }

        const notes = noteNums.map(num => {
          return new Note(num);
        });
        const noteStart = this.getCursorTime();
        const noteEnd = noteStart.plus(duration);

        if (notes.length == 0) {
          this.lengthenPrevNoteGp(noteEnd);
          return;
        }
        this._upsertNoteGp(new NoteGp(notes, noteStart, noteEnd, false, startMillis));
      }

      // relNotes is a list of beat.Note (must have start time relative to start beat)
      upsertBeat(relNotes, step) {
        if (this.isChordMode()) {
          return;
        }

        step = step || this.editor.step;
        const noteGps = this.getCurrVoice().noteGps;
        const cursorStart = this.getCursorTime();
        const beatStartTime = cursorStart.over(step).wholePart().times(step);
        const beatEndTime = beatStartTime.plus(step);

        function relativeToAbsolute(time) {
          return beatStartTime.plus(time.times(step));
        }
        const newNoteGpsArrWithGraceNotes = relNotes.map((relNote, i) => {
          let noteEnd = beatEndTime;
          if (i + 1 < relNotes.length) {
            const relEnd = relNotes[i + 1].start;
            noteEnd = relativeToAbsolute(relEnd);
          }
          const noteStart = relativeToAbsolute(relNote.start);
          return new NoteGp(
            relNote.noteNums.map(noteNum => {
              return new Note(noteNum);
            }), noteStart, noteEnd);
        });

        // 0. Treat grace notes as simultaneous notes.
        const newNoteGpsArr = collapseGraceNotesToSimultaneousNotes(newNoteGpsArrWithGraceNotes);

        // 1. Gather enough notes from the left for merging.
        const noteGpsLeftOfCursor = [];
        while (true) {
          const left = noteGps.getLeft();
          if (!left) {
            break;
          }
          // Want noteGpsLeftOfCursor.length > 0 in order to extend the previous
          // beat's noteGp if possible
          if (left.end.equals(beatStartTime) && noteGpsLeftOfCursor.length > 0) {
            break;
          }
          if (left.end.lessThan(beatStartTime)) {
            break;
          }
          // left.end > beatStartTime
          noteGpsLeftOfCursor.push(left);
          this.unsafeRemoveFromNoteGps();
        }
        noteGpsLeftOfCursor.reverse();

        // 2. Merge and upsert
        function merge(noteGpsLeftOfCursor, newNoteGpsArr) {
          const res = [];
          const newNoteGpsStart = (
            newNoteGpsArr.length === 0 ?
            beatEndTime :
            newNoteGpsArr[0].start
          );

          res.push(...noteGpsLeftOfCursor.filter(noteGp => {
            // Strictness of lessThan removes grace notes as well.
            return noteGp.start.lessThan(newNoteGpsStart);
          }));
          if (res.length > 0) {
            // Ensure that noteGpsLeftOfCursor and newNoteGpsArr have no gaps in between.
            res[res.length - 1].end = newNoteGpsStart;
          } else {
            // Ensure that beatStartTime and newNoteGpsStart have no gaps in between.
            if (beatStartTime.lessThan(newNoteGpsStart)) {
              res.push(new NoteGp(
                [new Note(null)], beatStartTime, newNoteGpsStart));
            }
          }
          res.push(...newNoteGpsArr);
          return res;
        }
        merge(noteGpsLeftOfCursor, newNoteGpsArr).forEach(noteGp => {
          this._upsertNoteGp(noteGp);
        });
      }

      // Shorten the left note group by a step.
      // Works for out-of-sync.
      shortenPrevNoteGp() {
        if (this.isChordMode()) {
          return;
        }
        this._surger();
        const step = this.editor.step.over(build(2));
        const noteGps = this.getCurrVoice().noteGps;
        const left = noteGps.getLeft();
        if (noteGps.atHead() || !left) {
          // At head; don't do anything.
          return;
        }
        const cursorTime = this.getCursorTime();
        const prevBeat = computePrevBeat(cursorTime, step);

        let newTime = prevBeat.lessThan(left.start) ? left.start : prevBeat;
        let addRest = false;
        const split = this.tupletSplit(left);
        if (split.length > 0) {
          const lastInSplit = split[split.length - 1];
          // Either tied to a tuplet or is a single tuplet.
          if (isPossibleTuplet(lastInSplit)) {
            newTime = lastInSplit.start;
            addRest = isPossibleTuplet(lastInSplit);
          } else {
            newTime = prevBeat.lessThan(lastInSplit.start) ? lastInSplit.start : prevBeat;
          }
        }
        // For rest not at the tail, shorten just means moving the cursor leftward.
        this.shortenPrevTo(newTime, addRest);
      }

      tupletSplit(currNoteGp) {
        if (currNoteGp.isGraceNote()) {
          return [currNoteGp];
        }
        const res = [];
        const chunks = tupletChunking(toChunks(
          this.getCurrVoice().noteGps.toArray()));
        let started = false;
        let ended = false;
        chunks.forEach(chunk => {
          chunk.getNoteGps().forEach(noteGp => {
            if (noteGp.start.equals(currNoteGp.start)) {
              started = true;
            }
            if (noteGp.end.greaterThan(currNoteGp.end)) {
              ended = true;
            }
            if (started && !ended) {
              if (!noteGp.isGraceNote()) {
                res.push(noteGp);
              }
            }
          });
        });
        return res;
      }
      // Also handle inserting rests.
      shortenPrevTo(newTime, addRest) {
        const noteGps = this.getCurrVoice().noteGps;
        const left = noteGps.getLeft();
        if (!left) {
          return;
        }
        const currTime = left.end;
        if (left.start.equals(newTime)) {
          this.unsafeRemoveFromNoteGps();
        } else if (left.start.lessThan(newTime)) {
          left.end = newTime;
        } else {
          console.warn('Invalid newTime', newTime, left);
        }

        if (noteGps.atTail() && !addRest) {
          this.setCursorTimeSyncPointer(newTime);
        } else {
          // Insert a rest to the right.
          this.addRestInGap(newTime, currTime);
          this.setCursorTimeSyncPointer(newTime);
        }
      }

      // There may or may not be something to the right of the gap.
      // The cursor will point to end.
      addRestInGap(start, end) {
        if (start.geq(end)) {
          this.setCursorTimeSyncPointer(end);
          return;
        }
        const noteGps = this.getCurrVoice().noteGps;
        const right = noteGps.getCurr();
        const left = noteGps.getLeft();
        if (right && right.isRest()) {
          if (left && left.isRest()) {
            this.unsafeRemoveFromNoteGps();
            right.start = left.start;
          } else {
            right.start = start;
          }
        } else {
          if (left && left.isRest()) {
            this.unsafeRemoveFromNoteGps();
            this.unsafeAddToNoteGps(new NoteGp([new Note(null)], left.start, end));
          } else {
            this.unsafeAddToNoteGps(new NoteGp([new Note(null)], start, end));
          }
        }
        this.setCursorTimeSyncPointer(end);
      }

      deletePrevMeasure() {
        this.shortenPrevNoteGp();
        while (!this.atStartOfMeasure() && !this.getCurrVoice().noteGps.atHead()) {
          this.shortenPrevNoteGp();
        }
      }

      atStartOfMeasure() {
        return this.getCursorTime().over(this.getDurationPerMeasure()).isWhole();
      }

      startTime() {
        return this.doc.pickup.negative();
      }

      // If there is a gap between left and current noteGp,
      // this return the current noteGp.start.
      _currPointerTime() {
        const noteGps = this.getCurrVoice().noteGps;
        const curr = noteGps.getCurr();
        const left = noteGps.getLeft();
        if (!curr && !left) {
          return this.startTime();
        }
        return curr ? curr.start : left.end;
      }

      // START of mutable noteGps method calls.
      // Purpose: calling mutable methods on noteGps causes the time and pointer
      // to go out-of-sync; thus whenever those methods are called, we need
      // to sync the cursor time to the new pointer position.
      _syncTimeToPointer() {
        this.setCursorTimeSyncPointer(this._currPointerTime());
      }

      // leftMost: if true, when cursorTime points to multiple notes
      // (due to grace notes) go to the leftMost one. If false, the
      // cursor will stay at the first note with the correct start.
      setCursorTimeSyncPointer(cursorTime, leftMost) {
        this.editor.cursorTime = cursorTime;
        if (this.isChordMode()) {
          return;
        }

        // 1. Sync pointer
        const noteGps = this.getCurrVoice().noteGps;
        // The order of the 2 while loops makes it so that
        // pointer is never to the right of cursorTime.
        while (this._currPointerTime().lessThan(cursorTime)) {
          const moved = noteGps.moveRight();
          if (!moved) {
            break;
          }
        }
        while (this._currPointerTime().greaterThan(cursorTime)) {
          const moved = noteGps.moveLeft();
          if (!moved) {
            break;
          }
        }

        if (leftMost) {
          while (noteGps.getLeft() && noteGps.getLeft().isGraceNote()) {
            const moved = noteGps.moveLeft();
            if (!moved) {
              break;
            }
          }
        }

        // 2. Validate
        if (this._currPointerTime().equals(cursorTime)) {
          return;
        }
        const curr = noteGps.getCurr();
        // Allow cursorTime differ from pointer if cursorTime is within
        // the pointer's rest note.
        if (curr && curr.isRest() && cursorTime.strictlyInside(curr.start, curr.end)) {
          return;
        }

        console.warn(
          'setCursorTimeSyncPointer with a bad cursorTime.',
          this.getCursorTime(),
          this.getCurrVoice().noteGps.getCurr());
        // TODO remove this because having a method that sync in both directions
        // is confusing.
        // this._syncTimeToPointer();
      }

      // Only safe if adding at the end or for filling a gap
      unsafeAddToNoteGps(item) {
        const noteGps = this.getCurrVoice().noteGps;
        noteGps.add(item);
        this._syncTimeToPointer();
      }

      // Safe only if removing at the end or if you call
      // unsafeAddToNoteGps afterward to fill the gap.
      unsafeRemoveFromNoteGps() {
        const noteGps = this.getCurrVoice().noteGps;
        noteGps.remove();
        this._syncTimeToPointer();
      }
      // END of mutable noteGps method calls.

      navHead() {
        this.setCursorTimeSyncPointer(this.doc.pickup.negative(), true);
      }

      navTail() {
        let cursorTime = this.doc.pickup.negative();
        if (this.isChordMode()) {
          if (this.doc.chordLocs.length === 0) {
            return;
          }
          cursorTime = this.doc.chordLocs[this.doc.chordLocs.length - 1].start;
        } else {
          const noteGpsArr = this.getCurrVoice().noteGps.toArray();
          if (noteGpsArr.length == 0) {
            return;
          }
          cursorTime = noteGpsArr[noteGpsArr.length - 1].end;
        }
        this.setCursorTimeSyncPointer(cursorTime);
      }

      navUp() {
        const barsPerLine = 4;
        range(0, barsPerLine).forEach(_ => {
          this.navLeftMeasure();
        });
      }

      navDown() {
        let barsPerLine = 4;
        if (this.getCursorTime().lessThan(build(0))) {
          barsPerLine = 5;
        }
        range(0, barsPerLine).forEach(_ => {
          this.navRightMeasure();
        });
      }

      atHead() {
        const atStartTime = this.getCursorTime().equals(this.startTime());
        if (this.isChordMode()) {
          return atStartTime;
        }
        return atStartTime && this.getCurrVoice().noteGps.atHead();
      }

      atTail() {
        if (this.isChordMode()) {
          return false;
        }
        return this.getCurrVoice().noteGps.atTail();
      }

      // Move to "the start" of a measure that is earlier than the cursor position.
      // "the start" may be inside the measure if the measure has a note tied from
      // the previous measure.
      navLeftMeasure() {
        const durationPerMeasure = this.getDurationPerMeasure();
        const startMeasNum = measureNum(this.getCursorTime(), durationPerMeasure);
        const measStartTime = measureNumToTime(startMeasNum, durationPerMeasure, this.doc.pickup);
        const prevMeasStartTime = measureNumToTime(startMeasNum > 0 ? startMeasNum - 1 : 0, durationPerMeasure, this.doc.pickup);
        const strictlyInCurrMeas = measStartTime.lessThan(this.getCursorTime());

        // chord cursor to need to be handled specially to make it not fall between beats.
        if (this.isChordMode()) {
          if (strictlyInCurrMeas) {
            this.setCursorTimeSyncPointer(measStartTime);
          } else {
            this.setCursorTimeSyncPointer(prevMeasStartTime);
          }
          return;
        }

        let expectedMeasNumDiff = strictlyInCurrMeas ? 0 : 1;
        let numNavLeft = 0;
        while (!this.atHead()) {
          this.navLeft();
          numNavLeft += 1;
          const currMeasNum = measureNum(this.getCursorTime(), durationPerMeasure);

          // For some cases, we only know expectedMeasNumDiff after moving left once.
          // e.g. strictlyInCurrMeas is true for | c d- | d ? e |, but
          // expectedMeasNumDiff is 1 in order to result in | ? c d- | d e |
          if (numNavLeft == 1) {
            if (startMeasNum - currMeasNum > 0) {
              expectedMeasNumDiff = startMeasNum - currMeasNum;
            }
          }

          if (startMeasNum - currMeasNum > expectedMeasNumDiff) {
            if (numNavLeft > 1) {
              // | c d | d ? e | overshoots to | c ? d | d e | so navRight
              // to get back to | c d | ? d e |.
              this.navRight();
            }
            return;
          }
        }

      }

      navRightMeasure() {
        const durationPerMeasure = this.getDurationPerMeasure();
        const startMeasNum = measureNum(this.getCursorTime(), durationPerMeasure);

        // chord cursor to need to be handled specially to make it not fall between beats.
        if (this.isChordMode()) {
          const nextMeasStartTime = measureNumToTime(startMeasNum + 1, durationPerMeasure, this.doc.pickup);
          this.setCursorTimeSyncPointer(nextMeasStartTime);
          return;
        }

        while (!this.atTail()) {
          this.navRight();
          const currMeasNum = measureNum(this.getCursorTime(), durationPerMeasure);
          if (Math.abs(startMeasNum - currMeasNum) >= 1) {
            return;
          }
        }
      }

      // TODO consider implementing navPrev as well.
      navLeft() {
        if (this.isChordMode()) {
          this.setCursorTimeSyncPointer(this._prevCursorTime());
          return;
        }

        const noteGps = this.getCurrVoice().noteGps;
        const left = noteGps.getLeft();
        if (left && left.isGraceNote()) {
          // Handle grace notes differently because sync only
          // move pointer to non-grace notes.
          noteGps.moveLeft();
          return;
        }
        if (this.atHead()) {
          return;
        }
        this.setCursorTimeSyncPointer(this._prevCursorTime());
      }

      navRight() {
        if (this.isChordMode()) {
          this.setCursorTimeSyncPointer(this._nextCursorTime(), true);
          return;
        }

        const noteGps = this.getCurrVoice().noteGps;
        const curr = noteGps.getCurr();
        if (curr && curr.isGraceNote()) {
          noteGps.moveRight();
          return;
        }
        this.setCursorTimeSyncPointer(this._nextCursorTime(), true);
      }

      // Go to the end of the current note even if it is a rest note.
      skipRight() {
        const noteGps = this.getCurrVoice().noteGps;
        const curr = noteGps.getCurr();
        if (curr && curr.isRest()) {
          this.setCursorTimeSyncPointer(curr.end);
          return;
        }
        this.navRight();
      }

      _nextCursorTime() {
        const cursorTime = this.getCursorTime();
        if (this.isChordMode()) {
          return cursorTime.plus(this.editor.step);
        }
        const step = this.editor.step.over(build(2));
        const noteGps = this.getCurrVoice().noteGps;
        const curr = noteGps.getCurr();
        if (curr) {
          if (curr.isRest()) {
            const newCursorTime = cursorTime.plus(step);
            return curr.end.lessThan(newCursorTime) ? curr.end : newCursorTime;
          }
          return curr.end;
        }
        return cursorTime;
      }

      _prevCursorTime() {
        const cursorTime = this.getCursorTime();
        if (this.isChordMode()) {
          const newCursorTime = cursorTime.minus(this.editor.step);
          if (newCursorTime.lessThan(this.startTime())) {
            return this.startTime();
          }
          return newCursorTime
        }
        const step = this.editor.step.over(build(2));
        const noteGps = this.getCurrVoice().noteGps;
        const curr = noteGps.getCurr();
        if (this._isOutOfSync()) {
          const newCursorTime = cursorTime.minus(step);
          return curr.start.lessThan(newCursorTime) ? newCursorTime : curr.start;
        }
        const left = noteGps.getLeft();
        if (left) {
          if (!left.isRest()) {
            return left.start;
          }
          const newCursorTime = cursorTime.minus(step);
          return left.start.lessThan(newCursorTime) ? newCursorTime : left.start;
        }
        return this.startTime();
      }

      // The pointer can be left of the cursorTime for rest notes,
      // in which case it is out-of-sync.
      _isOutOfSync() {
        const noteGps = this.getCurrVoice().noteGps;
        const curr = noteGps.getCurr();
        return curr && curr.start.lessThan(this.getCursorTime());
      }

      save(clone, onSuccess) {
        const currUser = firebase.auth().currentUser;
        if (!currUser) {
          alert('Sign in to save.');
          return;
        }

        if (this.doc.owner && this.doc.owner !== currUser.email) {
          clone = true;
        }
        if (clone) {
          // It's okay to modify the doc, because we won't save it.
          this.doc.cloneId = this.urlId;
        }

        this.doc.owner = currUser.email;

        const db = firebase.firestore();
        const collName = version();
        const id = clone ? (new Date).toISOString().replace(/:/g,'_') : this.urlId;
        db.collection(collName).doc(id).set({
          id: id,
          title: this.doc.title,
          composer: this.doc.composer,
          payload: this.serialize(),
          owner: this.doc.owner,
          hasParts: this.parts.length > 0,
          lastEdit: Date.now(),
        }).then(_ => {
          if (onSuccess) {
            onSuccess();
            return;
          }
          if (clone) {
            window.location.href = getSongUrl(id);
          } else {
            this.ebanner.display('Saved.');
          }
        }).catch(err => {
          console.warn('Failed to save.', err);
          this.ebanner.display(err.message);
        });
      }

      addSimpleBass() {
        this._upsertComping(simpleBass);
      }

      addTwoBeatBass() {
        this._upsertComping(twoBeatBass);
      }

      addBossaNovaBass() {
        this._upsertComping(bossaNovaBass);
      }
      addBossaNovaComping() {
        this._upsertComping(bossaNovaComp);
      }
      // _genBassSeed(seed) {
      //   return Math.min(23, Math.max(36, Math.floor(Math.random() * 5) + seed - 2))
      // }

      // TODO refactor and get rid of n,n,n,n-n,n-n-n.
      addFingerStyleComping() {
        const quietFactor = 0.4;
        this._upsertComping((slot, prevSlot) => {
          let remainder = slot.duration;
          const chord = slot.chord;
          const bassSpelling = chord.getBassSpelling();
          const bassNoteNum = bassSpelling.toNoteNum(3) < 44 ? bassSpelling.toNoteNum(3) : bassSpelling.toNoteNum(2);
          const noteNums = chord.chordTonesAbove(bassNoteNum + chord.getFifthInterval());
          const skipBass = (
            prevSlot && prevSlot.chord &&
            prevSlot.duration.lessThan(build(3, 4)) &&
            prevSlot.chord.getBassSpelling().toString() == bassSpelling.toString());
          const eighth = build(1, 8);
          this.upsertByDur(skipBass ? noteNums.slice(2, 4) : [bassNoteNum], eighth);
          remainder = remainder.minus(eighth);

          const rand = Math.random();
          let dur1 = eighth;
          if (rand < 1/3 && eighth.lessThan(eighth)) {
            dur1 = eighth.times(build(2));
          }
          if (Math.random() < quietFactor) {
            this.lengthenPrevBy(eighth);
          } else {
            this.upsertByDur([noteNums[0]], dur1);
          }
          remainder = remainder.minus(dur1);
          if (remainder.toFloat() <= 0) {
            return;
          }

          let dur2 = build(1, 4).minus(dur1);
          const longSecondBeat = Math.random() < 0.4;
          if (remainder.equals(build(1, 4)) && longSecondBeat) {
            dur2 = remainder;
          }

          const rand3 = Math.random();
          let notes1 = [noteNums[1]];
          const beatLike = rand3 < 1/3;
          let idx3 = 2;
          if (beatLike) {
            notes1 = [noteNums[1], noteNums[2]];
            idx3 = 0;
          }
          if (dur2.toFloat() > 0) {
            this.upsertByDur(notes1, dur2);
          }
          remainder = remainder.minus(dur2);
          if (remainder.toFloat() <= 0) {
            return;
          }

          if (remainder.leq(eighth)) {
            this.upsertByDur([noteNums[idx3]], remainder);
            return;
          }

          const rand4 = Math.random();
          let quiet = true;
          let dur3 = remainder;
          if (rand4 < 1/12) {
            dur3 = eighth;
          } else if (rand4 < 3/12) {
            dur3 = eighth.times(build(2));
          } else if (rand4 < 7/12) {
            quiet = false;
          }
          if (beatLike || !quiet) {
            if (Math.random() < quietFactor) {
              this.lengthenPrevBy(eighth);
            } else {
              this.upsertByDur([noteNums[idx3]], eighth);
            }
            remainder = remainder.minus(eighth);
            const shifts = shuffle(range(0, 4));
            if (Math.random() < quietFactor) {
              this.lengthenPrevBy(eighth);
            } else {
              this.upsertByDur([noteNums[shifts[0]]], eighth);
            }
            remainder = remainder.minus(eighth);
            if (remainder.toFloat() <= 0) {
              return;
            }
            if (Math.random() < quietFactor) {
              this.lengthenPrevBy(eighth);
            } else {
              this.upsertByDur([noteNums[shifts[1]]], eighth);
            }
            remainder = remainder.minus(eighth);
            if (remainder.toFloat() <= 0) {
              return;
            }
            if (Math.random() < quietFactor) {
              this.lengthenPrevBy(eighth);
            } else {
              this.upsertByDur([noteNums[shifts[2]]], eighth);
            }
            remainder = remainder.minus(eighth);
            if (remainder.toFloat() <= 0) {
              return;
            }
            this.upsertByDur([noteNums[shifts[3]]], remainder);
            return;
          }

          this.upsertByDur([noteNums[idx3]], dur3);
          remainder = remainder.minus(dur3);
          if (remainder.toFloat() <= 0) {
            return;
          }
          const rand5 = Math.random();
          let dur4 = remainder;
          if (rand5 < 1/3) {
            dur4 = eighth;
          }
          const noteNums2 = chord.chordTonesAbove(noteNums[0] + 7);
          this.upsertByDur([noteNums2[1]], dur4);
          remainder = remainder.minus(dur4);
          if (remainder.toFloat() <= 0) {
            return;
          }
          const rand6 = Math.random();
          let idx9 = 0;
          if (rand6 < 1/3) {
            idx9 = 2;
          }
          this.upsertByDur([noteNums2[idx9]], remainder);
        });
      }

      addSimpleComping() {
        let simple = true;
        let seed = this.seed;
        this._upsertComping(slot => {
          const fourBeat = slot.duration.equals(build(4, 4));
          if (simple) {
            simple = Math.random() < 0.4;
          } else if (fourBeat) {
            simple = Math.random() < 0.1;
          } else {
            simple = Math.random() < 0.3;
          }
          if (simple) {
            this._simpleComping(slot, seed);
            seed = this._genCompSeed(seed);
            return;
          }
          this._twoBeatComping(slot, seed);
          seed = this._genCompSeed(seed);
        });
      }

      addMelodicComping() {
        let seed = this.seed;
        this._upsertComping(slot => {
          this._melodicComping(slot, seed);
          seed = this._genCompSeed(seed);
        });
      }

      _melodicComping(slot, seed) {
        // const useColor = Math.random() < 0.3;

        let remainder = slot.duration;
        const notes0 = slot.chord.chordTonesAbove(seed - 12);

        let dur0 = build(1, 4);
        let notes = [notes0[1]];
        const dur0Rand = Math.random();
        if (dur0Rand < 1 / 6 && remainder.geq(build(1, 2))) {
          dur0 = build(3, 8);
        } else if (dur0Rand < 3 / 6 && remainder.geq(build(1, 2))) {
          dur0 = build(1, 2);
          notes = [notes0[1], notes0[0]];
        }

        this.upsertByDur(notes, dur0);
        remainder = remainder.minus(dur0);
        if (remainder.toFloat() <= 0) {
          return;
        }

        const shiftIdxRand = Math.random();
        let shiftIdx1;
        let shiftIdx2;
        let shiftIdx3;
        if (shiftIdxRand < 1/10) {
          shiftIdx1 = 0;
          shiftIdx2 = 1;
          shiftIdx3 = 2;
        } else if (shiftIdxRand < 2/10) {
          shiftIdx1 = 0;
          shiftIdx2 = -1;
          shiftIdx3 = 1;
        } else if (shiftIdxRand < 4/10) {
          shiftIdx1 = -1;
          shiftIdx2 = 0;
          shiftIdx3 = 1;
        } else if (shiftIdxRand < 6/10) {
          shiftIdx1 = 1;
          shiftIdx2 = 0;
          shiftIdx3 = 2;
        } else if (shiftIdxRand < 8/10) {
          shiftIdx1 = 1;
          shiftIdx2 = 2;
          shiftIdx3 = 1;
        } else {
          shiftIdx1 = 2;
          shiftIdx2 = 1;
          shiftIdx3 = 0;
        }
        let dur1 = build(1, 8);
        let notes1 = [notes0[1+shiftIdx1]];
        if (dur0.equals(build(1, 2)) && Math.random() < 0.3) {
          dur1 = build(1,2);
          notes1 = [notes0[1+shiftIdx1], notes0[shiftIdx1 <= -1 ? 2 : shiftIdx1]];
        } else if (remainder.geq(build(1,4)) && Math.random() < 0.5) {
          dur1 = build(1,4);
        }
        this.upsertByDur(notes1, dur1);
        remainder = remainder.minus(dur1);
        if (remainder.toFloat() <= 0) {
          return;
        }

        let dur2 = build(1, 8);
        let notes2 = [notes0[1+shiftIdx2]];
        const dur2Rand = Math.random();
        if (dur2Rand < 2 / 4 && remainder.geq(build(1, 4))) {
          dur2 = build(1, 4);
          if (Math.random() < 0.2) {
            notes2 = [notes0[1+shiftIdx2], notes0[shiftIdx2 <= -1 ? 2 : shiftIdx2]];
          }
        } else if (dur2Rand < 3 / 4 && remainder.geq(build(3, 8))) {
          dur2 = build(3, 8);
          if (Math.random() < 0.4) {
            notes2 = [notes0[1+shiftIdx2], notes0[shiftIdx2 <= -1 ? 2 : shiftIdx2]];
          }
        }
        this.upsertByDur(notes2, dur2);
        remainder = remainder.minus(dur2);
        if (remainder.toFloat() <= 0) {
          return;
        }
        let notes3 = [notes0[1+shiftIdx3]];
        if (remainder.geq(build(3, 8)) && Math.random() < 0.4) {
          notes3 = [notes0[1+shiftIdx3], notes0[shiftIdx3 <= -1 ? 2 : shiftIdx3]];
        }
        this.upsertByDur(notes3, remainder);
        // remainder = remainder.minus(dur2);
      }

      _genCompSeed(seed) {
        return Math.min(65, Math.max(45, Math.floor(Math.random() * 3) + seed - 1))
      }

      _simpleComping(slot, seed) {
        // TODO replace 54 (G4) with something less arbitrary, e.g. the top note from the previous chord voicing.
        const numNotes = Math.random() < 0.6 ? 2 : 1;
        const noteNums = slot.chord.chordTonesBelow(seed).slice(0, numNotes);
        this.upsertByDur(noteNums, slot.duration);
      }

      _twoBeatComping(slot, seed) {
        // TODO replace 54 (G4) with something less arbitrary, e.g. the top note from the previous chord voicing.
        let dur2 = build(1, 8);
        const twoBeat = slot.duration.equals(build(2, 4));
        if (twoBeat) {
          const rand = Math.random();
          if (rand < 1/3) {
            dur2 = build(1, 8);
          } else {
            dur2 = build(1, 4);
          }
        }
        const threeBeat = slot.duration.equals(build(3, 4));
        if (threeBeat) {
          const rand = Math.random();
          if (rand < 1/4) {
            dur2 = build(1, 8);
          } else if (rand < 2/4) {
            dur2 = build(1, 4);
          } else if (rand < 3/4) {
            dur2 = build(3, 8);
          } else {
            dur2 = build(2, 4);
          }
        }
        const fourBeat = slot.duration.equals(build(4, 4));
        if (fourBeat) {
          const rand = Math.random();
          if (rand < 3/8) {
            dur2 = build(1, 4);
          } else if (rand < 5/8) {
            dur2 = build(3, 8);
          } else {
            dur2 = build(2, 4);
          }
        }

        const dur1 = slot.duration.minus(dur2);
        if (dur1.toFloat <= 0) {
          throw 'too small to generate 2 beat comping';
        }
        seed = seed || 54;
        const halfNote = build(2, 4);
        const below = slot.chord.chordTonesBelow(seed + 3);
        const idx1 = Math.floor(Math.random() * (below.length - 1));
        let notes1 = [below[idx1]];
        if (Math.random() < 0.3) {
          notes1 = [below[idx1], below[idx1 + 1]];
        }
        if (halfNote.lessThan(dur1)) {
          this.upsertByDur(notes1, halfNote.plus(dur1.minus(halfNote)));
        } else {
          this.upsertByDur(notes1, dur1);
        }

        let idx2 = Math.floor(Math.random() * (below.length - 1));
        if (idx1 === idx2) {
          idx2 = Math.floor(Math.random() * (below.length - 1));
          if (idx1 === idx2) {
            idx2 = Math.floor(Math.random() * (below.length - 1));
          }
        }
        let notes2 = [below[idx2]];
        if (Math.random() < 0.2) {
          notes2 = [below[idx2], below[idx2 + 1]];
        }
        this.upsertByDur(notes2, dur2);
      }

      _oneBeatComping(slot, skipSecondHalf, seed, decorate) {
        const halfBeat = build(1, 8);
        if (skipSecondHalf) {
          this.upsertByDur(slot.chord.chordTonesBelow(seed).slice(0, 2), halfBeat.times(build(2)));
          return;
        }
        if (!decorate) {
          this.upsertByDur(slot.chord.chordTonesBelow(seed).slice(0, 2), halfBeat);
          this.upsertByDur(slot.chord.chordTonesBelow(seed).slice(2, 3), halfBeat);
          return;
        }
        const quarterBeat = build(1, 16);
        let halfBeatIdx;
        const rand = Math.random();
        if (rand < 0.65) {
          halfBeatIdx = 0;
        } else if (rand < 0.93) {
          halfBeatIdx = 1;
        } else {
          halfBeatIdx = 2;
        }
        const durations = [quarterBeat, quarterBeat];
        durations.splice(halfBeatIdx, 0, halfBeat);
        const notes = [
          slot.chord.chordTonesBelow(seed).slice(2, 3),
          slot.chord.chordTonesBelow(seed).slice(3, 4)];
        shuffle(notes);
        this.upsertByDur(slot.chord.chordTonesBelow(seed).slice(0, 2), durations[0]);
        this.upsertByDur(notes[0], durations[1]);
        this.upsertByDur(notes[1], durations[2]);
      }

      addOneBeatComping() {
        let seed = 54;
        this._upsertComping(slot => {
          if (!slot.duration.times(build(4)).isWhole()) {
            throw 'Unable to add one beat comping for this time sig.'
          }
          const numBeats = slot.duration.times(build(4)).toFloat();

          const skipNum = Math.floor(Math.random() * numBeats);
          range(0, numBeats).forEach(idx => {
            let decorate = false;
            if (idx >= Math.floor(numBeats / 2)) {
              decorate = Math.random() < .15 * (idx / 1.5 + 1);
            }
            this._oneBeatComping(slot, skipNum === idx && idx !== 1, seed, decorate);
          });
          seed = this._genCompSeed(seed);
        });
      }

      addDecoratedTwoBeatComping() {
        this._upsertComping(slot => {
          // TODO replace 54 (G4) with something less arbitrary, e.g. the top note from the previous chord voicing.
          if (slot.duration.lessThan(build(2, 4))) {
            this._twoBeatComping(slot);
            return;
          }
          const dur2 = build(1, 8);
          let dur1 = slot.duration.over(build(2));
          if (slot.duration.equals(build(3, 4))) {
            dur1 = build(2, 4);
          }
          dur1 = dur1.minus(dur2);
          const dur3 = slot.duration.minus(dur1).minus(dur2);
          this.upsertByDur(slot.chord.chordTonesBelow(54).slice(0, 2), dur1);
          this.upsertByDur(slot.chord.chordTonesBelow(54).slice(2, 3), dur2);
          this.upsertByDur(slot.chord.chordTonesBelow(54).slice(1, 2), dur3);
        });
      }

      _createChordSlots() {
        const finalEndTime = this._getMaxEndTime();
        const durationPerMeasure = this.getDurationPerMeasure();
        const chordLocs = this.doc.chordLocs;
        const slots = [];
        if (this.doc.pickup.toFloat() > 0) {
          slots.push({
            chord: null,
            duration: this.doc.pickup,
            start: this.doc.pickup.negative(),
            end: build(0),
          });
        }
        chordLocs.forEach((chordLoc, idx) => {
          const chord = chordLoc.chord;
          const startTime = chordLoc.start;
          const endTime = idx + 1 < chordLocs.length ? chordLocs[idx + 1].start : finalEndTime;
          _split(startTime, endTime, durationPerMeasure).forEach(splitRes => {
            const duration = splitRes.end.minus(splitRes.start);
            slots.push({
              chord: chord,
              duration: duration,
              start: splitRes.start,
              end: splitRes.end,
            });
          });
        });
        return slots;
      }

      _upsertComping(algo) {
        const onlyAddToCursorSlot = !this.getCurrVoice().noteGps.atTail();
        const currTime = this.getCursorTime();
        let shouldAdd = false;
        const slots = this._createChordSlots();
        slots.forEach((slot, idx) => {
          if (currTime.equals(slot.start)) {
            shouldAdd = true;
          } else {
            if (onlyAddToCursorSlot) {
              shouldAdd = false;
            }
          }
          if (!shouldAdd) {
            return;
          }

          // Deal with pickup measure.
          if (!slot.chord) {
            this.upsertByDur([null], slot.duration);
            return;
          }
          const res = algo(slot, idx > 0 ? slots[idx - 1] : null);
          if (res) {
            // Each beat/step is multiplied by slot.duration, so we need to scale
            // down relNote.start by dividing by slot.duration.
            this.upsertBeat(res.map(relNote => {
              const res = relNote.clone();
              res.start = relNote.start.over(slot.duration);
              return res;
            }), slot.duration);
          }
        });
      }

      _getMaxEndTime() {
        let poss = this.doc.pickup.negative();
        this.doc.voices.forEach(voice => {
          const finalNoteGp = voice.noteGps.get2ndLast();
          if (finalNoteGp && poss.lessThan(finalNoteGp.end)) {
            poss = finalNoteGp.end;
          }
        });
        if (this.doc.chordLocs.length > 0) {
          const finalChordLoc = this.doc.chordLocs[this.doc.chordLocs.length - 1];
          const lastChordEnd = nextMeasureTime(finalChordLoc.start, this.getDurationPerMeasure());
          if (poss.lessThan(lastChordEnd)) {
            poss = lastChordEnd;
          }
        }
        return poss;
      }

      getDurationPerMeasure() {
        return build(this.doc.timeSigNumer, this.doc.timeSigDenom);
      }

      incrTimeSigNumer() {
        this.doc.timeSigNumer += 1;
      }

      decrTimeSigNumer() {
        if (this.doc.timeSigNumer <= 1) {
          return;
        }
        this.doc.timeSigNumer -= 1;
      }

      incrTimeSigDenom() {
        this.doc.timeSigDenom *= 2;
      }

      decrTimeSigDenom() {
        this.doc.timeSigDenom /= 2;
      }

      setTitle(title) {
        this.doc.title = title;
      }

      getTitle() {
        return this.doc.title;
      }

      // oldCurrTime arg is needed because we may have removed the voice before
      // calling this method.
      _setVoiceIdxAndAlign(idx, oldCurrTime) {
        oldCurrTime = oldCurrTime || this.getCursorTime();
        this.editor.currVoiceIdx = idx;
        this._alignTime(oldCurrTime);
      }

      setVoiceIdx(idx) {
        this.editor.currVoiceIdx = idx;
      }

      goUp() {
        if (this.isChordMode()) {
          const measNum = measureNum(this.getCursorTime(), this.getDurationPerMeasure());
          const barsPerLine = 4;
          const lineNum$1 = lineNum(measNum, barsPerLine);
          this.navUp();
          if (lineNum$1 === 0) {
            return;
          }
          const currTime = this.getCursorTime();
          this.disableChordMode();
          this._setVoiceIdxAndAlign(this.doc.voices.length - 1, currTime);
          return;
        }
        if (this.editor.currVoiceIdx > 0) {
          this._nextVoice(-1);
          return;
        }
        this.enableChordMode();
      }

      goDown() {
        if (this.isChordMode()) {
          const currTime = this.getCursorTime();
          this.disableChordMode();
          this._setVoiceIdxAndAlign(0, currTime);
          return;
        }
        if (this.editor.currVoiceIdx + 1 < this.doc.voices.length) {
          this._nextVoice(1);
          return;
        }
        this.enableChordMode();
        this.navDown();
      }

      _finalVoice() {
        this.setVoiceIdx(this.doc.voices.length - 1);
      }

      _nextVoice(jump, oldCurrTime) {
        jump = jump || 1;
        const newCurrVoiceIdx = mod(
          this.editor.currVoiceIdx + jump, this.doc.voices.length);
        if (newCurrVoiceIdx !== this.editor.currVoiceIdx + jump) {
          return;
        }
        this._setVoiceIdxAndAlign(newCurrVoiceIdx, oldCurrTime);
      }

      _alignTime(oldCurrTime) {
        const maxNotesPerLine = 999;
        boundedWhile(breakFunc => {
          if (this.getCursorTime().lessThan(oldCurrTime)) {
            return breakFunc();
          }
          // Use navLeftMeasure instead of navLeft to ensure
          // that in chord mode, the cursor is not in between beats.
          this.navLeftMeasure();
        }, maxNotesPerLine);
        boundedWhile(breakFunc => {
          if (this.getCursorTime().geq(oldCurrTime)) {
            return breakFunc();
          }
          this.navRight();
        }, maxNotesPerLine);
      }

      toggle24And44() {
        if ([2, 4].indexOf(this.doc.timeSigNumer) === -1) {
          this.ebanner.slowDisplay(
            'This only works for 2/4 or 4/4 time signatures.');
          return;
        }
        const mult = this.doc.timeSigNumer === 2 ? build(2) : build(1, 2);
        this.doc.timeSigNumer = build(this.doc.timeSigNumer).times(mult).toFloat();
        this.doc.chordLocs.forEach(loc => {
          loc.start = loc.start.times(mult);
        });
        this.doc.keySigLocs.forEach(loc => {
          loc.start = loc.start.times(mult);
        });
        this.doc.voices.forEach(voice => {
          voice.noteGps.toArray().forEach(noteGp => {
            noteGp.start = noteGp.start.times(mult);
            noteGp.end = noteGp.end.times(mult);
          });
        });
        // Note that setPickup is not used because noteGp
        // shifting is completed above.
        this.doc.pickup = this.doc.pickup.times(mult);
        this.setTempo(build(this.getTempo()).times(mult).toFloat());
      }

      swingify() {
        this.doc.tempoStr = '';
        const newVoices = [];
        this.doc.voices.forEach(voice => {
          const noteGpsArr = voice.noteGps.toArray();
          const beatDur = build(1, 4);
          const res = periodicSplit(noteGpsArr, beatDur);
          res.forEach((_, idx) => {
            // Perform mutation
            _swingifyOneBeat(res, idx);
          });
          newVoices.push(Voice.fromNoteGpsArray(
            mergeTiesAndRests(res), voice.clef));
        });
        this.doc.setVoices(newVoices);
      }

      implicitSwing() {
        if (this.doc.tempoStr == 'Swing') {
          this.doc.tempoStr = '';
          return;
        }
        this.doc.tempoStr = 'Swing';
        const durationPerMeasure = build(
          this.doc.timeSigNumer, this.doc.timeSigDenom);
        const newVoices = [];
        this.doc.voices.forEach(voice => {
          const noteGpsArr = voice.noteGps.toArray();
          const resNoteGps = [];
          splitIntoMeasures(noteGpsArr, durationPerMeasure).forEach(meas => {
            if (meas.length === 0) {
              return;
            }
            const start = meas[0].start;
            const end = meas[meas.length - 1].end;
            const chunks = exec(
              meas, start, end, this.doc.timeSigNumer, this.doc.timeSigDenom);
            chunks.forEach(chunk => {
              const noteGpsArrInChunk = chunk.getNoteGps();
              const isTuplet = chunk instanceof TupletChunk;
              if (isTuplet) {
                if (noteGpsArrInChunk.length === 2) {
                  const left = noteGpsArrInChunk[0];
                  if (left.getDuration().equals(build(1, 6))) {
                    const right = noteGpsArrInChunk[1];
                    if (right.getDuration().equals(build(1, 12))) {
                      // TODO move this into a helper for alt-left and alt-right.
                      const leftClone = left.clone();
                      const rightClone = right.clone();
                      leftClone.end = left.start.plus(build(1, 8));
                      rightClone.start = leftClone.end;
                      resNoteGps.push(leftClone, rightClone);
                      return;
                    }
                  }
                }
              }
              resNoteGps.push(...noteGpsArrInChunk);
            });
          });
          newVoices.push(Voice.fromNoteGpsArray(
            mergeTiesAndRests(resNoteGps), voice.clef));
        });
        this.doc.setVoices(newVoices);
      }

      enharmSpelling(spellingsStr) {
        if (this.isChordMode()) {
          return;
        }
        const currNoteGp = this.getCurrVoice().noteGps.getCurr();
        if (!currNoteGp) {
          return;
        }
        if (!spellingsStr) {
          currNoteGp.notes.forEach(note => {
            note.spelling = null;
          });
          return;
        }
        const spellings = spellingsStr.split(',').map(str => {
          const chord = _parseChordStr(str, this.ebanner);
          if (!chord) {
            return null;
          }
          return chord.root;
        });
        if (spellings.some(s => { return s == null; })) {
          return;
        }
        if (spellings.length != currNoteGp.notes.length) {
          return;
        }
        currNoteGp.notes.forEach((note, idx) => {
          note.spelling = spellings[idx];
        });
      }

      // Only for the purpose of auto-generating comping
      appendVoice() {
        if (this.doc.chordLocs.length === 0) {
          this.ebanner.slowDisplay(
            'This only works if you have added chords to the song.');
          return;
        }
        this.disableChordMode();
        this._finalVoice();
        this.addVoice();
      }

      addVoice(voice) {
        const nextIdx = this.isChordMode() ? 0 : this.editor.currVoiceIdx + 1;
        voice = voice || new Voice(null, 'bass');
        this.doc.voices.splice(nextIdx, 0, voice);
        if (nextIdx === 0) {
          this.goDown();
        } else {
          this._nextVoice();
        }
      }

      removeVoice() {
        if (this.isChordMode()) {
          this.doc.clearChords();
          return;
        }
        if (this.doc.voices.length < 2) {
          return;
        }
        const oldCurrTime = this.getCursorTime();
        this.doc.voices.splice(this.editor.currVoiceIdx, 1);
        this._nextVoice(-1, oldCurrTime);
      }

      toggleClef() {
        if (this.isChordMode()) {
          return;
        }

        const voice = this.getCurrVoice();
        voice.clef = voice.clef != 'treble' ? 'treble' : 'bass';
      }

      _abcVoices() {
        return this.doc.voices.map((voice, idx) => {
          const showChords = idx === 0;
          // const showChords = false;
          const showChordsCursor = !this.viewMode && showChords && this.editor.cursorOnChords;
          const chordLocs = (
            showChordsCursor ? addChordCursor(this.doc.chordLocs, this.getCursorTime()) :
            this.doc.chordLocs);
          const showNotesCursor = !this.viewMode && !this.editor.cursorOnChords && idx === this.editor.currVoiceIdx;
          return voice.getAbcStrings(
            this.abcNoteDuration,
            this.doc,
            this.showSpelling,
            chordLocs,
            showChords,
            showNotesCursor,
            idx,
            this.getCursorTime());
        }).flat();
      }

      toggleView() {
        this.save();
        const url = new URL(document.URL);
        let view = url.searchParams.get('view');
        view = view === '1' ? '0' : '1';
        const newUrl = new URL(document.URL);
        newUrl.searchParams.set('view', view);
        window.location.href = newUrl;
      }

      setComposer(c) {
        this.doc.composer = c;
      }

      cut() {
        if (this.isChordMode()) {
          this.ebanner.display('Not supported');
          return;
        }
        this.copy();
        this.truncateRight();
      }

      truncateRight() {
        const noteGps = this.getCurrVoice().noteGps;
        const cursorTime = this.getCursorTime();
        while(!noteGps.atTail()) {
          this.skipRight();
          this.unsafeRemoveFromNoteGps();
        }
        this.setCursorTimeSyncPointer(cursorTime);
      }

      // TODO think about pasting multiple voices with chords, and
      // recording the links/title of the pasted parts.
      copy() {
        let data = null;
        if (this.isChordMode()) {
          const currTime = this.getCursorTime();
          data = this.doc.chordLocs.filter(chordLoc => {
            return !chordLoc.start.lessThan(currTime);
          }).map(chordLoc => {
            const clone = chordLoc.clone();
            clone.start = chordLoc.start.minus(currTime);
            return clone;
          });
        } else {
          if (this._isOutOfSync()) {
            this._surger();
          }
          const noteGpArr = this.getCurrVoice().noteGps.toArrayStartingFromCurr();
          const voice = Voice.fromNoteGpsArray(noteGpArr);
          data = voice.toJson();
        }
        localStorage.setItem('pasteBuffer', JSON.stringify(data));
      }

      paste() {
        let data;
        let json;
        try {
          data = localStorage.getItem('pasteBuffer');
          json = JSON.parse(data);
        } catch (err) {
          console.log('Pasting non-music data.', err, data);
          return;
        }
        if (this.isChordMode()) {
          let chordLocs;
          try {
            chordLocs = json.map(loc => { return ChordLoc.fromJson(loc); });
          } catch(err) {
            this.ebanner.display('Error: Pasting non-chord JSON.');
            console.log('Pasting non-chord JSON.', err, json);
            return;
          }
          const currTime = this.getCursorTime();
          chordLocs.forEach(chordLoc => {
            const clone = chordLoc.clone();
            clone.start = chordLoc.start.plus(currTime);
            this._insertChordLoc(clone);
          });
          return;
        }
        let voice;
        try {
          voice = Voice.fromJson(json);
        } catch(err) {
          this.ebanner.display('Error: Pasting non-voice JSON.');
          console.log('Pasting non-voice JSON.', err, json);
          return;
        }
        const noteGpsArr = voice.noteGps.toArray();
        this.insertNoteGps(noteGpsArr);
      }

      insertNoteGps(noteGpsArr, stationaryCursor) {
        if (noteGpsArr.length == 0) {
          return;
        }
        const currTime = this.getCursorTime();
        const shift = currTime.minus(noteGpsArr[0].start);
        noteGpsArr.forEach(noteGp => {
          noteGp.start = noteGp.start.plus(shift);
          noteGp.end = noteGp.end.plus(shift);
        });
        noteGpsArr.forEach(noteGp => {
          this.upsertByDur(
            noteGp.notes.map(note => {return note.noteNum;}),
            noteGp.end.minus(noteGp.start));
        });
        if (stationaryCursor) {
          this.setCursorTimeSyncPointer(currTime);
        }
      }

      getAbc() {
        const tempoStr = this.doc.tempoStr ? `"${this.doc.tempoStr}"` : '';
        return `X: 1
T: ${this.doc.title}
C: ${this.doc.composer}
M: ${this.doc.timeSigNumer}/${this.doc.timeSigDenom}
K: ${this.doc.keySigSp.toString()}
Q: ${this.abcNoteDuration.toString()} = ${this.doc.tempo} ${tempoStr}
L: ${this.abcNoteDuration.toString()}
${this._abcVoices().join('')}
`;
      }
    }

    // idx is the potential start of a beat.
    function _swingifyOneBeat(noteGpsArr, idx) {
      const noteGp0 = noteGpsArr[idx];
      // Don't swing if noteGp0 is not at the start of a beat.
      if (!noteGp0.start.times(build(4)).isWhole()) {
        return;
      }
      const oneBeat = build(1, 4);
      const dur0 = noteGp0.getDuration();
      if (!dur0.lessThan(oneBeat)) {
        return;
      }
      if (idx + 1 >= noteGpsArr.length) {
        return;
      }
      const noteGp1 = noteGpsArr[idx + 1];
      const dur1 = noteGp1.getDuration();
      if (!dur0.plus(dur1).lessThan(oneBeat)) {
        if (noteGp0.tie) {
          return;
        }
        const newDur0 = (
          dur0.lessThan(build(1, 8)) ? build(1, 12)
          : build(1, 6));
        noteGp0.end = noteGp0.start.plus(newDur0);
        noteGp1.start = noteGp0.end;
        return;
      }
      if (idx + 2 >= noteGpsArr.length) {
        return;
      }
      const noteGp2 = noteGpsArr[idx + 2];
      const dur2 = noteGp2.getDuration();
      // Don't swing if there are more than 3 notes in a beat.
      if (dur0.plus(dur1).plus(dur2).lessThan(oneBeat)) {
        return;
      }

      noteGp0.end = noteGp0.start.plus(build(1, 12));
      noteGp1.start = noteGp0.end;
      noteGp1.end = noteGp1.start.plus(build(1, 12));
      noteGp2.start = noteGp1.end;
    }

    function findUpsertIdx(inputChordLocs, time) {
      // Case 1: on the far left.
      if (inputChordLocs.length === 0 || time.lessThan(inputChordLocs[0].start)) {
        return {idx: 0, update: false};
      }
      for (let idx = 0; idx < inputChordLocs.length; idx++ ) {
        const chordLoc = inputChordLocs[idx];
        // Case 2: time is at idx
        if (time.equals(chordLoc.start)) {
          return {idx: idx, update: true};
        }
        // Case 4: on the far right.
        if (idx + 1 >= inputChordLocs.length) {
          return {idx: inputChordLocs.length, update: false};
        }
        // Case 3: time is sandwiched between idx and idx + 1
        const nextChordLoc = inputChordLocs[idx+1];
        const sandwiched = chordLoc.start.lessThan(time) && time.lessThan(nextChordLoc.start);
        if (sandwiched) {
          return {idx: idx + 1, update: false};
        }
      }
      // Impossible.
      console.warn('failed to find upsertIdx; inputChordLocs, time:', inputChordLocs, time);
      throw 'failed to find upsertIdx';
    }

    function addChordCursor(inputChordLocs, cursorTime) {
      const upsertInfo = findUpsertIdx(inputChordLocs, cursorTime);
      if (upsertInfo.update) {
        return inputChordLocs.map((chordLoc, idx) => {
          const clone = chordLoc.clone();
          if (idx === upsertInfo.idx) {
            clone.onCursor = true;
          }
          return clone;
        });
      }
      const res = inputChordLocs.map(chordLoc => {
        return chordLoc.clone();
      });
      res.splice(upsertInfo.idx, 0, new ChordLoc(null, cursorTime, true));
      return res;
    }

    function _parseChordStr(chordStr, ebanner) {
      if (!chordStr) {
        return;
      }
      try {
        return new Chord(Parser.parse(chordStr));
      } catch(err) {
        if (ebanner) {
          ebanner.display('failed to parse chord: ' + chordStr);
        }
        console.warn('failed to parse chord: ', chord, err);
        return;
      }
    }

    function getSongUrl(id) {
      const newUrl = new URL(document.URL.split('#')[0]);
      newUrl.searchParams.set('id', id);
      return newUrl;
    }

    function collapseGraceNotesToSimultaneousNotes(noteGps) {
      function _merge(noteGpsToMerge) {
        if (noteGpsToMerge.length == 0) {
          throw 'noteGpsToMerge.length cannot be 0.';
        }
        const notes = [];
        const lastNoteGp = noteGpsToMerge[noteGpsToMerge.length - 1].clone();
        noteGpsToMerge.forEach(noteGp => {
          notes.push(...noteGp.notes);
        });
      return new NoteGp(notes, lastNoteGp.start, lastNoteGp.end, lastNoteGp.tie);
      }

      const res = [];
      let noteGpsToMerge = [];
      for (let idx = 0; idx < noteGps.length; idx++) {
        const currNoteGp = noteGps[idx];
        if (noteGpsToMerge.length == 0) {
          noteGpsToMerge.push(currNoteGp);
          continue;
        }
        if (noteGpsToMerge[0].start.equals(currNoteGp.start)) {
          noteGpsToMerge.push(currNoteGp);
          continue;
        }
        // Context: currNoteGp start at a different place.
        // Outcome: merge and re-initialize oteGpsToMerge.
        res.push(_merge(noteGpsToMerge));
        noteGpsToMerge = [currNoteGp];
      }
      if (noteGpsToMerge.length > 0) {
        res.push(_merge(noteGpsToMerge));
      }
      return res;
    }

    /**
     * @fileoverview Description of this file.
     */


    const html = `
<style>
#banner {
    position: fixed;
    top: 0;
    left: 50%;

    background-color: #f9edbe;
    border-color: #f0c36d;
    border-style: solid;
    border-width: 1px;
    padding: 6px;
    font-size: 20px;

    visibility: hidden;
}
</style>
<div id='banner'>
</div>
`;

    class EphemeralBanner extends HTMLElement {
      constructor() {
        super();
        this.root = null;
        this.timeout = null;
      }

      connectedCallback() {
        this.root = this.attachShadow({ mode: 'open' });
        this.root.innerHTML = html;
      }

      display(message, color, period) {
        color = color || '#f9edbe';
        period = period || 2 * 1000;
        if (!this.root) {
          return;
        }
        window.clearTimeout(this.timeout);
        const banner = this.root.querySelector('#banner');
        banner.textContent = message;
        banner.style.visibility = 'visible';
        banner.style.backgroundColor = color;
        this.timeout = window.setTimeout(() => {
          banner.style.visibility = 'hidden';
        }, period);
      }

      slowDisplay(message) {
        this.display(message, null, 6 * 1000);
      }
    }

    customElements.define('eph-banner', EphemeralBanner);

    class RenderMgr {
      constructor(canvasDiv) {
        this._eBanner = new EphemeralBanner();
        this._canvasDiv = canvasDiv;
      }

      render(song) {
        const stateMgr = new StateMgr(this._eBanner);
        stateMgr.doc.timeSigNumer = song.timeSigChanges.defaultVal.upperNumeral;
        stateMgr.doc.timeSigDenom = song.timeSigChanges.defaultVal.lowerNumeral;
        stateMgr.setTitle(song.title);
        stateMgr.setPickup(song.pickup8n.over(8).negative());
        stateMgr.setTempo(song.tempo8nPerMinChanges.defaultVal);
        stateMgr.doc.tempoStr = song.swingChanges.defaultVal.ratio.toFloat() > 1 ? 'Swing' : '';
        stateMgr.doc.keySigSp = song.keySigChanges.defaultVal;
        
        stateMgr.doc.voices = [];
        song.getVisibleVoices().forEach((voice, idx) => {
          if (idx >= stateMgr.doc.voices.length) {
            stateMgr.addVoice(new Voice(null, voice.clef.toLowerCase()));
          }
          stateMgr.disableChordMode();
          stateMgr.setVoiceIdx(idx);
          stateMgr.navHead();
          voice.noteGps.forEach(qng => {
            const noteNums = qng.getNoteNums();
            stateMgr.upsertByDur(noteNums.length ? qng.getNoteNums() : [null], qng.end8n.minus(qng.start8n).over(8));
          });
        });

        stateMgr.enableChordMode();
        song.chordChanges.getChanges().forEach(chordChange => {
          stateMgr.setCursorTimeSyncPointer(chordChange.start8n.over(8));
          stateMgr.insertChord(chordChange.val.toString().replace('maj', 'M'));
        });

        stateMgr.viewMode = true;

        const params = {};
        const moreParams = {};
        const abcStr = stateMgr.getAbc();
        ABCJS.renderAbc(this._canvasDiv, abcStr, params, moreParams);
      }

      clear() {
        this._canvasDiv.innerHTML = '';
        this._canvasDiv.removeAttribute("style");
      }
      
    }

    // Requires tmp-sheet-container and tmp-sheet-canvasto be in the DOM.
    function genSheetImage(gridData, title, handler) {
        const div = document.getElementById('tmp-sheet-container');
        if (!div) {
            return;
        }
        // 1. Render sheet music svg in div.
        const songInfo = parseKeyValsToSongInfo(gridData, { title: title });
        const song = songInfo.songForm.toFullyArrangedSong();
        const renderMgr = new RenderMgr(div);
        renderMgr.render(song);
        const canvas = document.getElementById('tmp-sheet-canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log('failed to get 2d context');
            return;
        }
        const canvgInstance = canvg.Canvg.fromString(ctx, div.innerHTML);
        canvgInstance.start();
        canvas.toBlob(handler, 'image/png');
    }

    function setupGoogleAddOnActions(msEditor) {
        // TODO add a shortcut for resizing modal.
        document.getElementById('add-image-button')?.addEventListener('keydown', _ => addLinkedImageToDoc(msEditor));
        msEditor.customHotkeyToAction.set('alt x', _ => addLinkedImageToDoc(msEditor));
        // Autofocus does not work for google add-on, so focus explicitly.
        msEditor.tsEditor.textarea.focus();
    }
    function onSuccess() {
        google.script.host.close();
    }
    function onFailure(error) {
        alert(error.message);
    }
    function addLinkedImageToDoc(msEditor) {
        const dialog = document.getElementById('inserting-dialog');
        dialog.showModal();
        const link = msEditor.getMelodocLink();
        const title = getTitle(msEditor.tsEditor.textTable);
        genSheetImage(textTableToGridData(msEditor.tsEditor.textTable), title, async (blob) => {
            if (!blob) {
                dialog.close();
                return;
            }
            const blobInArray = Array.from(new Uint8Array(await blob.arrayBuffer()));
            google.script.run
                .withSuccessHandler(onSuccess)
                .withFailureHandler(onFailure)
                .addImageWithLink(blobInArray, link);
        });
    }

    function isInGoogleAddOn() {
        return typeof google !== 'undefined';
    }

    function main(url) {
        const mainDiv = document.getElementById('main');
        mainDiv.innerHTML = '';
        const msUiElt = document.createElement('music-spreadsheet-ui');
        mainDiv.appendChild(msUiElt);
        const urlParams = getUrlParamsMapFromString(url);
        if (urlParams.has('data')) {
            msUiElt.msEditor.tsEditor.textTable = TextTable.fromString(urlParams.get('data'));
        }
        else {
            insertDefaultHeadersIfBlank(msUiElt.msEditor.tsEditor);
        }
        msUiElt.msEditor.tsEditor.render();
        if (isInGoogleAddOn()) {
            setupGoogleAddOnActions(msUiElt.msEditor);
        }
        else {
            msUiElt.onRender(() => {
                const textContent = msUiElt.msEditor.tsEditor.textTable.toString(true);
                setUrlParam('data', textContent);
            });
            msUiElt.msEditor.customHotkeyToAction.set('alt x', async (_) => {
                const title = getTitle(msUiElt.msEditor.tsEditor.textTable);
                genSheetImage(textTableToGridData(msUiElt.msEditor.tsEditor.textTable), title, blob => {
                    if (!blob) {
                        return;
                    }
                    const item = { [blob.type]: blob };
                    navigator.clipboard.write([new ClipboardItem(item),
                    ]);
                });
            });
        }
    }
    function insertDefaultHeadersIfBlank(tsEditor) {
        console.log(tsEditor.textTable.toString());
        if (tsEditor.textTable.toString().trim().length > 0) {
            return;
        }
        tsEditor.textTable.cells = [
            [new Cell$1, new Cell$1('Title: Untitled')],
            [new Cell$1, new Cell$1('Meter: 4/4')],
            [new Cell$1, new Cell$1],
        ];
        tsEditor.cursor.rowIdx = tsEditor.textTable.cells.length - 1;
        tsEditor.cursor.colIdx = 0;
    }

    main(linkPointedToByCursor);

})();
//# sourceMappingURL=googleAddOnMain.js.map
