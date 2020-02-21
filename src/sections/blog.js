/* 
    Blog Section
    Requires Button Component
    Fetches RSS Feed and renders content in Articles
*/
import React from 'react';
import * as RSSParser from 'rss-parser';

import './css/blog.scss';

import '../components/button';
import Icons from '../components/icons';

import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

var rssList = [];

// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

function scrollBlog() {
    var container = document.querySelector('#rss-feeds');
    var icon = document.querySelector('.section-blog .row.grid').querySelectorAll(".icon")
    let width = document.getElementsByClassName('rss-item')[0].offsetWidth;

    container.addEventListener("resize", function(){
        width = document.getElementsByClassName('rss-item')[0].offsetWidth;
    })

    container.addEventListener("scroll", function() {
        let v = Math.round(container.scrollLeft / width)
        icon.forEach(e => e.classList.remove("current"))
        icon[v].classList.add("current")
    })
    for (let i = 0; i < 6; i++) {
        icon[i].addEventListener("click", function() {
            container.scrollTo({
				left: width * i,
				behavior: 'smooth' 
			})
        })
    }
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
            <div className="row grid"><div id="rss-feeds">{RSSMain()} <h3>Blog Posts are loading...</h3></div><Icons items="6"></Icons></div>
        </section>
    )
}

export default Blog;
  