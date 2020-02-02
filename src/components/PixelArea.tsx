import React, { RefObject } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';

type PixelAreaProps = {
  width: number;
  height: number;
  dots: string[];
  gridLength: number;
  gridSize: number;
  isShowGrid: boolean;
  onMouseDown: (i: number) => void;
  onMouseUp: () => void;
  onMouseMove: (i: number, e: KonvaEventObject<MouseEvent>) => void;
  stageRef: RefObject<Stage> | null;
};

const PixelArea: React.FC<PixelAreaProps> = props => {
  const {
    width,
    height,
    dots,
    gridLength,
    gridSize,
    isShowGrid,
    onMouseDown,
    onMouseUp,
    onMouseMove,
    stageRef,
  } = props;
  return (
    <Stage
      width={width}
      height={height}
      className="bg-white border"
      stageRef={stageRef}
    >
      <Layer>
        {dots.map((dot, i) => (
          <Rect
            key={i}
            x={(i % gridLength) * gridSize}
            y={Math.floor(i / gridLength) * gridSize}
            width={gridSize}
            height={gridSize}
            fill={dot}
            stroke={isShowGrid ? '#dee2e6' : ''}
            strokeWidth={1}
            onMouseDown={onMouseDown.bind(null, i)}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove.bind(null, i)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default PixelArea;
