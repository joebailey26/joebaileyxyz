/* 
  Home Page
  Requires:
	Sections:
		Portfolio
		Blog
		Contact
	Components:
		Button
*/

import React from 'react';

import '../css/main.scss';

import './css/home.scss';

import Button from '../components/button';
import SEO from '../components/seo';

import Blog from '../sections/blog';
import Portfolio from '../sections/portfolio';
import Contact from '../sections/contact';

import * as Hammer from "hammerjs";

import Footer from '../components/footer'

import '../js/modernizer';

import smoothscroll from 'smoothscroll-polyfill'
smoothscroll.polyfill()

let app;
let aclose;

class Home extends React.Component {
	render() {
  		return (
			<div>
				<SEO title="Home"/>
				<nav className="navbar" id="transp" >
					<div className="container">
						<div className="row">
							<div className="navbar-brand"><a href="#home">Joe Bailey</a></div>
							<a href="javascript:void(0)" title="navigation" className="navbar-toggler text-center" onClick={this.appdrawer}>
								<i className="fas fa-bars"></i>
							</a>
							<div className="navmob closed" id="nav">
								<div className="navlinks">
									<a className="nav-link" id="portfolio" href="#section-portfolio">
										<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
											<path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
										</svg>
										Portfolio
									</a>
									<a className="nav-link" id="blog" href="#section-blog">
										<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
											<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
										</svg>
										Blog
									</a>
									<a className="nav-link" id="contact" href="#section-contact">
										<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
											<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
										</svg>
										Contact
									</a>
									<a href="javascript:void(0)" title="close-navigation" id="close" className="closed" onClick={this.appclose}></a>
								</div>
							</div>
						</div>
					</div>
				</nav>
				<header className="page-header header-filter">
					<div className="container ml-auto mr-auto">
						<div className="row">
							<div id="header-title">
								<h1><span>I’m Joe, a</span> <span>Front-End </span><span>Web Developer.</span></h1>
								<h5 className="description">My passion for web development has always been present both prior to, and at College and University. As a result, I have gained experience in a variety of areas. This includes developing bespoke WordPress sites, creating PWA's, static HTML, CSS, and JavaScript sites, and working with clients. During the second year of my University course I plan to learn as much as possible, whilst working with as many different types of clients as possible before I undertake a 12-month placement in Web Development.</h5>
								<Button link="https://drive.google.com/open?id=1Mm61EELkpbByy3ADzffmSec_VjH8X7Na" text="Download my CV" type="Secondary"></Button>
							</div>
						</div>
					</div>
				</header>
				<main className="main" id="trans">
					<div className="container ml-auto mr-auto">
						<Portfolio></Portfolio>
						<Blog></Blog>
						<Contact></Contact>
					</div>
				</main>
				<Footer></Footer>
			</div>
		)
	}

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
	}

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
	}

	scrollBlog() {
		const container = document.querySelector('.section-blog .items .row.grid');
		const count = document.querySelector('.section-blog .items .row.grid').querySelectorAll('.col-md-4').length;
		const icon = document.querySelector('.section-blog .items').querySelectorAll(".icon");
	
		container.addEventListener("scroll", function(){
			let width = document.querySelector('.section-blog .col-md-4').offsetWidth;
			let v = Math.round(container.scrollLeft / width)
			icon.forEach(e => e.classList.remove("current"))
			icon[v].classList.add("current")
		})
		for (let i = 0; i < count; i++) {
			let width = document.querySelector('.section-blog .col-md-4').offsetWidth;
			icon[i].addEventListener("click", function() {
				container.scrollTo({
					left: width * i,
					behavior: 'smooth' 
				})
			})
		}
	}
    
    componentDidMount() {
		this.scrollBlog()
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

export default Home;
