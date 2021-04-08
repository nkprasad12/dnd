import {
  ContextMenuAction,
  ContextMenuItem,
} from '_client/game_board/context_menu/context_menu_model';
import React, {useCallback, useState} from 'react';
import {Point} from '_common/coordinates';
import {BoardModel} from '_client/game_board/model/board_model';
import {ContextMenu} from '_client/game_board/context_menu/context_menu';
import {checkState} from '_common/preconditions';

const CATEGORY_HIGHLIGHTS = 'Highlights';
const CATEGORY_FOG = 'Fog';
// Exported for testing
export const CATEGORY_TOKENS = 'Tokens';
export const CATEGORY_ZOOM = 'Zoom';

const CATEGORY_ITEM_MAP = new Map([
  [
    CATEGORY_TOKENS,
    [
      ContextMenuItem.AddToken,
      ContextMenuItem.EditToken,
      ContextMenuItem.CopyToken,
    ],
  ],
  [
    CATEGORY_FOG,
    [
      ContextMenuItem.AddFog,
      ContextMenuItem.ClearFog,
      ContextMenuItem.PeekFog,
      ContextMenuItem.UnpeekFog,
    ],
  ],
  [
    CATEGORY_HIGHLIGHTS,
    [
      ContextMenuItem.ClearHighlight,
      ContextMenuItem.BlueHighlight,
      ContextMenuItem.OrangeHighlight,
      ContextMenuItem.GreenHighlight,
    ],
  ],
  [CATEGORY_ZOOM, [ContextMenuItem.ZoomIn, ContextMenuItem.ZoomOut]],
]);

// BaseMenu
interface BaseMenuProps {
  children: JSX.Element[];
  setRect?: (rect: DOMRect) => any;
  atPoint?: Point;
}

function BaseMenuView(props: BaseMenuProps) {
  const setRect = props.setRect;
  const ref = useCallback<(e: HTMLDivElement) => any>(
    (node) => {
      if (node !== null && setRect) {
        setRect(node.getBoundingClientRect());
      }
    },
    [setRect]
  );

  if (!props.atPoint) {
    return null;
  }

  return (
    <div
      id="rightClickMenu"
      ref={ref}
      style={{
        zIndex: 20,
        display: 'initial',
        top: props.atPoint.y + 'px',
        left: props.atPoint.x + 'px',
      }}
      onClick={(event) => {
        event.preventDefault();
        return false;
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        return false;
      }}
    >
      {props.children}
    </div>
  );
}

// ClickableMenu
interface ClickableMenuProps<T> {
  atPoint?: Point;
  items: T[];
  onClick: (item: T) => any;
}

function ClickableMenu<T>(props: ClickableMenuProps<T>) {
  const buttons = props.items.map((item) => (
    <button
      type="button"
      key={JSON.stringify(item)}
      onClick={(mouseEvent) => {
        if (mouseEvent.button !== 0) {
          return;
        }
        props.onClick(item);
      }}
    >
      {item}
    </button>
  ));
  return <BaseMenuView atPoint={props.atPoint} children={buttons} />;
}

// CategoryButton
interface CategoryButtonProps {
  label: string;
  items: ContextMenuItem[];
  onItemClick: (item: ContextMenuItem) => any;
  parentRect?: DOMRect;
}

function CategoryButton(props: CategoryButtonProps) {
  const [menuStart, setMenuStart] = useState<Point | undefined>(undefined);
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);

  const ref = useCallback<(e: HTMLButtonElement) => any>((node) => {
    if (node !== null) {
      setRect(node.getBoundingClientRect());
    }
  }, []);

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div
      onMouseLeave={() => setMenuStart(undefined)}
      onMouseEnter={() => {
        setMenuStart(
          props.parentRect && rect
            ? {
                x: props.parentRect.width,
                y: rect.top - props.parentRect.top,
              }
            : {x: 0, y: 0}
        );
      }}
    >
      <button
        ref={ref}
        type="button"
        onClick={(event) => {
          event.preventDefault();
          return false;
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          return false;
        }}
      >
        {props.label}
      </button>
      <ClickableMenu
        atPoint={menuStart}
        items={props.items}
        onClick={props.onItemClick}
      />
    </div>
  );
}

export interface ContextMenuProps {
  boardModel: BoardModel;
  clickListener: (action: ContextMenuAction) => any;
}

export function ContextMenuView(props: ContextMenuProps) {
  const [rect, setRect] = useState<DOMRect | undefined>(undefined);
  const [model, invalidItems] = ContextMenu.processModel(props.boardModel);

  if (!model.isVisible) {
    return null;
  }

  // TODO: Should this really be the same component? Where should this
  // branching be handled? Maybe we need a separate "Attack Menu".
  if (model.attackerSheet) {
    const sheet = model.attackerSheet;
    const attacks = Object.keys(sheet.attackBonuses);
    checkState(
      attacks.length > 0,
      'Attacker sheet has no attacks, cannot be used.'
    );
    return (
      <ClickableMenu
        atPoint={model.clickPoint}
        items={attacks}
        onClick={(attack) =>
          props.clickListener({
            item: ContextMenuItem.Attack,
            // TODO: We should probably have a construct that writes commands
            // for us so this is kept in sync in once place.
            metadata: `!attack ${attack} @${sheet.name}`,
          })
        }
      />
    );
  }

  const categories = Array.from(CATEGORY_ITEM_MAP).map(([category, items]) => (
    <CategoryButton
      label={category}
      key={category}
      items={items.filter((item) => !invalidItems.includes(item))}
      parentRect={rect}
      onItemClick={(clickedItem) => {
        props.clickListener({item: clickedItem});
      }}
    />
  ));
  return (
    <BaseMenuView
      data-testid="ContextMenu"
      setRect={setRect}
      atPoint={model.clickPoint}
      children={categories}
    />
  );
}
