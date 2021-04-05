import React, {useState} from 'react';
import {TEXT_COLOR} from '_client/common/styles';
import {NumberInputField} from '_client/common/ui_components/input_fields';
import {GameBoard} from '_client/game_board/controller/game_board';
import {ModelHandler} from '_client/game_board/controller/model_handler';
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
  const updateData = InputValues.toUpdateData(values, props.board.modelHandler);

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
        Create
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
    modelHandler: ModelHandler
  ): BoardUpdateData | undefined {
    const tileSize = checkDefined(values.tileSize);
    const offsetX = checkDefined(values.offsetX);
    const offsetY = checkDefined(values.offsetY);
    if (
      tileSize < 1 ||
      offsetX < 0 ||
      offsetX >= tileSize ||
      offsetY < 0 ||
      offsetY >= tileSize
    ) {
      return undefined;
    }
    const backgroundData = getBackgroundData(
      modelHandler.getModel().backgroundImage,
      tileSize,
      {x: offsetX, y: offsetY}
    );
    return {
      tileSize: tileSize,
      rows: backgroundData.rows,
      cols: backgroundData.cols,
      offset: {x: offsetX, y: offsetY},
    };
  }
}
