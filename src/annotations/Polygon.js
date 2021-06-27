import React, { useEffect, useState } from "react";
import { Layer, Line, Transformer } from "react-konva";

const Polygon = ({
  polyProps,
  flattenedPoints,
  isClosed,
  isFinished,
  selected,
  handleMouseDown,
  layers,
  setPolygonPoints,
  widthRatio,
  heightRatio,
  originalWidth,
  originalHeight,
}) => {
  const trRef = React.useRef();
  const polyRef = React.useRef();
  const circleRef = React.useRef();

  let newFlattenedPoints = [];

  for (let i = 0; i <= flattenedPoints.length - 1; i++) {
    if (i % 2 == 0) {
      newFlattenedPoints.push(flattenedPoints[i] / widthRatio);
    } else {
      newFlattenedPoints.push(flattenedPoints[i] / heightRatio);
    }
  }

  useEffect(() => {
    if (selected === polyProps.id) {
      trRef.current.nodes([polyRef.current]);
      trRef.current.getLayer().batchDraw();
    }

    if (polyRef.current) {
      polyRef.current.zIndex(0);
    }

    if (circleRef.current) {
      circleRef.current.zIndex(1);
    }
  }, [selected]);

  function handlePolyDrag(e) {
    const absolutePoints = [];
    const out = [];

    const points = polyRef.current.points();
    const transform = polyRef.current.getAbsoluteTransform();

    let i = 0;
    while (i < points.length) {
      const point = {
        x: points[i],
        y: points[i + 1],
      };

      let trueValue = transform.point(point);

      if (
        trueValue.x > originalWidth ||
        trueValue.x < 0 ||
        trueValue.y > originalHeight ||
        trueValue.y < 0
      ) {
        out.push(true);
      }

      absolutePoints.push(transform.point(point));
      i = i + 2;
    }

    if (out.length === 0) {
      const newPoints = [];
      for (let val of absolutePoints) {
        newPoints.push([
          Math.round(val.x * widthRatio),
          Math.round(val.y * heightRatio),
        ]);
      }
      setPolygonPoints(newPoints, polyProps.id);
      e.target.position({ x: 0, y: 0 });
      e.target.scale({ x: 1, y: 1 });

      let newFlattenedPoints = [];

      for (let f = 0; f <= newPoints.length - 1; f++) {
        newFlattenedPoints.push(newPoints[f][0]);
        newFlattenedPoints.push(newPoints[f][1]);
      }

      return newPoints;
    } else {
      let oldFlattenedPoints = [];
      let newPoints = [];

      for (let f = 0; f <= points.length - 1; f += 2) {
        oldFlattenedPoints.push(points[f]);
        newPoints.push([points[f] * widthRatio, points[f + 1] * heightRatio]);
      }

      setPolygonPoints(newPoints, polyProps.id);
      e.target.position({ x: 0, y: 0 });
      e.target.scale({ x: 1, y: 1 });
    }
  }

  return (
    <Layer>
      <Line
        draggable={isFinished}
        points={newFlattenedPoints}
        stroke="#e8190f"
        fill={"rgba(249, 249, 249, 0.3)"}
        strokeWidth={4}
        closed={isFinished ? isFinished : isClosed}
        ref={polyRef}
        onClick={(e) => handleMouseDown(e, polyProps.id)}
        onDragEnd={handlePolyDrag}
        onTransformEnd={handlePolyDrag}
      />
      {selected === polyProps.id && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          borderStrokeWidth={3}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (
              newBox.x + newBox.width < 0 ||
              newBox.y + newBox.height < 0 ||
              newBox.x + newBox.width > originalWidth ||
              newBox.y + newBox.height > originalHeight ||
              newBox.x < 0 ||
              newBox.y < 0 ||
              newBox.x > originalWidth ||
              newBox.y > originalHeight
            ) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
      {layers}
    </Layer>
  );
};

export default Polygon;
