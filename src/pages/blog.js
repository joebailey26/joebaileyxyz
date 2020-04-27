import React from "react"
import { Link, graphql } from "gatsby"

import IndexLayout from "../components/indexLayout"
import SEO from "../components/seo"
import Share from "../components/share"

const BlogIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const site = data.site.siteMetadata
    return (
      <IndexLayout>
        <SEO title="Blog" slug="/blog"/>
        <header>
          <h1 className="title">Blog</h1>
          <p className="description">Keep up to date with my latest adventures in the world of Web Development and tech in general.</p>
        </header>
        {posts.map(({ node }) => {
          const title = node.title

          let t = node.date
          let date = new Date(t.substring(0, t.indexOf('T')))
          let day = date.getDay()
          let monthArr = []
            monthArr[0] = "Jan"
            monthArr[1] = "Feb"
            monthArr[2] = "Mar"
            monthArr[3] = "Apr"
            monthArr[4] = "May"
            monthArr[5] = "Jun"
            monthArr[6] = "Jul"
            monthArr[7] = "Aug"
            monthArr[8] = "Sep"
            monthArr[9] = "Oct"
            monthArr[10] = "Nov"
            monthArr[11] = "Dec"
          let month = monthArr[date.getMonth()]
          let year = date.getFullYear().toString().substring(2)

          let post = node.content
          const avgWordsPerMin = 200;
          let count = post.match(/\w+/g).length
          let readingTime = Math.ceil(count / avgWordsPerMin)

          return (
              <article key={node.title} id={node.slug} className="with_featureImage">
                <div className="date">
                  <div className="day">
                    {day}
                  </div>
                  <div className="monthYear">
                    {month + " '" + year}
                  </div>
                </div>
                <header>
                  <h2 className="sub-title">
                    <Link to={"blog/" + node.slug}
                      dangerouslySetInnerHTML={{
                      __html: title,
                      }}>
                    </Link>
                  </h2>
                </header>
                <span className="read-time">{readingTime} minute read</span>
                <div
                    dangerouslySetInnerHTML={{
                      __html: node.excerpt,
                    }}
                  >
                </div>
                <footer>
                  <div className="buttonsContainer">
                    <Link className="btn" to={"blog/" + node.slug}>Continue Reading</Link>
                  </div>
                  <Share url={site.siteUrl + "/" + node.slug} title={node.title} twitterHandle={site.twitterHandle}></Share>
                </footer>
              </article>
          )
        })}
      </IndexLayout>
    )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        siteUrl
        twitterHandle
      }
    },
    allWordpressPost(filter: { 
        categories: { 
            elemMatch: {
                id: {
                    eq: "5dd9c949-a4d5-53db-85f7-b5375417cab6"
                }
            } 
        }, 
        status: {
            eq: "publish"
        }
    }) {
      edges {
        node {
          title
          date
          excerpt
          content
          slug
        }
      }
    }
  }
`
