<!DOCTYPE html>
<html lang="en-GB">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		
		<title>Joe Bailey | Web Designer, Developer, Photographer | Southampton, UK</title>
		<meta name="description" content="Joe Bailey is a web developer and photographer currently living in Southampton studying at Solent University.">
		<meta property="og:image" content="assets/img/header.jpg">
		<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
		<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
		<link rel="manifest" href="manifest.json">
		<link rel="mask-icon" href="safari-pinned-tab.svg" color="#004c3f">
		<meta name="msapplication-TileColor" content="#004c3f">
		<meta name="theme-color" content="#282828">
		
		<link rel="stylesheet" href="assets/css/main.css">
		
		<link href="https://fonts.googleapis.com/css?family=Roboto+Slab:700|Roboto:300,400&display=swap" rel="stylesheet">
		
		<link href="https://fonts.googleapis.com/icon?family=Material+Icons&font-display=block" rel="stylesheet">
		
		<script src="https://www.google.com/recaptcha/api.js?render=6LcLDYgUAAAAAIXDeTU8jn_FTTetybUTIscj8DZX"></script>
		<script>
			grecaptcha.ready(function () {
				grecaptcha.execute('6LcLDYgUAAAAAIXDeTU8jn_FTTetybUTIscj8DZX', { action: 'contact' }).then(function (token) {
					var recaptchaResponse = document.getElementById('recaptchaResponse');
					recaptchaResponse.value = token;
				});
			});
		</script>		
		<link rel="canonical" href="https://joebailey.xyz">
	</head>
    <body>
		<div id="joe" style="top:0px;position:absolute;"></div>
        <nav class="navbar" id="transp" >
			<div class="container">
				<div class="row">
					<a class="navbar-brand" id="top" href="javascript:void(0)">Joe Bailey</a>
					<a title="navigation" class="navbar-toggler" href="javascript:void(0);" onclick="appdrawer()">
						<i class="fas fa-bars"></i>
					</a>
					<div class="navmob closed" id="nav">
						<div class="navlinks">
							<a class="nav-link" id="portfolio" href="javascript:void(0)">
								<i class="material-icons">apps</i> Portfolio
							</a>
							<a class="nav-link" id="blog" href="javascript:void(0)">
								<i class="material-icons">message</i> Blog
							</a>
							<a class="nav-link" id="contact" href="javascript:void(0)">
								<i class="material-icons">send</i> Contact
							</a>
							<a title="close-navigation" id="close" class="closed" href="javascript:void(0);" onclick="appclose()"></a>
						</div><!--navlinks-->
					</div><!--navmob-->
				</div><!--row-->
			</div><!--container-->
		</nav>
		
        <div class="page-header header-filter">
			<div class="container">
				<div class="row">
					<div id="header-title">
						<h1>I’m Joe, a Full Stack Web Developer.</h1>
						<h5 class="description" style="margin-top: 20px;">My passion for web development has always been present both prior to, and at College and University. As a result, I have gained experience in a variety of areas. This includes developing bespoke WordPress sites, creating PWA's, static HTML and CSS sites, and working with clients. I am in the process of learning Vue and React in order to create more advanced applications.</h5>
						<a rel="noreferrer" style="margin-top: 20px; font-size: 1rem" target="_blank" href="https://drive.google.com/open?id=1Mm61EELkpbByy3ADzffmSec_VjH8X7Na" class="btn secondary"> Download my CV </a>
					</div>
				</div>
			</div>
		</div>
		<div class="main" id="trans">
			<div class="container">
				<div class="section section-portfolio">
					<div class="row">
						<div class="col-md-8 ml-auto mr-auto">
							<h2 class="text-center title">Portfolio</h2>
						</div>
					</div>

					<div id="web" style="margin-bottom: 50px;">
						<h2 class="subtitle">Live Websites</h2>
						<h5>View some of the websites that I have created.</h5>
					</div>

					<div class="row">
						<div class="col-md-4">
							<img alt="Joe Bailey Photography" class="lazy has-webp" data-src="assets/img/Portfolio/Websites/Photography.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Joe Bailey Photography</h4>
							<p>In order to use many of the new Web Technologies you first need a platform to test them on. This is my photography website. I am very passionate about photography and like to keep my website as close to the cutting edge as possible.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.joebaileyphotography.com">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.joebaileyphotography.com/Blog/category/joe-bailey-photography/website/">Read the docs</a>
						</div>
						<div class="col-md-4">
							<img alt="Therfield Village Pre-School" class="lazy has-webp" data-src="assets/img/Portfolio/Websites/Therfield.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Therfield Village Pre-School</h4>
							<p>A local Pre-School needed someone to manage their website, updating content, ensuring consitency, and implementing new features. I have since helped their brand become more consistent and created a blog which I help keep up to date.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://therfieldpreschool.co.uk">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.joebaileyphotography.com/Blog/2019/04/therfield-village-pre-school/">Read the docs</a>
						</div>
						<div class="col-md-4">
							<img alt="Disabled People's Voice" class="lazy has-webp" data-src="assets/img/Portfolio/Websites/dpv.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Disabled People's Voice</h4>
							<p>A local charity approached me to develop their website from a template that an external graphic designer has created. I worked closely with the designer over a 3 month period making sure that the site was pixel perfect before pushing it live.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://dpv.org.uk">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="http://www.joebaileyphotography.com/Blog/2019/04/disabled-people's-voice/">Read the docs</a>
						</div>
						<div class="col-md-4">
							<img alt="Island RIBs" class="lazy has-webp" data-src="assets/img/Portfolio/Websites/IslandRIBs.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Island RIBs</h4>
							<p>I gave this local company's website a design refresh. I worked closely with the client on a development site to help them reach their vision within their budget. I then went through the process of cross-browser testing before pushing the website live.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://island-ribs.co.uk/">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.joebaileyphotography.com/Blog/2019/08/island-ribs/">Read the docs</a>
						</div>
						<div class="col-md-4">
							<img alt="Don's Discs" class="lazy has-webp" data-src="assets/img/Portfolio/Websites/DonsDiscs.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Don's Discs</h4>
							<p>This client needed an E-Commerce website in order to sell rare vinyl around the world. I created a site using WooCommerce and worked with them on a procdure for exporting products from Discogs onto the new website.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://donsdiscs.com">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="http://www.joebaileyphotography.com/Blog/2019/07/dons-discs/">Read the docs</a>
						</div>
						<div class="col-md-4">
							<img alt="Blossom Tree Photography" class="lazy has-webp" data-src="assets/img/Portfolio/Websites/BlossomTree.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Blossom Tree Photography</h4>
							<p>I gave this photographer a bespoke website made with WordPress so that she could show off her portfolio and write about her work in a blog. I used Figma to prototype the site and developed a custom theme for it.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://blossomtreephoto.co.uk">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="http://www.joebaileyphotography.com/Blog/2019/01/blossom-tree-photography/">Read the docs</a>
						</div>
					</div>

					<div id="temp" style="margin-bottom: 50px; margin-top: 75px;">
						<h2 class="subtitle">Website Designs</h2>
						<h5>View some of the websites I have designed.</h5>
					</div>
					<div class="row">
						<div class="col-md-4">
							<img alt="National Hyacinth Collection" class="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/National-Hyacinth-Collection.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">National Hyacinth Collection</h4>
							<p>In 2017 I approached the National Hyacinth Collection asking if they wanted a website. I decided it would be a good opportunity to teach myself HTML and CSS. However, the project never came to fruition.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://nhc.joebailey.xyz">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.behance.net/gallery/79742435/National-Hyacinth-Collection">View on Behance</a>
						</div>
						<div class="col-md-4">
							<img alt="Conspiracy?" class="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/conspiracy.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Conspiracy?</h4>
							<p>At University, we were tasked with creating a website that uses some basic JavaScript and solves a real-world problem. I made a website that displays conspiracy theories in a news website form as most information is only available on YouTube.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://web-tech-report.firebaseapp.com/">View the website</a>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.behance.net/gallery/79730007/Conspiracy">View on Behance</a>
						</div>
						<div class="col-md-4">
							<img alt="Projekt" class="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/Projekt.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Projekt</h4>
							<p>As part of my media course at Sixth Form we had to create multiple websites. This website is a social media platform for creators to share their work.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.behance.net/gallery/74653547/Projekt?">View on Behance</a>
						</div>
						<div class="col-md-4">
							<img alt="Student Photography" class="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/Student-Photographer.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Student Photographer</h4>
							<p>As part of my media course at Sixth Form we had to create multiple websites. This website is a social media platform for photographers to share their work.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.behance.net/gallery/74653681/Student-Photographer?">View on Behance</a>
						</div>
						<div class="col-md-4">
							<img alt="Project Gutenberg" class="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/Gutenberg.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Project Gutenberg</h4>
							<p>My second project at University was to redesign the <a href="https://www.gutenberg.org/">Project Gutenberg site</a>. As part of this project I learnt how to use Figma.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.behance.net/gallery/74308561/Project-Gutenberg-Redesign">View on Behance</a>
						</div>
						<div class="col-md-4">
							<img alt="Solent App" class="lazy has-webp" data-src="assets/img/Portfolio/Website Templates/solent.jpg" width="150px">
							<h4 class="info-title" style="margin-top:20px;">Solent App</h4>
							<p>I wanted to practise my design skills using Adobe XD so I made a mockup of a mobile app that combines current web-based applications that the university offers.</p>
							<a class="btn" rel="noreferrer" target="_blank" href="https://www.behance.net/gallery/77240793/Solent-University-Mobile-Application">View on Behance</a>
						</div>
					</div>
				</div> <!--portfolio-->

				<div class="section section-blog">
					<div class="row">
						<div class="col-md-8 ml-auto mr-auto">
							<h2 class="text-center title">Blog</h2>
						</div>
					</div>
					<div id="rss-feeds" class="row"></div>
				</div>

				<div class="section section-contact">
					<div class="row">
						<div class="col-md-8 ml-auto mr-auto">
							<h2 class="text-center title">Get in touch</h2>
							<div class="row">
								<div class="col-md-4">
									<a><i class="material-icons">phone</i> <a href="tel:+4474777535">07477 7535</a></a>
								</div>
								<div class="col-md-4">
									<a><i class="material-icons">email</i> <a href="mailto:joe@joebailey.xyz">joe@joebailey.xyz</a></a>
								</div>
								<div class="col-md-4">
									<a><i class="material-icons">my_location</i> <a>Southampton, UK</a></a>
								</div>
							</div>
							
							
							<form id="ajax-contact" class="contact-form" method="post" name="myemailform" action="/form-to-email">
								<div class="row">
									<div class="col-md-6">
										<div class="form-group">
											<label class="bmd-label-floating" for="name">Your Name</label>
											<input id="name" name="name" class="form-control" required>
										</div>
									</div>
									<div class="col-md-6">
										<div class="form-group">
											<label class="bmd-label-floating" for="email">Your Email</label>
											<input id="email" name="email" type="email" class="form-control" required>
										</div>
									</div>
								</div>
								<div class="form-group">
									<label for="subject" class="bmd-label-floating">Your Message</label>
									<textarea id="subject" name="subject" class="form-control" rows="4" required></textarea>
								</div>
								<div class="form-group">
									<label for="privacyPolicy"><input type="checkbox" id="privacyPolicy" name="privacy" value="privacy" required> I consent to having this website store my submitted information so they can respond to my inquiry.</label>
								</div>
								<input type="hidden" name="recaptcha_response" id="recaptchaResponse">
								<div class="row">
									<div class="col-md-4 ml-auto mr-auto text-center">
										<button class="btn">
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

		<footer class="footer">
			<div class="container">
				<div class="row">
					<div class="col-md-8 ml-auto mr-auto">
						<div class="copyright">
							&copy; <?php echo date("Y"); ?> Joe Bailey. All rights reserved.
						</div>
						<div class="social">
							<a title="Twitter" aria-label="Twitter Social Profile Link" href="https://twitter.com/joebaileyphoto" rel="noreferrer" target="_blank">
								<i class="fab fa-twitter"></i>
							</a>
							<a title="LinkedIn" aria-label="LinkedIn Social Profile Link" href="https://www.linkedin.com/in/joe-bailey-b68b17171/" rel="noreferrer" target="_blank">
								<i class="fab fa-linkedin"></i>
							</a>
							<a title="Behance" aria-label="Behance Social Profile Link" href="https://www.behance.net/joebailey26" rel="noreferrer" target="_blank">
								<i class="fab fa-behance-square"></i>
							</a>
							<a title="GitHub" aria-label="GitHub Social Profile Link" href="https://github.com/joebailey26" rel="noreferrer" target="_blank">
								<i class="fab fa-github"></i>
							</a>
							<a title="CodePen" aria-label="CodePen Social Profile Link" href="https://codepen.io/joebailey26" rel="noreferrer" target="_blank">
								<i class="fab fa-codepen"></i>
							</a>
						</div>
					</div>
				</div>
			</div>   
		</footer>
		<script type="application/ld+json">
			{
			  "@context": "http://schema.org",
			  "@type": "Person",
			  "email": "mailto:joe@joebailey.xyz",
			  "image": "https://joebailey.xyz/assets/img/joe.jpg",
			  "jobTitle": "Web Developer",
			  "name": "Joe Bailey",
			  "gender": "male",
			  "telephone": "+44 7477737535",
			  "url": "https://joebailey.xyz",
				"sameAs" : [ "https://www.facebook.com/joebaileyphoto/",
			  "https://www.linkedin.com/in/joe-bailey-b68b17171/",
			  "https://www.behance.net/joebailey26",
			  "https://twitter.com/joebaileyphoto",
			  "https://www.instagram.com/joebaileyphotography/",
			  "https://github.com/joebailey26"]
			}
    	</script>
		<script src="assets/js/main.min.js"></script>

		<script>
			// Create a script tag in the Header
			function createScript(url) {
				const script = document.createElement('script');
				script.src = url;
				document.getElementsByTagName('head')[0].appendChild(script);
				
				// GA
				  window.dataLayer = window.dataLayer || [];
				  function gtag(){dataLayer.push(arguments);}
				  gtag('js', new Date());

				  gtag('config', 'UA-140457046-3');

			};

			// If cookies are accepted then apply JavaScript
			if (getCookie('cookieconsent_status') == 'dismiss') {
				createScript('//www.googletagmanager.com/gtag/js?id=UA-140457046-3')
			}
			
			jQuery(function($) {
				$("#rss-feeds").rss("https://www.joebaileyphotography.com/Blog/category/web-design/news/feed/",
				{
					entryTemplate:'<div class="col-md-4 rss-item"><h4 class="info-title"><a href="{url}">{title}</a></h4><div class="rss-content">{body}</div></div>'
				})
			})			

			var lazyLoadInstances = [];
			// The "lazyLazy" instance of lazyload is used (kinda improperly) 
			// to check when the .horzContainer divs enter the viewport
			var lazyLazy = new LazyLoad({
				elements_selector: ".row",
				// When the .horzContainer div enters the viewport...
				callback_enter: function(el) {
					// ...instantiate a new LazyLoad on it
					var oneLL = new LazyLoad({
						container: el
					});
					// Optionally push it in the lazyLoadInstances 
					// array to keep track of the instances
					lazyLoadInstances.push(oneLL);
				}
			});

			$(window).scroll(function (event) {
				var scroll = $(window).scrollTop();
				$('#transp').toggleClass('transparent',
				  scroll >= $('#trans').offset().top - 50
				);
			});
			$(document).ready(function() {
				$(window).scroll();
			})
		</script>
	</body>
</html>