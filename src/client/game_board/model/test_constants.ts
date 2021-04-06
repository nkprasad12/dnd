import {BoardModel} from '_client/game_board/model/board_model';
import {
  remoteBoardModel,
  RemoteModelParameters,
} from '_common/board/test_constants';

export function createBoardModel(
  params?: RemoteModelParameters
): Promise<BoardModel> {
  return BoardModel.createFromRemote(
    remoteBoardModel(params ?? {tileSizeOverride: 10})
  );
}
