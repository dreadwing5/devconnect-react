/* eslint-disable no-unused-vars */
import React, { Fragment } from "react";
import { Landing } from "./componets/layout/Landing";
import { Navbar } from "./componets/layout/Navbar";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./componets/auth/Register";
import Login from "./componets/auth/Login";
import "./App.css";

const App = () => (
  <Router>
    <Fragment>
      <Navbar />
      <Route exact path="/" component={Landing} />
      <section className="container">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </Switch>
      </section>
    </Fragment>
  </Router>
);

export default App;
