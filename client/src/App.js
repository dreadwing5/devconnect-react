/* eslint-disable no-unused-vars */
import React, { Fragment } from "react";
import { Landing } from "./componets/layout/Landing";
import { Navbar } from "./componets/layout/Navbar";
import "./App.css";

const App = () => (
  <Fragment>
    <Landing />
    <Navbar />
  </Fragment>
);

export default App;
