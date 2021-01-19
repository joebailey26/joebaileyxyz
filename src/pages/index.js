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

import React from 'react'
import { Link } from 'gatsby'

import '../css/main.scss'
import './css/home.scss'
import '../sections/css/portfolio.scss'

import Button from '../components/button'
import SEO from '../components/seo'

import Blog from '../sections/blog'
import Portfolio from '../sections/portfolio'
import Projects from '../sections/projects'
import Contact from '../sections/contact'

import Footer from '../components/footer'

import Description from '../components/description'

if (typeof window !== `undefined`) {
	require('../js/modernizer')
}

let app
let aclose

class Home extends React.Component {
	render() {
  		return (
			<div>
				<SEO title="Home" slug=""/>
				<nav className="navbar" id="transp" >
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
				<header className="page-header header-filter">
					<div className="container ml-auto mr-auto">
						<div className="row">
							<div id="header-title">
								<h1><span>I’m Joe, a</span> <span>Front-End </span><span>Web Developer.</span></h1>
		  						<Description></Description>
								<Button link="https://drive.google.com/file/d/116W_5ZSvSk_UG5ujWpeu33oPK2cr7WMs/view?usp=sharing" text="Download my CV" type="Secondary"></Button>
							</div>
						</div>
					</div>
				</header>
				<main className="main" id="trans">
					<div className="container ml-auto mr-auto">
						<section className="section section-portfolio" id="section-portfolio">
							<Portfolio></Portfolio>
							<Projects></Projects>
						</section>
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

	scrollPortfolio(i) {
		const container = document.querySelectorAll('.section-portfolio .items .row.grid')[i];
		const count = document.querySelectorAll('.section-portfolio .items .row.grid')[i].querySelectorAll('.col-md-4').length;
		const icon = document.querySelectorAll('.section-portfolio .items')[i].querySelectorAll(".icon");
	
		container.addEventListener("scroll", function(){
			let width = document.querySelector('.section-portfolio .col-md-4').offsetWidth;
			let v = Math.round(container.scrollLeft / width)
			icon.forEach(e => e.classList.remove("current"))
			icon[v].classList.add("current")
		})
		for (let i = 0; i < count; i++) {
			let width = document.querySelector('.section-portfolio .col-md-4').offsetWidth;
			icon[i].addEventListener("click", function() {
				container.scrollTo({
					left: width * i,
					behavior: 'smooth' 
				})
			})
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
		this.scrollPortfolio(0)
        this.scrollPortfolio(1)
		this.scrollBlog()
        app = document.getElementsByClassName('navmob')[0];
        aclose = document.getElementById('close');
        aclose.setAttribute("style", "display: none");
        
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
