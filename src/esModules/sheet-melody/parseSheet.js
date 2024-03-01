import { chunkArray } from "../array-util/arrayUtil.js";
import { makeSpelling } from "../chord/spell.js";
import { makeFrac } from "../fraction/fraction.js";
import { scaleDegreeToSpelling } from "../solfege-util/scaleDegree.js";
import { toSpelling } from "../solfege-util/solfege.js";

// Deps: nearley (nearley.js), grammar (melodicCell.js)

// TODO Design how to interface with parse.js.

// Strip out the Bar and GuideBar in order to populate relDur.
// For a note type, noteSpelling will be populated.
// Returns [VoiceToken]
export function parseCell(cell) {
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

export class VoiceToken {
  constructor({relDur, type, noteInfo}) {
    this.relDur = relDur;
    this.type = type;
    this.noteInfo = noteInfo;
  }
}

export class NoteInfo {
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

export const TokenType = {
  Bar: 'Bar',
  GuideBar: 'GuideBar',
  Note: 'Note',
  Blank: 'Blank',
  Slot: 'Slot',
  Rest: 'Rest',
}
