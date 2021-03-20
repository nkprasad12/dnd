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
    server: BoardClient,
    boards: Promise<string[]>
  ): Promise<BoardSelectorModel> {
    const allBoards = await boards;
    const activeBoard = await server.requestActiveBoardId();
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
      BoardSelectorModel.createForActiveSetting(server, boards).then(
        (model) => model.items
      )
    );
  }

  export function createEditBoardSelector(
    parent: HTMLElement,
    onSelection: (id: string) => any,
    boards: Promise<string[]>
  ): DropdownSelector<string> {
    const initialModel = boards.then(
      (ids) => new BoardSelectorModel(ids.map((id) => idSelector(id, false)))
    );
    return new DropdownSelector(
      parent,
      'Edit Existing',
      onSelection,
      initialModel.then((model) => model.items)
    );
  }
}
