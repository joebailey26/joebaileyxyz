import React from 'react';

import Nav from '../components/nav';

import Button from '../components/button';

import Blog from '../sections/blog';
import Portfolio from '../sections/portfolio';
import Contact from '../sections/contact';

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

class Home extends React.Component {
	render() {
  		return (
			<div id="home">
				<div id="joe"></div>
        		<Nav></Nav>
				<div className="page-header header-filter">
					<div className="container">
						<div className="row">
							<div id="header-title">
								<h1>I’m Joe, a Full Stack Web Developer.</h1>
								<h5 className="description">My passion for web development has always been present both prior to, and at College and University. As a result, I have gained experience in a variety of areas. This includes developing bespoke WordPress sites, creating PWA's, static HTML and CSS sites, and working with clients. I am in the process of learning Vue and React in order to create more advanced applications.</h5>
								<Button link="https://drive.google.com/open?id=1Mm61EELkpbByy3ADzffmSec_VjH8X7Na" text="Download my CV" type="Secondary"></Button>
							</div>
						</div>
					</div>
				</div>
				<div className="main" id="trans">
					<div className="container">
						<Portfolio></Portfolio>
						<Blog></Blog>
						<Contact></Contact>
					</div>
				</div>
			</div>
		)
	};

  	componentDidMount() {	
		scrollPortfolio(1);
		setTimeout(function(){
			scrollPortfolio(2)
		}, 2000);
	}
}

export default Home;
