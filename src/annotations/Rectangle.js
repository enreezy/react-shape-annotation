import React from "react";
import { Rect, Transformer } from "react-konva";

const Rectangle = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  widthRatio,
  heightRatio,
  originalHeight,
  originalWidth,
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      trRef.current.setNode(shapeRef.current);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        x={Math.round(shapeProps.x / widthRatio)}
        y={Math.round(shapeProps.y / heightRatio)}
        width={Math.round(shapeProps.width / widthRatio)}
        height={Math.round(shapeProps.height / heightRatio)}
        label={shapeProps.label}
        id={shapeProps.id}
        fill={"rgba(249, 249, 249, 0.3)"}
        stroke={shapeProps.stroke}
        strokeWidth={3}
        draggable={isSelected ? true : false}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: Math.round(e.target.x() * widthRatio),
            y: Math.round(e.target.y() * heightRatio),
          });
        }}
        dragBoundFunc={(e) => {
          let x =
            Math.round(e.x) + Math.round(shapeProps.width / widthRatio) >
              originalWidth || Math.round(e.x * widthRatio) < 0
              ? Math.round(shapeProps.x / widthRatio)
              : Math.round(e.x);

          let y =
            Math.round(e.y) + Math.round(shapeProps.height / heightRatio) >
              originalHeight || Math.round(e.y * heightRatio) < 0
              ? Math.round(shapeProps.y / heightRatio)
              : Math.round(e.y);

          return {
            x: x,
            y: y,
          };
        }}
        onTransformEnd={(e) => {
          /* transformer is changing scale of the node and NOT its width or height but in the store we have only width and height to match the data better 
              we will reset scale on transform end */
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: Math.round(node.x() * widthRatio),
            y: Math.round(node.y() * heightRatio),
            // set minimal value
            width: Math.round(Math.max(5, node.width() * scaleX) * widthRatio),
            height: Math.round(Math.max(node.height() * scaleY) * heightRatio),
          });
        }}
      />
      {isSelected && (
        <Transformer
          anchorStroke={shapeProps.stroke}
          borderStroke={shapeProps.stroke}
          ref={trRef}
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
    </React.Fragment>
  );
};

export default Rectangle;
