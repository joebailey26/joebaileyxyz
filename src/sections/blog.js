import React from 'react';
import * as RSSParser from 'rss-parser';

var rssList = [];

// Note: some RSS feeds can't be loaded in the browser due to CORS security.
// To get around this, you can use a proxy.
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

function RSSMain() {
    new RSSParser().parseURL(CORS_PROXY + "https://www.joebaileyphotography.com/Blog/category/web-design/news/feed/", function(err, feed) {
        if (err) throw err;

        rssList = feed.items.splice(0, 6)

        let list = rssList.map((b) => buildTemplate(b)).join('');

        function buildTemplate(b) {
            return `
                <article class="col-md-4 rss-item">
                    <h4 class="info-title"><a target="_blank" href="${b.link}">${b.title}</a></h4>
                    <div class="rss-content">
                        ${b.content}
                    </div>
                </article>
            `;
        }
        document.querySelector("#rss-feeds").innerHTML = list
    })
}

function Blog() {
        return (
            <div className="section section-blog" id="section-blog">
                <div className="row">
                    <div className="col-md-8 ml-auto mr-auto">
                        <h2 className="text-center title">Blog</h2>
                    </div>
                </div>
        <div id="rss-feeds" className="row">{RSSMain()}</div>
            </div>
        )
}

export default Blog;
  