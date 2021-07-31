import React, { memo } from "react";
import { Layer, Stage, Group } from "react-konva";
import AnnotationInput from "annotations/AnnotationInput";

function Canvas({
  resizedWidth,
  resizedHeight,
  showInput,
  handleMouseMove,
  handleClick,
  onDelete,
  currentShape,
  selectedShape,
  selectedId,
  checkDeselect,
  transformer,
  handleMouseUp,
  handleMouseMovePolygon,
  rectangles,
  text,
  lines,
  inputPosition,
  inputComment,
  setCommentPolygon,
  setCommentRectangle,
  polygons,
  annotations,
}) {
  return (
    <div
      style={{
        width: resizedWidth,
        height: resizedHeight,
        position: "absolute",
        margin: "auto",
        left: "0px",
        right: "0px",
        top: "0px",
        bottom: "0px",
        marginTop: "90px",
      }}
    >
      <Stage
        width={resizedWidth}
        height={resizedHeight}
        onContentMouseMove={handleMouseMove}
        onMouseDown={
          currentShape === "polygon" || selectedShape === "polygon"
            ? selectedId
              ? checkDeselect
              : (event) => handleClickPolygon(event, undefined)
            : transformer
            ? checkDeselect
            : handleClick
        }
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMovePolygon}
      >
        <Layer>{rectangles}</Layer>
        <Layer>
          <Group>{text}</Group>
        </Layer>
        {lines}
      </Stage>
      <div
        style={{
          position: "absolute",
          top: inputPosition.top,
          left: inputPosition.left,
        }}
      >
        {showInput && (
          <AnnotationInput
            onChange={
              selectedShape === "polygon"
                ? setCommentPolygon
                : setCommentRectangle
            }
            onDelete={onDelete}
            selectedId={selectedId}
            annotations={selectedShape === "polygon" ? polygons : annotations}
            value={inputComment}
          />
        )}
      </div>
    </div>
  );
}

export default memo(Canvas);
