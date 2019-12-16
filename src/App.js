import React from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Nav from './components/nav';
import Footer from './components/footer';

import Home from './pages/home';
import Cookies from './pages/cookies';

import './css/main.scss';

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div>
      <Router>
        <ScrollToTop />
        <Switch>
          <Route path="/Cookie-Policy">
            <div id="cookies">
              <Nav></Nav>
              <Cookies />
            </div>
          </Route>
          <Route path="/">
            <Nav></Nav>
            <Home />
          </Route>
        </Switch>

        <Footer></Footer>
      </Router>
    </div>
    
  );
}

export default App;
