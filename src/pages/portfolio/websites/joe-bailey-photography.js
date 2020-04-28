import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../../components/Layout"
import SEO from "../../../components/seo"
import Share from "../../../components/share"

const websitesIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const categories = data.allWordpressCategory.edges
  const site = data.site.siteMetadata
    return (
      <Layout>
        <SEO title="Joe Bailey Photography | Websites | Portfolio" slug="/portfolio/websites/joe-bailey-photography" />
        {categories.map(({ node }) => {
          return (
            <header>
              <h1 class="title">{node.name}</h1>
              <p className="description">{node.description}</p>
            </header>
          )
        })}
        {posts.map(({ node }) => {
          const title = node.title

          let t = node.date
          let date = new Date(t)
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
                  <h2 className="title">
                    <Link to={"portfolio/websites/joe-bailey-photography/" + node.slug}
                      dangerouslySetInnerHTML={{
                      __html: title,
                      }}>
                    </Link>
                  </h2>
                </header>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.excerpt,
                  }}
                >
                </div>
                <footer>
                  <div className="buttonsContainer">
                    <Link className="btn" to={"portfolio/websites/joe-bailey-photography/" + node.slug}>Continue Reading</Link>
                  </div>
                  <Share url={site.siteUrl + "/" + node.slug} title={node.title} twitterHandle={site.twitterHandle}></Share>
                </footer>
              </article>
          )
        })}
      </Layout>
    )
}

export default websitesIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        siteUrl
        twitterHandle
      }
    },
    allWordpressCategory(filter: {id: {eq: "a6ddce2d-885a-5e1c-96f3-8647e5ebdb49"}}) {
      edges {
        node {
          name
          description
        }
      }
    },
    allWordpressPost(filter: {categories: {elemMatch: {id: {eq: "a6ddce2d-885a-5e1c-96f3-8647e5ebdb49"}}}, status: {eq: "publish"}}, sort: { fields: [date] order: DESC }) {
        edges {
          node {
            title
            excerpt
            slug
            date
          }
        }
      }
    }
`