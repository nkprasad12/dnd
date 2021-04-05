import React, {useState} from 'react';
import {TEXT_COLOR} from '_client/common/styles';
import {NumberInputField} from '_client/common/ui_components/input_fields';
import {GameBoard} from '_client/game_board/controller/game_board';
import {getBackgroundData} from '_client/utils/image_utils';
import {RemoteBoardModel} from '_common/board/remote_board_model';
import {Point} from '_common/coordinates';
import {checkDefined} from '_common/preconditions';

export interface BoardUpdateData {
  tileSize: number;
  offset: Point;
  cols: number;
  rows: number;
}

export interface BoardUpdateFormProps {
  board: GameBoard;
}

function getModel(props: BoardUpdateFormProps): RemoteBoardModel {
  return props.board.modelHandler.getModel().inner;
}

export function BoardUpdateFormView(props: BoardUpdateFormProps) {
  const [tileSize, setTileSize] = useState<number | undefined>(
    getModel(props).tileSize
  );
  const [offsetX, setOffsetX] = useState<number | undefined>(
    getModel(props).gridOffset.x
  );
  const [offsetY, setOffsetY] = useState<number | undefined>(
    getModel(props).gridOffset.y
  );

  const values: InputValues = {
    tileSize: tileSize,
    offsetX: offsetX,
    offsetY: offsetY,
  };
  const updateData = InputValues.toUpdateData(values, props);

  return (
    <div>
      <NumberInputField
        label="Tile Size (in pixels)"
        labelColor={TEXT_COLOR}
        inputCallback={setTileSize}
        defaultValue={getModel(props).tileSize}
      />
      <NumberInputField
        label="Grid X Offset (in pixels)"
        labelColor={TEXT_COLOR}
        inputCallback={setOffsetX}
        defaultValue={getModel(props).gridOffset.x}
      />
      <NumberInputField
        label="Grid Y Offset (in pixels)"
        labelColor={TEXT_COLOR}
        inputCallback={setOffsetY}
        defaultValue={getModel(props).gridOffset.y}
      />
      <button
        className="btn-success"
        style={{display: updateData ? 'block' : 'none'}}
        onClick={() => {
          props.board.updateGridParameters(checkDefined(updateData));
        }}
      >
        Update
      </button>
    </div>
  );
}

interface InputValues {
  tileSize?: number;
  offsetX?: number;
  offsetY?: number;
}

namespace InputValues {
  export function toUpdateData(
    values: InputValues,
    props: BoardUpdateFormProps
  ): BoardUpdateData | undefined {
    const model = getModel(props);
    const tileSize = values.tileSize ?? model.tileSize;
    const offsetX = values.offsetX ?? model.gridOffset.x;
    const offsetY = values.offsetY ?? model.gridOffset.y;
    if (tileSize < 1) {
      return undefined;
    }
    const backgroundData = getBackgroundData(
      props.board.modelHandler.getModel().backgroundImage,
      tileSize,
      {x: offsetX, y: offsetY}
    );
    return {
      tileSize: tileSize,
      rows: backgroundData.rows,
      cols: backgroundData.cols,
      offset: backgroundData.offset,
    };
  }
}
