import {BoardModel} from '_client/game_board/model/board_model';
import {BoardClient} from '_client/game_board/remote/board_client';
import {UiController} from '_client/entrypoints/main/ui_controller';
import {
  FeedbackChannel,
  FeedbackType,
  UserFeedback,
} from '_client/entrypoints/main/user_feedback';

function showFeedback(type: FeedbackType, message: string) {
  UserFeedback.get().show(FeedbackChannel.BOARD_LOAD, type, message);
}

export async function loadBoard(boardId: string): Promise<BoardModel> {
  const server = await BoardClient.get();
  showFeedback(FeedbackType.PENDING, 'Retrieving board data');
  try {
    const remoteModel = await server.requestBoard(boardId);
    showFeedback(
      FeedbackType.PENDING,
      'Loading images (may take a few moments)'
    );
    const model = BoardModel.createFromRemote(remoteModel);
    showFeedback(FeedbackType.SUCCESS, 'Successfully loaded!');
    return model;
  } catch (ex) {
    showFeedback(FeedbackType.ERROR, 'Error loading board');
    throw new Error(ex);
  }
}

export async function setupActiveBoard(
  controller: UiController
): Promise<void> {
  showFeedback(FeedbackType.PENDING, 'Connecting to game server');
  const boardId = await (await BoardClient.get()).requestActiveBoardId();
  if (boardId === undefined) {
    showFeedback(
      FeedbackType.ERROR,
      'Either there is no active board, or an error occurred.'
    );
    return;
  }
  const model = await loadBoard(boardId);
  controller.setBoard(model);
  return;
}
