import React from "react"
import { Link } from 'gatsby'

import './css/nav.scss'

let app;
let aclose;

class Nav extends React.Component {
    render() {
        return (
            <nav className="navbar transparent" id="transp" >
                <div className="container">
                    <div className="row">
                        <div className="navbar-brand"><Link to="/">Joe Bailey</Link></div>
                        <a href="javascript:void(0)" title="navigation" className="navbar-toggler text-center" onClick={this.appdrawer}>
                            <i className="fas fa-bars"></i>
                        </a>
                        <div className="navmob closed" id="nav">
                            <div className="navlinks">
                                <Link className="nav-link" to="portfolio">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                                    </svg>
                                    Portfolio
                                </Link>
                                <Link className="nav-link" to="projects">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M3 6h18V4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V6zm10 6H9v1.78c-.61.55-1 1.33-1 2.22s.39 1.67 1 2.22V20h4v-1.78c.61-.55 1-1.34 1-2.22s-.39-1.67-1-2.22V12zm-2 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM22 8h-6c-.5 0-1 .5-1 1v10c0 .5.5 1 1 1h6c.5 0 1-.5 1-1V9c0-.5-.5-1-1-1zm-1 10h-4v-8h4v8z"/>
                                    </svg>
                                    Projects
                                </Link>
                                <Link className="nav-link" to="blog">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                                    </svg>
                                    Blog
                                </Link>
                                <Link className="nav-link" to="/#section-contact">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                    Contact
                                </Link>
                                <a href="javascript:void(0)" title="close-navigation" id="close" className="closed" onClick={this.appclose}></a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    };

    /* Mobile Navigation JS */
    appdrawer(){
		if (app.classList.contains('closed') === true){
				aclose.setAttribute("style", "display: block");
				setTimeout(function() {
					app.classList.remove('closed');
					app.classList.add('open');
					aclose.classList.remove('closed');
					aclose.classList.add('open');
				}, 100);
		} 
		else {
			app.classList.remove('open');
			app.classList.add('closed');
			aclose.classList.remove('open');
			aclose.classList.add('closed');
			setTimeout(
				function() {
					aclose.setAttribute("style", "display: none");
				}, 900);
		}

	};

	appclose(){
		if (app.classList.contains('open') === true){
			app.classList.remove('open');
			app.classList.add('closed');
			aclose.classList.remove('open');
			aclose.classList.add('closed');
			setTimeout(
		        function() {
			        aclose.setAttribute("style", "display: none");
                }, 
            900);
		}
    };
    
    componentDidMount() {
        app = document.getElementsByClassName('navmob')[0];
        aclose = document.getElementById('close');
        aclose.setAttribute("style", "display: none");
    }
}

export default Nav;