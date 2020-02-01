/* 
  Home Page
  Requires:
	Sections:
		Portfolio
		Blog
		Contact
	Components:
		Nav
		Button
*/

import React from 'react';

import './css/home.scss';

import Nav from '../components/nav';
import Button from '../components/button';

import Blog from '../sections/blog';
import Portfolio from '../sections/portfolio';
import Contact from '../sections/contact';

class Home extends React.Component {
	render() {
  		return (
			<main id="home">
        		<Nav></Nav>
				<header className="page-header header-filter">
					<div className="container ml-auto mr-auto">
						<div className="row">
							<div id="header-title">
								<h1>I’m Joe, a Full Stack Web Developer.</h1>
								<h5 className="description">My passion for web development has always been present both prior to, and at College and University. As a result, I have gained experience in a variety of areas. This includes developing bespoke WordPress sites, creating PWA's, static HTML and CSS sites, and working with clients. I am in the process of learning Vue and React in order to create more advanced applications.</h5>
								<Button link="https://drive.google.com/open?id=1Mm61EELkpbByy3ADzffmSec_VjH8X7Na" text="Download my CV" type="Secondary"></Button>
							</div>
						</div>
					</div>
				</header>
				<div className="main" id="trans">
					<div className="container ml-auto mr-auto">
						<Portfolio></Portfolio>
						<Blog></Blog>
						<Contact></Contact>
					</div>
				</div>
			</main>
		)
	};
}

export default Home;
