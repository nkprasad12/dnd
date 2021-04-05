import React from 'react';
import {
  DropdownSelectorView,
  SelectorItem,
} from '_client/common/ui_components/dropdown';
import {BoardClient} from '_client/game_board/remote/board_client';

export namespace BoardSelector {
  export interface ViewProps {
    onEditBoard: (id: string) => any;
    activeModel: SelectorItem<string>[];
    setActiveModel: (data: SelectorItem<string>[]) => any;
    editModel: SelectorItem<string>[];
    setEditModel: (data: SelectorItem<string>[]) => any;
  }

  export function View(props: ViewProps) {
    return (
      <div>
        <DropdownSelectorView
          label="Set Active"
          model={props.activeModel}
          clickListener={(boardId, newModel) => {
            props.setActiveModel(newModel);
            BoardClient.get().then((client) =>
              client.setActiveBoard(boardId.data)
            );
          }}
        />
        <div className="divider"></div>
        <DropdownSelectorView
          label="Edit Existing"
          model={props.editModel}
          clickListener={(boardId, newModel) => {
            props.setEditModel(newModel);
            props.onEditBoard(boardId.data);
          }}
        />
        <div className="divider"></div>
      </div>
    );
  }
}
