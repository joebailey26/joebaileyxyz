/* 
    Blog Section
    Requires Button Component
    Fetches RSS Feed and renders content in Articles
*/
import React from 'react';
import * as RSSParser from 'rss-parser';

import './css/blog.scss';

import '../components/button';

import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

var rssList = [];

// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

function scrollBlog() {
	setInterval(function() {
		var width = document.getElementsByClassName('rss-item')[0].offsetWidth;
		var container = document.querySelector('#rss-feeds');
		if (container.scrollLeft === (width * 5)) {
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

function RSSMain() {
    new RSSParser().parseURL(CORS_PROXY + "https://www.joebaileyphotography.com/Blog/category/web-design/news/feed/", function(err, feed) {
        if (err) throw err;

        rssList = feed.items.splice(0, 6)

        let list = rssList.map((b) => buildTemplate(b)).join('');

        function buildTemplate(b) {
            return `
                <article class="col-md-4 rss-item">
                    <h4 class="info-title"><a target="_blank" rel="noopener noreferrer" href="${b.link}">${b.title}</a></h4>
                    <div class="rss-content text-center">
                        ${b.content}
                    </div>
                </article>
            `;
        }
        document.querySelector("#rss-feeds").innerHTML = list;
        scrollBlog();
    })
}

function Blog() {
        return (
            <section className="section section-blog" id="section-blog">
                <div className="row">
                    <div className="col-md-8 ml-auto mr-auto">
                        <h2 className="text-center title">Blog</h2>
                    </div>
                </div>
                <div id="rss-feeds" className="row">{RSSMain()} <h3>Blog Posts are loading...</h3></div>
            </section>
        )
}

export default Blog;
  