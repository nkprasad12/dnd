/* istanbul ignore file */

import {
  RemoteBoardDiff,
  RemoteBoardModel,
  RemoteTokenModel,
} from '_common/board/remote_board_model';
import {Point} from '_common/coordinates';
import {createGrid, gridDimensions} from '_common/util/grid';
import {prefer} from '_common/verification';

export const DEFAULT_LOCATION = {row: 1, col: 7};
export const DEFAULT_SIZE = 2;
export const DEFAULT_SPEED = 6;
export const TEST_TOKEN_ID = 'AndOnThePedestal';
export const TEST_BOARD_ID = 'TheseWordsAppear';
export const TEST_BOARD_NAME = 'MyNameIs';
export const TEST_BOARD_SOURCE = 'server@Ozymandias';
export const TEST_TOKEN_NAME = 'KingOfKings';
export const TEST_TOKEN_SOURCE = 'server@LookUponMyWorks';

export function remoteTokenModel(): RemoteTokenModel {
  return {
    id: TEST_TOKEN_ID,
    location: DEFAULT_LOCATION,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
}

export interface RemoteModelParameters {
  tileSizeOverride?: number;
  widthOverride?: number;
  heightOverride?: number;
  gridOffsetOverride?: Point;
}

export function remoteBoardModel(
  params?: RemoteModelParameters
): RemoteBoardModel {
  const tileSize = prefer(params?.tileSizeOverride, 57);
  const width = prefer(params?.widthOverride, 60);
  const height = prefer(params?.heightOverride, 150);
  const dimensions = gridDimensions(width, height, tileSize);
  return new RemoteBoardModel(
    TEST_BOARD_ID,
    TEST_BOARD_NAME,
    TEST_BOARD_SOURCE,
    tileSize,
    [remoteTokenModel()],
    createGrid(dimensions.rows, dimensions.cols, '0'),
    createGrid(dimensions.rows, dimensions.cols, '0'),
    width,
    height,
    prefer(params?.gridOffsetOverride, {x: 57, y: 57}),
    dimensions.cols,
    dimensions.rows
  );
}

export function remoteBoardDiff(): RemoteBoardDiff {
  return {
    id: TEST_TOKEN_ID,
    newTokens: [remoteTokenModel()],
    removedTokens: ['removedId'],
    tokenDiffs: [{id: 'tokenDiffId', speed: 5}],
    publicSelectionDiffs: [],
  };
}
