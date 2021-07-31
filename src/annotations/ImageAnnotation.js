import React from "react";
import { Layer, Rect, Stage, Group, Text, Tag, Label } from "react-konva";
import autoBind from "react-autobind";
import { Card, CardBody } from "reactstrap";
import Polygon from "shapes/Polygon";
import Rectangle from "shapes/Rectangle";
import {
  getRandomColour,
  isContainsObject,
} from "methods/ImageAnnotationMethods";
import ButtonOptions from "options";
import Canvas from "canvas";

export default class ImageAnnotation extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);

    this.state = {
      annotations: [],
      widthRatio: 0,
      heightRatio: 0,
      isDrawingMode: true,
      showInput: false,
      inputPosition: {
        left: 0,
        top: 0,
      },
      inputComment: "",
      currentShape: "rectangle",
      selectedShape: "rectangle",
      points: [],
      curMousePos: [0, 0],
      isMouseOverStartPoint: false,
      isFinished: false,
      polygons: [],
      currentIndex: 0,
      isClosed: false,
      resizedWidth: 735,
      resizedHeight: 550,
    };
  }

  addNewPolygon = () => {
    this.setState({
      isFinished: false,
      currentIndex: this.state.polygons.length,
      isDrawingMode: true,
    });
  };

  onSelect(selectedId) {
    this.setState({ selectedId: selectedId });
  }

  onChange = (data) => {
    if (this.state.selectedShape === "polygon") {
      if (data === undefined || data.length === 0) {
      } else {
        if (isContainsObject(data, this.state.polygons)) {
        } else {
          this.setState({ polygons: data });
        }
      }
    } else {
      if (data === undefined || data.length === 0) {
      } else {
        if (isContainsObject(data, this.state.annotations)) {
        } else {
          this.setState({ annotations: data });
        }
      }
    }

    this.setState({
      inputComment: data,
    });
  };

  setRatio = ({ target: image }) => {
    const origWidth = image.offsetWidth;
    const origHeight = image.offsetHeight;

    let width =
      origWidth > this.state.resizedWidth ? this.state.resizedWidth : origWidth;
    let height =
      origHeight > this.state.resizedHeight
        ? this.state.resizedHeight
        : origHeight;

    let widthRatio = origWidth / width;
    let heightRatio = origHeight / height;

    this.setState({
      widthRatio: widthRatio,
      heightRatio: heightRatio,
      resizedHeight: height,
      resizedWidth: width,
    });
  };

  onDelete() {
    let annotations =
      this.state.selectedShape === "polygon"
        ? this.state.polygons
        : this.state.annotations;

    const deleteTarget = annotations.findIndex(
      (poly) => poly.id === this.state.selectedId
    );

    if (deleteTarget >= 0) {
      annotations.splice(deleteTarget, 1);
      this.onChange(annotations);
    }

    const currentIndex = this.state.polygons.length;
    this.setState({ showInput: false, currentIndex });

    if (this.props.onPlay) {
      const { onPlay } = this.props;

      onPlay(this.state.polygons, this.state.polygons[0]);
    }
  }

  onDeleteLabel = (selectedId) => {
    let annotations =
      this.state.selectedShape === "polygon"
        ? this.state.polygons
        : this.state.annotations;

    const deleteTarget = annotations.findIndex(
      (annotation) => annotation.id === selectedId
    );

    if (deleteTarget >= 0) {
      annotations.splice(deleteTarget, 1);
      this.onChange(annotations);
    }

    this.setState({ showInput: false });
  };

  setCommentPolygon = (annotations) => {
    let polyIndex = this.state.polygons.findIndex(
      (poly) => poly.id === this.state.selectedId
    );

    const value = this.state.polygons[polyIndex].label;

    this.setState({
      inputComment: value,
      polygons: annotations,
    });
  };

  setCommentRectangle = (value, annotations) => {
    this.setState({
      inputComment: value,
    });

    this.onChange(annotations);
  };

  getMousePosition = (stage) => {
    return [
      Number((stage.getPointerPosition().x * this.state.widthRatio).toFixed(2)),
      Number(
        (stage.getPointerPosition().y * this.state.heightRatio).toFixed(2)
      ),
    ];
  };

  handleClickPolygon = (event, id) => {
    const {
      state: { polygons, currentIndex, isMouseOverStartPoint, isFinished },
      getMousePosition,
    } = this;

    const emptySpace = event.target === event.target.getStage();
    if (
      !emptySpace && polygons[this.state.polygons.length - 1]
        ? polygons[this.state.polygons.length - 1].isFinished
        : false
    ) {
      return;
    }
    if (event.target.attrs.draggable && id !== undefined) {
      return;
    } else {
      if (!this.state.isDrawingMode) return;

      const stage = event.target.getStage();
      const mousePos = getMousePosition(stage);

      if (polygons[currentIndex] ? polygons[currentIndex].isFinished : false) {
        return;
      }
      if (isMouseOverStartPoint && polygons[currentIndex].points.length >= 3) {
        polygons[currentIndex].isFinished = true;

        //this.handleMouseDown(event, polygons[currentIndex].id);

        this.setState({
          polygons,
          currentShape: "polygon",
          selectedShape: "polygon",
          isFinished: false,
          currentIndex: this.state.polygons.length,
          isDrawingMode: true,
        });

        if (this.props.onPlay) {
          const { onPlay } = this.props;

          onPlay(polygons, polygons[0]);
        }
      } else {
        if (!polygons[currentIndex]) {
          let points = polygons[currentIndex]
            ? polygons[currentIndex].points
            : [];
          polygons[currentIndex] = {
            id: Math.random().toString(36).substring(7),
            isFinished: false,
            points: [...points, mousePos],
            label: "",
            shape: "polygon",
          };
        } else {
          polygons[currentIndex].id = polygons[currentIndex]
            ? polygons[currentIndex].id
            : Math.random().toString(36).substring(7);
          polygons[currentIndex].label = polygons[currentIndex]
            ? polygons[currentIndex].label
            : "";
          let points = polygons[currentIndex]
            ? polygons[currentIndex].points
            : [];
          polygons[currentIndex].points = [...points, mousePos];
          polygons[currentIndex].isFinished = false;
        }

        this.setState({
          polygons,
        });
      }
    }
  };

  handleMouseDown = (e, id) => {
    let polyIndex = this.state.polygons.findIndex((poly) => poly.id === id);
    let y = [];
    let points = this.state.polygons[polyIndex].points;

    points.forEach((point) => {
      y.push(point[1]);
    });

    const max = Math.max.apply(Math, y);
    const pointIndex = points.findIndex((data) => data[1] === max);
    const label = this.state.polygons[polyIndex].label;

    this.setState({
      selectedId: id,
      inputComment: label,
      showInput: true,
      selectedShape: "polygon",
      inputPosition: {
        left: points[pointIndex][0] / this.state.widthRatio + 10,
        top: points[pointIndex][1] / this.state.heightRatio + 10,
      },
    });

    if (e.target === e.target.getStage()) {
      this.setState({ selectedId: id });
    }
  };

  handleMouseMovePolygon = (event) => {
    const { getMousePosition } = this;
    const stage = event.target.getStage();
    const mousePos = getMousePosition(stage);
    this.setState({
      curMousePos: mousePos,
    });
  };

  handleMouseOverStartPoint = (event, id) => {
    let polyIndex = this.state.polygons.findIndex((poly) => poly.id === id);

    if (
      this.state.polygons[polyIndex]
        ? this.state.polygons[polyIndex].isFinished
        : false || this.state.polygons[polyIndex].points.length < 3
    )
      return;
    event.target.scale({ x: 2, y: 2 });
    this.setState({
      isMouseOverStartPoint: true,
    });
  };

  handleMouseOutStartPoint = (event) => {
    event.target.scale({ x: 1, y: 1 });
    this.setState({
      isMouseOverStartPoint: false,
    });
  };

  handleDragStartPoint = (event) => {
    console.log("start", event);
  };

  handleDragMovePoint = (event, id) => {
    let polyIndex = this.state.polygons.findIndex((poly) => poly.id === id);
    let polygons = this.state.polygons;
    const points = this.state.polygons[polyIndex].points;

    const index =
      polyIndex === 0
        ? event.target.index
        : event.target.index - this.getPolyPrevLength(polyIndex - 1);

    const stage = event.target.getStage();
    let pos = this.getMousePosition(stage);

    if (
      pos[0] / this.state.widthRatio > this.state.resizedWidth ||
      pos[0] / this.state.widthRatio <= 6 ||
      pos[1] / this.state.heightRatio > this.state.resizedHeight ||
      pos[1] / this.state.heightRatio <= 6
    ) {
      pos = points[Math.abs(index - 1)];
    } else {
      pos = this.getMousePosition(stage);
    }

    polygons[polyIndex].points = [
      ...points.slice(0, Math.abs(index - 1)),
      pos,
      ...points.slice(Math.abs(index - 1) + 1),
    ];

    this.setState({
      polygons,
    });
  };

  handleDragEndPoint = (event) => {
    console.log("end", event);
  };

  setPolygonPoints = (points, id) => {
    let polyIndex = this.state.polygons.findIndex((poly) => poly.id === id);
    let y = [];
    let polygons = this.state.polygons;
    polygons[polyIndex].points = points;

    points.forEach((point) => {
      y.push(point[1]);
    });

    const max = Math.max.apply(Math, y);
    const pointIndex = points.findIndex((data) => data[1] === max);
    const label = this.state.polygons[polyIndex].label;

    this.setState({
      selectedId: id,
      inputComment: label,
      showInput: true,
      selectedShape: "polygon",
      inputPosition: {
        left: points[pointIndex][0] / this.state.widthRatio + 10,
        top: points[pointIndex][1] / this.state.heightRatio + 10,
      },
      polygons,
    });

    if (this.props.onPlay) {
      const { onPlay } = this.props;

      onPlay(polygons, polygons[0]);
    }
  };

  getPolyPrevLength = (count) => {
    let length = 0;

    for (let index = 0; index <= count; index++) {
      length += this.state.polygons[index].points.length;
    }

    return length;
  };

  handleWheel = (e) => {
    e.evt.preventDefault();
    let height = this.state.resizedHeight;
    let width = this.state.resizedWidth;
    let resizedHeight = height + e.evt.deltaY;
    let resizedWidth = width + e.evt.deltaY;
    resizedHeight = resizedHeight > 550 ? 550 : resizedHeight;
    resizedWidth = resizedWidth > 735 ? 735 : resizedWidth;
    this.setState({
      resizedHeight,
      resizedWidth,
      showInput: false,
    });
  };

  checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      this.setState({ selectedId: null });
    }

    this.setState({ transformer: false, showInput: false });

    if (e.target === e.target.getStage()) {
      this.setState({ selectedId: false, showInput: false });
    }
  };

  handleMouseUp = (e) => {
    if (this.state.isDrawing) {
      let annotations = this.state.annotations;
      let width =
        this.state.annotations[this.state.annotations.length - 1].width;
      if (width <= 0) {
        annotations = annotations.slice(0, -1);
      }

      this.setState({
        annotations,
        isDrawing: !this.state.isDrawing,
        isDrawingMode: true,
      });

      if (this.props.onPlay) {
        const { onPlay } = this.props;

        onPlay(annotations, annotations[annotations.length - 1]);
      }

      return;
    }
  };

  handleClick = (e) => {
    if (!this.state.isDrawingMode) {
      return;
    }

    /*
          otherwise, add a new rectangle at the mouse position with 0 width and height,
           and set isDrawing to true
        */
    const newShapes = this.state.annotations.slice();

    let id = Math.random().toString(36).substring(7);
    newShapes.push({
      id: id,
      x: Math.round(e.evt.layerX * this.state.widthRatio),
      y: Math.round(e.evt.layerY * this.state.heightRatio),
      width: 0,
      height: 0,
      stroke: getRandomColour(),
      label: "New Object",
      shape: "rectangle",
    });

    this.setState({
      annotations: newShapes,
      isDrawing: true,
      selectedId: id,
      transformer: true,
    });

    console.log(this.state.annotations, "--annotations");
  };

  handleMouseMove = (e) => {
    if (!this.state.isDrawingMode) return;

    const mouseX = Math.round(e.evt.layerX * this.state.widthRatio);
    const mouseY = Math.round(e.evt.layerY * this.state.heightRatio);

    // update the current rectangle's width and height based on the mouse position
    if (this.state.isDrawing) {
      // get the current shape (the last shape in this.state.shapes);
      const currentShapeIndex = this.state.annotations.length - 1;

      const currentShape = this.state.annotations[currentShapeIndex];
      const newWidth = mouseX - currentShape.x;
      const newHeight = mouseY - currentShape.y;

      const newShapesList = this.state.annotations.slice();
      newShapesList[currentShapeIndex] = {
        id: currentShape.id, // id
        x: currentShape.x, // keep starting position the same
        y: currentShape.y,
        width: newWidth, // new width and height
        height: newHeight,
        stroke: currentShape.stroke,
        label: currentShape.label,
        time: currentShape.time,
      };

      this.setState({
        annotations: newShapesList,
      });
    }
  };

  onClickButtonRect() {
    this.setState({
      isClosed: true,
      currentShape: "rectangle",
      selectedShape: "rectangle",
      isDrawingMode: true,
    });
  }

  onClickButtonPolygon() {
    this.setState({
      isClosed: true,
      currentShape: "polygon",
      selectedShape: "polygon",
      isFinished: false,
      currentIndex: this.state.polygons.length,
      isDrawingMode: true,
    });
  }

  onClickButtonPolyline() {
    this.setState({
      isClosed: false,
      currentShape: "polygon",
      selectedShape: "polygon",
      isFinished: false,
      currentIndex: this.state.polygons.length,
      isDrawingMode: true,
    });
  }

  render() {
    let polygons = [];
    let rectangles = [];
    let lines = [];
    let text = [];
    let flattenedPoints = [];
    let pointIndex = 0;

    if (this.state.polygons.length > 0) {
      this.state.polygons.forEach((polygon) => {
        flattenedPoints = polygon.points
          .concat(polygon.isFinished ? [] : this.state.curMousePos)
          .reduce((a, b) => a.concat(b), []);

        polygons.push(
          polygon.points.map((point, index) => {
            const width = 6;
            const x = point[0] - width / 2;
            const y = point[1] - width / 2;
            const startPointAttr =
              index === 0
                ? {
                    hitStrokeWidth: 12,
                    onMouseOver: (event) =>
                      this.handleMouseOverStartPoint(event, polygon.id),
                    onMouseOut: this.handleMouseOutStartPoint,
                  }
                : null;
            return (
              <Rect
                key={index}
                x={x / this.state.widthRatio}
                y={y / this.state.heightRatio}
                width={width}
                height={width}
                fill="white"
                stroke="black"
                strokeWidth={3}
                onDragStart={this.handleDragStartPoint}
                onDragMove={(event) =>
                  this.handleDragMovePoint(event, polygon.id)
                }
                onDragEnd={this.handleDragEndPoint}
                draggable
                {...startPointAttr}
              />
            );
          })
        );

        let y = [];
        let points = polygon.points;
        points.forEach((point) => {
          y.push(point[1]);
        });
        const min = Math.min.apply(Math, y);
        pointIndex = points.findIndex((data) => data[1] === min);

        let xAxis =
          points[pointIndex] !== undefined ? points[pointIndex][0] : 0;
        let yAxis =
          points[pointIndex] !== undefined ? points[pointIndex][1] : 0;

        text.push(
          <Label
            x={
              xAxis / this.state.widthRatio + polygon.label.length * 7 >=
              this.state.resizedWidth
                ? xAxis / this.state.widthRatio - polygon.label.length * 7
                : xAxis / this.state.widthRatio
            }
            y={
              yAxis / this.state.heightRatio - 25 <= 0
                ? yAxis / this.state.heightRatio
                : yAxis / this.state.heightRatio - 25
            }
          >
            <Tag fill="white" />
            <Text
              offsetY={0}
              text={polygon.label}
              fontSize={12}
              fontWeight={"bold"}
              fontFamily={"Century Gothic"}
              lineHeight={1.4}
              fill="black"
            />
          </Label>
        );

        lines.push(
          <Polygon
            polyProps={polygon}
            flattenedPoints={flattenedPoints}
            isClosed={this.state.isClosed}
            isFinished={polygon.isFinished}
            selected={this.state.selectedId}
            handleMouseDown={
              polygon.isFinished
                ? (event) => this.handleMouseDown(event, polygon.id)
                : () => {}
            }
            layers={polygons}
            setPolygonPoints={this.setPolygonPoints}
            widthRatio={this.state.widthRatio}
            heightRatio={this.state.heightRatio}
            originalWidth={this.state.resizedWidth}
            originalHeight={this.state.resizedHeight}
          />
        );
      });
    }

    if (this.state.annotations.length > 0) {
      this.state.annotations.map((rect, i) => {
        if (rect.width > 0) {
          rectangles.push(
            <Group>
              {this.state.selectedId !== rect.id && (
                <Label
                  x={Math.round(rect.x / this.state.widthRatio)}
                  y={
                    Math.round(rect.y / this.state.heightRatio) - 16 <= 6
                      ? Math.round(rect.y / this.state.heightRatio)
                      : Math.round(rect.y / this.state.heightRatio) - 16
                  }
                >
                  <Tag fill="white" />
                  <Text
                    offsetY={0}
                    text={rect.label}
                    fontSize={12}
                    fontWeight={"bold"}
                    fontFamily={"Century Gothic"}
                    lineHeight={1.4}
                    fill="black"
                  />
                </Label>
              )}
              <Rectangle
                key={i}
                shapeProps={rect}
                isSelected={rect.id === this.state.selectedId}
                onSelect={() => {
                  this.setState({
                    selectedId: rect.id,
                    transformer: true,
                    showInput: true,
                    currentShape: "rectangle",
                    selectedShape: "rectangle",
                    inputPosition: {
                      left: Math.round(rect.x / this.state.widthRatio) + 10,
                      top:
                        Math.round(rect.y / this.state.heightRatio) +
                        Math.round(rect.height / this.state.heightRatio) +
                        10,
                    },
                    inputComment: rect.label,
                  });
                }}
                onChange={(newAttrs) => {
                  const rects = this.state.annotations.slice();
                  rects[i] = newAttrs;

                  this.setState({
                    annotations: rects,
                    transformer: true,
                    showInput: true,
                    inputPosition: {
                      left: Math.round(newAttrs.x / this.state.widthRatio) + 10,
                      top:
                        Math.round(newAttrs.y / this.state.heightRatio) +
                        Math.round(newAttrs.height / this.state.heightRatio) +
                        10,
                    },
                    inputComment: newAttrs.label,
                  });

                  if (this.props.onPlay) {
                    const { onPlay } = this.props;
                    onPlay(rects, rects[rects.length - 1]);
                  }
                }}
                widthRatio={this.state.widthRatio}
                heightRatio={this.state.heightRatio}
                originalHeight={this.state.resizedHeight}
                originalWidth={this.state.resizedWidth}
              />
            </Group>
          );
        }
      });
    }

    return (
      <div>
        <div>
          <Card>
            <CardBody>
              <h6>Available Shapes</h6>
              <ButtonOptions
                onClickButtonRect={this.onClickButtonRect}
                onClickButtonPolygon={this.onClickButtonPolygon}
                onClickButtonPolyline={this.onClickButtonPolyline}
                isClosed={this.state.isClosed}
                selectedShape={this.state.selectedShape}
              />
              <img
                style={{
                  height: this.state.resizedHeight + "px",
                  width: this.state.resizedWidth + "px",
                  display: "flex",
                  alignItems: "middle",
                  margin: "auto auto",
                }}
                src={this.props.src}
                ref={(el) => (this.imgEl = el)}
                onLoad={this.setRatio}
                className="annotation-image"
              />
              <Canvas
                resizedWidth={this.state.resizedWidth}
                resizedHeight={this.state.resizedHeight}
                showInput={this.state.showInput}
                handleMouseMove={this.handleMouseMove}
                handleClick={this.handleClick}
                onDelete={this.onDelete}
                currentShape={this.state.currentShape}
                selectedShape={this.state.selectedShape}
                selectedId={this.state.selectedId}
                checkDeselect={this.checkDeselect}
                transformer={this.state.transformer}
                handleMouseUp={this.handleMouseUp}
                handleMouseMovePolygon={this.handleMouseMovePolygon}
                rectangles={rectangles}
                text={text}
                lines={lines}
                inputPosition={this.state.inputPosition}
                inputComment={this.state.inputComment}
                setCommentPolygon={this.setCommentPolygon}
                setCommentRectangle={this.setCommentRectangle}
                polygons={this.state.polygons}
                annotations={this.state.annotations}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}
