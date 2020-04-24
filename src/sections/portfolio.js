/*  
    Portfolio Section
    Requires Item Component
*/
import React from 'react'

import Websites from './sub_sections/websites'
import Projects from './sub_sections/projects'

import './css/portfolio.scss'

import smoothscroll from 'smoothscroll-polyfill'
smoothscroll.polyfill();

function scrollPortfolio(i) {
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

class Portfolio extends React.Component {
	render() {
        return (
            <section className="section section-portfolio" id="section-portfolio">
                <div className="row">
                    <div className="col-md-8 ml-auto mr-auto">
                        <a href="/portfolio"><h2 className="text-center title">Portfolio</h2></a>
                    </div>
                </div>

                <div id="web">
                    <a href="/websites"><h2 className="subtitle">Websites</h2></a>
                    <h5>View some of the websites that I have created.</h5>
                </div>
                <Websites></Websites>
                <div id="projects">
                    <a href="/projects"><h2 className="subtitle">Projects</h2></a>
                    <h5>View some of my projects.</h5>
                </div>
                <div id="git">
                    <div className="col-md-8 ml-auto mr-auto">
                        <h3>GitHub Contributions</h3>
                        <a title="GitHub Contributions" href="https://github.com/joebailey26">
                            <img src="https://ghchart.rshah.org/joebailey26" alt="Joe's Github chart" width="100%" />
                            <i className="fab fa-github"></i>
                            <h5>View my profile on GitHub.</h5>
                        </a>
                    </div>
                </div>
                <Projects></Projects>
            </section>
        )
    }
    componentDidMount() {
        scrollPortfolio(0)
        scrollPortfolio(1)
	}
}

export default Portfolio