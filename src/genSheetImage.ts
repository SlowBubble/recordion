import { parseKeyValsToSongInfo } from "./esModules/sheet-to-song/parseV2.js";
import { RenderMgr } from "./esModules/sheet-to-song/render.js";

declare const canvg: any;

// Requires tmp-sheet-container and tmp-sheet-canvasto be in the DOM.
export function genSheetImage(gridData: string[][], title: string, handler: BlobCallback) {
  const div = document.getElementById('tmp-sheet-container');
  if (!div) {
    return;
  }
  // 1. Render sheet music svg in div.
  const songInfo = parseKeyValsToSongInfo(gridData, {title: title});
  const song = songInfo.songForm.toFullyArrangedSong();
  const renderMgr = new RenderMgr(div);
  renderMgr.render(song);

  const canvas = document.getElementById('tmp-sheet-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.log('failed to get 2d context')
    return;
  }
  const canvgInstance = canvg.Canvg.fromString(ctx, div.innerHTML);
  canvgInstance.start();
  canvas.toBlob(handler, 'image/png');
}