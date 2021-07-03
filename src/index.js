import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import ImageAnnotationApp from "components/ImageAnnotation.js";
import VideoAnnotationnApp from "components/VideoAnnotation.js";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <BrowserRouter>
    <VideoAnnotationnApp />
    {/* <ImageAnnotationApp /> */}
  </BrowserRouter>,
  document.getElementById("root")
);
