import {BoardModel} from '_client/game_board/model/board_model';
import {BoardClient} from '_client/game_board/remote/board_client';
import {UiController} from '_client/entrypoints/main/ui_controller';

export async function loadBoard(
  boardId: string,
  controller: UiController
): Promise<BoardModel> {
  const server = await BoardClient.get();
  controller.setBoardMessage('Retrieving board data');
  try {
    const remoteModel = await server.requestBoard(boardId);
    controller.setBoardMessage('Loading images (may take a few moments)');
    return BoardModel.createFromRemote(remoteModel);
  } catch (ex) {
    controller.setBoardMessage(`Error thrown by server: ${ex}`);
    throw new Error(ex);
  }
}

export async function setupActiveBoard(
  controller: UiController
): Promise<void> {
  controller.setBoardMessage('Connecting to game server');
  const boardId = await (await BoardClient.get()).requestActiveBoardId();
  if (boardId === undefined) {
    controller.setBoardMessage(
      'Either there is no active board, or an error occurred.'
    );
    return;
  }
  const model = await loadBoard(boardId, controller);
  controller.setBoard(model);
  return;
}
