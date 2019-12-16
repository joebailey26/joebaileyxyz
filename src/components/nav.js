import React from 'react';
import {
    Link
  } from "react-router-dom";

function Nav() {
  return (
    <div>
        <nav className="navbar" id="transp" >
            <div className="container">
                <div className="row">
                    <Link className="navbar-brand" to="/">Joe Bailey</Link>
                    <a title="navigation" className="navbar-toggler" href="javascript:void(0);" onClick="appdrawer()">
                        <i className="fas fa-bars"></i>
                    </a>
                    <div className="navmob closed" id="nav">
                        <div className="navlinks">
                            <a className="nav-link" id="portfolio" href="javascript:void(0)">
                                <i className="material-icons">apps</i> Portfolio
                            </a>
                            <a className="nav-link" id="blog" href="javascript:void(0)">
                                <i className="material-icons">message</i> Blog
                            </a>
                            <a className="nav-link" id="contact" href="javascript:void(0)">
                                <i className="material-icons">send</i> Contact
                            </a>
                            <a title="close-navigation" id="close" className="closed" href="javascript:void(0);" onClick="appclose()"></a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </div>
  );
}

export default Nav;

