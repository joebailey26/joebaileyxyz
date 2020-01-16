/* 
    Nav component
    Renders the navigation menu and handles all logic for mobile version with swipe and app drawer
*/
import React from 'react';
import * as Hammer from "hammerjs";

import './css/nav.scss'

let app;
let aclose;

class Nav extends React.Component {
    render() {
        return (
            <nav className="navbar" id="transp" >
                <div className="container">
                    <div className="row">
                        <div className="navbar-brand"><a href="#home">Joe Bailey</a></div>
                        <p title="navigation" className="navbar-toggler text-center" onClick={this.appdrawer}>
                            <i className="fas fa-bars"></i>
                        </p>
                        <div className="navmob closed" id="nav">
                            <div className="navlinks">
                                <a className="nav-link" id="portfolio" href="#section-portfolio">
                                    <i className="material-icons">apps</i> Portfolio
                                </a>
                                <a className="nav-link" id="blog" href="#section-blog">
                                    <i className="material-icons">message</i> Blog
                                </a>
                                <a className="nav-link" id="contact" href="#section-contact">
                                    <i className="material-icons">send</i> Contact
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

        /*Hammer.js Init*/
		var myElement = document.body;

		// create a simple instance
		// by default, it only adds horizontal recognizers
		var mc = new Hammer(myElement);

		// listen to events...
		mc.on("swipeleft", this.appclose);
        mc.on("swiperight", this.appdrawer);
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
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

                const query = '(prefers-reduced-motion: reduce)'
                const hasOSReducedMotion = window.matchMedia(query).matches

                if (hasOSReducedMotion) {
                    document.querySelector(this.getAttribute('href')).scrollIntoView();
                } else {
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                }

            });
        });

        const nav = document.querySelector("#transp")
        const header = document.querySelector(".page-header")
        const header_height = header.offsetHeight - 100

        const add_class_on_scroll = () => nav.classList.add("transparent")
        const remove_class_on_scroll = () => nav.classList.remove("transparent")

        window.addEventListener('scroll', function() { 
            let scrollpos = window.scrollY;

            if (scrollpos >= header_height) { 
                add_class_on_scroll() 
            }
            else { 
                remove_class_on_scroll() 
            }
        })
    }
}

export default Nav;

