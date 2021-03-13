/* istanbul ignore file */

import {RemoteTokenModel} from '_common/board/remote_board_model';

export const DEFAULT_ID = '12345678';
export const DEFAULT_LOCATION = {row: 1, col: 7};
export const DEFAULT_NAME = 'Ozymandias';
export const DEFAULT_IMAGE_SOURCE = 'source@kingOfKings';
export const DEFAULT_SIZE = 2;
export const DEFAULT_SPEED = 6;

export function defaultRemoteToken(): RemoteTokenModel {
  return {
    id: DEFAULT_ID,
    location: DEFAULT_LOCATION,
    name: DEFAULT_NAME,
    imageSource: DEFAULT_IMAGE_SOURCE,
    size: DEFAULT_SIZE,
    speed: DEFAULT_SPEED,
  };
}
