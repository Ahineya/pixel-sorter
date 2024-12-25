import React, {FC, useRef} from 'react';
import './editor-controller.scss';

type IProps = {
  scale: number;
  offsetX: number;
  offsetY: number;

  onScaleOffsetChange: (scale: number, offsetX: number, offsetY: number) => void;
}

export const EditorController: FC<IProps> = ({
                                               scale,
                                               offsetX,
                                               offsetY,
                                               onScaleOffsetChange
                                             }) => {

  const divRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Zoom into cursor
    const prevScale = scale;

    const bbox = divRef.current!.getBoundingClientRect();

    scale *= 1 - e.deltaY * 0.01;
    scale = Math.max(1, scale);
    scale = Math.min(250, scale);

    const cursorX = (e.clientX - bbox.left) / divRef.current!.offsetWidth * 2 - 1;
    const cursorY = -(e.clientY - bbox.top) / divRef.current!.offsetHeight * 2 + 1;

    const prevOffsetX = offsetX;
    const prevOffsetY = offsetY;

    const scaleRatio = scale / prevScale;

    offsetX = cursorX + (prevOffsetX - cursorX) * scaleRatio;
    offsetY = cursorY + (prevOffsetY - cursorY) * scaleRatio;

    onScaleOffsetChange(scale, offsetX, offsetY);
  };

  function pan(e: React.MouseEvent<HTMLDivElement>) {
    const bbox = divRef.current!.getBoundingClientRect();

    const cursorX = (e.clientX - bbox.left) / divRef.current!.offsetWidth * 2 - 1;
    const cursorY = -(e.clientY - bbox.top) / divRef.current!.offsetHeight * 2 + 1;

    const startX = cursorX;
    const startY = cursorY;
    const startOffset = {x: offsetX, y: offsetY};

    const onMouseMove = (moveEvent: MouseEvent) => {

      const cursorX = (moveEvent.clientX - bbox.left) / divRef.current!.offsetWidth * 2 - 1;
      const cursorY = -(moveEvent.clientY - bbox.top) / divRef.current!.offsetHeight * 2 + 1;

      const dx = cursorX - startX;
      const dy = cursorY - startY;

      onScaleOffsetChange(scale, startOffset.x + dx, startOffset.y + dy);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.shiftKey) {
      pan(e);

      return;
    }
  }

  return (
    <div
      className="editor-controller"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      ref={divRef}
    />
  );
}
