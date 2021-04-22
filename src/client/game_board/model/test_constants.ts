/* istanbul ignore file */

import {BoardModel} from '_client/game_board/model/board_model';
import {
  remoteBoardModel,
  RemoteModelParameters,
} from '_common/board/test_constants';

export interface BoardModelParameters {
  scale?: number;
  activeTokenIndex?: number;
}

export async function createBoardModel(
  remoteModelParams?: RemoteModelParameters,
  boardModelParams?: BoardModelParameters
): Promise<BoardModel> {
  let model = await BoardModel.createFromRemote(
    remoteBoardModel(remoteModelParams ?? {tileSizeOverride: 10})
  );
  if (boardModelParams?.scale) {
    model = await model.mergedWith({scale: boardModelParams.scale});
  }
  if (boardModelParams?.activeTokenIndex !== undefined) {
    model = await model.mergedWith({
      tokenDiffs: [
        {
          inner: {
            id: model.tokens[boardModelParams?.activeTokenIndex].inner.id,
          },
          isActive: true,
        },
      ],
    });
  }
  return model;
}
