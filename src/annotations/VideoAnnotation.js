import React from "react";
import { Layer, Rect, Stage, Group, Transformer } from "react-konva";
import ReactPlayer from "react-player";
import { Button } from "reactstrap";

const Rectangle = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  addNew,
  currentTime,
  selectedTime,
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    trRef.current.setNode(shapeRef.current);
    trRef.current.getLayer().batchDraw();
  }, []);

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable={isSelected ? true : false}
        opacity={isSelected ? 0.5 : 0}
        strokeWidth={1} // border width
        stroke="red" // border color
        onDragEnd={(e) => {
          if (shapeProps.time === currentTime || selectedTime === currentTime) {
            onChange(
              {
                ...shapeProps,
                time: currentTime,
                x: e.target.x(),
                y: e.target.y(),
              },
              shapeProps.id,
              shapeProps.time
            );
          } else {
            addNew({
              ...shapeProps,
              x: e.target.x(),
              y: e.target.y(),
              fill: "red",
              time: currentTime,
            });
          }
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);

          onChange(
            {
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              time: currentTime,
              // set minimal value
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            },
            shapeProps.id,
            shapeProps.time
          );
        }}
      />
      {
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      }
    </React.Fragment>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shapes: [], // list of dimensions to be rendered as shapes
      rects: [],
      isDrawing: false, // in the process of drawing a shape
      isDrawingMode: false, // allow shapes to be drawn
      selectedId: "",
      transformer: true,
      currentTime: 0,
      isPlaying: false,
      currentIndex: 0,
      coordinates: [],
    };
  }

  handlePause = () => {
    this.setState({
      isPlaying: false,
      isDrawingMode: true,
    });
  };

  handleAddNew = () => {
    this.setState({
      transformer: false,
      isDrawingMode: true,
    });
  };

  handlePlay = () => {
    let video = this.player.getInternalPlayer();
    console.log(video, "video");

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.setState({
        currentTime: this.getFixedNumber(video.currentTime, 5),
      });
    }, 1);

    console.log(video, "video");

    this.setState({
      isPlaying: true,
      isDrawingMode: false,
    });

    let rects = [];
    let coordinates = this.state.coordinates;

    coordinates.forEach((shapes, arr) => {
      for (let i = 0; i < shapes.length; i++) {
        if (i !== shapes.length - 1) {
          rects.push(shapes[i]);
        } else {
          rects.push(shapes[i]);
        }
      }
    });
    var result = [];
    rects.forEach((item) => {
      var saved = result.find((innerArr) => {
        return innerArr.find((innerItem) => innerItem.id === item.id)
          ? true
          : false;
      });

      if (saved) {
        saved.push(item);
      } else {
        result.push([item]);
      }
    });

    this.setState({ rects: result });
  };

  getLinearInterpolatedValue(x0, x1, y0, y1, x) {
    const slope = (y1 - y0) / (x1 - x0);
    return slope * (x - x0) + y0;
  }

  handleClick = (e) => {
    if (!this.state.isDrawingMode) return;
    // if we are drawing a shape, a click finishes the drawing
    if (this.state.isDrawing) {
      this.setState({
        isDrawing: !this.state.isDrawing,
      });
      return;
    }

    // otherwise, add a new rectangle at the mouse position with 0 width and height,
    // and set isDrawing to true
    const newShapes = this.state.shapes.slice();

    let id = Math.random().toString(36).substring(7);
    newShapes.push({
      id: id,
      x: e.evt.layerX,
      y: e.evt.layerY,
      fill: "red",
      width: 0,
      height: 0,
      comment: "test",
      time: this.state.currentTime,
    });

    this.setState({
      isDrawing: true,
      shapes: newShapes,
      selectedId: id,
      transformer: true,
    });

    var coordinates = [];
    this.state.shapes.forEach((item) => {
      var newCoordinates = coordinates.find((innerArr) => {
        return innerArr.find((innerItem) => innerItem.id === item.id)
          ? true
          : false;
      });

      if (newCoordinates) {
        newCoordinates.push(item);
      } else {
        coordinates.push([item]);
      }
    });

    this.setState({
      coordinates: coordinates,
    });

    let rects = [];

    this.state.coordinates.forEach((shapes, arr) => {
      for (let i = 0; i < shapes.length; i++) {
        if (i !== shapes.length - 1) {
          rects.push(shapes[i]);
        } else {
          rects.push(shapes[i]);
        }
      }
    });
    var result = [];
    rects.forEach((item) => {
      var saved = result.find((innerArr) => {
        return innerArr.find((innerItem) => innerItem.id === item.id)
          ? true
          : false;
      });

      if (saved) {
        saved.push(item);
      } else {
        result.push([item]);
      }
    });

    this.setState({ rects: result });
  };

  handleMouseUp = (e) => {
    if (this.props.onPlay) {
      const { onPlay } = this.props;

      onPlay(this.state.coordinates, this.state.shapes[0]);
    }
    if (this.state.isDrawing) {
      this.setState({
        isDrawing: !this.state.isDrawing,
        isDrawingMode: false,
      });
      return;
    }
  };

  handleMouseMove = (e) => {
    if (!this.state.isDrawingMode) return;

    const mouseX = e.evt.layerX;
    const mouseY = e.evt.layerY;

    // update the current rectangle's width and height based on the mouse position
    if (this.state.isDrawing) {
      // get the current shape (the last shape in this.state.shapes);
      const currShapeIndex = this.state.shapes.length - 1;

      const currShape = this.state.shapes[currShapeIndex];
      const newWidth = mouseX - currShape.x;
      const newHeight = mouseY - currShape.y;

      const newShapesList = this.state.shapes.slice();
      newShapesList[currShapeIndex] = {
        id: currShape.id, // id
        x: currShape.x, // keep starting position the same
        y: currShape.y,
        fill: currShape.fill,
        width: newWidth, // new width and height
        height: newHeight,
        comment: currShape.comment,
        time: currShape.time,
      };

      this.setState({
        shapes: newShapesList,
      });

      var coordinates = [];
      this.state.shapes.forEach((item) => {
        var newCoordinates = coordinates.find((innerArr) => {
          return innerArr.find((innerItem) => innerItem.id === item.id)
            ? true
            : false;
        });

        if (newCoordinates) {
          newCoordinates.push(item);
        } else {
          coordinates.push([item]);
        }
      });

      this.setState({
        coordinates: coordinates,
      });

      let rects = [];

      this.state.coordinates.forEach((shapes, arr) => {
        for (let i = 0; i < shapes.length; i++) {
          if (i !== shapes.length - 1) {
            rects.push(shapes[i]);
          } else {
            rects.push(shapes[i]);
          }
        }
      });
      var result = [];
      rects.forEach((item) => {
        var saved = result.find((innerArr) => {
          return innerArr.find((innerItem) => innerItem.id === item.id)
            ? true
            : false;
        });

        if (saved) {
          saved.push(item);
        } else {
          result.push([item]);
        }
      });

      this.setState({ rects: result });
    }
  };

  handleCheckboxChange = () => {
    // toggle drawing mode
    this.setState({
      isDrawingMode: !this.state.isDrawingMode,
    });
  };

  onMouseDown = (e) => {
    e.target.getStage();
    // const position = stage.getPointerPosition();
  };

  checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      this.setState({ selectedId: null, transformer: true });
    }
  };

  getFixedNumber = (number, digits) =>
    Math.round(number * 10 ** digits) / 10 ** digits;

  onProgress = (data) => {
    var player = this.player.getInternalPlayer();

    var i = setInterval(() => {
      this.setState({
        currentTime: this.getFixedNumber(player.currentTime, 5),
      });
      if (this.state.playing === false) {
        clearInterval(i);
      }
    }, 1);
  };

  onEnded = () => {
    this.setState({
      playing: false,
    });
  };

  render() {
    let drawings = [];
    this.state.rects.forEach((rect, arr) => {
      for (var i = 0; i < rect.length; i++) {
        let id = rect[i].id;
        let time = rect[i].time;
        if (this.state.currentTime >= rect[i].time) {
          if (
            i !== rect.length - 1 &&
            this.state.currentTime >= rect[i + 1].time
          ) {
            continue;
          }

          let newShape;
          if (i === rect.length - 1) {
            newShape = rect[i];
          } else {
            let startX = rect[i].x;
            let endX = rect[i + 1].x;
            let startY = rect[i].y;
            let endY = rect[i + 1].y;
            let startWidth = rect[i].width;
            let endWidth = rect[i + 1].width;
            let startHeight = rect[i].height;
            let endHeight = rect[i + 1].height;
            let startTime = rect[i].time;
            let endTime = rect[i + 1].time;

            newShape = {
              id: rect[i].id,
              x: this.getLinearInterpolatedValue(
                endTime,
                startTime,
                endX,
                startX,
                this.state.currentTime
              ),
              y: this.getLinearInterpolatedValue(
                endTime,
                startTime,
                endY,
                startY,
                this.state.currentTime
              ),
              fill: rect[i].fill,
              width: this.getLinearInterpolatedValue(
                endTime,
                startTime,
                endWidth,
                startWidth,
                this.state.currentTime
              ),
              height: this.getLinearInterpolatedValue(
                endTime,
                startTime,
                endHeight,
                startHeight,
                this.state.currentTime
              ),
              comment: rect[i].car,
              time: rect[i].time,
            };
          }

          drawings.push(
            <Group>
              <Rectangle
                key={i}
                shapeProps={newShape}
                isSelected={this.state.selectedId}
                onSelect={() => {
                  this.setState({
                    selectedId: id,
                    selectedTime: time,
                    transformer: true,
                  });
                }}
                onChange={(newAttrs, id, selectedTime) => {
                  const shapes = this.state.shapes.slice();
                  const shapeIndex = shapes.findIndex(
                    (x) => x.id === id && x.time === selectedTime
                  );
                  shapes[shapeIndex] = newAttrs;

                  const coordinates = this.state.coordinates.slice();
                  const coordIndex = coordinates[arr].findIndex(
                    (x) => x.id === id && x.time === selectedTime
                  );
                  coordinates[arr][coordIndex] = newAttrs;

                  const rects = this.state.rects.slice();
                  const rectIndex = rects[arr].findIndex(
                    (x) => x.id === id && x.time === selectedTime
                  );
                  rects[arr][rectIndex + 1] = newAttrs;

                  this.setState({
                    coordinates: coordinates,
                    shapes: shapes,
                    rects: rects,
                  });

                  if (this.props.onPlay) {
                    const { onPlay } = this.props;

                    onPlay(this.state.coordinates, newAttrs);
                  }
                }}
                addNew={(newAttrs) => {
                  const coordinates = this.state.coordinates.slice();
                  coordinates[arr].push(newAttrs);

                  const rects = this.state.rects.slice();
                  rects[arr].push(newAttrs);

                  const shapes = this.state.shapes;
                  shapes.push(newAttrs);
                  this.setState({
                    shapes: shapes,
                    coordinates: coordinates,
                    rects: rects,
                  });

                  if (this.props.onPlay) {
                    const { onPlay } = this.props;

                    onPlay(this.state.coordinates, newAttrs);
                  }
                }}
                currentTime={this.state.currentTime}
                selectedTime={rect[i].time}
                // pass isDrawingMode so we know when we can click on a shape
              />
            </Group>
          );
        }
      }
    });

    return (
      <div style={{ marginTop: "-8%", width: "100%" }}>
        <ReactPlayer
          url={this.props.src}
          ref={(player) => {
            this.player = player;
          }}
          height={550}
          width={750}
          muted
          onEnded={this.onEnded}
          controls={true}
          onPause={this.handlePause}
          onPlay={this.handlePlay}
          config={{
            file: {
              attributes: {
                crossOrigin: "anonymous",
              },
            },
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0%",
            height: 420,
            width: "100%",
          }}
        >
          <Stage
            width={750}
            height={420}
            onContentMouseMove={this.handleMouseMove}
            onMouseDown={
              this.state.transformer ? this.checkDeselect : this.handleClick
            }
            onMouseUp={this.handleMouseUp}
            onMouseOver={() => {
              document.body.style.cursor = "crosshair";
            }}
            onMouseLeave={() => {
              document.body.style.cursor = "default";
            }}
            onMouseOut={() => {
              document.body.style.cursor = "default";
            }}
          >
            <Layer ref="layer">{drawings}</Layer>
          </Stage>
        </div>
        <br />
        <Button color="primary" onClick={this.handleAddNew}>
          Add New Box
        </Button>
      </div>
    );
  }
}

export default App;
