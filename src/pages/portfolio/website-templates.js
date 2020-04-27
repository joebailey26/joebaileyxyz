import React from "react"
import { graphql } from "gatsby"

import IndexLayout from "../../components/indexLayout"
import SEO from "../../components/seo"
import Share from "../../components/share"
import {picture, tech, button} from "../../components/individualItem"

const websiteDesignsIndex = ({ data }) => {
  const posts = data.allWordpressPost.edges
  const categories = data.allWordpressCategory.edges
  const site = data.site.siteMetadata
    return (
      <IndexLayout>
        <SEO title="Website Designs | Portfolio" slug="/portfolio/website-templates" />
        {categories.map(({ node }) => {
          return (
            <header>
              <h1 class="title">{node.name}</h1>
              <p className="description">{node.description}</p>
            </header>
          )
        })}
        {posts.map(({ node }) => {
          return (
              <article key={node.title} id={node.slug} className="with_featureImage">
                {picture(node.jetpack_featured_media_url, node.title)}
                <header>
                  <h2 class="subtitle">
                      {node.title}
                  </h2>
                  <div className="tech-stack">{tech(node.acf.icons)}</div>
                </header>
                <div
                  dangerouslySetInnerHTML={{
                    __html: node.content,
                  }}
                >
                </div>
                <footer>
                  <div className="buttonsContainer">
                    {button(node.acf.website, "View the website")}
                    {button(node.acf.behance, "View on Behance")}
                  </div>
                  <Share url={site.siteUrl} title={node.title} twitterHandle={site.twitterHandle}></Share>
                </footer>
              </article>
          )
        })}
      </IndexLayout>
    )
}

export default websiteDesignsIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        siteUrl
        twitterHandle
      }
    },
    allWordpressCategory(filter: {name: {eq: "Website Templates"}}) {
      edges {
        node {
          name
          description
        }
      }
    },
    allWordpressPost(filter: {categories: {elemMatch: {name: {eq: "Website Templates"}}}, status: {eq: "publish"}}, sort: { fields: [date] order: DESC }) {
      edges {
        node {
          title
          content
          slug
          jetpack_featured_media_url
          acf {
            website
            behance
            icons
          }
        }
      }
    }
  }
`