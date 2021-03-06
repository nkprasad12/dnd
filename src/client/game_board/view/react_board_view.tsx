import React, {useEffect, useRef, useState} from 'react';
import {FunctionComponent} from 'react';
import {BoardView} from '_client/game_board/view/board_view';
import {checkDefined} from '_common/preconditions';

interface CanvasProps {
  zIndex: number;
  canvasHolder: CanvasHolder;
  setLoadedCount: React.Dispatch<React.SetStateAction<number>>;
}

const Canvas: FunctionComponent<CanvasProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = checkDefined(canvasRef.current);
    if (canvas === props.canvasHolder.get(props.zIndex)) {
      return;
    }
    props.canvasHolder.set(props.zIndex, canvas);
    props.setLoadedCount(props.canvasHolder.size);
    console.log(`Loaded canvas with Z-index ${props.zIndex}`);
  }, [canvasRef, props]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        zIndex: props.zIndex,
        position: 'absolute',
        left: '0px',
        top: '0px',
      }}
    />
  );
};

const CANVAS_Z_INDICES: readonly number[] = [1, 2, 3, 4, 5, 6, 7];

type CanvasHolder = Map<number, HTMLCanvasElement>;

interface ViewProps {
  onBoardView: (boardView: BoardView) => any;
}

const View: FunctionComponent<ViewProps> = (props) => {
  const [loadedContexts, setLoadedContexts] = useState(0);
  const contextHolder = useRef<CanvasHolder>(new Map());

  const onBoardView = props.onBoardView;
  useEffect(() => {
    if (loadedContexts !== CANVAS_Z_INDICES.length) {
      return;
    }
    const map = contextHolder.current;
    const canvases = {
      backgroundCanvas: map.get(1)!,
      tokenCanvas: map.get(2)!,
      fogOfWarCanvas: map.get(3)!,
      publicSelectionCanvas: map.get(4)!,
      localSelectionCanvas: map.get(5)!,
      gridCanvas: map.get(6)!,
      topCanvas: map.get(7)!,
    };
    const view = new BoardView(canvases);
    onBoardView(view);
  }, [loadedContexts, onBoardView]);

  const canvases = CANVAS_Z_INDICES.map((zIndex) => (
    <Canvas
      zIndex={zIndex}
      setLoadedCount={setLoadedContexts}
      canvasHolder={contextHolder.current}
    />
  ));

  return <div>{canvases}</div>;
};

export type ReactBoardViewProps = ViewProps;
export const ReactBoardView = View;
