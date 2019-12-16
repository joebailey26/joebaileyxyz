import React from 'react';

function Home() {
  return (
    <div id="home">
        <div className="page-header header-filter">
			<div className="container">
				<div className="row">
					<div id="header-title">
						<h1>I’m Joe, a Full Stack Web Developer.</h1>
						<h5 className="description">My passion for web development has always been present both prior to, and at College and University. As a result, I have gained experience in a variety of areas. This includes developing bespoke WordPress sites, creating PWA's, static HTML and CSS sites, and working with clients. I am in the process of learning Vue and React in order to create more advanced applications.</h5>
						<a rel="noopener noreferrer" target="_blank" href="https://drive.google.com/open?id=1Mm61EELkpbByy3ADzffmSec_VjH8X7Na" className="btn secondary"> Download my CV </a>
					</div>
				</div>
			</div>
		</div>
		<div className="main" id="trans">
			<div className="container">
				<div className="section section-portfolio">
					<div className="row">
						<div className="col-md-8 ml-auto mr-auto">
							<h2 className="text-center title">Portfolio</h2>
						</div>
					</div>

					<div id="web">
						<h2 className="subtitle">Live Websites</h2>
						<h5>View some of the websites that I have created.</h5>
					</div>

					<div className="row">
						<div className="col-md-4">
							<img alt="Joe Bailey Photography" className="lazy has-webp" data-src="assets/img/Portfolio/Websites/Photography.jpg" width="150px"/>
							<h4 className="info-title">Joe Bailey Photography</h4>
							<p>In order to use many of the new Web Technologies you first need a platform to test them on. This is my photography website. I am very passionate about photography and like to keep my website as close to the cutting edge as possible.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.joebaileyphotography.com">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.joebaileyphotography.com/Blog/category/joe-bailey-photography/website/">Read the docs</a>
						</div>
						<div className="col-md-4">
							<img alt="Therfield Village Pre-School" className="lazy has-webp" data-src="assets/img/Portfolio/Websites/Therfield.jpg" width="150px"/>
							<h4 className="info-title">Therfield Village Pre-School</h4>
							<p>A local Pre-School needed someone to manage their website, updating content, ensuring consitency, and implementing new features. I have since helped their brand become more consistent and created a blog which I help keep up to date.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://therfieldpreschool.co.uk">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.joebaileyphotography.com/Blog/2019/04/therfield-village-pre-school/">Read the docs</a>
						</div>
						<div className="col-md-4">
							<img alt="Disabled People's Voice" className="lazy has-webp" data-src="assets/img/Portfolio/Websites/dpv.jpg" width="150px"/>
							<h4 className="info-title">Disabled People's Voice</h4>
							<p>A local charity approached me to develop their website from a template that an external graphic designer has created. I worked closely with the designer over a 3 month period making sure that the site was pixel perfect before pushing it live.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://dpv.org.uk">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="http://www.joebaileyphotography.com/Blog/2019/04/disabled-people's-voice/">Read the docs</a>
						</div>
						<div className="col-md-4">
							<img alt="Island RIBs" className="lazy has-webp" data-src="assets/img/Portfolio/Websites/IslandRIBs.jpg" width="150px"/>
							<h4 className="info-title">Island RIBs</h4>
							<p>I gave this local company's website a design refresh. I worked closely with the client on a development site to help them reach their vision within their budget. I then went through the process of cross-browser testing before pushing the website live.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://island-ribs.co.uk/">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.joebaileyphotography.com/Blog/2019/08/island-ribs/">Read the docs</a>
						</div>
						<div className="col-md-4">
							<img alt="Don's Discs" className="lazy has-webp" data-src="assets/img/Portfolio/Websites/DonsDiscs.jpg" width="150px"/>
							<h4 className="info-title">Don's Discs</h4>
							<p>This client needed an E-Commerce website in order to sell rare vinyl around the world. I created a site using WooCommerce and worked with them on a procdure for exporting products from Discogs onto the new website.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://donsdiscs.com">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="http://www.joebaileyphotography.com/Blog/2019/07/dons-discs/">Read the docs</a>
						</div>
						<div className="col-md-4">
							<img alt="Blossom Tree Photography" className="lazy has-webp" data-src="assets/img/Portfolio/Websites/BlossomTree.jpg" width="150px"/>
							<h4 className="info-title">Blossom Tree Photography</h4>
							<p>I gave this photographer a bespoke website made with WordPress so that she could show off her portfolio and write about her work in a blog. I used Figma to prototype the site and developed a custom theme for it.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://blossomtreephoto.co.uk">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="http://www.joebaileyphotography.com/Blog/2019/01/blossom-tree-photography/">Read the docs</a>
						</div>
					</div>

					<div id="temp">
						<h2 className="subtitle">Website Designs</h2>
						<h5>View some of the websites I have designed.</h5>
					</div>
					<div className="row">
						<div className="col-md-4">
							<img alt="National Hyacinth Collection" className="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/National-Hyacinth-Collection.jpg" width="150px"/>
							<h4 className="info-title">National Hyacinth Collection</h4>
							<p>In 2017 I approached the National Hyacinth Collection asking if they wanted a website. I decided it would be a good opportunity to teach myself HTML and CSS. However, the project never came to fruition.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://nhc.joebailey.xyz">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.behance.net/gallery/79742435/National-Hyacinth-Collection">View on Behance</a>
						</div>
						<div className="col-md-4">
							<img alt="Conspiracy?" className="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/conspiracy.jpg" width="150px"/>
							<h4 className="info-title">Conspiracy?</h4>
							<p>At University, we were tasked with creating a website that uses some basic JavaScript and solves a real-world problem. I made a website that displays conspiracy theories in a news website form as most information is only available on YouTube.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://web-tech-report.firebaseapp.com/">View the website</a>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.behance.net/gallery/79730007/Conspiracy">View on Behance</a>
						</div>
						<div className="col-md-4">
							<img alt="Projekt" className="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/Projekt.jpg" width="150px"/>
							<h4 className="info-title">Projekt</h4>
							<p>As part of my media course at Sixth Form we had to create multiple websites. This website is a social media platform for creators to share their work.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.behance.net/gallery/74653547/Projekt?">View on Behance</a>
						</div>
						<div className="col-md-4">
							<img alt="Student Photography" className="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/Student-Photographer.jpg" width="150px"/>
							<h4 className="info-title">Student Photographer</h4>
							<p>As part of my media course at Sixth Form we had to create multiple websites. This website is a social media platform for photographers to share their work.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.behance.net/gallery/74653681/Student-Photographer?">View on Behance</a>
						</div>
						<div className="col-md-4">
							<img alt="Project Gutenberg" className="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/Gutenberg.jpg" width="150px"/>
							<h4 className="info-title">Project Gutenberg</h4>
							<p>My second project at University was to redesign the <a href="https://www.gutenberg.org/">Project Gutenberg site</a>. As part of this project I learnt how to use Figma.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.behance.net/gallery/74308561/Project-Gutenberg-Redesign">View on Behance</a>
						</div>
						<div className="col-md-4">
							<img alt="Solent App" className="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/solent.jpg" width="150px"/>
							<h4 className="info-title">Solent App</h4>
							<p>I wanted to practise my design skills using Adobe XD so I made a mockup of a mobile app that combines current web-based applications that the university offers.</p>
							<a className="btn" rel="noopener noreferrer" target="_blank" href="https://www.behance.net/gallery/77240793/Solent-University-Mobile-Application">View on Behance</a>
						</div>
					</div>
				</div>

				<div className="section section-blog">
					<div className="row">
						<div className="col-md-8 ml-auto mr-auto">
							<h2 className="text-center title">Blog</h2>
						</div>
					</div>
					<div id="rss-feeds" className="row"></div>
				</div>

				<div className="section section-contact">
					<div className="row">
						<div className="col-md-8 ml-auto mr-auto">
							<h2 className="text-center title">Get in touch</h2>
							<div className="row">
								<div className="col-md-4">
									<a href="tel:+4474777535"><i className="material-icons">phone</i> 07477 7535</a>
								</div>
								<div className="col-md-4">
									<a href="mailto:joe@joebailey.xyz"><i className="material-icons">email</i> joe@joebailey.xyz</a>
								</div>
								<div className="col-md-4">
									<a href="https://www.google.co.uk/maps/place/Southampton/"><i className="material-icons">my_location</i> Southampton, UK</a>
								</div>
							</div>
							
							
							<form id="ajax-contact" className="contact-form" method="post" name="myemailform" action="/form-to-email">
								<div className="row">
									<div className="col-md-6">
										<div className="form-group">
											<label className="bmd-label-floating" htmlFor="name">Your Name</label>
											<input id="name" name="name" className="form-control" required/>
										</div>
									</div>
									<div className="col-md-6">
										<div className="form-group">
											<label className="bmd-label-floating" htmlFor="email">Your Email</label>
											<input id="email" name="email" type="email" className="form-control" required/>
										</div>
									</div>
								</div>
								<div className="form-group">
									<label htmlFor="subject" className="bmd-label-floating">Your Message</label>
									<textarea id="subject" name="subject" className="form-control" rows="4" required></textarea>
								</div>
								<div className="form-group">
									<label htmlFor="privacyPolicy"><input type="checkbox" id="privacyPolicy" name="privacy" value="privacy" required/> I consent to having this website store my submitted information so they can respond to my inquiry.</label>
								</div>
								<input type="hidden" name="recaptcha_response" id="recaptchaResponse"/>
								<div className="row">
									<div className="col-md-4 ml-auto mr-auto text-center">
										<button className="btn">
											Send Message
										</button>
									</div>
								</div>
							</form>
							<div id="form-messages"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
    </div>
  );
}

export default Home;

