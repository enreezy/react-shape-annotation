import React from 'react';
import { Switch, Route } from 'react-router-dom';
import VideoAnnotation from "components/VideoAnnotation";
import ImageAnnotation from "components/ImageAnnotation";

export default () => (
    <Switch>
        <Route path="/" exact component={VideoAnnotation} />
        <Route path="/video" exact component={VideoAnnotation} />
        <Route path="/image" exact component={ImageAnnotation} />
    </Switch>
)