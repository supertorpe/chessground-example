import "./styles.scss";

import { Chess, ChessInstance, SQUARES, Square } from "chess.js";
import { Chessground } from "chessground";
import { Api } from "chessground/api";
import { Config } from "chessground/config";
import { MoveMetadata, Key } from "chessground/types";

const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const chess: ChessInstance = Chess();
chess.load(fen);

function toDests(): Map<Key, Key[]> {
  const dests = new Map();
  SQUARES.forEach((s) => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length)
      dests.set(
        s,
        ms.map((m) => m.to)
      );
  });
  return dests;
}

let board: Api;

const boardConfig: Config = {
  fen: fen,
  orientation: "white",
  viewOnly: false,
  turnColor: "white",
  premovable: {
    enabled: false,
  },
  movable: {
    free: false,
    color: "white",
    dests: toDests(),
    showDests: true,
    events: {
      after: (orig: Key, dest: Key, _metadata: MoveMetadata) => {
        chess.move({
          from: orig as Square,
          to: dest as Square,
          promotion: undefined,
        });
        const turnColor = chess.turn() == "w" ? "white" : "black";
        board.set({
          movable: {
            color: turnColor,
            dests: toDests(),
          },
        });
      },
    },
  },
  highlight: {
    lastMove: true,
    check: true,
  },
  draggable: {
    enabled: true,
    autoDistance: true,
    showGhost: true,
  },
  selectable: {
    enabled: true,
  },
};

board = Chessground(
  document.getElementById("chessboard") as HTMLElement,
  boardConfig
);

const resizeBoard = () => {
  const boardWrapper = document.getElementById("board_wrapper") as HTMLElement;
  const containerWidth = document.body.clientWidth;
  const containerHeight = document.body.clientHeight;
  let minSize = Math.min(containerWidth, containerHeight);
  boardWrapper.style.height = `${minSize}px`;
  boardWrapper.style.width = `${minSize}px`;
  const board: any = document.getElementById("chessboard");
  const mod = boardWrapper.clientWidth % 8;
  let boardSize = boardWrapper.clientWidth - mod;
  board.style.height = `${boardSize}px`;
  board.style.width = `${boardSize}px`;
};

window.addEventListener("resize", resizeBoard);
requestAnimationFrame(() => {
  resizeBoard();
});
