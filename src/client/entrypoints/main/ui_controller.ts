import {Location} from '_common/coordinates';

export interface UiController {
  createNewTokenForm: (tile: Location) => any;
}

export namespace UiController {
  export function create(
    setNewTokenTile: (tile: Location) => any,
    setNewTokenVisibility: (visible: boolean) => any
  ): UiController {
    return {
      createNewTokenForm: (tile: Location) => {
        setNewTokenTile(tile);
        setNewTokenVisibility(true);
      },
    };
  }
}
