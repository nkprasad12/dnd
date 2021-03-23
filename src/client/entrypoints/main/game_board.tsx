import {BoardModel} from '_client/game_board/model/board_model';
import {GameBoard} from '_client/game_board/controller/game_board';
import {BoardClient} from '_client/game_board/remote/board_client';
import {getElementById, removeChildrenOf} from '_client/common/ui_util';
import {addLabel, TEXT_COLOR} from '_client/board_tools/board_form';
import {MAIN_BOARD_STUB} from '_client/entrypoints/main/main';

function setLabel(message: string) {
  removeChildrenOf(MAIN_BOARD_STUB);
  addLabel(getElementById(MAIN_BOARD_STUB), message, TEXT_COLOR);
}

export async function loadBoard(boardId: string): Promise<BoardModel> {
  const server = await BoardClient.get();
  setLabel('Retrieving board data');
  const remoteModel = await server.requestBoard(boardId);
  setLabel('Loading images (may take a few moments)');
  return BoardModel.createFromRemote(remoteModel);
}

async function setupBoard(boardId: string): Promise<GameBoard> {
  const model = await loadBoard(boardId);
  removeChildrenOf(MAIN_BOARD_STUB);
  return GameBoard.create(MAIN_BOARD_STUB, model, await BoardClient.get());
}

export async function setupActiveBoard(): Promise<void> {
  setLabel('Connecting to game server');
  const boardId = await (await BoardClient.get()).requestActiveBoardId();
  if (boardId === undefined) {
    setLabel('Either there is no active board, or an error occurred.');
    return;
  }
  await setupBoard(boardId);
  return;
}
