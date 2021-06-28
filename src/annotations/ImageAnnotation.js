import React, { Component, useState, useEffect } from "react";
import {
    Layer,
    Rect,
    Stage,
    Group,
    Text,
    Line,
    Transformer,
    Tag,
    Label,
} from "react-konva";
import Konva from "konva";
import autoBind from "react-autobind";
import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button
} from 'reactstrap';
import Polygon from "annotations/Polygon";
import Rectangle from "annotations/Rectangle";
import AnnotationInput from "annotations/AnnotationInput";

export default class ImageAnnotation extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            annotations: [],
            imageName: { name: "default.jpg" },
            seletectedId: null,
            annotated: [],
            dataImage: [],
            height: 0,
            width: 0,
            isLoading: true,
            loadingImage: true,
            uploadLength: 0,
            widthRatio: 735 / 730,
            heightRatio: 550 / 486,
            isDrawingMode: true, 
            dimensions: {
                height: 0,
                width: 0,
            },
            showInput: false,
            inputPosition: {
                left: 0,
                top: 0,
            },
            inputComment: "",
            imageCount: [],
            filterAnnotationLabels: [],
            allLabels: "Select All",
            currentShape: "rectangle",
            selectedShape: "rectangle",
            points: [],
            curMousePos: [0, 0],
            isMouseOverStartPoint: false,
            isFinished: false,
            selected: false,
            polygons: [],
            currentIndex: 0,
            isClosed: false,
            resizedWidth: 735,
            resizedHeight: 550,
            currentImageIndex: 0,
        };
    }

    
    getRandomColour = () => {
        let red = Math.floor(Math.random() * 255);
        let green = Math.floor(Math.random() * 255);
        let blue = Math.floor(Math.random() * 255);

        return "rgb(" + red + "," + green + "," + blue + " )";
    };

    onImgLoad = ({ target: img }) => {
        this.setState({
            dimensions: { height: img.naturalHeight, width: img.naturalWidth },
        });
    };

    addNewPolygon = () => {
        this.setState({
        isFinished: false,
        currentIndex: this.state.polygons.length,
        isDrawingMode: true,
        });
    };  

    componentDidMount = () => {
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            let currentImageIndex =
              this.state.currentImageIndex === this.state.uploadLength - 1
                ? 0
                : this.state.currentImageIndex + 1;
    
            this.setState({
              currentImageIndex,
            });
    
            this.handleImageClick(this.state.dataImage[currentImageIndex]);
          }
        });
    };

    onSelect(selectedId) {
        this.setState({ selectedId: selectedId });
      }
    
    onChange = (data) => {
        if (this.state.selectedShape === "polygon") {
            if (data === undefined || data.length === 0) {
                } else {
                    if (this.isContainsObject(data, this.state.polygons)) {
                    } else {
                        this.setState({ polygons: data });
                    }
                }
        } else {
            if (data === undefined || data.length === 0) {
            } else {
                if (this.isContainsObject(data, this.state.annotations)) {
                } else {
                    this.setState({ annotations: data });
                }
            }
        }

        this.setState({
            inputComment: data,
        });

    };

    handleImage(e) {
        this.setState({ imageName: e.target.files[0] });
    }

    isContainsObject = (obj, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i] === obj) {
            return true;
        }
    }

    return false;
    };

    handleImageChange = (e) => {
        this.setState({ imageName: { name: e.target.files[0].name } });
    };

    setRatio = (image, origWidth, origHeight) => {
        let width = origWidth > 735 ? 735 : origWidth;
        let height = origHeight > 550 ? 550 : origHeight;

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
  
      const selectedId = this.state.selectedId;
      const deleteTarget = annotations.findIndex(
        (poly) => poly.id === this.state.selectedId
      );
  
      let annotated = this.state.annotated;
  
      let targetDelete = annotated.indexOf(this.state.imageName.name);
      if (targetDelete >= 0) {
        annotated.splice(targetDelete, 1);
        this.setState({ annotated: annotated });
      }
  
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
  
      let annotated = this.state.annotated;
  
      let targetDelete = annotated.indexOf(this.state.imageName.name);
      if (targetDelete >= 0) {
        annotated.splice(targetDelete, 1);
        this.setState({ annotated: annotated });
      }
  
      if (deleteTarget >= 0) {
        annotations.splice(deleteTarget, 1);
        this.onChange(annotations);
      }
  
      this.setState({ showInput: false });
    };

    handleImageClick = (image) => {
        this.setState({
          imageName: { name: image.imgUrl, id: image.id },
          imageScale: { width: 735, height: 735 },
          showInput: false,
          filterAnnotationLabels: [],
          allLabels: "",
          imageId: image.id,
          selectedId: null,
        });
    
        this.onNext();
        this.clearAnnotations(image.id);
        this.getAnnotatedImages();
    };

    setAnnotations = (annotations) => {
        this.setState({
          annotations: annotations,
        });
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
        this.onNext();
    };
    
    setCommentRectangle = (value, annotations) => {
        this.setState({
          inputComment: value,
        });
    
        this.onChange(annotations);
        this.onNext();
    };

    _onChange = (event) => {
        this.filterLabelOptions(this.state.imageName.id, event.value);
        this.setState({
          allLabels: event.value,
        });
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
                imageId: this.state.imageName.id,
                isFinished: false,
                points: [...points, mousePos],
                label: "",
                shape: "polygon",
              };
            } else {
              polygons[currentIndex].imageId = this.state.imageName.id;
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
    
    handleDeselectPolygon = (event) => {
        if (event.target === event.target.getStage()) {
          this.setState({ selectedId: false, showInput: false });
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

    handleCircleDrag(e, circleX, circleY) {
        const newPoints = [...this.state.points];
    
        // Changing the points state with new points while dragging the circle
        for (
          let i = 0;
          i < this.state.polygons[this.state.currentIndex].points.length;
          i++
        ) {
          if (
            this.state.polygons[this.state.currentIndex].points[i] === circleX &&
            this.state.polygons[this.state.currentIndex].points[i + 1] === circleY
          ) {
            newPoints[i] = e.target.x();
            newPoints[i + 1] = e.target.y();
            break;
          }
        }
    
        this.setState({ points: newPoints });
    }
    
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
        })

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
    
    addNewRectangle = () => {
        this.setState({
          isDrawingMode: true,
        });
    };
    
    handleMouseUp = (e) => {
        if (this.state.isDrawing) {
          let annotations = this.state.annotations;
          let width = this.state.annotations[this.state.annotations.length - 1]
            .width;
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
          imageId: this.state.imageName.id,
          width: 0,
          height: 0,
          stroke: this.getRandomColour(),
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
            imageId: currentShape.imageId,
            stroke: currentShape.stroke,
            label: currentShape.label,
            time: currentShape.time,
          };
          
          console.log(newShapesList, "----newShapesList")

          this.setState({
            annotations: newShapesList,
          });
        }

        
    };

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

                let xAxis = points[pointIndex] !== undefined ? points[pointIndex][0] : 0;
                let yAxis = points[pointIndex] !== undefined ? points[pointIndex][1] : 0;

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
        
        return(
            <div>
                <div>
                <Card>
                    <CardBody>
                        <h6>Available Shapes</h6>
                        <Button
                            onClick={() =>
                                this.setState({
                                  isClosed: true,
                                  currentShape: "rectangle",
                                  selectedShape: "rectangle",
                                  isDrawingMode: true,
                                })
                              }
                        >
                            <svg 
                              aria-hidden="true" 
                              focusable="false" 
                              data-prefix="fas" 
                              data-icon="draw-square" 
                              role="img" 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 448 512" 
                              height="25"
                              width="25"
                              class="svg-inline--fa fa-draw-square fa-w-14 fa-9x">
                              <path 
                              fill={
                                this.state.selectedShape === "rectangle"
                                  ? "red"
                                  : "currentColor"
                              }
                              d="M416 360.88V151.12c19.05-11.09 32-31.49 32-55.12 0-35.35-28.65-64-64-64-23.63 0-44.04 12.95-55.12 32H119.12C108.04 44.95 87.63 32 64 32 28.65 32 0 60.65 0 96c0 23.63 12.95 44.04 32 55.12v209.75C12.95 371.96 0 392.37 0 416c0 35.35 28.65 64 64 64 23.63 0 44.04-12.95 55.12-32h209.75c11.09 19.05 31.49 32 55.12 32 35.35 0 64-28.65 64-64 .01-23.63-12.94-44.04-31.99-55.12zm-320 0V151.12A63.825 63.825 0 0 0 119.12 128h209.75a63.825 63.825 0 0 0 23.12 23.12v209.75a63.825 63.825 0 0 0-23.12 23.12H119.12A63.798 63.798 0 0 0 96 360.88zM400 96c0 8.82-7.18 16-16 16s-16-7.18-16-16 7.18-16 16-16 16 7.18 16 16zM64 80c8.82 0 16 7.18 16 16s-7.18 16-16 16-16-7.18-16-16 7.18-16 16-16zM48 416c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zm336 16c-8.82 0-16-7.18-16-16s7.18-16 16-16 16 7.18 16 16-7.18 16-16 16z" class="">
                              </path>
                            </svg>
                        </Button>
                        <Button
                            onClick={() =>
                                this.setState({
                                  isClosed: true,
                                  currentShape: "polygon",
                                  selectedShape: "polygon",
                                  isFinished: false,
                                  currentIndex: this.state.polygons.length,
                                  isDrawingMode: true,
                                })
                              }
                        >
                            <svg
                              visible="true"
                              focusable="false"
                              data-prefix="fas"
                              data-icon="draw-polygon"
                              class="svg-inline--fa fa-draw-polygon fa-w-14"
                              role="img"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                              height="25"
                              width="25"
                            >
                              <path
                                fill={
                                  this.state.isClosed === true &&
                                  this.state.selectedShape === "polygon"
                                    ? "red"
                                    : "currentColor"
                                }
                                d="M384 352c-.35 0-.67.1-1.02.1l-39.2-65.32c5.07-9.17 8.22-19.56 8.22-30.78s-3.14-21.61-8.22-30.78l39.2-65.32c.35.01.67.1 1.02.1 35.35 0 64-28.65 64-64s-28.65-64-64-64c-23.63 0-44.04 12.95-55.12 32H119.12C108.04 44.95 87.63 32 64 32 28.65 32 0 60.65 0 96c0 23.63 12.95 44.04 32 55.12v209.75C12.95 371.96 0 392.37 0 416c0 35.35 28.65 64 64 64 23.63 0 44.04-12.95 55.12-32h209.75c11.09 19.05 31.49 32 55.12 32 35.35 0 64-28.65 64-64 .01-35.35-28.64-64-63.99-64zm-288 8.88V151.12A63.825 63.825 0 0 0 119.12 128h208.36l-38.46 64.1c-.35-.01-.67-.1-1.02-.1-35.35 0-64 28.65-64 64s28.65 64 64 64c.35 0 .67-.1 1.02-.1l38.46 64.1H119.12A63.748 63.748 0 0 0 96 360.88zM272 256c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zM400 96c0 8.82-7.18 16-16 16s-16-7.18-16-16 7.18-16 16-16 16 7.18 16 16zM64 80c8.82 0 16 7.18 16 16s-7.18 16-16 16-16-7.18-16-16 7.18-16 16-16zM48 416c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zm336 16c-8.82 0-16-7.18-16-16s7.18-16 16-16 16 7.18 16 16-7.18 16-16 16z"
                              ></path>
                            </svg>
                        </Button>
                        <Button
                            onClick={() =>
                                this.setState({
                                  isClosed: false,
                                  currentShape: "polygon",
                                  selectedShape: "polygon",
                                  isFinished: false,
                                  currentIndex: this.state.polygons.length,
                                  isDrawingMode: true,
                                })
                              }
                        >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              version="1.1" id="mdi-vector-polyline" 
                              height="25"
                              width="25" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                fill={
                                  this.state.isClosed === false &&
                                  this.state.selectedShape === "polygon"
                                    ? "red"
                                    : "currentColor"
                                }
                                d="M2 3V9H4.95L6.95 15H6V21H12V16.41L17.41 11H22V5H16V9.57L10.59 15H9.06L7.06 9H8V3M4 5H6V7H4M18 7H20V9H18M8 17H10V19H8Z">
                              </path>
                            </svg>
                        </Button>
                        <div className="annotation-image-container">
                          <img
                            style={{
                              height: this.state.resizedHeight,
                              width: this.state.resizedWidth,
                              maxHeight: 550,
                              maxWidth: 735,
                              display: "flex",
                              alignItems: "middle",
                              margin: "auto auto",
                            }}
                            src={this.props.src}
                            ref={el => this.imgEl = el}
                            onLoad={() => this.onImgLoad(this.imgEl)}
                            className="annotation-image"
                          />
                          <div className="annotation-stage-container">
                            <div
                              style={{
                                width: this.state.resizedWidth,
                                height: this.state.resizedHeight,
                                position: "absolute",
                                margin: "auto",
                                left: "0px",
                                right: "0px",
                                top: "0px",
                                bottom: "0px",
                                marginTop: "90px"
                              }}
                            >
                              <Stage
                                width={this.state.resizedWidth}
                                height={this.state.resizedHeight}
                                onContentMouseMove={this.handleMouseMove}
                                onMouseDown={
                                  this.state.currentShape === "polygon" ||
                                  this.state.selectedShape === "polygon"
                                    ? this.state.selectedId
                                      ? this.checkDeselect
                                      : (event) =>
                                          this.handleClickPolygon(
                                            event,
                                            undefined
                                          )
                                    : this.state.transformer
                                    ? this.checkDeselect
                                    : this.handleClick
                                }
                                onMouseUp={this.handleMouseUp}
                                onMouseMove={this.handleMouseMovePolygon}
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
                                  top: this.state.inputPosition.top,
                                  left: this.state.inputPosition.left,
                                }}
                              >
                                {this.state.showInput && (
                                  <AnnotationInput
                                    onChange={
                                      this.state.selectedShape === "polygon"
                                        ? this.setCommentPolygon
                                        : this.setCommentRectangle
                                    }
                                    onDelete={this.onDelete}
                                    selectedId={this.state.selectedId}
                                    annotations={
                                      this.state.selectedShape === "polygon"
                                        ? this.state.polygons
                                        : this.state.annotations
                                    }
                                    value={this.state.inputComment}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                    </CardBody>
                </Card>
                </div>
            </div>
        );


    } //end render


    
}