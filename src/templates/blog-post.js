import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"
import { Link } from "gatsby"
import Share from "../components/share"

export default ({ data, pageContext }) => {
  const post = data.allWordpressPost.edges[0].node
  const site = data.site.siteMetadata

  let t = post.date
  let date = new Date(t.substring(0, t.indexOf('T')))
  let day = date.getDate()
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

  const {next, previous } = pageContext
  const nextArticle = next && (
    <Link to={"blog/" + next.slug} className="next">
      <strong>Next Article </strong>
      <span dangerouslySetInnerHTML={{__html: next.title}}></span>
    </Link>
  )

  const prevArticle = previous && (
    <Link to={"blog/" + previous.slug} className="previous">
      <strong>Previous Article </strong>
      <span dangerouslySetInnerHTML={{__html: previous.title}}></span>
    </Link>
  )
  return (
    <Layout>
      <SEO title={post.title} slug={"/blog/" + post.slug} type="article"/>
      <article className="single">
        <div className="navigation">
          <span className="previous">{prevArticle}</span>
          <span className="navIndex"><Link to="blog">Back to Blog</Link></span>
          <span className="next">{nextArticle}</span>
        </div>
        <h1 dangerouslySetInnerHTML={{__html: post.title}}></h1>
        <section dangerouslySetInnerHTML={{ __html: post.content }} ></section>
        <footer>
          <p><span>Published </span><time datetime={date}>{day} {month} '{year}</time></p>
          <Share url={site.siteUrl + post.slug} title={post.title} twitterHandle={site.twitterHandle}></Share>
        </footer>
        <div className="navigation">
          <span className="previous">{prevArticle}</span>
          <span className="navIndex"><Link to="blog">Back to Blog</Link></span>
          <span className="next">{nextArticle}</span>
        </div>
      </article>
    </Layout>
  )
}
export const query = graphql`
  query($slug: String!) {
    site {
      siteMetadata {
        siteUrl
        twitterHandle
      }
    },
    allWordpressPost(filter: { slug: { eq: $slug } }) {
      edges {
        node {
          title
          date
          content
          slug
        }
        next {
          title
          slug
        }
        previous {
          title
          slug
        }
      }
    }
  }
`
