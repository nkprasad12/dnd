/* istanbul ignore file */

import {
  RemoteBoardDiff,
  RemoteBoardModel,
  RemoteTokenModel,
} from '_common/board/remote_board_model';

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

export function remoteBoardModel(): RemoteBoardModel {
  return new RemoteBoardModel(
    TEST_BOARD_ID,
    TEST_BOARD_NAME,
    TEST_BOARD_SOURCE,
    57,
    [remoteTokenModel()],
    [
      ['0', '0', '0'],
      ['0', '0', '0'],
    ],
    [
      ['0', '0', '0'],
      ['0', '0', '0'],
    ],
    60,
    150,
    {x: 57, y: 57},
    2,
    3
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
