import React from "react"

import './css/nav.scss'

let app;
let aclose;

class Nav extends React.Component {
    render() {
        return (
            <nav className="navbar transparent" id="transp" >
                <div className="container">
                    <div className="row">
                        <div className="navbar-brand"><a href="https://joebailey.xyz/#home">Joe Bailey</a></div>
                        <p title="navigation" className="navbar-toggler text-center" onClick={this.appdrawer}>
                            <i className="fas fa-bars"></i>
                        </p>
                        <div className="navmob closed" id="nav">
                            <div className="navlinks">
                                <a className="nav-link" id="portfolio" href="https://joebailey.xyz/#section-portfolio">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
                                    </svg>
                                    Portfolio
                                </a>
                                <a className="nav-link" id="blog" href="https://joebailey.xyz/#section-blog">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                                    </svg>
                                    Blog
                                </a>
                                <a className="nav-link" id="contact" href="https://joebailey.xyz/#section-contact">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                    </svg>
                                    Contact
                                </a>
                                <div title="close-navigation" id="close" className="closed" onClick={this.appclose}></div>
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