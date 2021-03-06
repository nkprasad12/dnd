/* istanbul ignore file */

import {
  RemoteBoardDiff,
  RemoteBoardModel,
  RemoteTokenModel,
} from '_common/board/remote_board_model';
import {CharacterSheetData} from '_common/character_sheets/types';
import {Location, Point} from '_common/coordinates';
import {createGrid, gridDimensions} from '_common/util/grid';

export const DEFAULT_LOCATION = {row: 1, col: 3};
export const DEFAULT_SIZE = 2;
export const DEFAULT_SPEED = 6;
export const TEST_TOKEN_ID = 'AndOnThePedestal';
export const TEST_BOARD_ID = 'TheseWordsAppear';
export const TEST_BOARD_NAME = 'MyNameIs';
export const TEST_BOARD_SOURCE = 'server@Ozymandias';
export const TEST_TOKEN_NAME = 'KingOfKings';
export const TEST_TOKEN_SOURCE = 'server@LookUponMyWorks';

export interface RemoteTokenParameters {
  id?: string;
  location?: Location;
  sheetData?: CharacterSheetData;
}

export function remoteTokenModel(
  params?: RemoteTokenParameters
): RemoteTokenModel {
  return {
    id: params?.id ?? TEST_TOKEN_ID,
    location: params?.location ?? DEFAULT_LOCATION,
    name: TEST_TOKEN_NAME,
    imageSource: TEST_TOKEN_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
    sheetData: params?.sheetData ?? null,
  };
}

export interface RemoteModelParameters {
  tileSizeOverride?: number;
  widthOverride?: number;
  heightOverride?: number;
  gridOffsetOverride?: Point;
  tokensOverride?: RemoteTokenModel[];
}

export function remoteBoardModel(
  params?: RemoteModelParameters
): RemoteBoardModel {
  const tileSize = params?.tileSizeOverride ?? 57;
  const width = params?.widthOverride ?? 60;
  const height = params?.heightOverride ?? 150;
  const gridOffset = params?.gridOffsetOverride ?? {x: 57, y: 57};
  const dimensions = gridDimensions(width, height, tileSize, gridOffset);
  return new RemoteBoardModel(
    TEST_BOARD_ID,
    TEST_BOARD_NAME,
    TEST_BOARD_SOURCE,
    tileSize,
    params?.tokensOverride ?? [remoteTokenModel()],
    createGrid(dimensions.rows, dimensions.cols, '0'),
    createGrid(dimensions.rows, dimensions.cols, '0'),
    width,
    height,
    gridOffset,
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
  };
}
