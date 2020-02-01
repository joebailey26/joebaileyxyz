/*  
    Portfolio Section
    Requires Item Component
*/
import React from 'react';

import Item from '../components/item';

import './css/portfolio.scss';

import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

function scrollPortfolio(i) {
	setInterval(function() {
		var width = document.querySelector('.section-portfolio .col-md-4').offsetWidth;
		var container = document.querySelectorAll('.section-portfolio .row')[i];
		var count = document.querySelectorAll('.section-portfolio .row')[i].querySelectorAll('.col-md-4').length - 1;
		if (container.scrollLeft === (width * count)) {
			container.scrollBy({
			left: 0,
			behavior: 'smooth' 
			})
		}
		else {
			container.scrollBy({
			left: width,
			behavior: 'smooth' 
			})
		}
	}, 10000);
}

class Portfolio extends React.Component {
	render() {
        return (
            <section className="section section-portfolio" id="section-portfolio">
                <div className="row">
                    <div className="col-md-8 ml-auto mr-auto">
                        <h2 className="text-center title">Portfolio</h2>
                    </div>
                </div>

                <div id="web">
                    <h2 className="subtitle">Websites</h2>
                    <h5>View some of the websites that I have created.</h5>
                </div>

                <div className="row">
                    <Item 
                        title="Joe Bailey Photography"
                        tech={["php","vuejs","wordpress", "file-code"]}
                        desc="In order to use many of the new Web Technologies you first need a platform to test them on. This is my photography website. I am very passionate about photography and like to keep my website as close to the cutting edge as possible." 
                        websiteLink="https://www.joebaileyphotography.com" 
                        docsLink="https://www.joebaileyphotography.com/Blog/category/joe-bailey-photography/website/">
                    </Item>
                    <Item 
                        title="Therfield Village Pre-School"
                        tech={["wordpress"]}
                        desc="A local Pre-School needed someone to manage their website, updating content, ensuring consitency, and implementing new features. I have since helped their brand become more consistent and created a blog which I help keep up to date." 
                        websiteLink="https://therfieldpreschool.co.uk" 
                        docsLink="https://www.joebaileyphotography.com/Blog/2019/04/therfield-village-pre-school/">
                    </Item>
                    <Item 
                        title="Disabled People's Voice"
                        tech={["wordpress", "file-code"]}
                        desc="A local charity approached me to develop their website from a template that an external graphic designer has created. I worked closely with the designer over a 3 month period making sure that the site was pixel perfect before pushing it live." 
                        websiteLink="https://dpv.org.uk" 
                        docsLink="http://www.joebaileyphotography.com/Blog/2019/04/disabled-people's-voice/">
                    </Item>
                    <Item 
                        title="Island RIBs"
                        tech={["wordpress"]}
                        desc="I gave this local company's website a design refresh. I worked closely with the client on a development site to help them reach their vision within their budget. I then went through the process of cross-browser testing before pushing the website live." 
                        websiteLink="https://island-ribs.co.uk/" 
                        docsLink="https://www.joebaileyphotography.com/Blog/2019/08/island-ribs/">
                    </Item>
                    <Item 
                        title="Don's Discs" 
                        tech={["wordpress", "file-code"]}
                        desc="This client needed an E-Commerce website in order to sell rare vinyl around the world. I created a site using WooCommerce and worked with them on a procdure for exporting products from Discogs onto the new website." 
                        websiteLink="https://donsdiscs.com" 
                        docsLink="http://www.joebaileyphotography.com/Blog/2019/07/dons-discs/">
                    </Item>
                    <Item 
                        title="Blossom Tree Photography"
                        tech={["wordpress", "file-code"]}
                        desc="I gave this photographer a bespoke website made with WordPress so that she could show off her portfolio and write about her work in a blog. I used Figma to prototype the site and developed a custom theme for it." 
                        websiteLink="https://blossomtreephoto.co.uk" 
                        docsLink="http://www.joebaileyphotography.com/Blog/2019/01/blossom-tree-photography/">
                    </Item>
                </div>

                <div id="designs">
                    <h2 className="subtitle">Designs</h2>
                    <h5>View some of the websites I have designed.</h5>
                </div>
                <div className="row">
                    <Item 
                        title="National Hyacinth Collection"
                        tech={["file-code"]}
                        desc="In 2017 I approached the National Hyacinth Collection asking if they wanted a website. I decided it would be a good opportunity to teach myself HTML and CSS. However, the project never came to fruition." 
                        websiteLink="https://nhc.joebailey.xyz" 
                        behanceLink="https://www.behance.net/gallery/79742435/National-Hyacinth-Collection">
                    </Item>
                    <Item 
                        title="Conspiracy"
                        tech={["file-code", "google"]}
                        desc="At University, we were tasked with creating a website that uses some basic JavaScript and solves a real-world problem. I made a website that displays conspiracy theories in a news website form as most information is only available on YouTube." 
                        websiteLink="https://web-tech-report.firebaseapp.com/" 
                        behanceLink="https://www.behance.net/gallery/79730007/Conspiracy">
                    </Item>
                    <Item 
                        title="Projekt" 
                        tech={["adobe"]}
                        desc="As part of my media course at Sixth Form we had to create multiple websites. This website is a social media platform for creators to share their work."
                        behanceLink="https://www.behance.net/gallery/74653547/Projekt?">
                    </Item>
                    <Item 
                        title="Student Photographer"
                        tech={["adobe"]}
                        desc="As part of my media course at Sixth Form we had to create multiple websites. This website is a social media platform for photographers to share their work."
                        behanceLink="https://www.behance.net/gallery/74653681/Student-Photographer?">
                    </Item>
                    <Item 
                        title="Project Gutenberg"
                        tech={["figma"]}
                        desc="My second project at University was to redesign the Project Gutenberg site. As part of this project I learnt how to use Figma."
                        behanceLink="https://www.behance.net/gallery/74308561/Project-Gutenberg-Redesign">
                    </Item>
                    <Item 
                        title="Solent App"
                        tech={["adobe-xd"]}
                        desc="I wanted to practise my design skills using Adobe XD so I made a mockup of a mobile app that combines current web-based applications that the university offers."
                        behanceLink="https://www.behance.net/gallery/77240793/Solent-University-Mobile-Application">
                    </Item>
                </div>
                <div id="projects">
                    <h2 className="subtitle">Projects</h2>
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
                <div className="row">
                    <Item 
                        title="Galexia" 
                        tech={["react", "cloud"]}
                        desc="" 
                        projectLink="https://galexia.agency" 
                        gitHubLink="https://github.com/joebailey26/Galexia"
                        picture="no">
                    </Item>
                    <Item 
                        title="Weather App"
                        tech={["file-code"]}
                        desc="" 
                        projectLink="https://joebailey26.github.io/Weather-App/index.html" 
                        gitHubLink="https://github.com/joebailey26/Weather-App"
                        picture="no">
                    </Item>
                    <Item 
                        title="To Do List" 
                        tech={["file-code"]}
                        desc="" 
                        projectLink="https://codepen.io/joebailey26/pen/wvvbBpN" 
                        gitHubLink="https://github.com/joebailey26/JavaScript-To-Do-List"
                        picture="no">
                    </Item>
                    <Item 
                        title="Vue To Do List" 
                        tech={["vuejs"]}
                        desc="" 
                        projectLink="" 
                        gitHubLink="https://github.com/joebailey26/Vue-To-Do-List"
                        picture="no">
                    </Item>
                    <Item 
                        title="React Tic Tac Toe" 
                        tech={["react"]}
                        desc="" 
                        projectLink="https://codepen.io/joebailey26/pen/poogwjN" 
                        gitHubLink="https://github.com/joebailey26/React-Tic-Tac-Toe"
                        picture="no">
                    </Item>
                    <Item 
                        title="Firebase Chat App" 
                        tech={["google"]}
                        desc="" 
                        projectLink="https://chat-app-a7f51.firebaseapp.com/" 
                        gitHubLink="https://github.com/joebailey26/firebase_chat_app"
                        picture="no">
                    </Item>
                </div>
            </section>
        )
    }
    componentDidMount() {	
		scrollPortfolio(1);
		setTimeout(function(){
			scrollPortfolio(2)
		}, 2000);
		setTimeout(function(){
			scrollPortfolio(3)
		}, 4000);
	}
}

export default Portfolio