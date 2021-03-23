import {
  DropdownSelector,
  SelectorItem,
} from '_client/common/ui_components/dropdown';
import {BoardClient} from '_client/game_board/remote/board_client';

export function idSelector(
  id: string,
  isSelected: boolean
): SelectorItem<string> {
  return SelectorItem.create(id, id, isSelected, id);
}

export class BoardSelectorModel {
  static async createForActiveSetting(
    boards: Promise<string[]>
  ): Promise<BoardSelectorModel> {
    const allBoards = await boards;
    const activeBoard = await (await BoardClient.get()).requestActiveBoardId();
    const items: SelectorItem<string>[] = allBoards.map((id) =>
      idSelector(id, id === activeBoard)
    );
    return new BoardSelectorModel(items);
  }

  constructor(readonly items: SelectorItem<string>[]) {}
}

export namespace BoardSelector {
  export function createActiveBoardSelector(
    parent: HTMLElement,
    server: BoardClient,
    boards: Promise<string[]>
  ): DropdownSelector<string> {
    return new DropdownSelector(
      parent,
      'Set Active',
      (id) => server.setActiveBoard(id),
      BoardSelectorModel.createForActiveSetting(boards).then(
        (model) => model.items
      )
    );
  }

  export function createEditBoardSelector(
    parent: HTMLElement,
    onSelection: (id: string) => any,
    boards: Promise<string[]>
  ): DropdownSelector<string> {
    return new DropdownSelector(
      parent,
      'Edit Existing',
      onSelection,
      BoardSelectorModel.createForActiveSetting(boards).then(
        (model) => model.items
      )
    );
  }
}
