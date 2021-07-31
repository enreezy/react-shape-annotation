import React, { useState } from "react";
import VideoAnnotation from "annotations/VideoAnnotation";
import { BrowserRouter as Router } from "react-router-dom";
import Car from "../assets/videos/car.mp4";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  Button,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { Link } from "react-router-dom";

function VideoAnnotationApp() {
  const [coordinates, setCoordinates] = useState([]);

  function showData(shapes, lastShapes) {
    if (shapes === undefined || shapes.length === 0) {
    } else {
      if (containsObject(shapes, coordinates)) {
      } else {
        setCoordinates(shapes);
      }
    }
  }

  function containsObject(obj, list) {
    for (let i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return true;
      }
    }

    return false;
  }

  return (
    <div className="wrapper ">
      <div
        className="sidebar"
        data-color="purple"
        data-background-color="black"
        data-image="./assets/img/sidebar-2.jpg"
      >
        <div className="logo">
          <a
            href="http://www.creative-tim.com"
            className="simple-text logo-normal"
          >
            bbox annotator
          </a>
        </div>
        <div className="sidebar-wrapper">
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" to="/image">
                <i className="material-icons">dashboard</i>
                <p>Image Annotation</p>
              </Link>
            </li>
            <li className="nav-item active">
              <Link className="nav-link" to="/video">
                <i className="material-icons">dashboard</i>
                <p>Video Annotation</p>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="main-panel">
        <nav className="navbar navbar-expand-lg navbar-transparent navbar-absolute fixed-top ">
          <div className="container-fluid">
            <div className="navbar-wrapper">
              <a className="navbar-brand" href="javascript:void(0)">
                Video
              </a>
            </div>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              aria-controls="navigation-index"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="sr-only">Toggle navigation</span>
              <span className="navbar-toggler-icon icon-bar"></span>
              <span className="navbar-toggler-icon icon-bar"></span>
              <span className="navbar-toggler-icon icon-bar"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end">
              <ul className="navbar-nav">
                <li className="nav-item active  ">
                  <Link className="nav-link" to="/image">
                    <i className="material-icons">dashboard</i>
                    <p>Image Annotation</p>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-lg-8 col-md-12">
                <div className="card">
                  <div className="card-header card-header-primary">
                    <h4 className="card-title">Annotate Video</h4>
                    <p className="card-category">
                      Pause the video, Click the ADD NEW BOX button and draw box
                      to moving object move the box every time you want to
                      annotate the object then replay
                    </p>
                    <p className="card-category">
                      ADD NEW BOX is equivalent to 1 box
                    </p>
                  </div>
                  <div className="card-body" style={{ marginTop: "15px" }}>
                    <VideoAnnotation onPlay={showData} src={Car} />
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-12">
                <div className="card">
                  <div className="card-header card-header-primary">
                    <h4 className="card-title">Annotation feeds</h4>
                    <p className="card-category">timestamp and coordinates</p>
                  </div>
                  <div className="card-body">
                    {coordinates.map((data, i) => (
                      <table class="table table-hover">
                        <tbody>
                          {data === undefined
                            ? "loading"
                            : data.map((shape) => (
                                <tr style={{ height: "10px" }}>
                                  <td>Time {shape.time}</td>
                                  <td
                                    onClick={() =>
                                      this.setCurrentTime(
                                        data.findIndex(
                                          (x) =>
                                            JSON.stringify(x) ===
                                            JSON.stringify(shape)
                                        ),
                                        i
                                      )
                                    }
                                  >
                                    Width:{parseInt(shape.width)} Height:
                                    {parseInt(shape.height)}
                                  </td>
                                  <td
                                    onClick={() =>
                                      this.setCurrentTime(
                                        data.findIndex(
                                          (x) =>
                                            JSON.stringify(x) ===
                                            JSON.stringify(shape)
                                        ),
                                        i
                                      )
                                    }
                                  >
                                    Position {parseInt(shape.x)}:
                                    {parseInt(shape.y)}
                                  </td>
                                  <td>
                                    {" "}
                                    <Button
                                      className="btn-round btn-icon"
                                      color="warning"
                                    >
                                      <i className="fa fa-trash" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                        </tbody>
                      </table>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="footer">
          <div className="container-fluid">
            <nav className="float-left">
              <ul>
                <li>
                  <a href="https://www.creative-tim.com">Creative Tim</a>
                </li>
              </ul>
            </nav>
            <div className="copyright float-right">
              &copy;
              <script>document.write(new Date().getFullYear())</script>, made
              with <i className="material-icons">favorite</i> by
              <a href="https://www.creative-tim.com" target="_blank">
                Creative Tim
              </a>{" "}
              for a better web.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default VideoAnnotationApp;
